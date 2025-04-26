
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoom: (delta: number) => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ scale, onZoom, onReset }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onZoom(-0.25)}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Slider
        value={[scale * 100]}
        onValueChange={(value) => onZoom((value[0] / 100) - scale)}
        min={50}
        max={300}
        step={10}
        className="w-32"
      />
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onZoom(0.25)}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onReset}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
