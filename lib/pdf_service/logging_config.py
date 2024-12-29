import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app_name='pdf_service', log_dir='logs'):
    """configure production-grade logging with rotation and formatting
    
    args:
        app_name: name of the application for log identification
        log_dir: directory where log files will be stored
    
    returns:
        logger: configured logger instance
    """
    # Create logs directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)
    
    log_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # File handler for all logs
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, f'{app_name}.log'),
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(logging.INFO)
    
    # Error file handler for errors only
    error_file_handler = RotatingFileHandler(
        os.path.join(log_dir, f'{app_name}_error.log'),
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    error_file_handler.setFormatter(log_formatter)
    error_file_handler.setLevel(logging.ERROR)
    
    # Configure root logger
    logger = logging.getLogger(app_name)
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.addHandler(error_file_handler)
    
    # Add console handler in development
    if os.getenv('FLASK_ENV') == 'development':
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        logger.addHandler(console_handler)
    
    return logger 