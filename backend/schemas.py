
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from pydantic import BaseModel

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
class FacilityResponse(BaseModel):
    id: int
    name: str
    name_bangla: Optional[str] = None
    facility_type: str
    district: str
    upazila: str
    area_name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True