from django.urls import path

from .views import (
    OrganizerEventDetailView,
    OrganizerEventListCreateView,
    PublicEventDetailView,
    PublicEventListView,
    EventSeatListView,
)


urlpatterns = [
    path(
        "my-events/",
        OrganizerEventListCreateView.as_view(),
        name="my-events",
    ),

    path(
        "",
        PublicEventListView.as_view(),
        name="event-list",
    ),

    path(
        "<int:pk>/",
        PublicEventDetailView.as_view(),
        name="event-detail",
    ),

    path(
    "<int:event_id>/seats/",
    EventSeatListView.as_view(),
    name="event-seats",
    ),
]