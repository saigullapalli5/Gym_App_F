import React, { useState, useEffect } from 'react';
import { FaYoutube, FaPlay, FaClock, FaThumbsUp } from 'react-icons/fa';
import { FiExternalLink, FiThumbsUp, FiClock, FiEye } from 'react-icons/fi';

const ExerciseVideos = ({ youtubeVideo = [], name = '' }) => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [relatedVideos, setRelatedVideos] = useState([]);
  
  // Format view count
  const formatViews = (views) => {
    if (!views) return 'N/A';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };
  
  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  // Loading state
  if (youtubeVideo === null) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No videos state
  if (youtubeVideo.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaYoutube className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Videos Found</h3>
          <p className="text-gray-500 mb-6">We couldn't find any video tutorials for this exercise.</p>
        </div>
      </div>
    );
  }

  // Set related videos when youtubeVideo changes
  useEffect(() => {
    if (youtubeVideo?.length > 0) {
      setRelatedVideos(youtubeVideo.slice(1)); // First video is the main one
    }
  }, [youtubeVideo]);

  if (youtubeVideo.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaYoutube className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Videos Available</h3>
          <p className="text-gray-500">We couldn't find any video tutorials for this exercise.</p>
        </div>
      </div>
    );
  }

  const mainVideo = youtubeVideo[0]?.video;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          <span className="text-red-600">{name}</span> Video Tutorials
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-black rounded-xl overflow-hidden shadow-lg">
              {mainVideo ? (
                <div className="relative aspect-video">
                  <img 
                    src={mainVideo.thumbnails?.[0]?.url || 'https://via.placeholder.com/1280x720?text=Video+Thumbnail'}
                    alt={mainVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <a 
                    href={`https://www.youtube.com/watch?v=${mainVideo.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="bg-red-600 text-white rounded-full p-4 transform group-hover:scale-110 transition-transform">
                      <FaPlay className="w-6 h-6" />
                    </div>
                  </a>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-medium text-lg">{mainVideo.title}</h3>
                    <div className="flex items-center text-gray-300 text-sm mt-1 space-x-4">
                      <span className="flex items-center">
                        <FiEye className="mr-1" /> {formatViews(mainVideo.viewCount) || 'N/A'}
                      </span>
                      <span className="flex items-center">
                        <FiThumbsUp className="mr-1" /> {formatViews(mainVideo.likes) || 'N/A'}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-1" /> {formatDuration(mainVideo.lengthSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Video not available</p>
                </div>
              )}
            </div>
            
            {/* Video Description */}
            {mainVideo?.description && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">About this video</h4>
                <p className="text-gray-600 text-sm line-clamp-3">{mainVideo.description}</p>
              </div>
            )}
          </div>
          
          {/* Related Videos */}
          <div className="lg:w-1/3">
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Related Videos
            </h3>
            <div className="space-y-4">
              {relatedVideos.slice(0, 5).map((item, index) => (
                item?.video && (
                  <a
                    key={item.video.videoId || index}
                    href={`https://www.youtube.com/watch?v=${item.video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex group hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="relative flex-shrink-0 w-40 h-24 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={item.video.thumbnails?.[0]?.url}
                        alt={item.video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/160x90?text=Thumbnail';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors flex items-center justify-center">
                        <FiPlay className="text-white text-opacity-80 group-hover:text-opacity-100" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        {formatDuration(item.video.lengthSeconds)}
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-red-600 line-clamp-2" title={item.video.title}>
                        {item.video.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.video.channelName}</p>
                      <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                        <span>{formatViews(item.video.viewCount)} views</span>
                        <span>•</span>
                        <span>{formatViews(item.video.likes)} likes</span>
                      </div>
                    </div>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ExerciseVideos);