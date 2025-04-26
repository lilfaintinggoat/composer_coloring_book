
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eraser, Undo, Download } from 'lucide-react';
import { useZoomPan } from '@/hooks/useZoomPan';
import ZoomControls from './ZoomControls';

interface ColoringCanvasProps {
  imageUrl: string;
  onBack: () => void;
}

const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ imageUrl, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState('#8B1C3B');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isColoring, setIsColoring] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { zoomState, zoom, pan, reset } = useZoomPan(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const originalImageDataRef = useRef<ImageData | null>(null);

  const generateColorPalette = () => {
    const colors = [];
    
    // Basic colors (first row)
    colors.push('#FFFFFF', '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#FF0000', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF00', '#C0C0C0');
    
    // Skin tones and browns
    const skinTones = [
      '#8D5524', '#C68642', '#E0AC69', '#F1C27D', 
      '#FFDBAC', '#E5C298', '#DEB887', '#D2B48C',
      '#A0522D', '#6B4423', '#794D2F', '#935D38',
      '#AA6C3F', '#C18448', '#BC8F8F', '#E6BE8A'
    ];
    colors.push(...skinTones);

    // Generate rainbow gradient colors
    for (let r = 0; r < 4; r++) {
      for (let g = 0; g < 4; g++) {
        for (let b = 0; b < 4; b++) {
          const color = `#${(r * 85).toString(16).padStart(2, '0')}${(g * 85).toString(16).padStart(2, '0')}${(b * 85).toString(16).padStart(2, '0')}`;
          colors.push(color);
        }
      }
    }

    // Add grayscale
    for (let i = 0; i < 16; i++) {
      const value = Math.floor(i * 16).toString(16).padStart(2, '0');
      colors.push(`#${value}${value}${value}`);
    }

    // Pastel colors
    const pastels = [
      '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
      '#FFB3FF', '#B3FFB3', '#B3B3FF', '#FFCCB3',
      '#E6B3B3', '#B3E6B3', '#B3B3E6', '#E6CCB3',
      '#F0B3FF', '#B3FFF0', '#B3F0FF', '#FFF0B3'
    ];
    colors.push(...pastels);

    // Fill remaining slots with additional color variations
    while (colors.length < 256) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }

    return colors.slice(0, 256);
  };

  const colors = generateColorPalette();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (canvas && context) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        
        // Store the original image data for history
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        originalImageDataRef.current = imageData;
        setHistory([imageData]);
        setImageLoaded(true);
      };
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [zoomState, imageLoaded]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (!canvas || !context || !originalImageDataRef.current) return;
    
    // Apply transformations for zoom and pan
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan transformations
    context.setTransform(
      zoomState.scale, 0, 
      0, zoomState.scale, 
      zoomState.translateX, zoomState.translateY
    );
    
    // Draw the current state from history
    context.putImageData(history[history.length - 1], 0, 0);
    context.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      // Right-click is prevented by default
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get canvas and mouse position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: mouseX - zoomState.translateX,
      y: mouseY - zoomState.translateY
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    pan(
      mouseX - dragStart.x - zoomState.translateX,
      mouseY - dragStart.y - zoomState.translateY
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Don't color if we're dragging
    
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (canvas && context) {
      // Get the actual position considering zoom and pan
      const rect = canvas.getBoundingClientRect();
      
      // Calculate the position in the original image coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Convert screen coordinates to canvas coordinates
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      
      // Convert canvas coordinates to image coordinates (accounting for zoom and pan)
      const x = (canvasX - zoomState.translateX) / zoomState.scale;
      const y = (canvasY - zoomState.translateY) / zoomState.scale;
      
      // Save the current state first
      context.save();
      
      // Reset transformations temporarily to work with actual pixel data
      context.setTransform(1, 0, 0, 1, 0, 0);
      
      // Get the current image data
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // Create a copy for flood fill
      const newImageData = new ImageData(
        new Uint8ClampedArray(currentImageData.data),
        currentImageData.width,
        currentImageData.height
      );
      
      // Apply flood fill to the copy
      improvedFloodFill(newImageData, Math.round(x), Math.round(y), currentColor);
      
      // Update the history
      setHistory(prev => [...prev, newImageData]);
      
      // Redraw with the new image data
      context.putImageData(newImageData, 0, 0);
      
      // Restore transformations
      context.restore();
      
      // Force a redraw with transformations
      redrawCanvas();
    }
  };

  // Improved flood fill algorithm with tolerance for similar colors
  const improvedFloodFill = (imageData: ImageData, startX: number, startY: number, fillColor: string) => {
    const { width, height, data } = imageData;
    
    // Check boundaries
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
      return;
    }
    
    const stack: [number, number][] = [[startX, startY]];
    const startPos = (startY * width + startX) * 4;
    
    // Get RGB values of the starting pixel
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    
    // If trying to fill with the same color or transparent area, do nothing
    if (startA < 100) {
      return;
    }
    
    // Get RGB values of the fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Color similarity tolerance - higher values allow filling more dissimilar colors
    const tolerance = 30;
    
    // Track visited pixels to avoid checking them multiple times
    const visited = new Set<number>();
    
    // Check if a pixel is within tolerance of the starting color
    const isWithinTolerance = (pos: number): boolean => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      
      // Skip transparent pixels
      if (a < 100) {
        return false;
      }
      
      // Calculate color difference (Manhattan distance)
      const colorDiff = 
        Math.abs(r - startR) +
        Math.abs(g - startG) +
        Math.abs(b - startB);
      
      return colorDiff <= tolerance;
    };

    while (stack.length) {
      const [curX, curY] = stack.pop()!;
      
      // Skip if outside canvas
      if (curX < 0 || curX >= width || curY < 0 || curY >= height) {
        continue;
      }
      
      const pos = (curY * width + curX) * 4;
      const pixelKey = curY * width + curX;
      
      // Skip if already visited or not within tolerance
      if (visited.has(pixelKey) || !isWithinTolerance(pos)) {
        continue;
      }
      
      // Mark as visited
      visited.add(pixelKey);
      
      // Fill the pixel
      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      
      // Add neighbors to stack
      stack.push(
        [curX + 1, curY],
        [curX - 1, curY],
        [curX, curY + 1],
        [curX, curY - 1]
      );
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      
      // Force redraw with the previous state
      setTimeout(redrawCanvas, 0);
    }
  };

  const handleClear = () => {
    if (history.length > 0 && originalImageDataRef.current) {
      setHistory([originalImageDataRef.current]);
      
      // Force redraw with the original state
      setTimeout(redrawCanvas, 0);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'colored-composer.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-cream min-h-screen">
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <Button onClick={onBack} variant="outline">Back to Gallery</Button>
        <div className="flex gap-2">
          <Button onClick={handleUndo} disabled={history.length <= 1}>
            <Undo className="w-5 h-5" />
          </Button>
          <Button onClick={handleClear} variant="destructive">
            <Eraser className="w-5 h-5" />
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
        <div className="flex md:flex-col flex-wrap gap-2 p-4 bg-white rounded-lg shadow-md">
          <ZoomControls 
            scale={zoomState.scale}
            onZoom={zoom}
            onReset={reset}
          />
          <div className="grid grid-cols-8 md:grid-cols-16 gap-1 max-h-[70vh] overflow-y-auto p-2">
            {colors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                className={`w-6 h-6 rounded-sm border ${
                  color === currentColor ? 'border-gray-900 scale-110' : 'border-gray-200'
                } hover:scale-110 transition-transform`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="relative flex-1 bg-white rounded-lg shadow-md overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="max-w-full h-auto cursor-pointer"
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColoringCanvas;
