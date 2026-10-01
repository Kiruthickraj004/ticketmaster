from django.urls import path

from .views import (
    EventSeatListView,
    OrganizerEventDetailView,
    OrganizerEventListCreateView,
    PublicEventDetailView,
    PublicEventListView,
)

urlpatterns = [
    # Organizer
    path(
        "my-events/",
        OrganizerEventListCreateView.as_view(),
        name="my-events",
    ),
    path(
        "manage/<int:pk>/",
        OrganizerEventDetailView.as_view(),
        name="manage-event",
    ),

    # Public
    path("", PublicEventListView.as_view(), name="event-list"),
    path(
        "<int:event_id>/seats/",
        EventSeatListView.as_view(),
        name="event-seats",
    ),
    path(
        "<int:pk>/",
        PublicEventDetailView.as_view(),
        name="event-detail",
    ),
]