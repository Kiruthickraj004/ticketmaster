import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getMyBookings, addTicketsToBooking } from "../api/buses";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  TicketIcon,
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
  SparklesIcon,
} from "../components/Icons";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // "Add More Tickets" Modal State
  const [activeModalBooking, setActiveModalBooking] = useState(null);
  const [addTicketCount, setAddTicketCount] = useState(1);
  const [newPassengerNames, setNewPassengerNames] = useState([""]);
  const [addLoading, setAddLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // "Cancel Tickets" Modal State (Full or Partial)
  const [activeCancelBooking, setActiveCancelBooking] = useState(null);
  const [cancelCount, setCancelCount] = useState(1);
  const [cancelSelectionMode, setCancelSelectionMode] = useState("count"); // "count" | "seats"
  const [selectedCancelSeats, setSelectedCancelSeats] = useState([]);
  const [cancelModalLoading, setCancelModalLoading] = useState(false);
  const [cancelModalError, setCancelModalError] = useState("");

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load bookings. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenAddModal = (booking) => {
    setActiveModalBooking(booking);
    setAddTicketCount(1);
    setNewPassengerNames([""]);
    setModalError("");
  };

  const handleCloseAddModal = () => {
    setActiveModalBooking(null);
    setModalError("");
  };

  const handleAddTicketCountChange = (count) => {
    if (count < 1 || count > 6) return;
    setAddTicketCount(count);
    setNewPassengerNames((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push("");
      }
      return updated.slice(0, count);
    });
  };

  const handleNewPassengerNameChange = (idx, value) => {
    setNewPassengerNames((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleConfirmAddTickets = async (e) => {
    e.preventDefault();
    if (!activeModalBooking) return;

    setAddLoading(true);
    setModalError("");

    try {
      const cleanNames = newPassengerNames.map((n, i) =>
        n.trim() ? n.trim() : `Passenger ${activeModalBooking.ticket_count + i + 1}`
      );

      const response = await addTicketsToBooking(activeModalBooking.id, {
        additional_tickets: addTicketCount,
        passenger_names: cleanNames,
      });

      setSuccessMessage(
        response.detail ||
        `Successfully added ${addTicketCount} ticket(s)! Newly allocated seats: ${response.allotted_seats?.join(", ")}`
      );

      // Refresh bookings
      await loadBookings();
      handleCloseAddModal();
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not add tickets. Please check remaining seats and try again."
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenCancelModal = (booking) => {
    setActiveCancelBooking(booking);
    setCancelCount(1);
    setCancelSelectionMode("count");
    setSelectedCancelSeats([]);
    setCancelModalError("");
  };

  const handleCloseCancelModal = () => {
    setActiveCancelBooking(null);
    setCancelModalError("");
  };

  const handleToggleSeatCancellation = (seat) => {
    setSelectedCancelSeats((prev) => {
      const exists = prev.includes(seat);
      const updated = exists ? prev.filter((s) => s !== seat) : [...prev, seat];
      return updated;
    });
  };

  const handleConfirmCancelTickets = async (e) => {
    e.preventDefault();
    if (!activeCancelBooking) return;

    setCancelModalLoading(true);
    setCancelModalError("");

    try {
      let payload = {};
      if (cancelSelectionMode === "seats") {
        if (selectedCancelSeats.length === 0) {
          setCancelModalError("Please select at least one seat to cancel.");
          setCancelModalLoading(false);
          return;
        }
        payload = { seat_numbers: selectedCancelSeats };
      } else {
        payload = { cancel_count: cancelCount };
      }

      const res = await cancelBooking(activeCancelBooking.id, payload);
      setSuccessMessage(res.detail || "Ticket(s) cancelled successfully. Released seats are now available.");
      handleCloseCancelModal();
      await loadBookings();
    } catch (err) {
      console.error(err);
      setCancelModalError(
        err.response?.data?.detail || "Failed to cancel ticket(s). Please try again."
      );
    } finally {
      setCancelModalLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  if (loading) {
    return <LoadingSpinner message="Retrieving your bus tickets..." fullScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Passenger Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            My Bus Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View allocated seats, add more tickets to your booking, or cancel reservations anytime.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          {["ALL", "CONFIRMED", "CANCELLED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError("")}
            className="text-rose-700 hover:text-rose-900"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <BusIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
          <p className="text-sm text-slate-500">
            {filter === "ALL"
              ? "You haven't booked any bus tickets yet. Search available buses and plan your journey!"
              : `You have no ${filter.toLowerCase()} bus bookings.`}
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white gradient-brand text-xs shadow-sm hover:shadow"
          >
            <span>Search Available Buses</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === "CONFIRMED";
            const seatsList = b.allocated_seats || (b.seat_name ? b.seat_name.split(",") : []);
            const passengersList = b.passenger_list || [];

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row justify-between"
              >
                {/* Left Section: Journey & Bus Details */}
                <div className="p-6 sm:p-7 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-brand-600 border border-rose-100 flex items-center justify-center shrink-0">
                        <BusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {b.event_name || "Intercity Express"}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500">
                          {b.bus_type || "AC Coach"}{" "}
                          {b.bus_number && <span className="text-slate-400 font-mono">• {b.bus_number}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        Booking #{b.id}
                      </span>
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Origin
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 block">
                        {b.source || "Origin"}
                      </span>
                      <span className="font-bold text-brand-600 flex items-center gap-1 mt-0.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {b.departure_time}
                      </span>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <div className="w-16 h-[2px] bg-slate-300 relative">
                        <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-500 rotate-45" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">
                        {b.departure_date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Destination
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 block">
                        {b.destination || "Destination"}
                      </span>
                    </div>
                  </div>

                  {/* Passengers List */}
                  {passengersList.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Passengers ({passengersList.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {passengersList.map((name, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium border border-slate-200"
                          >
                            {i + 1}. {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Perforated Divider (hidden on mobile) */}
                <div className="hidden md:block w-[1px] border-r-2 border-dashed border-slate-200 relative my-4" />

                {/* Right Section: Allocated Seats, Fare & Actions */}
                <div className="p-6 sm:p-7 md:w-72 bg-slate-50/50 md:bg-white flex flex-col justify-between border-t md:border-t-0 border-slate-100 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Allocated Seats
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {seatsList.length > 0 ? (
                        seatsList.map((seat, i) => (
                          <span
                            key={i}
                            className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-50 text-brand-600 border border-rose-200 shadow-xs"
                          >
                            {seat.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          {b.seat_name || "Assigned on Boarding"}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500">
                        ({b.ticket_count} {b.ticket_count === 1 ? "Ticket" : "Tickets"})
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="text-2xl font-black text-slate-900">
                        ₹{Number(b.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Add More Tickets & Cancel */}
                  <div className="space-y-2 pt-2">
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(b)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-brand-600 bg-rose-50 hover:bg-brand-500 hover:text-white border border-rose-200 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add More Tickets</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(b)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer text-center"
                      >
                        {b.ticket_count > 1 ? "Cancel Tickets (Partial / Full)" : "Cancel Ticket"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Add More Tickets" Interactive Modal */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-brand-600 flex items-center justify-center font-bold">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Add More Tickets
                  </h3>
                  <p className="text-xs text-slate-500">
                    Booking #{activeModalBooking.id} • {activeModalBooking.event_name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseAddModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmAddTickets} className="space-y-5 pt-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Current Status Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-bold text-slate-800">
                    {activeModalBooking.source} ➔ {activeModalBooking.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Tickets:</span>
                  <span className="font-bold text-slate-800">
                    {activeModalBooking.ticket_count} tickets (Seats: {activeModalBooking.allocated_seats?.join(", ")})
                  </span>
                </div>
              </div>

              {/* Ticket Counter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  How Many Additional Tickets?
                </label>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    Additional Passengers
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddTicketCountChange(addTicketCount - 1)}
                      disabled={addTicketCount <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-base">
                      {addTicketCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddTicketCountChange(addTicketCount + 1)}
                      disabled={addTicketCount >= 6}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-seat guarantee */}
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 text-brand-600 rounded-xl text-xs font-medium border border-rose-100">
                <SparklesIcon className="w-4 h-4 shrink-0" />
                <span>
                  The next available consecutive seats will be auto-allotted and added to this booking.
                </span>
              </div>

              {/* Additional Passenger Names */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Passenger Names
                </label>
                {newPassengerNames.map((name, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Passenger ${activeModalBooking.ticket_count + idx + 1} Full Name`}
                    value={name}
                    onChange={(e) => handleNewPassengerNameChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                ))}
              </div>

              {/* Additional Cost Calculation */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">
                    Additional Amount:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {addTicketCount} × ₹{Number(activeModalBooking.ticket_price || 650).toFixed(2)}
                  </span>
                </div>
                <span className="text-lg font-black text-brand-600">
                  + ₹{(addTicketCount * Number(activeModalBooking.ticket_price || 650)).toFixed(2)}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {addLoading ? (
                    <span>Allotting & Updating...</span>
                  ) : (
                    <span>Add {addTicketCount} Ticket(s)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* "Cancel Tickets" Interactive Partial & Full Modal */}
      {activeCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
                  <TicketIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {activeCancelBooking.ticket_count > 1 ? "Cancel Tickets" : "Cancel Reservation"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Booking #{activeCancelBooking.id} • {activeCancelBooking.event_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCancelModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmCancelTickets} className="space-y-5 pt-4">
              {cancelModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cancelModalError}</span>
                </div>
              )}

              {/* Journey Details Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-extrabold text-slate-900">
                    {activeCancelBooking.source} ➔ {activeCancelBooking.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmed Tickets:</span>
                  <span className="font-bold text-slate-800">
                    {activeCancelBooking.ticket_count} ticket(s)
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                  <span className="text-slate-500">Allocated Seats:</span>
                  <div className="flex flex-wrap gap-1">
                    {(activeCancelBooking.allocated_seats || []).map((s, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* If multi-ticket booking, allow choosing partial cancellation */}
              {activeCancelBooking.ticket_count > 1 && (
                <div className="space-y-3">
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCancelSelectionMode("count");
                        setSelectedCancelSeats([]);
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        cancelSelectionMode === "count"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Cancel by Count
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCancelSelectionMode("seats");
                        if (selectedCancelSeats.length === 0 && activeCancelBooking.allocated_seats?.length) {
                          setSelectedCancelSeats([activeCancelBooking.allocated_seats[activeCancelBooking.allocated_seats.length - 1]]);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        cancelSelectionMode === "seats"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Select Specific Seats
                    </button>
                  </div>

                  {cancelSelectionMode === "count" ? (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        How many tickets to cancel?
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCancelCount(Math.max(1, cancelCount - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <div className="flex-1 text-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-xl font-black text-rose-600">
                            {cancelCount}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold ml-1.5">
                            of {activeCancelBooking.ticket_count} tickets
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCancelCount(Math.min(activeCancelBooking.ticket_count, cancelCount + 1))}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick options */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCancelCount(1)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          1 Ticket
                        </button>
                        {activeCancelBooking.ticket_count > 2 && (
                          <button
                            type="button"
                            onClick={() => setCancelCount(Math.floor(activeCancelBooking.ticket_count / 2))}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Half ({Math.floor(activeCancelBooking.ticket_count / 2)})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setCancelCount(activeCancelBooking.ticket_count)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors ml-auto cursor-pointer"
                        >
                          Cancel All ({activeCancelBooking.ticket_count})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Choose Seats to Cancel:
                        </label>
                        <span className="text-xs font-bold text-rose-600">
                          {selectedCancelSeats.length} selected
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(activeCancelBooking.allocated_seats || []).map((seat, idx) => {
                          const passenger = (activeCancelBooking.passenger_list || [])[idx] || `Passenger ${idx + 1}`;
                          const isSelected = selectedCancelSeats.includes(seat);
                          return (
                            <label
                              key={seat}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSeatCancellation(seat)}
                                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                                />
                                <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {seat}
                                </span>
                                <span className="text-xs font-medium text-slate-700">
                                  {passenger}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {isSelected ? "Will Cancel" : "Keep Seat"}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedCancelSeats([...(activeCancelBooking.allocated_seats || [])])}
                          className="text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          Select All Seats
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCancelSeats([])}
                          className="text-slate-500 hover:underline font-medium cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financial & Status Impact Box */}
              {(() => {
                const numToCancel =
                  activeCancelBooking.ticket_count === 1
                    ? 1
                    : cancelSelectionMode === "seats"
                    ? selectedCancelSeats.length
                    : cancelCount;
                const unitPrice =
                  Number(activeCancelBooking.ticket_price || 0) ||
                  (Number(activeCancelBooking.total_price) / activeCancelBooking.ticket_count);
                const refundAmount = numToCancel * unitPrice;
                const remaining = activeCancelBooking.ticket_count - numToCancel;
                const isCancellingAll = remaining === 0;

                return (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Tickets to Cancel:</span>
                        <span className="font-extrabold text-rose-700 text-sm">
                          {numToCancel} Ticket(s)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Refund Amount:</span>
                        <span className="font-black text-rose-700 text-base">
                          ₹{refundAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-rose-200/80 flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Remaining Active Tickets:</span>
                        <span className="font-black text-slate-900">
                          {isCancellingAll ? "0 (Booking Cancelled)" : `${remaining} Ticket(s) CONFIRMED`}
                        </span>
                      </div>
                    </div>

                    {isCancellingAll ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium flex items-center gap-2">
                        <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>All tickets are selected. This will cancel your entire booking reservation.</span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Partial cancellation: Your remaining {remaining} ticket(s) stay active and confirmed!</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Nevermind, Keep
                </button>
                <button
                  type="submit"
                  disabled={cancelModalLoading || (cancelSelectionMode === "seats" && selectedCancelSeats.length === 0)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {cancelModalLoading ? (
                    <span>Processing Cancellation...</span>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;