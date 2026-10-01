import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getEvent, getEventSeats, bookSeat } from "../api/events";

function EventDetails() {
  const { id } = useParams();
  const [bookingSeat, setBookingSeat] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const [eventData, seatData] = await Promise.all([
          getEvent(id),
          getEventSeats(id),
        ]);

        setEvent(eventData);
        setSeats(seatData);
      } catch (error) {
        console.error(error);
        setError("Unable to load event.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleBookSeat = async (seatId) => {
  setBookingError("");
  setBookingSuccess("");
  setBookingSeat(seatId);

  try {
    await bookSeat(id, seatId);

    setBookingSuccess("Seat booked successfully.");

    const updatedSeats = await getEventSeats(id);
    setSeats(updatedSeats);
  } catch (error) {
    console.error(error);

    setBookingError(
      error.response?.data?.non_field_errors?.[0] ||
      "Unable to book this seat."
    );
  } finally {
    setBookingSeat(null);
  }
};

  if (loading) {
    return <p>Loading event...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }


  return (
    <div>
      <h1>{event.name}</h1>

      <p>{event.description}</p>

      <p>
        Date: {event.date}
      </p>

      <p>
        Time: {event.time}
      </p>

      <p>
        Ticket Price: ₹{event.ticket_price}
      </p>

      <h2>Seats</h2>
      {bookingSuccess && <p>{bookingSuccess}</p>}
      {bookingError && <p>{bookingError}</p>}

      {seats.length === 0 ? (
        <p>No seats available.</p>
      ) : (
        <div>
          {seats.map((seat) => (
            <button
  key={seat.id}
  disabled={
    seat.status === "BOOKED" ||
    bookingSeat === seat.id
  }
  onClick={() => handleBookSeat(seat.id)}
>
  {bookingSeat === seat.id
    ? "Booking..."
    : `${seat.seat} - ${seat.status}`}
</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventDetails;