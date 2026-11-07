
import os
import base64
import tempfile
import time
import subprocess
import shutil

from dotenv import load_dotenv
from google import genai
import imageio_ffmpeg


# =====================================
# Load Environment Variables
# =====================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from environment variables."
    )


# =====================================
# Gemini Configuration
# =====================================

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={
        "api_version": "v1beta"
    }
)

STT_MODEL = "gemini-3.5-transcribe"
TTS_MODEL = "gemini-3.8-flash-tts"

FILE_PROCESSING_TIMEOUT = 60
FILE_PROCESSING_INTERVAL = 1


# =====================================
# Wait Until Gemini File Is Active
# =====================================

def wait_for_file_active(file_name: str):

    start_time = time.time()

    while True:

        file_info = client.files.get(
            name=file_name
        )

        state = getattr(
            file_info,
            "state",
            None
        )

        state_name = getattr(
            state,
            "name",
            str(state) if state is not None else ""
        ).upper()

        print("Gemini file status:", state_name)

        if state_name.endswith("ACTIVE"):
            return file_info

        if state_name.endswith("FAILED"):
            raise ValueError(
                "Gemini could not process the uploaded audio file."
            )

        if time.time() - start_time > FILE_PROCESSING_TIMEOUT:
            raise TimeoutError(
                "Gemini audio processing timed out. Please try again."
            )

        time.sleep(FILE_PROCESSING_INTERVAL)


# =====================================
# Convert Browser Audio to WAV
# =====================================

def convert_audio_to_wav(
    input_path: str,
    output_path: str
):

    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

    result = subprocess.run(
        [
            ffmpeg_path,
            "-y",
            "-i", input_path,
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            "-c:a", "pcm_s16le",
            output_path
        ],
        capture_output=True,
        text=True,
        timeout=60
    )

    if result.returncode != 0:

        print(
            "FFmpeg conversion error:",
            result.stderr[-1500:]
        )

        raise ValueError(
            "Unable to convert recorded audio to WAV."
        )

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:

        raise ValueError(
            "Audio conversion produced an empty WAV file."
        )

    print("Audio conversion successful!")


# =====================================
# Speech-to-Text (STT)
# =====================================

def transcribe_audio(
    audio_bytes: bytes,
    mime_type: str
) -> str:

    if not audio_bytes:
        raise ValueError(
            "Audio file is empty."
        )

    temp_dir = tempfile.mkdtemp()

    uploaded_file = None

    try:

        # Determine original audio extension

        clean_mime_type = mime_type.split(";")[0].strip().lower()

        if "wav" in clean_mime_type:
            suffix = ".wav"

        elif "mp3" in clean_mime_type or "mpeg" in clean_mime_type:
            suffix = ".mp3"

        elif "mp4" in clean_mime_type:
            suffix = ".mp4"

        elif "webm" in clean_mime_type:
            suffix = ".webm"

        else:
            raise ValueError(
                f"Unsupported audio format: {mime_type}"
            )

        input_path = os.path.join(
            temp_dir,
            f"recorded_audio{suffix}"
        )

        wav_path = os.path.join(
            temp_dir,
            "converted_audio.wav"
        )

        # Save uploaded audio locally

        with open(input_path, "wb") as audio_file:
            audio_file.write(audio_bytes)

        # Convert browser recording to WAV

        if suffix != ".wav":

            print("Converting audio to WAV...")

            convert_audio_to_wav(
                input_path,
                wav_path
            )

            final_audio_path = wav_path

        else:

            final_audio_path = input_path

        print("Uploading WAV audio to Gemini...")

        # Upload WAV file to Gemini

        uploaded_file = client.files.upload(
            file=final_audio_path
        )

        print(
            "Uploaded Gemini file:",
            uploaded_file.name
        )

        # Wait until Gemini file becomes ACTIVE

        active_file = wait_for_file_active(
            uploaded_file.name
        )

        print("Gemini file is ACTIVE.")

        # Speech-to-Text

        interaction = client.interactions.create(

            model=STT_MODEL,

            input=[
                {
                    "type": "audio",
                    "uri": active_file.uri,
                    "mime_type": "audio/wav"
                }
            ]
        )

        transcript = (
            interaction.output_text or ""
        ).strip()

        if not transcript:
            raise ValueError(
                "No speech was detected in the audio."
            )

        print("STT SUCCESS!")
        print("Transcribed text:", transcript)

        return transcript

    finally:

        # Delete uploaded Gemini file

        if uploaded_file:

            try:

                client.files.delete(
                    name=uploaded_file.name
                )

                print("Gemini temporary file deleted.")

            except Exception as error:

                print(
                    "Gemini file cleanup warning:",
                    repr(error)
                )

        # Delete local temporary files

        shutil.rmtree(
            temp_dir,
            ignore_errors=True
        )


# =====================================
# Text-to-Speech (TTS)
# =====================================

def generate_speech(
    text: str
) -> tuple[bytes, str]:

    if not text or not text.strip():

        raise ValueError(
            "Text cannot be empty."
        )

    interaction = client.interactions.create(

        model=TTS_MODEL,

        input=[
            {
                "type": "user_input",
                "content": [
                    {
                        "type": "text",
                        "text": text.strip(),
                    }
                ],
            }
        ],

        response_format={
            "type": "audio"
        },

        generation_config={
            "speech_config": [
                {
                    "voice": "Kore"
                }
            ]
        },
    )

    audio_output = interaction.output_audio

    if not audio_output or not audio_output.data:

        raise ValueError(
            "Audio generation failed."
        )

    audio_bytes = base64.b64decode(
        audio_output.data
    )

    mime_type = (
        getattr(audio_output, "mime_type", None)
        or "audio/wav"
    )

    return audio_bytes, mime_type
