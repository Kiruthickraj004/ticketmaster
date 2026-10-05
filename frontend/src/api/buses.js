import api from "./axios";

export const getBuses = async (params = {}) => {
  const response = await api.get("/buses/", { params });
  return response.data;
};

export const getBus = async (busId) => {
  const response = await api.get(`/buses/${busId}/`);
  return response.data;
};

export const getBusSeats = async (busId) => {
  const response = await api.get(`/buses/${busId}/seats/`);
  return response.data;
};

export const bookTickets = async ({
  event,
  bus,
  ticket_count = 1,
  passenger_names = [],
  contact_phone = "",
  contact_email = "",
}) => {
  const response = await api.post("/bookings/", {
    event: bus || event,
    ticket_count,
    passenger_names,
    contact_phone,
    contact_email,
  });
  return response.data;
};

export const addTicketsToBooking = async (
  bookingId,
  { additional_tickets = 1, passenger_names = [] }
) => {
  const response = await api.post(`/bookings/${bookingId}/add-tickets/`, {
    additional_tickets,
    passenger_names,
  });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/");
  return response.data;
};

export const cancelBooking = async (bookingId, cancelPayload = {}) => {
  const response = await api.post(`/bookings/${bookingId}/cancel/`, cancelPayload);
  return response.data;
};

// Aliases for compatibility
export const getEvents = getBuses;
export const getEvent = getBus;
export const getEventSeats = getBusSeats;
export const bookSeat = async (busId) => bookTickets({ bus: busId, ticket_count: 1 });
