from django.urls import path

from .views import (
    BookingCancelView,
    CustomerBookingListCreateView,
    CustomerBookingDetailView,
    BookingAddTicketsView,
)


urlpatterns = [
    path(
        "",
        CustomerBookingListCreateView.as_view(),
        name="booking-list-create",
    ),
    path(
        "<int:pk>/",
        CustomerBookingDetailView.as_view(),
        name="booking-detail",
    ),
    path(
        "<int:pk>/add-tickets/",
        BookingAddTicketsView.as_view(),
        name="booking-add-tickets",
    ),
    path(
        "<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="booking-cancel",
    ),
]