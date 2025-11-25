import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from "../context/cart";
import { toast } from "react-hot-toast";
import { getExerciseImage, EXERCISE_IMAGES } from '../utils/imageUtils';

const ExerciseCard = ({ exercises = [], heading, bodyPart }) => {
  const { cart, setCart } = useCart();

  // Handle loading and error states
  if (!Array.isArray(exercises)) {
    return (
      <div className='flex flex-col items-center justify-center w-full py-16 bg-gray-100 rounded-lg'>
        <p className='text-lg text-red-500 mb-4'>Failed to load exercises.</p>
        <button 
          onClick={() => window.location.reload()}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
        >
          Retry
        </button>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center w-full py-16 bg-gray-100 rounded-lg'>
        <h2 className='text-2xl font-medium text-gray-700 mb-2'>No exercises found</h2>
        <p className='text-gray-500 mb-4'>
          {bodyPart && bodyPart !== 'all' 
            ? `No exercises found for ${bodyPart}.` 
            : 'Try a different search term or category.'}
        </p>
      </div>
    );
  }

  const handleAddToCart = (exercise) => {
    const isExerciseInCart = cart.some(item => item.id === exercise.id);

    if (!isExerciseInCart) {
      setCart([...cart, exercise]);
      toast.success("Exercise added to Favourite");
    } else {
      toast.error("Exercise is already in the Favourite");
    }
  };

  const toggleCart = (exercise) => {
    const isExerciseInCart = cart.some(item => item.id === exercise.id);

    if (isExerciseInCart) {
      setCart(cart.filter((item) => item.id !== exercise.id));
      toast.success("Exercise removed from Favourite");
    } else {
      setCart([...cart, exercise]);
      toast.success("Exercise added to Favourite");
    }
  };

  // Component for handling exercise images with loading and error states
  const ExerciseImage = ({ exercise }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [triedFallback, setTriedFallback] = useState(false);

    // Function to safely load an image
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    };

    useEffect(() => {
      let isMounted = true;
      
      const loadExerciseImage = async () => {
        if (!isMounted) return;
        
        setIsLoading(true);
        setHasError(false);
        setTriedFallback(false);

        try {
          // Try loading the GIF URL first if available
          if (exercise.gifUrl) {
            try {
              await loadImage(exercise.gifUrl);
              if (isMounted) {
                setImageUrl(exercise.gifUrl);
                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.log('GIF failed to load, trying fallback...');
            }
          }

          // Get the best matching image URL using our utility function
          const exerciseImageUrl = await getExerciseImage(exercise.name);
          
          // Try to load the exercise image
          try {
            await loadImage(exerciseImageUrl);
            if (isMounted) {
              setImageUrl(exerciseImageUrl);
              setIsLoading(false);
            }
          } catch (error) {
            console.log('Exercise image failed to load, using default...');
            throw error; // Will be caught by the outer catch
          }
        } catch (error) {
          console.error('Error loading exercise image:', error);
          if (isMounted) {
            setHasError(true);
            // Use the default image from our utility
            setImageUrl(EXERCISE_IMAGES.default);
            setIsLoading(false);
          }
        }
      };

      loadExerciseImage();

      return () => {
        isMounted = false;
      };
    }, [exercise.gifUrl, exercise.name]);

    return (
      <div className='relative h-48 overflow-hidden rounded-lg mb-4 bg-gray-50 flex items-center justify-center'>
        {isLoading ? (
          <div className='w-full h-full flex flex-col items-center justify-center space-y-2'>
            <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
            <p className='text-sm text-gray-500'>Loading image...</p>
          </div>
        ) : hasError ? (
          <div className='text-center p-4'>
            <div className='text-gray-300 text-5xl mb-2'>🏋️</div>
            <p className='text-sm text-gray-400'>Exercise image not available</p>
          </div>
        ) : (
          <img 
            src={imageUrl}
            alt={exercise.name}
            className='w-full h-full object-cover md:object-contain transition-transform duration-300 hover:scale-105'
            loading='lazy'
            onError={(e) => {
              if (!triedFallback) {
                e.target.src = getExerciseImage('default');
                setTriedFallback(true);
              } else {
                e.target.className = 'w-1/2 h-1/2 object-contain opacity-50';
                e.target.onerror = null;
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <section className='py-12 bg-white' id='exercises'>
      <div className="container mx-auto px-4">
        {heading && (
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800'>
            {heading} Exercises
          </h2>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exercises.slice(0, 24).map((exercise) => {
            const exerciseData = {
              id: exercise.id || `ex-${Math.random().toString(36).substr(2, 9)}`,
              name: exercise.name || 'Unnamed Exercise',
              bodyPart: exercise.bodyPart || 'N/A',
              target: exercise.target || 'N/A',
              equipment: exercise.equipment || 'N/A',
              gifUrl: exercise.gifUrl || '',
              instructions: exercise.instructions || []
            };
            
            return (
              <div 
                key={exerciseData.id}
                className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col'
              >
                <Link 
                  to={`/exercise/${exerciseData.id}`}
                  state={{ exercise: exerciseData }}
                  className='flex-1 flex flex-col'
                >
                  <div className='p-4 flex-1 flex flex-col'>
                    <ExerciseImage exercise={exerciseData} />
                    
                    <div className='flex-1 flex flex-col'>
                      <div className='flex flex-wrap gap-2 mb-3 justify-center'>
                        <span 
                          title={`Body Part: ${exerciseData.bodyPart}`} 
                          className='px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap truncate max-w-[120px]'
                        >
                          {exerciseData.bodyPart}
                        </span>
                        <span 
                          title={`Target: ${exerciseData.target}`} 
                          className='px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap truncate max-w-[120px]'
                        >
                          {exerciseData.target}
                        </span>
                      </div>
                      <h3 
                        className='text-lg font-semibold text-center mb-4 text-gray-800' 
                        title={exerciseData.name}
                      >
                        {exerciseData.name.length > 24 
                          ? `${exerciseData.name.substring(0, 22)}...` 
                          : exerciseData.name
                        }
                      </h3>
                    </div>
                  </div>
                </Link>
                
                <div className='p-4 border-t border-gray-100'>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(exerciseData);
                    }}
                    className='w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2'
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    Add to Favorites
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExerciseCard;