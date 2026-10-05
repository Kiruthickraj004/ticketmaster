import api from "./axios";

export const getMyBuses = async () => {
  const response = await api.get("/events/my-events/");
  return response.data;
};

export const createBus = async (busData) => {
  const response = await api.post("/events/my-events/", busData);
  return response.data;
};

export const updateBus = async (busId, busData) => {
  const response = await api.patch(`/events/manage/${busId}/`, busData);
  return response.data;
};

export const deleteBus = async (busId) => {
  const response = await api.delete(`/events/manage/${busId}/`);
  return response.data;
};

export const getOperatorBookings = async () => {
  const response = await api.get("/operator/bookings/");
  return response.data;
};

export const getMyBus = async (busId) => {
  const response = await api.get(`/events/manage/${busId}/`);
  return response.data;
};

// Aliases for compatibility
export const getMyEvents = getMyBuses;
export const createEvent = createBus;
export const updateEvent = updateBus;
export const deleteEvent = deleteBus;
export const getOrganizerBookings = getOperatorBookings;
export const getMyEvent = getMyBus;
