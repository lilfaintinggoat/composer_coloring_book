
import React from 'react';
import { Card } from "@/components/ui/card";

interface Composer {
  id: number;
  name: string;
  image: string;
}

const composers: Composer[] = [
  { id: 1, name: "Mozart", image: "/lovable-uploads/mozart.png" },
  { id: 2, name: "Bach", image: "/placeholder.svg" },
  { id: 3, name: "Beethoven", image: "/lovable-uploads/beethoven.png" },
  { id: 4, name: "Brahms", image: "/placeholder.svg" },
  { id: 5, name: "Tchaikovsky", image: "/placeholder.svg" },
  { id: 6, name: "Vivaldi", image: "/placeholder.svg" },
  { id: 7, name: "Chopin", image: "/placeholder.svg" },
  { id: 8, name: "Schubert", image: "/schubert.svg" },
  { id: 9, name: "Haydn", image: "/placeholder.svg" },
];

interface ComposerGalleryProps {
  onSelect: (composer: Composer) => void;
}

const ComposerGallery: React.FC<ComposerGalleryProps> = ({ onSelect }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-serif text-center mb-8 text-charcoal">Classical Composers Coloring Book</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {composers.map((composer) => (
          <Card
            key={composer.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
            onClick={() => onSelect(composer)}
          >
            <img
              src={composer.image}
              alt={composer.name}
              className="w-full h-64 object-contain mb-4"
            />
            <h2 className="text-xl font-serif text-center text-charcoal">{composer.name}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComposerGallery;
