import os
import sys
import json
import pdfplumber

# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def extract_text(pdf_path: str, pages_to_extract: list[int]) -> str:
    # Validate inputs
    if not pdf_path or not isinstance(pdf_path, str):
        raise ValueError("Invalid PDF path")
    if not pages_to_extract or not all(isinstance(p, int) and p > 0 for p in pages_to_extract):
        raise ValueError("Invalid page numbers")
    
    # Check file exists and size
    if not os.path.exists(pdf_path):
        raise ValueError("PDF file does not exist")
    if os.path.getsize(pdf_path) > MAX_FILE_SIZE:
        raise ValueError(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes")

    # Validate PDF format
    with open(pdf_path, 'rb') as f:
        header = f.read(4)
        if header != b'%PDF':
            raise ValueError("Invalid PDF file format")

    # Extract text with improved efficiency
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        if any(p > total_pages for p in pages_to_extract):
            raise ValueError(f"Page number exceeds document length ({total_pages} pages)")

        text_parts = []
        for page in pdf.pages:
            if page.page_number in pages_to_extract:
                text_parts.append(page.extract_text())
    return "\n".join(text_parts)

if __name__ == "__main__":
    # Get PDF path from command line argument
    pdf_path = sys.argv[1]
    pages_to_extract = [int(page) for page in sys.argv[2:]]
    try:
        text = extract_text(pdf_path, pages_to_extract)
        # Output as JSON for easy parsing in Go
        print(json.dumps({
            "success": True,
            "text": text
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        })) 