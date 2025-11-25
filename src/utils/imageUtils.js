// Helper function to convert exercise name to image filename
const getImageFilename = (name) => {
  if (!name) return null;
  // Convert to kebab-case and clean up
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') +      // Remove leading/trailing hyphens
    '.jpg';
};

// Check if image exists at the given path
const imageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Default exercise images from local public folder with CDN fallback
export const EXERCISE_IMAGES = {
  // Upper Body
  'push up': 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'pull up': 'https://images.unsplash.com/photo-1596815067527-6a85dcc0f4e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bench press': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'shoulder press': 'https://images.unsplash.com/photo-1534258932625-384bc5f45779?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bicep curl': 'https://images.unsplash.com/photo-1534368428065-8eb9d737d8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'tricep dip': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'lat pulldown': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'dumbbell row': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Lower Body
  'squat': 'https://images.unsplash.com/photo-1601422407692-ec4eea5e8c0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'deadlift': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'lunge': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'leg press': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'leg curl': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'calf raise': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Core
  'plank': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'sit up': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'russian twist': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'leg raise': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'mountain climber': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Cardio
  'jumping jack': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'burpee': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'jump rope': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'high knees': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Default fallback (SVG placeholder)
  'default': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCIgZmlsbD0ibm9uZSI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz4KICA8cGF0aCBkPSJNMjAwIDEwMEMxNzcuOTA5IDEwMCAxNjAgMTE3LjkwOSAxNjAgMTQwQzE2MCAxNjIuMDkxIDE3Ny45MDkgMTgwIDIwMCAxODBDMjIyLjA5MSAxODAgMjQwIDE2Mi4wOTEgMjQwIDE0MEMyNDAgMTE3LjkwOSAyMjIuMDkxIDEwMCAyMDAgMTAwWk0yMDAgMTcwQzE4My40NTggMTcwIDE3MCAxNTYuNTQyIDE3MCAxNDBDMTcwIDEyMy40NTggMTgzLjQ1OCAxMTAgMjAwIDExMEMyMTYuNTQyIDExMCAyMzAgMTIzLjQ1OCAyMzAgMTQwQzIzMCAxNTYuNTQyIDIxNi41NDIgMTcwIDIwMCAxNzBaIiBmaWxsPSIjOUNBM0FGIi8+CiAgPHBhdGggZD0iTTIwMCAxMjBDMTg4Ljk1NCAxMjAgMTgwIDEyOC45NTQgMTgwIDE0MEMxODAgMTUxLjA0NiAxODguOTU0IDE2MCAyMDAgMTYwQzIxMS4wNDYgMTYwIDIyMCAxNTEuMDQ2IDIyMCAxNDBDMjIwIDEyOC45NTQgMjExLjA0NiAxMjAgMjAwIDEyMFoiIGZpbGw9IiM2QjcyODAiLz4KICA8cGF0aCBkPSJNMjAwIDEzMEMxOTMuMzczIDEzMCAxODggMTM1LjM3MyAxODggMTQyQzE4OCAxNDguNjI3IDE5My4zNzMgMTU0IDIwMCAxNTRDMjA2LjYyNyAxNTQgMjEyIDE0OC42MjcgMjEyIDE0MkMyMTIgMTM1LjM3MyAyMDYuNjI3IDEzMCAyMDAgMTMwWiIgZmlsbD0iIzRCQTU2MyIvPgogIDxwYXRoIGQ9Ik0yMDAgMTAwVjgwTTIwMCA4MFY2ME0yMDAgNjBIMjIwTTIwMCA2MEgxODNNMjAwIDgwSDIyME0yMDAgOEgxODNNMjAwIDEwMFYxMjBNMjAwIDEyMFYxNDBNMjAwIDE0MFYxNjBNMjAwIDE2MFYxODBNMjAwIDE4MEgyMjBNMjAwIDE4MEgxODNNMjAwIDE2MEgyMTBNMjAwIDE2MEgxOTBNMjAwIDE0MEgyMTBNMjAwIDE0MEgxOTBNMjAwIDEyMEgyMTBNMjAwIDEyMEgxOTBNMjAwIDEwMEgyMTBNMjAwIDEwMEgxOTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMTYwIDE0MEgxNDBNMTQwIDE0MEgxMjBNMTQwIDE0MFYxMjBNMTQwIDE0MFYxNjBNMjQwIDE0MEgyNjBNMjYwIDE0MEgyODBNMjYwIDE0MFYxMjBNMjYwIDE0MFYxNjAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
};

// Utility function to get the correct exercise image path with local and CDN fallback
export const getExerciseImage = async (exerciseName) => {
  try {
    if (!exerciseName) return EXERCISE_IMAGES.default;

    // Generate the local image path
    const localImageName = getImageFilename(exerciseName);
    const localImagePath = localImageName ? `/images/exercises/${localImageName}` : null;

    // Check if local image exists
    if (localImagePath) {
      const exists = await imageExists(localImagePath);
      if (exists) return localImagePath;
    }
    
    // Fallback to CDN images if local image not found
    const normalizedExerciseName = exerciseName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')  // Remove special chars
      .replace(/\s+/g, ' ')          // Replace multiple spaces with single
      .trim();
    
    // Exact match in CDN images
    const exactMatch = EXERCISE_IMAGES[normalizedExerciseName];
    if (exactMatch) return exactMatch;

    // Try to find the best matching exercise in CDN
    const exerciseWords = normalizedExerciseName.split(' ');
    
    // First try: match all words in the exercise name
    for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
      if (key === 'default') continue;
      
      const keyWords = key.split(' ');
      const allWordsMatch = keyWords.every(word => 
        normalizedExerciseName.includes(word)
      );
      
      if (allWordsMatch) return value;
    }
    
    // Second try: match any word in the exercise name
    for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
      if (key === 'default') continue;
      
      const keyWords = key.split(' ');
      const anyWordMatches = keyWords.some(word => 
        exerciseWords.some(exWord => exWord === word)
      );
      
      if (anyWordMatches) return value;
    }
    
    // Fallback to default image
    return EXERCISE_IMAGES.default;
    
  } catch (error) {
    console.error('Error getting exercise image:', error);
    return EXERCISE_IMAGES.default;
  }
};
