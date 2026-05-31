from fastapi import FastAPI
from sports.basketball.routes import router as basketball_router
from sports.soccer.routes import router as soccer_router

app = FastAPI(title="Mock Sports Score API")

app.include_router(basketball_router)
app.include_router(basketball_router, prefix="/basketball")
app.include_router(soccer_router, prefix="/soccer")
