import api from "./axios";

export const getEvents = async () => {
  const response = await api.get("/events/");
  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}/`);
  return response.data;
};

export const getEventSeats = async (eventId) => {
  const response = await api.get(`/events/${eventId}/seats/`);
  return response.data;
};

export const bookSeat = async (eventId, seatId) => {
  const response = await api.post("/bookings/", {
    event: eventId,
    seat: seatId,
  });

  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/");
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.post(
    `/bookings/${bookingId}/cancel/`
  );

  return response.data;
};