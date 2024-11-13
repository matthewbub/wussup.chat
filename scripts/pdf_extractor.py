import sys
import json
import pdfplumber

def extract_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

if __name__ == "__main__":
    # Get PDF path from command line argument
    pdf_path = sys.argv[1]
    
    try:
        text = extract_text(pdf_path)
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