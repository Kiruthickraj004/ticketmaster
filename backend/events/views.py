from rest_framework import generics, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction

from .models import Event, Booking, Seat
from .permissions import IsOrganizer, IsCustomer
from .serializers import (
    EventSerializer,
    BookingSerializer,
    OrganizerBookingSerializer,
    AddTicketsSerializer,
)


class EventSeatListView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        booked_seats = event.get_booked_seats()
        all_seats = [
            {
                "id": i,
                "seat": f"S{i}",
                "status": "BOOKED" if f"S{i}" in booked_seats else "AVAILABLE"
            }
            for i in range(1, event.total_seats + 1)
        ]
        return Response(all_seats)


class OrganizerEventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user
        ).order_by("-date", "-time")

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
        if instance.bookings.filter(status=Booking.Status.CONFIRMED).exists():
            raise serializers.ValidationError(
                "Cannot delete a bus trip with active passenger bookings. Please cancel bookings first or mark trip as CANCELLED."
            )
        instance.delete()


class PublicEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Event.objects.filter(
            status=Event.Status.PUBLISHED
        ).select_related("organizer").order_by("date", "time")

        source = self.request.query_params.get("source") or self.request.query_params.get("from")
        if source:
            qs = qs.filter(source__icontains=source.strip())

        destination = self.request.query_params.get("destination") or self.request.query_params.get("to")
        if destination:
            qs = qs.filter(destination__icontains=destination.strip())

        date = self.request.query_params.get("date")
        if date:
            qs = qs.filter(date=date.strip())

        bus_type = self.request.query_params.get("bus_type")
        if bus_type:
            qs = qs.filter(bus_type__icontains=bus_type.strip())

        search = self.request.query_params.get("search")
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(source__icontains=search)
                | Q(destination__icontains=search)
                | Q(bus_type__icontains=search)
            )

        return qs


class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Event.objects.filter(
            status=Event.Status.PUBLISHED
        ).select_related("organizer")


class CustomerBookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related("event").order_by("-booked_at")


class CustomerBookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related("event")

    def partial_update(self, request, *args, **kwargs):
        booking = self.get_object()
        phone = request.data.get("contact_phone")
        email = request.data.get("contact_email")
        passengers = request.data.get("passenger_names")

        if phone is not None:
            booking.contact_phone = phone
        if email is not None:
            booking.contact_email = email
        if passengers is not None:
            if isinstance(passengers, list):
                booking.set_passenger_names(passengers)
            elif isinstance(passengers, str):
                booking.set_passenger_names([p.strip() for p in passengers.split(",") if p.strip()])

        booking.save()
        return Response(BookingSerializer(booking).data)


