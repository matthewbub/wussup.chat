import React, { useRef, useEffect, useState } from "react";
import * as fabric from "fabric";

interface PDFDrawingCanvasProps {
  backgroundImage: string;
  onSave: (drawingData: DrawingData[]) => void;
  onClose: () => void;
}

interface DrawingData {
  type: "rect";
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

const PDFDrawingCanvas: React.FC<PDFDrawingCanvasProps> = ({
  backgroundImage,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [boxColor] = useState("#FF0000"); // Fixed red color for boxes

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight * 0.8;

    // Initialize canvas without drawing mode
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false, // Disable drawing mode
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "transparent",
    });
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Load background image
    const img = new Image();
    img.onload = () => {
      // Calculate scale to fit the container while maintaining aspect ratio
      const scale = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      );

      const fabricImage = new fabric.FabricImage(img, {
        scaleX: scale,
        scaleY: scale,
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
      });

      // Set canvas size to match scaled image size
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      canvas.setDimensions({
        width: scaledWidth,
        height: scaledHeight,
      });

      canvas.backgroundImage = fabricImage;
      canvas.renderAll();
    };
    img.src = backgroundImage;

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = window.innerHeight * 0.8;
      canvas.setDimensions({ width: newWidth, height: newHeight });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [backgroundImage]);

  const addBox = () => {
    if (!fabricCanvasRef.current) return;

    // Create a new rectangle
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 400,
      height: 40,
      fill: boxColor,
      opacity: 0.5,
      strokeWidth: 2,
      stroke: boxColor,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvasRef.current) return;

    // Convert canvas objects to vector data
    const vectorData: DrawingData[] = fabricCanvasRef.current
      .getObjects()
      .map((obj) => {
        const scaled = getScaledCoordinates(obj);
        return {
          type: "rect",
          left: scaled.left,
          top: scaled.top,
          width: scaled.width,
          height: scaled.height,
          color: obj.fill as string,
          opacity: obj.opacity || 0.5,
        };
      });

    onSave(vectorData);
  };

  // Helper to convert canvas coordinates to PDF coordinates
  const getScaledCoordinates = (obj: fabric.Object) => {
    const canvas = fabricCanvasRef.current!;
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // Get original PDF dimensions from the background image
    const bgImage = canvas.backgroundImage as fabric.Image;
    const pdfWidth = bgImage.width!;
    const pdfHeight = bgImage.height!;

    return {
      left: (obj.left! / canvasWidth) * pdfWidth,
      top: (obj.top! / canvasHeight) * pdfHeight,
      width: ((obj.width! * obj.scaleX!) / canvasWidth) * pdfWidth,
      height: ((obj.height! * obj.scaleY!) / canvasHeight) * pdfHeight,
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
      <div className="flex justify-between mb-4">
        <div className="space-x-4">
          <button
            onClick={addBox}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Add Box
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PDFDrawingCanvas;
