import { useState, useEffect } from 'react';
import { getExerciseImage } from '../utils/imageUtils';

export const useExerciseImage = (exercise, options = {}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { preferGif = true } = options;

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Try to load the GIF first if available and preferred
        if (preferGif && exercise?.gifUrl) {
          const img = new Image();
          img.src = exercise.gifUrl;
          
          const gifLoaded = await new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });

          if (gifLoaded && isMounted) {
            setImageUrl(exercise.gifUrl);
            setIsLoading(false);
            return;
          }
        }

        // Fall back to the exercise image
        const exerciseImageUrl = await getExerciseImage(exercise?.name || '');
        if (isMounted) {
          setImageUrl(exerciseImageUrl);
        }
      } catch (err) {
        console.error('Error loading exercise image:', err);
        if (isMounted) {
          setError('Failed to load image');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [exercise?.gifUrl, exercise?.name, preferGif]);

  return { imageUrl, isLoading, error };
};
