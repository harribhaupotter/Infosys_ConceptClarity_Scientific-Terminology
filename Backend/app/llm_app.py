from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI()

MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map="auto",
    torch_dtype=torch.float16
)

class ExplainRequest(BaseModel):
    term: str

@app.post("/generate")
def generate(req: ExplainRequest):
    prompt = f"Explain the scientific term '{req.term}' in simple words in 20 to 30 words."

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7
    )

    text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return {
        "term": req.term,
        "explanation": text
    }
