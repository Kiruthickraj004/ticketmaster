import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBus, getBusSeats, bookTickets } from "../api/buses";
import { useAuth } from "../context/AuthContext";
import SeatGrid from "../components/SeatGrid";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  MinusIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "../components/Icons";

function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();

  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state: simple ticket count selection!
  const [ticketCount, setTicketCount] = useState(1);
  const [passengers, setPassengers] = useState([""]);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const loadBusData = async () => {
    try {
      const [busData, seatData] = await Promise.all([
        getBus(id),
        getBusSeats(id),
      ]);
      setBus(busData);
      setSeats(seatData);

      // Pre-fill passenger 1 with user full name or username if logged in
      if (user) {
        setPassengers([
          user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username,
        ]);
        setContactEmail(user.email || "");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load bus trip details. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusData();
  }, [id, user]);

  const maxAvailable = bus?.available_seats_count ?? (bus?.total_seats || 40);

  const handleTicketCountChange = (newCount) => {
    if (newCount < 1 || newCount > Math.min(8, maxAvailable)) return;
    setTicketCount(newCount);

    // Adjust passengers array size
    setPassengers((prev) => {
      const updated = [...prev];
      while (updated.length < newCount) {
        updated.push("");
      }
      return updated.slice(0, newCount);
    });
  };

  const handlePassengerNameChange = (index, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleBookTickets = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      setBookingError("Please sign in to book your tickets.");
      return;
    }

    if (!isCustomer) {
      setBookingError("Bus operators cannot book tickets. Please sign in with a passenger account.");
      return;
    }

    if (ticketCount < 1) {
      setBookingError("Please select at least 1 ticket.");
      return;
    }

    if (ticketCount > maxAvailable) {
      setBookingError(`Only ${maxAvailable} seats are available on this bus.`);
      return;
    }

    setBookingLoading(true);

    try {
      // Clean passenger names or provide defaults
      const cleanPassengers = passengers.map((p, idx) =>
        p.trim() ? p.trim() : idx === 0 ? user.first_name || user.username : `Passenger ${idx + 1}`
      );

      const bookingData = await bookTickets({
        bus: id,
        ticket_count: ticketCount,
        passenger_names: cleanPassengers,
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || user.email,
      });

      setConfirmedBooking(bookingData);

      // Reload live seat status
      const updatedSeats = await getBusSeats(id);
      setSeats(updatedSeats);
    } catch (err) {
      console.error(err);
      setBookingError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.ticket_count?.[0] ||
          "Booking failed. Please check available seats and try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bus route details..." fullScreen />;
  }

  if (error || !bus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircleIcon className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Bus Trip Not Found</h2>
        <p className="text-sm text-slate-500">{error || "Bus trip details are currently unavailable."}</p>
        <Link
          to="/buses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors shadow-sm"
        >
          Return to Buses
        </Link>
      </div>
    );
  }

  const ticketPrice = Number(bus.ticket_price) || 0;
  const totalPrice = (ticketPrice * ticketCount).toFixed(2);
  const amenitiesList = bus.amenities ? bus.amenities.split(",").map((a) => a.trim()) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/buses" className="hover:text-brand-600 transition-colors">
          Search Buses
        </Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-xs">{bus.name}</span>
      </div>

      {/* Main Grid: Bus Details (Left) + Ticket Booking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bus Info & Coach Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <StatusBadge status={bus.status || "PUBLISHED"} size="md" />
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {maxAvailable} seats left
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-brand-600 border border-rose-100 flex items-center justify-center shrink-0">
                <BusIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {bus.name}
                </h1>
                <p className="text-xs font-bold text-slate-500">
                  {bus.bus_type || "AC Coach"}{" "}
                  {bus.bus_number && (
                    <span className="font-mono text-slate-400">• {bus.bus_number}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Route Board */}
            <div className="my-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between gap-4">
                {/* Source */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Boarding From
                  </span>
                  <p className="text-lg font-black text-slate-900">{bus.source || "Origin City"}</p>
                  <p className="text-xs font-bold text-brand-600 flex items-center gap-1 mt-0.5">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>{bus.time}</span>
                  </p>
                  {bus.boarding_point && (
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">{bus.boarding_point}</p>
                  )}
                </div>

                {/* Duration / Arrow */}
                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
                    Direct Trip
                  </span>
                  <div className="w-20 sm:w-28 h-[2px] bg-slate-300 my-2 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-500 rotate-45" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{bus.date}</span>
                </div>

                {/* Destination */}
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Dropping At
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    {bus.destination || "Destination City"}
                  </p>
                  <p className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1 mt-0.5">
                    <span>{bus.arrival_time || "Next Morning"}</span>
                  </p>
                  {bus.dropping_point && (
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs ml-auto">
                      {bus.dropping_point}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {bus.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {bus.description}
              </p>
            )}

            {/* Amenities list */}
            {amenitiesList.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Onboard Amenities & Facilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coach Layout Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Coach Layout Preview</h3>
                <p className="text-xs text-slate-500">
                  Preview where your auto-allocated seats will be located
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Coach Capacity: <strong className="text-slate-800">{bus.total_seats || 40} Seats</strong>
              </span>
            </div>

            <SeatGrid
              seats={seats}
              ticketCount={ticketCount}
              allocatedSeats={confirmedBooking?.allocated_seats || []}
            />
          </div>
        </div>

        {/* Right Column: Ticket Counter & Instant Booking Card */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-brand-600" />
                <span>Book Tickets</span>
              </h2>
              <span className="text-xs font-bold text-brand-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                ₹{ticketPrice.toFixed(2)} / seat
              </span>
            </div>

            {/* Confirmed Booking Success Banner */}
            {confirmedBooking ? (
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-4 text-emerald-900">
                <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-800">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Tickets Confirmed & Seats Allotted!</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking ID:</span>
                    <span className="font-mono font-bold text-slate-800">
                      #{confirmedBooking.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allocated Seats:</span>
                    <span className="font-extrabold text-brand-600 text-sm bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {confirmedBooking.allocated_seats?.join(", ") || confirmedBooking.seat_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tickets Count:</span>
                    <span className="font-bold text-slate-800">
                      {confirmedBooking.ticket_count} Passenger(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Paid:</span>
                    <span className="font-black text-slate-900">
                      ₹{Number(confirmedBooking.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/bookings"
                    className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white gradient-brand shadow-sm hover:shadow transition-all"
                  >
                    View in My Bookings & Manage
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedBooking(null);
                      setTicketCount(1);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Book More Tickets for This Bus
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookTickets} className="space-y-6">
                {bookingError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Step 1: Select Number of Tickets */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    1. How Many Tickets?
                  </label>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Number of Passengers
                      </span>
                      <span className="text-xs text-slate-400">
                        Max {Math.min(8, maxAvailable)} tickets per booking
                      </span>
                    </div>

                    {/* Counter Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTicketCountChange(ticketCount - 1)}
                        disabled={ticketCount <= 1}
                        className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-base transition-colors shadow-xs"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <span className="w-6 text-center font-black text-lg text-slate-900">
                        {ticketCount}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTicketCountChange(ticketCount + 1)}
                        disabled={ticketCount >= Math.min(8, maxAvailable)}
                        className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-base transition-colors shadow-xs"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Auto-seat allocation guarantee pill */}
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-brand-600 bg-rose-50/70 border border-rose-100 px-3 py-1.5 rounded-xl font-medium">
                    <SparklesIcon className="w-4 h-4 text-brand-500 shrink-0" />
                    <span>Seats will be automatically allotted consecutively for your party.</span>
                  </div>
                </div>

                {/* Step 2: Passenger Names */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    2. Passenger Details
                  </label>
                  <div className="space-y-2.5">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-xs font-bold text-slate-400 text-center">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder={
                              idx === 0
                                ? "Passenger 1 (Lead Passenger)"
                                : `Passenger ${idx + 1} Full Name`
                            }
                            value={p}
                            onChange={(e) => handlePassengerNameChange(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Contact Info */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    3. Contact Information
                  </label>
                  <div className="space-y-2.5">
                    <input
                      type="tel"
                      placeholder="Contact Phone (e.g. +91 98765 43210)"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <input
                      type="email"
                      placeholder="Contact Email for Ticket Confirmation"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                {/* Fare Summary Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Ticket Price ({ticketCount} × ₹{ticketPrice.toFixed(2)}):</span>
                    <span className="font-bold text-slate-800">
                      ₹{(ticketPrice * ticketCount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Convenience Fee:</span>
                    <span className="font-bold text-emerald-600">FREE (₹0.00)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">Total Payable:</span>
                    <span className="text-xl font-black text-brand-600">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Submit Action */}
                {!user ? (
                  <Link
                    to="/login"
                    className="w-full py-3.5 px-4 rounded-xl text-center font-bold text-white gradient-brand shadow-md shadow-brand-500/20 block text-sm"
                  >
                    Sign In to Book {ticketCount} Ticket(s)
                  </Link>
                ) : !isCustomer ? (
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs text-center font-semibold border border-amber-200">
                    Logged in as Bus Operator. Please switch to a Passenger account to book.
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={bookingLoading || maxAvailable <= 0}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {bookingLoading ? (
                      <span>Allotting Seats & Confirming...</span>
                    ) : (
                      <>
                        <span>Confirm & Book {ticketCount} Ticket(s) • ₹{totalPrice}</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusDetails;
