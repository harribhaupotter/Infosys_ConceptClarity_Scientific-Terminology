from fastapi import FastAPI, HTTPException, Depends
from app.database import users_collection
from app.schemas import SignupRequest, LoginRequest, ExplainRequest
from app.auth import hash_password, verify_password, create_token
from app.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware
import requests

COLAB_LLM_URL = "https://unattacked-rayden-wheezingly.ngrok-free.dev/generate"
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
    response = requests.post(
        COLAB_LLM_URL,
        json={"term": data.term},
        timeout=60
    )
    response.raise_for_status()

    users_collection.update_one(
        {"email": user["email"]},
        {"$push": {"search_history": {"$each": [data.term], "$slice": -5}}}
    )

    return response.json()


@app.get("/user/search-history")
def get_history(user=Depends(get_current_user)):
    db_user = users_collection.find_one({"email": user["email"]})
    return db_user.get("search_history", [])

@app.post("/explain/guest")
def explain_guest(data: ExplainRequest):
    response = requests.post(
        COLAB_LLM_URL,
        json={"term": data.term},
        timeout=60
    )
    response.raise_for_status()
    return response.json()


