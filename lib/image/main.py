from flask import Flask, request, jsonify, send_file
import fitz  # PyMuPDF
from io import BytesIO
from flask_cors import CORS
import PIL.Image

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3001"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"],
    "supports_credentials": True
}})

@app.route('/', methods=['GET'])
def index():
    return "Hello, World!"

@app.route('/api/v1/image/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/pdf/split-pages', methods=['POST'])
def split_pages():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.content_type != 'application/pdf':
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Read PDF file
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Create array to store individual page PDFs
        page_pdfs = []
        
        # Process each page
        for page_num in range(doc.page_count):
            # Create new PDF document for single page
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
            
            # Save to bytes
            output = BytesIO()
            new_doc.save(output)
            output.seek(0)
            
            # Convert to base64 for JSON response
            page_pdfs.append({
                'page_number': page_num + 1,
                'pdf_data': output.getvalue()
            })
            
            new_doc.close()
        
        doc.close()
        
        return jsonify({
            'num_pages': len(page_pdfs),
            'pages': page_pdfs
        })

    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)