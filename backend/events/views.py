from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import User
from django.shortcuts import get_object_or_404
from .models import Event, Booking, Seat
from .permissions import IsOrganizer, IsCustomer
from .serializers import EventSerializer, BookingSerializer, EventSeatSerializer, OrganizerBookingSerializer


class OrganizerEventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            organizer=self.request.user
        )


class OrganizerEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user
        )

    def perform_destroy(self, instance):
        if instance.status != Event.Status.DRAFT:
            raise serializers.ValidationError(
                "Only draft events can be deleted."
            )

        instance.delete()


class PublicEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(
            status=Event.Status.PUBLISHED
        ).select_related(
            "organizer",
            "venue",
        )


class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(
            status=Event.Status.PUBLISHED
        ).select_related(
            "organizer",
            "venue",
        )


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user
        )


class EventSeatListView(generics.ListAPIView):
    serializer_class = EventSeatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Seat.objects.filter(
            venue__events__id=self.kwargs["event_id"]
        ).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()

        event = get_object_or_404(
            Event,
            id=self.kwargs["event_id"],
            status=Event.Status.PUBLISHED,
        )

        context["event"] = event

        return context


class CustomerBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related(
            "event",
            "seat",
        )


class CustomerBookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related(
            "event",
            "seat",
        )


class BookingCancelView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        )

    def post(self, request, pk):
        booking = get_object_or_404(
            self.get_queryset(),
            pk=pk,
        )

        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {
                    "detail": "Booking is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.Status.CANCELLED
        booking.save(
            update_fields=["status"]
        )

        return Response({
            "detail": "Booking cancelled successfully."
        })


class OrganizerBookingListView(generics.ListAPIView):
    serializer_class = OrganizerBookingSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Booking.objects.filter(
            event__organizer=self.request.user
        ).select_related(
            "customer",
            "event",
            "seat",
        )
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Booking.objects.filter(
            event__organizer=self.request.user
        ).select_related(
            "customer",
            "event",
            "seat",
        )