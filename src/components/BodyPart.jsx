import React, { useState, useEffect } from 'react';
import { fetchData, exerciseOptions } from '../utils/fetchData';
import { exercisePng } from "../images";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';

// Fallback exercises data in case API fails
const FALLBACK_EXERCISES = [
  { id: 1, name: 'Push Up', bodyPart: 'chest', target: 'chest', gifUrl: exercisePng },
  { id: 2, name: 'Pull Up', bodyPart: 'back', target: 'back', gifUrl: exercisePng },
  { id: 3, name: 'Squat', bodyPart: 'legs', target: 'quadriceps', gifUrl: exercisePng },
  { id: 4, name: 'Lunges', bodyPart: 'legs', target: 'quadriceps', gifUrl: exercisePng },
  { id: 5, name: 'Plank', bodyPart: 'core', target: 'abs', gifUrl: exercisePng },
];

const BodyPart = ({ bodyParts = [], setBodyPart, bodyPart, setExercises }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercisesData = async () => {
      if (!bodyPart) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let exercisesData;
        
        if (bodyPart === "all") {
          exercisesData = await fetchData(
            "https://exercisedb.p.rapidapi.com/exercises", 
            exerciseOptions
          );
        } else {
          exercisesData = await fetchData(
            `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, 
            exerciseOptions
          );
        }
        
        // If we get a valid response, use it, otherwise use fallback
        if (Array.isArray(exercisesData) && exercisesData.length > 0) {
          setExercises(exercisesData);
        } else {
          setExercises(FALLBACK_EXERCISES);
          setError('Using limited exercise data due to API limits');
        }
      } catch (err) {
        console.error('Failed to fetch exercises:', err);
        setExercises(FALLBACK_EXERCISES);
        setError('Using limited exercise data. Some features may not work as expected.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExercisesData();
  }, [bodyPart, setExercises]);


  const handleBodyPartClick = (part) => {
    setBodyPart(part);
    window.scrollTo({ top: 1000, left: 100, behavior: 'smooth' });
  };

  return (
    <section className="py-8">
      <div className="overflow-hidden">
        <h2 className='text-2xl sm:text-3xl md:text-4xl text-white font-semibold text-center mb-8'>
          Exercise Categories
        </h2>
        
        {error && (
          <div className='text-yellow-400 text-center text-sm mb-4'>
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            centeredSlides={false}
            centeredSlidesBounds={false}
            className="my-4 px-4"
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 10 },
              480: { slidesPerView: 3, spaceBetween: 12 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
            }}
          >
            {bodyParts.map((part, id) => (
              <SwiperSlide 
                key={id} 
                className="max-w-[160px] h-auto flex-shrink-0"
              >
                <div 
                  className={`bg-white rounded-lg hover:bg-gray-100 transition-all text-center cursor-pointer 
                    border-t-4 ${bodyPart === part ? 'border-blue-500' : 'border-gray-200'}
                    shadow-md hover:shadow-lg overflow-hidden h-full flex flex-col`}
                  onClick={() => handleBodyPartClick(part)}
                >
                  <div className="p-2 flex-grow flex items-center justify-center">
                    <img 
                      src={exercisePng} 
                      alt={part} 
                      className='w-16 h-16 mx-auto object-contain transition-transform hover:scale-110'
                    />
                  </div>
                  <h2 className='text-sm sm:text-base font-medium text-gray-800 p-2 border-t border-gray-100'>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </h2>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}

export default BodyPart;