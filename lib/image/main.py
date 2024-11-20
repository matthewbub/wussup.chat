from flask import Flask, request, jsonify, send_file
import fitz  # PyMuPDF
from io import BytesIO
from flask_cors import CORS
import PIL.Image
import base64
from PIL import Image
import io

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

@app.route('/api/v1/pdf/apply-drawing', methods=['POST'])
def apply_drawing():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    page_num = int(request.form.get('page', 1)) - 1
    drawing_data = request.form.get('drawing')
    
    if not drawing_data:
        return jsonify({'error': 'No drawing data provided'}), 400
    
    try:
        # Read original PDF just to get the page
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc[page_num]
        
        # Convert drawing data to image with high DPI
        drawing_data = drawing_data.split(',')[1]
        drawing_bytes = base64.b64decode(drawing_data)
        drawing_image = Image.open(io.BytesIO(drawing_bytes))
        
        if drawing_image.mode != 'RGBA':
            drawing_image = drawing_image.convert('RGBA')
        
        # Get page dimensions at 300 DPI for better quality
        zoom = 3  # 300 DPI (3 x 96 DPI)
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        base_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Resize drawing to match high-res PDF page
        drawing_image = drawing_image.resize((pix.width, pix.height), Image.Resampling.LANCZOS)
        
        # Composite images
        base_image.paste(drawing_image, (0, 0), drawing_image)
        
        # Create new single-page PDF with the same dimensions as original page
        new_doc = fitz.open()
        new_page = new_doc.new_page(width=page.rect.width, height=page.rect.height)
        
        # Convert edited image to bytes with high quality
        img_bytes = io.BytesIO()
        base_image.save(img_bytes, format='PNG', optimize=False, quality=100)
        img_bytes.seek(0)
        
        # Insert image into new PDF with proper scaling
        new_page.insert_image(new_page.rect, stream=img_bytes, keep_proportion=True)
        
        # Save to bytes with high quality settings
        output = io.BytesIO()
        new_doc.save(output, 
                    garbage=4,
                    deflate=True,
                    clean=True)
        output.seek(0)
        
        # Clean up
        doc.close()
        new_doc.close()
        
        # Return the modified single page with the original page number
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'page_{page_num + 1}.pdf'  # Keep original page numbering
        )

    except Exception as e:
        print(e)  # For debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)