class BookingAddTicketsView(generics.GenericAPIView):
    """Allows customer to add more tickets to an existing confirmed booking with auto-allotment of seats."""
    serializer_class = AddTicketsSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related("event")

    @transaction.atomic
    def post(self, request, pk):
        booking = get_object_or_404(self.get_queryset(), pk=pk)

        if booking.status != Booking.Status.CONFIRMED:
            return Response(
                {"detail": "Cannot add tickets to a cancelled booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        additional_count = serializer.validated_data.get("additional_tickets", 1)
        if additional_count < 1:
            return Response(
                {"detail": "Must add at least 1 ticket."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = booking.event
        available_seats = event.get_available_seats()

        if len(available_seats) < additional_count:
            return Response(
                {
                    "detail": f"Only {len(available_seats)} seat(s) remaining on this bus. Cannot add {additional_count} ticket(s)."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        newly_allotted = available_seats[:additional_count]
        current_seats = booking.get_seat_numbers()
        updated_seats = current_seats + newly_allotted
        booking.set_seat_numbers(updated_seats)

        # Passenger names
        new_passengers = serializer.validated_data.get("passenger_names", [])
        current_passengers = booking.get_passenger_names()

        for i in range(additional_count):
            if i < len(new_passengers) and new_passengers[i].strip():
                current_passengers.append(new_passengers[i].strip())
            else:
                current_passengers.append(f"Passenger {len(current_passengers) + 1}")

        booking.set_passenger_names(current_passengers)
        booking.ticket_count += additional_count
        booking.total_price = booking.ticket_count * event.ticket_price
        booking.save()

        return Response(
            {
                "detail": f"Successfully added {additional_count} ticket(s)! Allocated seats: {', '.join(newly_allotted)}.",
                "allotted_seats": newly_allotted,
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_200_OK,
        )


class BookingCancelView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        )

    @transaction.atomic
    def post(self, request, pk):
        booking = get_object_or_404(
            self.get_queryset(),
            pk=pk,
        )

        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {"detail": "This booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cancel_count = request.data.get("cancel_count")
        seats_to_cancel = request.data.get("seat_numbers")

        current_seats = booking.get_seat_numbers()
        current_passengers = booking.get_passenger_names()

        # If neither cancel_count nor seat_numbers is specified, cancel the entire booking
        if cancel_count is None and not seats_to_cancel:
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=["status"])
            return Response({
                "detail": "Entire booking cancelled successfully. All seats have been released.",
                "cancelled_seats": current_seats,
                "remaining_tickets": 0,
                "refund_amount": float(booking.total_price),
                "booking": BookingSerializer(booking).data,
            })

        # Calculate seats to remove
        if seats_to_cancel and isinstance(seats_to_cancel, list) and len(seats_to_cancel) > 0:
            seats_set = set(str(s).strip() for s in seats_to_cancel)
            if not seats_set.issubset(set(current_seats)):
                return Response(
                    {"detail": "One or more specified seats do not belong to this booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            to_remove_count = len(seats_set)
        else:
            try:
                to_remove_count = int(cancel_count)
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid cancel_count provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if to_remove_count <= 0:
                return Response(
                    {"detail": "cancel_count must be at least 1."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            seats_set = None

        # If user cancels all remaining seats
        if to_remove_count >= booking.ticket_count or to_remove_count >= len(current_seats):
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=["status"])
            return Response({
                "detail": f"Entire booking cancelled ({booking.ticket_count} ticket(s)). All seats have been released.",
                "cancelled_seats": current_seats,
                "remaining_tickets": 0,
                "refund_amount": float(booking.total_price),
                "booking": BookingSerializer(booking).data,
            })

        # Partial cancellation: align passengers with seats
        while len(current_passengers) < len(current_seats):
            current_passengers.append(f"Passenger {len(current_passengers) + 1}")

        kept_seats = []
        kept_passengers = []
        cancelled_seats = []

        if seats_set:
            for seat, passenger in zip(current_seats, current_passengers):
                if seat in seats_set:
                    cancelled_seats.append(seat)
                else:
                    kept_seats.append(seat)
                    kept_passengers.append(passenger)
        else:
            split_idx = len(current_seats) - to_remove_count
            kept_seats = current_seats[:split_idx]
            kept_passengers = current_passengers[:split_idx]
            cancelled_seats = current_seats[split_idx:]

        booking.set_seat_numbers(kept_seats)
        booking.set_passenger_names(kept_passengers)
        booking.ticket_count = len(kept_seats)
        booking.total_price = booking.ticket_count * booking.event.ticket_price
        booking.save()

        refund_val = float(len(cancelled_seats) * booking.event.ticket_price)

        return Response({
            "detail": f"Successfully cancelled {len(cancelled_seats)} ticket(s)! {booking.ticket_count} ticket(s) remain confirmed. Released seats: {', '.join(cancelled_seats)}.",
            "cancelled_seats": cancelled_seats,
            "remaining_tickets": booking.ticket_count,
            "refund_amount": refund_val,
            "booking": BookingSerializer(booking).data,
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
        ).order_by("-booked_at")