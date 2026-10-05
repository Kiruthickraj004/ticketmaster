import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteBus, getMyBuses } from "../api/operator";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
} from "../components/Icons";

function MyBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadBuses = async () => {
    try {
      const data = await getMyBuses();
      setBuses(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your bus trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const handleDelete = async (busId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus trip? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(busId);
    setError("");

    try {
      await deleteBus(busId);
      await loadBuses();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to delete this trip. Trips with confirmed bookings cannot be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bus schedules..." fullScreen />;
  }

  const publishedCount = buses.filter((b) => b.status === "PUBLISHED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
            <BusIcon className="w-3.5 h-3.5" />
            <span>Bus Operator Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            My Bus Trips & Routes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your coaches, schedule new departures, and oversee passenger seat allocations.
          </p>
        </div>

        <Link
          to="/operator/buses/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Schedule New Bus</span>
        </Link>
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
            Total Bus Routes
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {buses.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Active Departures
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {publishedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
            Fleet Operations
          </span>
          <Link
            to="/operator/buses/create"
            className="text-xs font-bold text-brand-600 hover:underline mt-1 block"
          >
            + Add Another Bus Route →
          </Link>
        </div>
      </div>

      {/* Bus Trips Table / List */}
      {buses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <BusIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Bus Trips Scheduled</h3>
          <p className="text-sm text-slate-500">
            You haven't scheduled any bus trips yet. Add your first route now!
          </p>
          <Link
            to="/operator/buses/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white gradient-brand text-xs shadow-sm hover:shadow"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Schedule First Bus Trip</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Route & Service</th>
                  <th className="py-3.5 px-6">Coach Type</th>
                  <th className="py-3.5 px-6">Departure Date & Time</th>
                  <th className="py-3.5 px-6">Seat Availability</th>
                  <th className="py-3.5 px-6">Fare</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {buses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {b.source || "Origin"} ➔ {b.destination || "Destination"}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{b.name}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px] border border-slate-200">
                        {b.bus_type || "AC Coach"}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{b.date}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{b.time}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">
                        {b.available_seats_count ?? b.total_seats}
                      </span>{" "}
                      / {b.total_seats || 40} seats left
                    </td>

                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      ₹{Number(b.ticket_price).toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/operator/buses/${b.id}/edit`}
                          title="Edit Route"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-rose-50 transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === b.id}
                          onClick={() => handleDelete(b.id)}
                          title="Delete Route"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBuses;
