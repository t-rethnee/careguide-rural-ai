
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

# Password hashing
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hasher.verify(plain_password, hashed_password)


# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is missing from .env")

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str):
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is missing from .env")

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except jwt.InvalidTokenError:
        return None
