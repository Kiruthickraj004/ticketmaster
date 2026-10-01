import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">
        Mini Ticketmaster
      </Link>

      {" | "}

      <Link to="/events">
        Events
      </Link>

      {" | "}

      {user?.role === "CUSTOMER" && (
        <Link to="/bookings">
          My Bookings
        </Link>
      )}

      {user?.role === "ORGANIZER" && (
        <>
          <Link to="/organizer/events">
            My Events
          </Link>

          {" | "}

          <Link to="/organizer/bookings">
            Bookings
          </Link>
        </>
      )}

      {" | "}

      {user ? (
        <>
          <span>
            Welcome, {user.username}
          </span>

          {" | "}

          <button onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">
            Login
          </Link>

          {" | "}

          <Link to="/register">
            Register
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;