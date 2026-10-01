import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div>
      <h2>{event.name}</h2>

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

      <Link to={`/events/${event.id}`}>
        View Event
      </Link>
    </div>
  );
}

export default EventCard;