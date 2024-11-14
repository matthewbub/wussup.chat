import sys
import json
import pdfplumber

def extract_text(pdf_path, pages_to_extract):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            if page.page_number in pages_to_extract:
                text += page.extract_text() + "\n"
    return text

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