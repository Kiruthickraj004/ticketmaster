import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteEvent,
  getMyEvents,
} from "../api/organizer";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEvent(eventId);

      await loadEvents();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to delete event."
      );
    }
  };

  if (loading) {
    return <p>Loading your events...</p>;
  }

  return (
    <div>
      <h1>My Events</h1>

      <Link to="/organizer/events/create">
        Create Event
      </Link>

      {error && <p>{error}</p>}

      {events.length === 0 ? (
        <p>You haven't created any events.</p>
      ) : (
        events.map((event) => (
          <div key={event.id}>
            <h2>{event.name}</h2>

            <p>
              Date: {event.date}
            </p>

            <p>
              Status: {event.status}
            </p>

            <p>
              Ticket Price: ₹{event.ticket_price}
            </p>

            <Link
              to={`/organizer/events/${event.id}/edit`}
            >
              Edit
            </Link>

            {" "}

            {event.status === "DRAFT" && (
              <button
                onClick={() => handleDelete(event.id)}
              >
                Delete
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default MyEvents;