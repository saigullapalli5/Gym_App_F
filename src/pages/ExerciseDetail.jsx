import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GiGymBag, GiMuscleUp, GiWeightLiftingUp } from "react-icons/gi";
import { FaDumbbell, FaHeart, FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import { fetchData, exerciseOptions } from "../utils/fetchData";
import { getExerciseImage } from "../utils/imageUtils";
import { ExerciseCard } from "../components";
import { useExerciseImage } from "../hooks/useExerciseImage";
import { useCart } from "../context/cart";

// Default exercise data structure
const DEFAULT_EXERCISE = {
  id: "",
  name: "Exercise Not Found",
  bodyPart: "N/A",
  target: "N/A",
  equipment: "N/A",
  gifUrl: "",
  instructions: ["No instructions available"],
  secondaryMuscles: [],
  tips: [
    "Try searching for a different exercise",
    "Check your internet connection",
    "Refresh the page and try again",
    "Ensure you are logged in to access all features",
    "Contact support if the issue persists",
  ],
  difficulty: "intermediate",
  rating: 4.0,
  benefits: [],
};

// Exercise-specific tips and details
const EXERCISE_TIPS = {
  "Pull Up": [
    "Engage your core throughout the movement to prevent swinging",
    "Focus on pulling with your back muscles, not just your arms",
    "Keep your shoulders down and back during the entire movement",
    "Start with assisted pull-ups if you can't do a full one yet",
    "Control the descent to maximize muscle engagement",
  ],
  "Push Up": [
    "Keep your body in a straight line from head to heels",
    "Lower your chest to just above the ground",
    "Keep your elbows at about a 45-degree angle from your body",
    "Engage your core throughout the movement",
    "Breathe in as you lower, breathe out as you push up",
  ],
  Squat: [
    "Keep your chest up and back straight",
    "Lower until your thighs are at least parallel to the ground",
    "Keep your knees in line with your toes",
    "Push through your heels to stand back up",
    "Engage your core for stability",
  ],
};

// Default tips for exercises not in the EXERCISE_TIPS object
const DEFAULT_TIPS = [
  "Focus on maintaining proper form throughout the exercise",
  "Breathe consistently - exhale on exertion, inhale on the easier part of the movement",
  "Start with lighter weights to master the form before increasing intensity",
  "Keep your core engaged to protect your back",
  "Listen to your body and stop if you feel any sharp pain",
];

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const [exercise, setExercise] = useState(DEFAULT_EXERCISE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Fetch related exercise videos from YouTube
  const fetchExerciseVideos = async (exerciseName) => {
    if (!exerciseName) return;

    try {
      setLoadingVideos(true);

      // Common base for YouTube thumbnails with different video IDs
      const getThumbnail = (videoId) =>
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

      // Realistic video data with proper YouTube video IDs and relevant content
      const videoCategories = {
        "Tutorials & Form Guides": [
          {
            id: "tut1",
            title: `Perfect ${exerciseName} Form - Step by Step Guide`,
            thumbnail: getThumbnail("eGo4IYlbE5g"),
            videoId: "eGo4IYlbE5g",
            channel: "Athlean-X",
            views: "3.2M",
            duration: "8:45",
            description:
              "Learn the proper form and technique to maximize your results and prevent injuries.",
          },
          {
            id: "tut2",
            title: `${exerciseName} - Complete Beginner's Tutorial`,
            thumbnail: getThumbnail("IODxDxX7oi4"),
            videoId: "IODxDxX7oi4",
            channel: "FitnessFAQs",
            views: "1.8M",
            duration: "12:30",
            description:
              "Start your fitness journey with this comprehensive beginner guide.",
          },
          {
            id: "tut3",
            title: `5 Common ${exerciseName} Mistakes & How to Fix Them`,
            thumbnail: getThumbnail("EiwmH5T5fFw"),
            videoId: "EiwmH5T5fFw",
            channel: "Jeremy Ethier",
            views: "2.5M",
            duration: "9:15",
            description:
              "Avoid these common mistakes to get the most out of your workout.",
          },
        ],
        "Exercise Variations": [
          {
            id: "var1",
            title: `7 ${exerciseName} Variations for All Levels`,
            thumbnail: getThumbnail("2tVm1yJINmQ"),
            videoId: "2tVm1yJINmQ",
            channel: "Calisthenicmovement",
            views: "1.1M",
            duration: "14:20",
            description:
              "Progress from beginner to advanced with these variations.",
          },
          {
            id: "var2",
            title: `${exerciseName} - Advanced Variations for Results`,
            thumbnail: getThumbnail("XeN4pCZZCXY"),
            videoId: "XeN4pCZZCXY",
            channel: "Chris Heria",
            views: "2.7M",
            duration: "11:45",
            description:
              "Take your training to the next level with these challenging variations.",
          },
        ],
        "Workout Routines": [
          {
            id: "work1",
            title: `30 Min ${exerciseName} Workout - All Levels`,
            thumbnail: getThumbnail("ml6cToxZLgo"),
            videoId: "ml6cToxZLgo",
            channel: "Pamela Reif",
            views: "4.5M",
            duration: "30:15",
            description:
              "Full body workout focusing on perfect form and technique.",
          },
          {
            id: "work2",
            title: `10 Min ${exerciseName} Challenge - Burn Fat Fast`,
            thumbnail: getThumbnail("j7rKKpwdXNE"),
            videoId: "j7rKKpwdXNE",
            channel: "Chloe Ting",
            views: "15.2M",
            duration: "10:30",
            description:
              "Quick and effective workout you can do anywhere, anytime.",
          },
          {
            id: "work3",
            title: `${exerciseName} for Strength & Endurance`,
            thumbnail: getThumbnail("c0Uxhjq8zZ4"),
            videoId: "c0Uxhjq8zZ4",
            channel: "Fitness Blender",
            views: "3.8M",
            duration: "25:45",
            description:
              "Build strength and endurance with this comprehensive routine.",
          },
        ],
        "Expert Tips": [
          {
            id: "tip1",
            title: `Scientist Explains: Best Way to Do ${exerciseName}`,
            thumbnail: getThumbnail("75W1V6yVVX4"),
            videoId: "75W1V6yVVX4",
            channel: "PictureFit",
            views: "1.9M",
            duration: "6:50",
            description: "Evidence-based approach to perfecting your form.",
          },
          {
            id: "tip2",
            title: `Physical Therapist's Guide to ${exerciseName}`,
            thumbnail: getThumbnail("NkcfWu70Y9Y"),
            videoId: "NkcfWu70Y9Y",
            channel: "Bob & Brad",
            views: "2.3M",
            duration: "9:15",
            description:
              "Learn how to perform this exercise safely and effectively.",
          },
        ],
      };

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setVideos(videoCategories);
    } catch (error) {
      console.error("Error fetching exercise videos:", error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a basic exercise with the ID
        const basicExercise = {
          id: id,
          name: "Loading Exercise...",
          instructions: ["Loading exercise details..."],
        };
        setExercise(processExerciseData(basicExercise));

        // Try to get data from location state first
        const locationState = window.history.state?.usr;
        if (locationState?.exercise) {
          const processedExercise = processExerciseData(locationState.exercise);
          setExercise(processedExercise);
          if (locationState.exercise.id) {
            checkIfFavorite(locationState.exercise.id);
          }
          setLoading(false);
          return;
        }

        // Try to fetch from API
        try {
          const apiData = await fetchData(
            `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
            exerciseOptions
          );

          if (!apiData) {
            throw new Error("No data received from API");
          }

          const processedExercise = processExerciseData(apiData);
          setExercise(processedExercise);
          if (apiData.id) {
            checkIfFavorite(apiData.id);
            // Fetch related videos after setting the main exercise
            fetchExerciseVideos(apiData.name);
          }
        } catch (apiError) {
          console.warn("Using fallback exercise data:", apiError);

          // Fallback to local data if API fails
          try {
            const fallbackData = await fetchData("fallback");
            let foundExercise = null;

            if (Array.isArray(fallbackData)) {
              foundExercise = fallbackData.find(
                (ex) =>
                  ex &&
                  (ex.id === id || ex.name?.toLowerCase() === id?.toLowerCase())
              );
            }

            if (!foundExercise) {
              // If no match found, create a basic exercise
              foundExercise = {
                id: id,
                name: id
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                bodyPart: "N/A",
                target: "N/A",
                equipment: "N/A",
                instructions: [
                  "No specific instructions available for this exercise.",
                ],
                tips: [
                  "Focus on proper form",
                  "Start with light weight and gradually increase",
                  "Consult a trainer for personalized guidance",
                ],
              };
            }

            const processedExercise = processExerciseData(foundExercise);
            setExercise(processedExercise);
            if (foundExercise.id) {
              checkIfFavorite(foundExercise.id);
            }
          } catch (fallbackError) {
            console.error("Error with fallback data:", fallbackError);
            // If all else fails, show a generic exercise
            const genericExercise = {
              id: id,
              name: id
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              instructions: ["Exercise details could not be loaded."],
              tips: [
                "Check your internet connection",
                "Try refreshing the page",
                "Contact support if the issue persists",
              ],
            };
            setExercise(processExerciseData(genericExercise));
          }
        }
      } catch (err) {
        console.error("Error fetching exercise data:", err);
        setError("Failed to load exercise details");
        setExercise({
          ...DEFAULT_EXERCISE,
          name: "Error Loading Exercise",
          instructions: [
            "Unable to load exercise details. Please try again later.",
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    const checkIfFavorite = (exerciseId) => {
      const isInFavorites = cart.some((item) => item.id === exerciseId);
      setIsFavorite(isInFavorites);
    };

    fetchExerciseData();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [id, cart]);

  // Process exercise data to ensure consistency
  const processExerciseData = (exerciseData) => {
    if (!exerciseData) {
      console.warn("No exercise data provided, using default");
      return {
        ...DEFAULT_EXERCISE,
      };
    }

    try {
      const exerciseName = exerciseData.name || "Unknown Exercise";
      const tips = EXERCISE_TIPS[exerciseName] || DEFAULT_TIPS;
      const id =
        exerciseData.id || `ex-${Math.random().toString(36).substr(2, 9)}`;

      return {
        ...DEFAULT_EXERCISE,
        ...exerciseData,
        id,
        name: exerciseName,
        bodyPart: exerciseData.bodyPart || "N/A",
        target: exerciseData.target || "N/A",
        equipment: exerciseData.equipment || "N/A",
        instructions: Array.isArray(exerciseData.instructions)
          ? exerciseData.instructions.filter(Boolean)
          : exerciseData.instructions
          ? [exerciseData.instructions]
          : ["No instructions available"],
        secondaryMuscles: Array.isArray(exerciseData.secondaryMuscles)
          ? exerciseData.secondaryMuscles
          : exerciseData.secondaryMuscles
          ? [exerciseData.secondaryMuscles]
          : [],
        tips: tips,
        difficulty: exerciseData.difficulty || "intermediate",
        rating: exerciseData.rating || 4.0,
        gifUrl: exerciseData.gifUrl || getExerciseImage(exerciseName),
      };
    } catch (error) {
      console.error("Error processing exercise data:", error);
      return {
        ...DEFAULT_EXERCISE,
        name: "Error Processing Exercise",
        instructions: [
          "There was an error loading this exercise. Please try again later.",
        ],
      };
    }
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    if (newFavoriteStatus) {
      // Add to favorites
      setCart([...cart, { ...exercise, isFavorite: true }]);
    } else {
      // Remove from favorites
      setCart(cart.filter((item) => item.id !== exercise.id));
    }
  };

  // Exercise Image Component
  const ExerciseImage = ({ exercise }) => {
    const { imageUrl, isLoading, error } = useExerciseImage(exercise);

    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-500">Loading image...</p>
        </div>
      );
    }

    if (error || !imageUrl) {
      return (
        <div className="text-center p-4">
          <div className="text-gray-300 text-5xl mb-2">🏋️</div>
          <p className="text-gray-500">No image available</p>
          {exercise?.name && (
            <p className="text-sm text-gray-400 mt-1">{exercise.name}</p>
          )}
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={exercise?.name || "Exercise demonstration"}
        className="w-full h-full object-contain rounded-lg"
        onError={(e) => {
          e.target.src = "/images/exercise-placeholder.svg";
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Exercise Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the exercise you're looking for.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
      >
        <FaArrowLeft className="mr-2" /> Back to Exercises
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Exercise Image */}
          <div className="md:w-1/2 p-6 bg-gray-100 flex items-center justify-center">
            <div className="relative w-full max-w-md h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <ExerciseImage exercise={exercise} />
            </div>
          </div>

          {/* Exercise Details */}
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {exercise.name}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="capitalize">
                    {exercise.difficulty || "Intermediate"}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(exercise.rating || 4)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1">({exercise.rating || "4.0"})</span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleFavorite}
                className={`mt-2 md:mt-0 p-2 rounded-full ${
                  isFavorite ? "text-red-500" : "text-gray-400"
                } hover:text-red-500 transition-colors`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <FaHeart
                  className={`text-2xl ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("instructions")}
                  className={`${
                    activeTab === "instructions"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`${
                    activeTab === "details"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Exercise Details
                </button>
                <button
                  onClick={() => setActiveTab("tips")}
                  className={`${
                    activeTab === "tips"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Pro Tips
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "instructions" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    How to perform
                  </h2>
                  <ol className="space-y-3">
                    {exercise.instructions.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <GiMuscleUp className="mr-2" />
                      <span className="font-medium">Primary Target</span>
                    </div>
                    <p className="text-gray-800 capitalize">
                      {exercise.target}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <GiMuscleUp className="mr-2" />
                      <span className="font-medium">Body Part</span>
                    </div>
                    <p className="text-gray-800 capitalize">
                      {exercise.bodyPart}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <FaDumbbell className="mr-2" />
                      <span className="font-medium">Equipment</span>
                    </div>
                    <p className="text-gray-800 capitalize">
                      {exercise.equipment}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <GiGymBag className="mr-2" />
                      <span className="font-medium">Secondary Muscles</span>
                    </div>
                    <p className="text-gray-800 capitalize">
                      {exercise.secondaryMuscles &&
                      exercise.secondaryMuscles.length > 0
                        ? exercise.secondaryMuscles.join(", ")
                        : "None"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <GiWeightLiftingUp className="mr-2" />
                      <span className="font-medium">Exercise Type</span>
                    </div>
                    <p className="text-gray-800 capitalize">Strength</p>
                  </div>
                </div>
              )}

              {activeTab === "tips" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Expert Tips
                  </h3>
                  <ul className="space-y-3">
                    {exercise.tips && exercise.tips.length > 0 ? (
                      exercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{tip}</p>
                        </li>
                      ))
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              No specific tips available for this exercise.
                              Focus on maintaining proper form and control
                              throughout the movement.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Videos by Category */}
      <div className="mt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            Exercise Tutorials & Guides
          </h2>

          {loadingVideos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            </div>
          ) : Object.keys(videos).length > 0 ? (
            <div className="space-y-16">
              {Object.entries(videos).map(([category, videoList]) => (
                <div key={category} className="mb-12">
                  <div className="flex items-center mb-6">
                    <div className="h-8 w-1.5 bg-purple-600 rounded-full mr-3"></div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoList.map((video) => (
                      <div
                        key={video.id}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                        onClick={() =>
                          window.open(
                            `https://www.youtube.com/watch?v=${video.videoId}`,
                            "_blank"
                          )
                        }
                      >
                        <div className="relative overflow-hidden">
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/800x450?text=Video+Not+Available";
                              }}
                            />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-90 group-hover:scale-110 transition-transform duration-300">
                              <svg
                                className="w-6 h-6 text-purple-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M15 10l4.553-2.276A1.5 1.5 0 0121 8.618v6.764a1.5 1.5 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {video.channel}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{video.views} views</span>
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              4.8
                            </span>
                          </div>
                          {video.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 10l4.553-2.276A1.5 1.5 0 0121 8.618v6.764a1.5 1.5 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Videos Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any video tutorials for this exercise. Try
                searching on YouTube for "{exercise.name} tutorial".
              </p>
              <button
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(
                      exercise.name + " tutorial"
                    )}`,
                    "_blank"
                  )
                }
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"></path>
                </svg>
                Search on YouTube
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
