import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import OrganizerBookings from "./pages/OrganizerBookings";

import { useAuth } from "./context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Mini Ticketmaster</h1>

      {user ? (
        <p>Welcome, {user.username}!</p>
      ) : (
        <p>
          Browse and book your favorite events.
        </p>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER"]}
              >
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute
                allowedRoles={["ORGANIZER"]}
              >
                <MyEvents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events/create"
            element={
              <ProtectedRoute
                allowedRoles={["ORGANIZER"]}
              >
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute
                allowedRoles={["ORGANIZER"]}
              >
                <EditEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/bookings"
            element={
              <ProtectedRoute
                allowedRoles={["ORGANIZER"]}
              >
                <OrganizerBookings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;