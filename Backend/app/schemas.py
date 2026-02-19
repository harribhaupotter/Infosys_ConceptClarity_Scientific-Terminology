from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ExplainRequest(BaseModel):
    term: str
    level: str  # "student", "enthusiast", or "expert"
    language: str = "en"  # "en", "hi", or "mr" - optional, defaults to "en"

class FeedbackRequest(BaseModel):
    term: str
    rating: str  # "positive" or "negative"
    reason: str = ""  # Optional reason for negative feedback
    explanation: str = ""  # The explanation text that was shown

class SaveRequest(BaseModel):
    term: str
    explanation: str