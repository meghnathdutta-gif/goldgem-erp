# ============================================
# GoldGem AI Service - Python FastAPI Dockerfile
# Optimized for Railway deployment
# ============================================

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create non-root user
RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 3031

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3031/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3031", "--workers", "2"]
