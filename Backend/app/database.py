from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # CRITICAL

MONGO_URI = os.getenv("MONGO_URI")
# print("MONGO_URI:", MONGO_URI)  

if not MONGO_URI:
    raise Exception("MONGO_URI is not set")

client = MongoClient(MONGO_URI)
db = client["scientific_terms"]
users_collection = db["users"]
feedback_collection = db["feedback"]