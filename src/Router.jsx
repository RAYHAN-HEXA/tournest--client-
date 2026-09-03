import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ExploreTours from "./pages/ExploreTours";
import TourDetails from "./pages/TourDetails";
import GuideProfile from "./pages/GuideProfile";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import MyBookings from "./pages/MyBookings";
import GuideDashboard from "./pages/GuideDashboard";
import TourForm from "./pages/TourForm";
import BecomeGuide from "./pages/BecomeGuide";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tours", element: <ExploreTours /> },
      { path: "tours/:id", element: <TourDetails /> },
      { path: "guides/:id", element: <GuideProfile /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "my-bookings",
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "become-a-guide",
        element: (
          <ProtectedRoute>
            <BecomeGuide />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute roles={["guide", "admin"]}>
            <GuideDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/add-tour",
        element: (
          <ProtectedRoute roles={["guide", "admin"]}>
            <TourForm mode="create" />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/update-tour/:id",
        element: (
          <ProtectedRoute roles={["guide", "admin"]}>
            <TourForm mode="edit" />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
