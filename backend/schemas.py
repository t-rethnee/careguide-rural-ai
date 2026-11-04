
from pydantic import BaseModel, EmailStr, Field, model_validator


class UserRegister(BaseModel):

    full_name: str = Field(min_length=2, max_length=100)

    email: EmailStr

    password: str = Field(min_length=8)

    confirm_password: str

    @model_validator(mode="after")
    def check_password(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
