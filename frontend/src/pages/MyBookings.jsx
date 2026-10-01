import { useEffect, useState } from "react";

import {
  cancelBooking,
  getMyBookings,
} from "../api/events";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancelling(bookingId);
    setError("");

    try {
      await cancelBooking(bookingId);

      await loadBookings();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to cancel booking."
      );
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <div>
      <h1>My Bookings</h1>

      {error && <p>{error}</p>}

      {bookings.length === 0 ? (
        <p>You don't have any bookings.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id}>
            <h2>
              Booking #{booking.id}
            </h2>

            <p>
              Event ID: {booking.event}
            </p>

            <p>
              Seat ID: {booking.seat}
            </p>

            <p>
              Status: {booking.status}
            </p>

            <p>
              Booked At: {booking.booked_at}
            </p>

            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => handleCancel(booking.id)}
                disabled={cancelling === booking.id}
              >
                {cancelling === booking.id
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;