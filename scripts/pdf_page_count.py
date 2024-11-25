import sys
import json
import pdfplumber
import os

# maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024

def get_page_count(pdf_path):
    # validate file exists
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"File not found: {pdf_path}")
    
    # check file size
    if os.path.getsize(pdf_path) > MAX_FILE_SIZE:
        raise ValueError(f"File exceeds maximum size of {MAX_FILE_SIZE/1024/1024:.0f}MB")
    
    # verify pdf header
    with open(pdf_path, 'rb') as f:
        if f.read(4) != b'%PDF':
            raise ValueError("Not a valid PDF file")
    
    with pdfplumber.open(pdf_path) as pdf:
        return len(pdf.pages)

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    
    try:
        num_pages = get_page_count(pdf_path)
        print(json.dumps({
            "numPages": num_pages
        }))
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        })) 