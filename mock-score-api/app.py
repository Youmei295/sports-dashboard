from fastapi import FastAPI
import random

app = FastAPI()

@app.get("/score")
def get_score():
    return {
        "homeTeam": "Lakers",
        "awayTeam": "Warriors",
        "homeScore": random.randint(80, 120),
        "awayScore": random.randint(80, 120),
        "status": "In Progress"
    }
