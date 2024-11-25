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
    if len(sys.argv) != 2:
        print(json.dumps({
            "error": "Usage: python pdf_page_count.py <pdf_path>"
        }))
        sys.exit(1)

    pdf_path = os.path.abspath(sys.argv[1])
    
    try:
        num_pages = get_page_count(pdf_path)
        print(json.dumps({
            "numPages": num_pages
        }))
        sys.exit(0)
    except FileNotFoundError as e:
        print(json.dumps({
            "error": f"File not found: {e}"
        }))
        sys.exit(2)
    except ValueError as e:
        print(json.dumps({
            "error": f"Invalid file: {e}"
        }))
        sys.exit(3)
    except Exception as e:
        print(json.dumps({
            "error": f"Unexpected error: {e}"
        }))
        sys.exit(4) 