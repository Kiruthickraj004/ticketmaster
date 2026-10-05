import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Buses from "./pages/Buses";
import BusDetails from "./pages/BusDetails";
import MyBookings from "./pages/MyBookings";
import MyBuses from "./pages/MyBuses";
import CreateBus from "./pages/CreateBus";
import EditBus from "./pages/EditBus";
import OperatorBookings from "./pages/OperatorBookings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Bus Routes */}
              <Route path="/buses" element={<Buses />} />
              <Route path="/buses/:id" element={<BusDetails />} />
              <Route path="/events" element={<Navigate to="/buses" replace />} />
              <Route path="/events/:id" element={<Navigate to="/buses" replace />} />

              {/* Customer Routes */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Bus Operator Routes */}
              <Route
                path="/operator/buses"
                element={
                  <ProtectedRoute allowedRoles={["OPERATOR"]}>
                    <MyBuses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/buses/create"
                element={
                  <ProtectedRoute allowedRoles={["OPERATOR"]}>
                    <CreateBus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/buses/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["OPERATOR"]}>
                    <EditBus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/bookings"
                element={
                  <ProtectedRoute allowedRoles={["OPERATOR"]}>
                    <OperatorBookings />
                  </ProtectedRoute>
                }
              />

              {/* Legacy / Compatibility Aliases */}
              <Route
                path="/operator/events"
                element={<Navigate to="/operator/buses" replace />}
              />
              <Route
                path="/operator/events/create"
                element={<Navigate to="/operator/buses/create" replace />}
              />
              <Route
                path="/organizer/events"
                element={<Navigate to="/operator/buses" replace />}
              />
              <Route
                path="/organizer/events/create"
                element={<Navigate to="/operator/buses/create" replace />}
              />
              <Route
                path="/organizer/bookings"
                element={<Navigate to="/operator/bookings" replace />}
              />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="py-24 text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-white">404</h1>
                    <p className="text-slate-400">Page not found</p>
                  </div>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;