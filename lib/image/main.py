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
    if file.content_type != 'application/pdf':
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Read PDF file
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Get first page
        page = doc[0]
        
        # Convert to image
        pix = page.get_pixmap()
        img = PIL.Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Save to bytes
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png', as_attachment=False, download_name='preview.png')

    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)