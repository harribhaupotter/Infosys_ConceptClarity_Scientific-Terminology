from fastapi import FastAPI, HTTPException, Depends
from app.database import users_collection
from app.schemas import SignupRequest, LoginRequest, ExplainRequest
from app.auth import hash_password, verify_password, create_token
from app.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/signup")
def signup(data: SignupRequest):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one({
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password)
    })

    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "email": user["email"],
        "name": user["name"]
    })

    return {"access_token": token}

@app.get("/user/profile")
def profile(user=Depends(get_current_user)):
    return {
        "name": user["name"],
        "email": user["email"]
    }


@app.post("/explain")
def explain(data: ExplainRequest, user=Depends(get_current_user)):
    return {
        "term": data.term,
        "explanation": f"This is a simplified explanation of {data.term}."
    }
