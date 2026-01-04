from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
import os

security = HTTPBearer()

def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(
            token.credentials,
            os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM")]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
