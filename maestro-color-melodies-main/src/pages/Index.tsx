
import React, { useState } from 'react';
import ComposerGallery from '../components/ComposerGallery';
import ColoringCanvas from '../components/ColoringCanvas';

interface Composer {
  id: number;
  name: string;
  image: string;
}

const Index = () => {
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(null);

  const handleComposerSelect = (composer: Composer) => {
    setSelectedComposer(composer);
  };

  const handleBack = () => {
    setSelectedComposer(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      {selectedComposer ? (
        <ColoringCanvas
          imageUrl={selectedComposer.image}
          onBack={handleBack}
        />
      ) : (
        <ComposerGallery onSelect={handleComposerSelect} />
      )}
    </div>
  );
};

export default Index;
