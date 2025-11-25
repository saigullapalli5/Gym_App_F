

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth'; // Adjust the path accordingly
import {toast} from "react-hot-toast";
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/fetchData';
const Feedback = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(1);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const { auth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth?.user || !auth?.token) {
      toast.error('Please log in to submit feedback.');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/feedback/create-feedback`,
        {
          message,
          rating: Number(rating),
          userId: auth.user._id
        },
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Feedback submitted successfully!');
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      const errorMessage = err.response?.data?.message || 'Error submitting feedback. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If token is invalid, clear auth and redirect to login
      if (err.response?.status === 401) {
        // You might want to add logic to clear auth and redirect to login
        // For example: logout(); navigate('/login');
      }
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col gap-5">
          <h2 className="text-2xl font-bold mb-4">Thank you for your feedback!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <Link className='bg-blue-500 text-white px-4 py-2 ' to="/">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center">Submit Feedback</h2>
        
        {error && (
          <div className="mb-4 text-red-500">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
          <textarea
            id="message"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 font-bold mb-2">Rating</label>
          <select
            id="rating"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;
