import React, { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from '../../components';
import { useAuth } from "../../context/auth";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Dashboard Card Component
const DashboardCard = ({ title, description, to, icon }) => (
    <Link 
        to={to}
        className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        data-aos="fade-up"
    >
        <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{icon}</span>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{description}</p>
    </Link>
);

const UserDashBoard = ({ hideContent = false }) => {
    const { auth, loading } = useAuth();
    const location = useLocation();

    // Initialize AOS
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    // Show loading state while auth is being checked
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!auth?.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <section className='min-h-screen bg-gray-900 pt-20'>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center" data-aos="fade-down">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome, {auth.user?.name || 'User'}
                    </h1>
                    <p className="text-gray-300">Manage your fitness journey</p>
                </div>
                
                {!hideContent && (
                    <div className="grid grid-cols-1 md:grid-cols  -2 lg:grid-cols-4 gap-6 px-4">
                        <DashboardCard 
                            title="Plan Details"
                            description="View and manage your subscription plan"
                            to="/dashboard/user/plan-detail"
                            icon="📋"
                        />
                        
                        <DashboardCard 
                            title="Favorites"
                            description="Your saved exercises"
                            to="/dashboard/user/favourite-exercises"
                            icon="❤️"
                        />
                        
                        <DashboardCard 
                            title="Profile"
                            description="Update your personal information"
                            to="/dashboard/user/profile"
                            icon="👤"
                        />
                        
                        <DashboardCard 
                            title="Feedback"
                            description="Share your thoughts with us"
                            to="/dashboard/user/feedback"
                            icon="💬"
                        />
                    </div>
                )}
                <Outlet /> {/* This will render nested routes */}
            </div>
        </section>
    );
};

export default UserDashBoard;
