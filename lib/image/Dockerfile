# Use a Debian-based image for better compatibility
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libclang-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libopenjp2-7-dev \
    libtiff-dev \
    liblcms2-dev \
    libwebp-dev \
    tesseract-ocr \
    libleptonica-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Copy the Python service code
COPY main.py .

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your Flask app runs on
EXPOSE 8082

# Run the Flask app
CMD ["python", "main.py"]
