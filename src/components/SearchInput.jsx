import React, {useState, useEffect} from 'react';
import {AiOutlineSearch} from "react-icons/ai";
import { exerciseOptions, fetchData } from '../utils/fetchData';
import BodyPart from './BodyPart';

// Fallback body parts in case API fails
const FALLBACK_BODY_PARTS = [
  'all', 'back', 'cardio', 'chest', 'lower arms', 'lower legs', 
  'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'
];

const SearchInput = ({ setExercises, bodyPart, setBodyPart }) => {
  const [search, setSearch] = useState('');
  const [bodyParts, setBodyParts] = useState(FALLBACK_BODY_PARTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBodypartsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const bodypartsData = await fetchData(
          "https://exercisedb.p.rapidapi.com/exercises/bodyPartList", 
          exerciseOptions
        );
        
        // If we got an array with items, use it; otherwise use fallback
        if (Array.isArray(bodypartsData) && bodypartsData.length > 0) {
          setBodyParts(["all", ...bodypartsData]);
        } else {
          setBodyParts(FALLBACK_BODY_PARTS);
          setError('Using limited set of body parts');
        }
      } catch (err) {
        console.error('Failed to fetch body parts:', err);
        setBodyParts(FALLBACK_BODY_PARTS);
        setError('Using limited set of body parts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBodypartsData();
  }, []);
  
  const handleSearch = async () => {
    if (!search.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const exercisesData = await fetchData(
        "https://exercisedb.p.rapidapi.com/exercises", 
        exerciseOptions
      );
      
      const searchTerm = search.toLowerCase();
      const searchedExercises = exercisesData.filter(exercise => 
        exercise?.name?.toLowerCase().includes(searchTerm) || 
        exercise?.target?.toLowerCase().includes(searchTerm) || 
        exercise?.equipment?.toLowerCase().includes(searchTerm) || 
        exercise?.bodyPart?.toLowerCase().includes(searchTerm)
      );
      
      setSearch('');
      setExercises(searchedExercises);
      
      if (searchedExercises.length === 0) {
        setError('No exercises found. Try a different search term.');
      }
      
      window.scrollTo({ top: 1000, left: 100, behavior: "smooth" });
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search is currently limited. Try again later or use the category filters.');
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='pt-32'>
      <div className='px-7 sm:px-14 space-y-8'>
        <h2 className='text-2xl sm:text-3xl md:text-5xl text-white capitalize text-center md:text-center border-b-4 border-red-500 sm:border-none'>
          Awesome exercises you <br /> should know
        </h2>
        
        <div className='flex flex-col items-center space-y-4'>
          <div className='flex flex-row justify-center items-center w-full max-w-4xl'>
            <input 
              type="text" 
              placeholder='Search for exercises...' 
              className='outline-none px-6 py-3 text-lg text-gray-800 w-full rounded-l-lg' 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className='text-2xl px-6 text-white bg-blue-500 py-3 rounded-r-lg hover:bg-blue-600 transition-colors'
              onClick={handleSearch}
              disabled={isLoading}
            >
              <AiOutlineSearch/>
            </button>
          </div>
          
          {error && (
            <div className='text-yellow-400 text-center text-sm'>
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className='text-white text-center py-4'>Loading exercise categories...</div>
          ) : (
            <BodyPart 
              bodyParts={bodyParts} 
              bodyPart={bodyPart} 
              setBodyPart={setBodyPart} 
              setExercises={setExercises}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default SearchInput;