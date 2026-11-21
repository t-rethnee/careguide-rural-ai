
from sentence_transformers import SentenceTransformer


# =====================================
# BGE-M3 Configuration
# =====================================

MODEL_NAME = "BAAI/bge-m3"
EMBEDDING_DIMENSION = 1024

# Load model on CPU initially
model = None


# =====================================
# Load Embedding Model
# =====================================

def load_embedding_model():
    global model

    if model is None:
        print("Loading BGE-M3 embedding model...")

        model = SentenceTransformer(
            MODEL_NAME,
            device="cpu"
        )

        print("BGE-M3 model loaded successfully!")

    return model


# =====================================
# Generate Single Text Embedding
# =====================================

def generate_embedding(text: str) -> list[float]:

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text cannot be empty.")

    embedding_model = load_embedding_model()

    embedding = embedding_model.encode(
        text.strip(),
        normalize_embeddings=True,
        convert_to_numpy=True
    )

    if len(embedding) != EMBEDDING_DIMENSION:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSION} dimensions, "
            f"but received {len(embedding)}."
        )

    return embedding.tolist()


# =====================================
# Generate Multiple Text Embeddings
# =====================================

def generate_embeddings(texts: list[str]) -> list[list[float]]:

    if not texts:
        return []

    if any(not isinstance(text, str) or not text.strip() for text in texts):
        raise ValueError("All texts must be non-empty strings.")

    embedding_model = load_embedding_model()

    embeddings = embedding_model.encode(
        texts,
        batch_size=4,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    if embeddings.shape[1] != EMBEDDING_DIMENSION:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSION} dimensions, "
            f"but received {embeddings.shape[1]}."
        )

    return embeddings.tolist()
