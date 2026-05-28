FROM python:3.11-slim

# 1. Set the working directory
WORKDIR /app

# 2. Set environment variables
ENV PORT=8000
# Prevents Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1 
# Prevents Python from buffering stdout/stderr (crucial for Grafana/Docker logs)
ENV PYTHONUNBUFFERED=1        

# 3. Optimizing Cache: Install dependencies BEFORE copying the full codebase
# The * acts as a glob. If you don't have a requirements.txt yet, you might need to create an empty one to avoid Docker build errors.
COPY ./requirements.txt* /app/
RUN if [ -f "requirements.txt" ]; then pip install --no-cache-dir -r requirements.txt; fi

# 4. Copy the rest of your application code
COPY . /app/

# 5. Expose the dynamic port
EXPOSE 8000

# 6. Launch using Uvicorn (adjust app:app to match your file and FastAPI variable name)
# To use the $PORT variable dynamically, use the shell form or hardcode 8000 like below:
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
