import React, { useRef, useEffect, useState } from "react";
import * as fabric from "fabric";

interface PDFDrawingCanvasProps {
  backgroundImage: string;
  onSave: (drawingData: string) => void;
  onClose: () => void;
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
      const fabricImage = new fabric.FabricImage(img, {
        scaleX: Math.min(
          canvas.width! / img.width,
          canvas.height! / img.height
        ),
        scaleY: Math.min(
          canvas.width! / img.width,
          canvas.height! / img.height
        ),
        originX: "center",
        originY: "center",
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        selectable: false,
        evented: false,
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
      width: 100,
      height: 100,
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
    const drawingData = fabricCanvasRef.current.toDataURL();
    onSave(drawingData);
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
