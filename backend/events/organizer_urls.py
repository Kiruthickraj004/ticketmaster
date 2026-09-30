from django.urls import path

from .views import OrganizerBookingListView


urlpatterns = [
    path(
        "bookings/",
        OrganizerBookingListView.as_view(),
        name="organizer-bookings",
    ),
]