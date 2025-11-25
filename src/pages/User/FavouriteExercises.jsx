import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components';

const FavouriteExercises = () => {
  const { auth } = useAuth();
  const { cart, setCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading if needed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Remove exercise from favorites
  const removeExercise = (exerciseId) => {
    try {
      const updatedCart = cart.filter(item => item.id !== exerciseId);
      setCart(updatedCart);
      toast.success("Exercise removed from favorites");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Failed to remove exercise");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <h1 className="text-2xl sm:text-4xl text-white text-center mb-6">
          No Favorite Exercises Yet
        </h1>
        <p className="text-gray-300 text-center mb-8">
          You haven't added any exercises to your favorites yet.
        </p>
        <button
          onClick={() => navigate('/exercise')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Browse Exercises
        </button>
      </div>
    );
  }

  return (
    <section className='min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className="max-w-7xl mx-auto">
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-2'>
            Your <span className='text-purple-400'>Favorite</span> Exercises
          </h2>
          <p className='text-gray-300'>
            {cart.length} {cart.length === 1 ? 'exercise' : 'exercises'} in your favorites
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {cart.map((exercise) => (
            <div 
              key={exercise.id} 
              className='bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700 flex flex-col h-full'
            >
              <Link 
                to={`/exercise/${exercise.id}`} 
                className='flex-1 flex flex-col group'
              >
                <div className='relative h-48 overflow-hidden bg-gray-900'>
                  <img 
                    src={exercise.gifUrl || '/exercise-placeholder.jpg'} 
                    alt={exercise.name}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    loading='lazy'
                    onError={(e) => {
                      e.target.src = '/exercise-placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className='p-4 flex-1 flex flex-col'>
                  <div className='flex flex-wrap gap-2 mb-3 justify-center'>
                    <span className='px-3 py-1 bg-purple-900/50 text-purple-200 text-xs font-medium rounded-full'>
                      {exercise.bodyPart || 'N/A'}
                    </span>
                    <span className='px-3 py-1 bg-blue-900/50 text-blue-200 text-xs font-medium rounded-full'>
                      {exercise.target || 'N/A'}
                    </span>
                  </div>
                  <h3 className='text-lg font-semibold text-center text-white mb-4'>
                    {exercise.name || 'Unnamed Exercise'}
                  </h3>
                </div>
              </Link>
              
              <div className='p-4 border-t border-gray-700'>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeExercise(exercise.id);
                  }}
                  className='w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FavouriteExercises;