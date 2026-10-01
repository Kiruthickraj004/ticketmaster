import api from "./axios";

export const getMyEvents = async () => {
  const response = await api.get("/events/my-events/");
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post(
    "/events/my-events/",
    eventData
  );

  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.patch(
    `/events/manage/${eventId}/`,
    eventData
  );

  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(
    `/events/manage/${eventId}/`
  );

  return response.data;
};

export const getOrganizerBookings = async () => {
  const response = await api.get(
    "/organizer/bookings/"
  );

  return response.data;
};

export const getMyEvent = async (eventId) => {
  const response = await api.get(
    `/events/manage/${eventId}/`
  );

  return response.data;
};