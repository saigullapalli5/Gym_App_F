import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth'; 
import { useParams } from 'react-router-dom';
import { Heading, Loader } from '../../components';
import { BASE_URL } from '../../utils/fetchData';

const Feedbacks = () => {
  const { auth } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [editedRating, setEditedRating] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllUserFeedbacks = async () => {
      if (!auth?.token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`${BASE_URL}/api/v1/auth/get-all-user-feedback`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        if (res.data?.success) {
          setFeedbacks(res.data.newFeedback || []);
        } else {
          throw new Error(res.data?.message || 'Failed to fetch feedbacks');
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError(err.response?.data?.message || 'Failed to load feedbacks. Please try again.');
        
        // If token is invalid, clear auth
        if (err.response?.status === 401) {
          // This will trigger the auth context to handle the invalid token
          localStorage.removeItem('auth');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        }
      } finally {
        setLoading(false);
      }
    };
    
    getAllUserFeedbacks();
  }, [auth?.token]);

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setEditedMessage(feedback.message);
    setEditedRating(feedback.rating);
  };

  const handleUpdateFeedback = async (feedbackId) => {
    if (!auth?.token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/feedback/update-feedback/${feedbackId}`, 
        {
          message: editedMessage,
          rating: editedRating,
        },
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data?.success) {
        setEditingFeedback(null);
        updateFeedbackList(response.data.updatedFeedback);
      } else {
        throw new Error(response.data?.message || 'Failed to update feedback');
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
      setError(err.response?.data?.message || 'Error updating feedback. Please try again.');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('auth');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }
    }
  };


  const handleDeleteFeedback = async (feedbackId) => {
    if (!auth?.token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/api/v1/feedback/delete-feedback/${feedbackId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data?.success) {
        setFeedbacks(prev => prev.filter((feedback) => feedback._id !== feedbackId));
      } else {
        throw new Error(response.data?.message || 'Failed to delete feedback');
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError(err.response?.data?.message || 'Error deleting feedback. Please try again.');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('auth');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }
    }
  };


  const updateFeedbackList = (updatedFeedback) => {
    setFeedbacks(prevFeedbacks =>
      prevFeedbacks.map(f => (f._id === updatedFeedback._id ? updatedFeedback : f))
    );
  };


  if (!auth.user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Please log in to view your feedback.
      </div>
    );
  }

  if (loading) {
    return (
      <Loader />
    );
  }



  return (
    <section className='bg-gray-900 pt-16 min-h-screen'>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Heading name="Your Feedback" className="mb-6" />
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {feedbacks.length === 0 ? (
          <div className='flex justify-center items-center h-64'>
            <p className="text-white text-center text-2xl">No feedback submitted yet.</p>
          </div>
        ) : (
        <ul className="divide-y divide-gray-700 border-2 px-6 my-20 ">
          {feedbacks.map(feedback => (
            <li key={feedback._id} className="py-4">
              {editingFeedback && editingFeedback._id === feedback._id ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
                    rows="4"
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    required
                  />
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
                    value={editedRating}
                    onChange={(e) => setEditedRating(e.target.value)}
                    required
                  >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleUpdateFeedback(feedback._id)}
                      className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditingFeedback(null)}
                      className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white text-xl md:text-2xl">Name : <b>{feedback.user.name}</b> </p>
                  <p className="text-white text-xl md:text-2xl">Message : {feedback.message}</p>
                  <p className="text-white text-xl md:text-2xl">Rating : <b> {feedback.rating}</b></p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleEditFeedback(feedback)}
                      className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </section>

  );
};

export default Feedbacks;





