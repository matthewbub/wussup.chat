import sys
import json
import pdfplumber

def get_page_count(pdf_path):
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