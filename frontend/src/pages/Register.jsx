import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    organization_name: "",
    contact_number: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      await registerUser(formData);

      setSuccess("Registration successful. You can now login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Registration failed."
      );
    }
  };

  return (
    <div>
      <h1>Register</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <br />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ORGANIZER">Event Organizer</option>
        </select>

        <br />

        {formData.role === "ORGANIZER" && (
          <>
            <input
              type="text"
              name="organization_name"
              placeholder="Organization Name"
              value={formData.organization_name}
              onChange={handleChange}
              required
            />

            <br />

            <input
              type="text"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleChange}
              required
            />

            <br />

            <textarea
              name="description"
              placeholder="Organization Description"
              value={formData.description}
              onChange={handleChange}
            />

            <br />
          </>
        )}

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;