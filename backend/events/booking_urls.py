from django.urls import path

from .views import (
    BookingCancelView,
    BookingCreateView,
    CustomerBookingDetailView,
    CustomerBookingListView,
)


urlpatterns = [
    path(
        "",
        BookingCreateView.as_view(),
        name="booking-create",
    ),
    path(
        "<int:pk>/",
        CustomerBookingDetailView.as_view(),
        name="booking-detail",
    ),
    path(
        "<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="booking-cancel",
    ),
]