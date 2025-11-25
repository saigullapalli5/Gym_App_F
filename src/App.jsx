import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Header,
  Footer,
  ScrollButton,
  PrivateRoute,
  AdminRoute,
} from "./components";
import {
  Register,
  Login,
  ForgotPassword,
  Home,
  PlanSubscription,
  Error,
  Exercise,
  ExerciseDetail,
  Profile,
  UserDashBoard,
  PlanDetail,
  AdminDashBoard,
  CreatePlan,
  UpdatePlan,
  Plans,
  SubscriberList,
  UserList,
  FavouriteExercises,
  PlanFullDetail,
  ContactUs,
  TrainerDetails,
  Feedback,
  Feedbacks,
  FeedbackList,
} from "./pages";
import Users from "./pages/Admin/Users";
import Subscribers from "./pages/Admin/Subscribers";
import NewSubscription from "./pages/Admin/NewSubscription";
import UserDetail from "./pages/Admin/UserDetail";
import EditPlan from "./pages/Admin/EditPlan";
// import PlanFullDetail from './pages/User/planFullDetail';
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/auth";
// import axios from 'axios';

const App = () => {
  const { auth, setAuth } = useAuth();

  return (
    <BrowserRouter>
      <ScrollButton />
      <Header />
      <Toaster />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Public exercise routes */}
          <Route path="/exercise/preview/:id" element={<ExerciseDetail previewMode={true} />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          
          {/* Redirect old routes to new dashboard paths */}
          <Route path="/feedback" element={<Navigate to="/dashboard/user/feedback" replace />} />
          <Route path="/exercise" element={<Navigate to="/dashboard/user/exercise" replace />} />
          
          {/* Protected User Routes */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard Routes */}
            <Route path="/dashboard">
              <Route index element={<UserDashBoard />} />
              <Route path="user">
                <Route index element={<UserDashBoard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="exercise" element={<Exercise />} />
                <Route path="exercise/:id" element={<ExerciseDetail />} />
                <Route path="favourite-exercises" element={<FavouriteExercises />} />
                <Route path="plan-detail" element={<PlanDetail />} />
                <Route path="plan-detail-full/:planid" element={<PlanFullDetail />} />
                <Route path="plan-subscribe/:planid" element={<PlanSubscription />} />
                <Route path="plan-details/:planid" element={<PlanFullDetail />} />
                <Route path="trainer/:trainerId" element={<TrainerDetails />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="feedbacks" element={<Feedbacks />} />
              </Route>
            </Route>
          </Route>

          {/* admin routes ================================== */}
          <Route path="/dashboard/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashBoard />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="feedbacks" element={<FeedbackList />} />
            <Route path="subscriptions" element={<SubscriberList />} />
            <Route path="subscriptions/new" element={<NewSubscription />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="plans" element={<Plans />} />
            <Route path="plans/create" element={<CreatePlan />} />
            <Route path="plans/edit/:id" element={<EditPlan />} />
            {/* Add a catch-all route for admin paths that don't match */}
            <Route
              path="*"
              element={<Navigate to="/dashboard/admin" replace />}
            />
          </Route>
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
