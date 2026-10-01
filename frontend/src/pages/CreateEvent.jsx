import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createEvent } from "../api/organizer";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    ticket_price: "",
    status: "DRAFT",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      await createEvent({
        ...formData,
        venue: Number(formData.venue),
      });

      navigate("/organizer/events");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to create event."
      );
    }
  };

  return (
    <div>
      <h1>Create Event</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Event name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="number"
          name="venue"
          placeholder="Venue ID"
          value={formData.venue}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="number"
          name="ticket_price"
          placeholder="Ticket price"
          value={formData.ticket_price}
          onChange={handleChange}
          required
        />

        <br />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="DRAFT">
            Draft
          </option>

          <option value="PUBLISHED">
            Published
          </option>
        </select>

        <br />

        <button type="submit">
          Create Event
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;