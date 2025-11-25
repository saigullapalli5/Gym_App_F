
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExerciseCard, SearchInput, SkeletonLoader } from '../components';
import { fetchData, exerciseOptions } from '../utils/fetchData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiRefreshCw, FiFilter } from 'react-icons/fi';

// Skeleton loader for exercise cards
const ExerciseSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex space-x-2 mb-3">
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, onRetry }) => (
  <div className="text-center my-12 p-8 bg-red-50 rounded-xl max-w-2xl mx-auto border border-red-100">
    <div className="flex justify-center mb-4">
      <FiAlertCircle className="w-12 h-12 text-red-500" />
    </div>
    <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-red-600 mb-6">{error || 'Failed to load exercises'}</p>
    <div className="flex flex-col sm:flex-row justify-center gap-3">
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Refresh Page
      </button>
    </div>
    <p className="text-sm text-gray-500 mt-4">
      If the problem persists, please check your internet connection or try again later.
    </p>
  </div>
);

const ITEMS_PER_PAGE = 12;

const Exercise = () => {
  const [bodyPart, setBodyPart] = useState("all");
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize AOS and fetch exercises on component mount
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      easing: 'ease-out-cubic'
    });
    
    const controller = new AbortController();
    fetchExercises(controller.signal);
    
    return () => controller.abort();
  }, [bodyPart, retryCount]);

  // Fetch exercises with retry logic and abort controller
  const fetchExercises = useCallback(async (signal) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add a small delay to show loading state (for better UX)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let data;
      const endpoint = bodyPart === 'all' 
        ? 'https://exercisedb.p.rapidapi.com/exercises'
        : `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
      
      data = await fetchData(endpoint, { ...exerciseOptions, signal });
      
      if (signal?.aborted) return;
      
      if (data && Array.isArray(data)) {
        setExercises(data);
        setFilteredExercises(data);
        setCurrentPage(1); // Reset to first page on new data
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      console.error('Error fetching exercises:', error);
      setError(error.message || 'Failed to load exercises');
      
      if (retryCount < 2) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(prev => prev + 1);
      } else {
        toast.error('Using limited exercise data. Some features may be restricted.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [bodyPart, retryCount]);

  // Handle search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExercises(exercises);
      return;
    }
    const lowercasedQuery = query.toLowerCase();
    const filtered = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowercasedQuery) ||
      exercise.target.toLowerCase().includes(lowercasedQuery) ||
      exercise.bodyPart.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredExercises(filtered);
    setCurrentPage(1);
  }, [exercises]);

  // Handle retry with exponential backoff
  const handleRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const paginatedExercises = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExercises.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredExercises, currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className='bg-gray-50 min-h-screen py-8 md:py-12'>
      <div className='container mx-auto px-4'>
        <header className='text-center mb-10' data-aos="fade-down">
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
            Browse Exercises
          </h1>
          <p className='text-gray-600 max-w-2xl mx-auto text-sm sm:text-base'>
            Explore our collection of exercises to find the perfect workout for your fitness goals.
            Filter by body part or search for specific exercises.
          </p>
        </header>
        
        {/* Search and Filter Section */}
        <div className='mb-8' data-aos="fade-up">
          <div className='flex flex-col md:flex-row gap-4 items-center justify-between mb-6'>
            <div className='relative w-full md:max-w-md'>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className='w-full px-4 py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-center"
            >
              <FiFilter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6" data-aos="fade-up">
              <h3 className="font-medium text-gray-900 mb-3">Filter by Body Part</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'waist'].map((part) => (
                  <button
                    key={part}
                    onClick={() => {
                      setBodyPart(part);
                      setShowFilters(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      bodyPart === part
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className='mb-8 p-4 bg-gray-50 rounded-lg' data-aos="fade-up">
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Quick Navigation</h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
            {['all', 'chest', 'back', 'arms', 'legs', 'shoulders'].map((part) => (
              <button
                key={part}
                onClick={() => {
                  setBodyPart(part);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  bodyPart === part
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className='min-h-[400px]'>
          {isLoading ? (
            <ExerciseSkeleton count={8} />
          ) : error ? (
            <ErrorFallback error={error} onRetry={handleRetry} />
          ) : filteredExercises.length === 0 ? (
            <div className='text-center py-16' data-aos="fade-up">
              <div className='bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiAlertCircle className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No exercises found</h3>
              <p className='text-gray-600 max-w-md mx-auto mb-6'>
                {searchQuery 
                  ? `No exercises match your search for "${searchQuery}". Try a different term.`
                  : `No exercises available for this category. Please try another filter.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBodyPart('all');
                }}
                className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2'
              >
                <FiRefreshCw className='w-4 h-4' />
                Reset Filters
              </button>
            </div>
          ) : (
          <div data-aos="fade-up" data-aos-delay="200">
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold text-gray-800'>
                {bodyPart === 'all' ? 'All Exercises' : `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Exercises`}
              </h2>
              <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </div>
            
            <ExerciseCard 
              exercises={paginatedExercises} 
              bodyPart={bodyPart} 
              setExercises={setExercises} 
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center mt-10'>
                <nav className='inline-flex rounded-md shadow-sm -space-x-px' aria-label='Pagination'>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className='relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className='relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Exercise);
