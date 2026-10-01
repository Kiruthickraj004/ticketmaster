import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getEvent,  } from "../api/events";
import { getMyEvent,updateEvent } from "../api/organizer";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    ticket_price: "",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const loadEvent = async () => {
    try {
      const data = await getMyEvent(id);

      setFormData({
        name: data.name,
        description: data.description,
        date: data.date,
        time: data.time,
        ticket_price: data.ticket_price,
        status: data.status,
      });
    } catch (error) {
      console.error(error);
      setError("Unable to load event.");
    } finally {
      setLoading(false);
    }
  };

  loadEvent();
}, [id]);

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
      await updateEvent(id, formData);

      navigate("/organizer/events");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to update event."
      );
    }
  };

  if (loading) {
    return <p>Loading event...</p>;
  }

  return (
    <div>
      <h1>Edit Event</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <br />

        <textarea
          name="description"
          value={formData.description}
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
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <br />

        <button type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditEvent;