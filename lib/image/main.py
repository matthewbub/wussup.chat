import os
from flask import Flask, request, jsonify, send_file
import fitz  # PyMuPDF
from io import BytesIO
from flask_cors import CORS
import PIL.Image
import io
import json
from fitz import Rect
import logging
import pdfplumber

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
SENSITIVE_PATTERNS = [
    "Account Number",
    "Routing Number",
    "SSN",
    "Social Security",
    "Credit Card",
    "Password",
    "DOB",
    "Date of Birth",
]

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3001", "http://localhost:8080"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"],
    "supports_credentials": True
}})


@app.route('/api/v1/pdf/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    file.seek(0, io.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    if file_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds the maximum limit of 10 MB'}), 400
    
    page_num = int(request.form.get('page', 1)) - 1  # Default to first page if not specified
    
    if file.content_type != 'application/pdf':
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Read PDF file
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Get requested page
        page = doc[page_num]
        
        # Convert to image
        pix = page.get_pixmap()
        img = PIL.Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Save to bytes
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)

        doc.close()
        return send_file(img_io, mimetype='image/png', as_attachment=False, download_name=f'preview_{page_num + 1}.png')

    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': 'An internal error occurred'}), 500

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color (#FF0000) to normalized RGB tuple (0-1)"""
    # Remove the '#' if present
    hex_color = hex_color.lstrip('#')
    # Convert hex to RGB (0-255)
    rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    # Normalize to 0-1 range
    return tuple(v / 255 for v in rgb)

@app.route('/api/v1/pdf/apply-drawing', methods=['POST'])
def apply_drawing():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    file.seek(0, io.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    if file_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds the maximum limit of 10 MB'}), 400
    
    page_num = int(request.form.get('page', 1)) - 1
    drawing_data = request.form.get('drawing')
    
    if not drawing_data:
        return jsonify({'error': 'No drawing data provided'}), 400
    
    try:
        vector_shapes = json.loads(drawing_data)
        
        # Read original PDF
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Create new document
        new_doc = fitz.open()
        
        # Copy all pages
        for i in range(doc.page_count):
            new_doc.insert_pdf(doc, from_page=i, to_page=i)
        
        # Get the page we want to modify
        page = new_doc[page_num]
        
        # Add vector annotations
        for shape in vector_shapes:
            if shape['type'] == 'rect':
                rect = Rect(
                    shape['left'],
                    shape['top'],
                    shape['left'] + shape['width'],
                    shape['top'] + shape['height']
                )
                
                annot = page.add_rect_annot(rect)
                
                # Black color (0, 0, 0) with 100% opacity
                annot.set_colors(
                    stroke=(0, 0, 0),  # RGB black
                    fill=(0, 0, 0, 1)  # RGBA black with 100% opacity for fill
                )
                annot.update()
        
        # Save with high quality
        output = io.BytesIO()
        new_doc.save(output,
                    garbage=4,
                    deflate=True,
                    clean=True)
        output.seek(0)
        
        # Clean up
        doc.close()
        new_doc.close()
        
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'page_{page_num + 1}.pdf'
        )

    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': 'An internal error occurred'}), 500

@app.route('/api/v1/internal/pdf/page-count', methods=['POST'])
def get_pdf_page_count():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    file.seek(0, io.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    
    if file_length > MAX_FILE_SIZE:
        return jsonify({'error': f'File size exceeds the maximum limit of {MAX_FILE_SIZE/1024/1024:.0f} MB'}), 400
    
    try:
        # Verify PDF header
        pdf_header = file.read(4)
        file.seek(0)  # Reset file pointer
        if pdf_header != b'%PDF':
            return jsonify({'error': 'Not a valid PDF file'}), 400
        
        # Count pages using pdfplumber
        with pdfplumber.open(file) as pdf:
            num_pages = len(pdf.pages)
            
        return jsonify({
            'numPages': num_pages
        })
        
    except Exception as e:
        logger.error(f"Error counting PDF pages: {str(e)}")
        return jsonify({'error': 'An error occurred while processing the PDF'}), 500

@app.route('/api/v1/internal/pdf/extract-text', methods=['POST'])
def extract_pdf_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    pages_to_extract = request.form.get('pages', '').split(',')
    
    try:
        # Validate pages input
        pages = [int(p.strip()) for p in pages_to_extract if p.strip()]
        if not pages:
            return jsonify({'error': 'No valid page numbers provided'}), 400
        if not all(p > 0 for p in pages):
            return jsonify({'error': 'Invalid page numbers'}), 400
        
        # Check file size
        file.seek(0, io.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return jsonify({'error': f'File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes'}), 400
        
        # Verify PDF header
        pdf_header = file.read(4)
        file.seek(0)
        if pdf_header != b'%PDF':
            return jsonify({'error': 'Invalid PDF file format'}), 400
        
        # Extract text with improved efficiency
        text_parts = []
        with pdfplumber.open(file) as pdf:
            total_pages = len(pdf.pages)
            if any(p > total_pages for p in pages):
                return jsonify({'error': f'Page number exceeds document length ({total_pages} pages)'}), 400
            
            for page in pdf.pages:
                if page.page_number in pages:
                    text = page.extract_text()
                    # Check for sensitive data - do case conversion once
                    text_lower = text.lower()
                    matched_patterns = [
                        pattern 
                        for pattern in SENSITIVE_PATTERNS 
                        if pattern.lower() in text_lower
                    ]
                    if matched_patterns:
                        return jsonify({
                            'success': False,
                            'data': {
                                'patterns_matched': matched_patterns
                            },
                            'error': 'Document contains sensitive information and cannot be processed'
                        }), 400
                    text_parts.append(text)
        
        return jsonify({
            'success': True,
            'text': '\n'.join(text_parts)
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An error occurred while processing the PDF'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8082,
        debug=os.getenv('FLASK_ENV', 'production') == 'development'
    )