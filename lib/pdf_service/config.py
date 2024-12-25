import os

class Config:
    # Logging configuration
    LOG_DIR = os.getenv('LOG_DIR', 'logs')
    APP_NAME = 'pdf_service'
    
    # Other configuration settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
    SENSITIVE_PATTERNS = [
        # "Account Number",
        # "Routing Number",
        # "SSN",
        # "Social Security",
        # "Credit Card",
        # "Password",
        # "DOB",
        # "Date of Birth",
        "TEST"
    ] 