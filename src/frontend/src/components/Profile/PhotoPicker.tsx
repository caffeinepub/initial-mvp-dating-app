import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const AVAILABLE_PHOTOS = [
  '/assets/generated/avatar-01.dim_512x512.png',
  '/assets/generated/avatar-02.dim_512x512.png',
  '/assets/generated/avatar-03.dim_512x512.png',
  '/assets/generated/avatar-04.dim_512x512.png',
  '/assets/generated/avatar-05.dim_512x512.png',
  '/assets/generated/avatar-06.dim_512x512.png',
  '/assets/generated/avatar-07.dim_512x512.png',
  '/assets/generated/avatar-08.dim_512x512.png'
];

interface PhotoPickerProps {
  selectedPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export default function PhotoPicker({ selectedPhotos, onPhotosChange }: PhotoPickerProps) {
  const togglePhoto = (photo: string) => {
    if (selectedPhotos.includes(photo)) {
      onPhotosChange(selectedPhotos.filter((p) => p !== photo));
    } else if (selectedPhotos.length < 5) {
      onPhotosChange([...selectedPhotos, photo]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {AVAILABLE_PHOTOS.map((photo) => {
          const isSelected = selectedPhotos.includes(photo);
          const selectionIndex = selectedPhotos.indexOf(photo);

          return (
            <button
              key={photo}
              type="button"
              onClick={() => togglePhoto(photo)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <img
                src={photo}
                alt="Avatar option"
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {selectionIndex + 1}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Selected: {selectedPhotos.length}/5
      </p>
    </div>
  );
}
