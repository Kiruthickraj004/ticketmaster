import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getOperatorBookings } from "../api/operator";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  SearchIcon,
  AlertCircleIcon,
  TicketIcon,
} from "../components/Icons";

function OperatorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOperatorBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load passenger bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchFilter = statusFilter === "ALL" || b.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        b.customer_username?.toLowerCase().includes(q) ||
        b.customer_email?.toLowerCase().includes(q) ||
        b.contact_phone?.toLowerCase().includes(q) ||
        b.event_name?.toLowerCase().includes(q) ||
        b.source?.toLowerCase().includes(q) ||
        b.destination?.toLowerCase().includes(q) ||
        String(b.id).includes(q) ||
        (b.passenger_list && b.passenger_list.some((p) => p.toLowerCase().includes(q))) ||
        (b.allocated_seats && b.allocated_seats.some((s) => s.toLowerCase().includes(q)));

      return matchFilter && matchSearch;
    });
  }, [bookings, searchQuery, statusFilter]);

  if (loading) {
    return <LoadingSpinner message="Loading passenger manifests..." fullScreen />;
  }

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Operator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Passenger Manifest & Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time passenger seat allocations and ticket sales across your bus routes.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search passenger, seat, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["ALL", "CONFIRMED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
          <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Confirmed Passenger Bookings
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {confirmedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            ₹{totalRevenue.toFixed(2)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Cancelled Bookings
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {cancelledCount}
          </span>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Passenger Bookings</h3>
          <p className="text-sm text-slate-500">
            {searchQuery
              ? "No passenger bookings match your query."
              : "No tickets have been booked on your buses yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Booking ID</th>
                  <th className="py-3.5 px-6">Customer & Passengers</th>
                  <th className="py-3.5 px-6">Bus Route</th>
                  <th className="py-3.5 px-6">Allocated Seats</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Total Fare</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Booked Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBookings.map((b) => {
                  const seatsList = b.allocated_seats || (b.seat_name ? [b.seat_name] : []);
                  const passengersList = b.passenger_list || [];

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        #{b.id}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {b.customer_username}
                        </div>
                        {passengersList.length > 0 && (
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                            {passengersList.join(", ")}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {b.source} ➔ {b.destination}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.event_name}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {seatsList.map((s, i) => (
                            <span
                              key={i}
                              className="font-mono font-bold bg-rose-50 text-brand-600 px-2 py-0.5 rounded border border-rose-200 text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {b.ticket_count} ticket(s)
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        <div>{b.contact_phone || "—"}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.contact_email || b.customer_email}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        ₹{Number(b.total_price || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={b.status} size="sm" />
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {b.booked_at ? new Date(b.booked_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorBookings;
