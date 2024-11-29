# Build stage
FROM python:3.12-slim as builder

RUN set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    libclang-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.12-slim

# Install only runtime dependencies
RUN set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    libjpeg-dev \
    libopenjp2-7-dev \
    libtiff-dev \
    liblcms2-dev \
    libwebp-dev \
    tesseract-ocr \
    libleptonica-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN useradd -m appuser

# Copy installed Python packages from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

# Create and set working directory
WORKDIR /app

# Copy the Python service code
COPY main.py .

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port your Flask app runs on
EXPOSE 8082

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8082/health || exit 1

# Run the Flask app with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8082", "--workers", "4", "--timeout", "120", "main:app"]