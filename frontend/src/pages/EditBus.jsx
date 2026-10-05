import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMyBus, updateBus } from "../api/operator";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { BusIcon, AlertCircleIcon } from "../components/Icons";

function EditBus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    bus_number: "",
    bus_type: "AC Sleeper (2+1)",
    source: "",
    destination: "",
    date: "",
    time: "",
    arrival_date: "",
    arrival_time: "",
    ticket_price: "",
    total_seats: "40",
    amenities: "",
    boarding_point: "",
    dropping_point: "",
    description: "",
    status: "PUBLISHED",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBusData = async () => {
      try {
        const data = await getMyBus(id);
        setFormData({
          name: data.name || "",
          bus_number: data.bus_number || "",
          bus_type: data.bus_type || "AC Sleeper (2+1)",
          source: data.source || "",
          destination: data.destination || "",
          date: data.date || "",
          time: data.time || "",
          arrival_date: data.arrival_date || data.date || "",
          arrival_time: data.arrival_time || "",
          ticket_price: data.ticket_price || "",
          total_seats: String(data.total_seats || 40),
          amenities: data.amenities || "",
          boarding_point: data.boarding_point || "",
          dropping_point: data.dropping_point || "",
          description: data.description || "",
          status: data.status || "PUBLISHED",
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load bus route details.");
      } finally {
        setLoading(false);
      }
    };

    loadBusData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateBus(id, {
        ...formData,
        ticket_price: Number(formData.ticket_price),
        total_seats: Number(formData.total_seats) || 40,
        arrival_date: formData.arrival_date || formData.date,
      });

      navigate("/operator/buses");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to update bus trip. Please check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bus trip details..." fullScreen />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/operator/buses" className="hover:text-brand-600 transition-colors">
          Operator Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800">Edit Bus Trip</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
              <BusIcon className="w-3.5 h-3.5" />
              <span>Bus Trip Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Edit Scheduled Bus Trip
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Update coach scheduling, departure timings, and onboard amenities.
            </p>
          </div>

          <StatusBadge status={formData.status} size="md" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Bus Name / Service & Coach Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bus Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bus Registration / Coach Number
              </label>
              <input
                type="text"
                name="bus_number"
                value={formData.bus_number}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Row 2: Coach Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Coach Type *
              </label>
              <select
                name="bus_type"
                value={formData.bus_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 bg-white"
              >
                <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                <option value="AC Semi-Sleeper (2+2)">AC Semi-Sleeper (2+2)</option>
                <option value="Volvo Multi-Axle AC Sleeper">Volvo Multi-Axle AC Sleeper</option>
                <option value="Scania Luxury AC">Scania Luxury AC</option>
                <option value="Executive Seater AC">Executive Seater AC</option>
                <option value="Non-AC Sleeper">Non-AC Sleeper</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 bg-white"
              >
                <option value="PUBLISHED">Published (Available for Booking)</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Row 3: Source and Destination Cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Origin / Source City *
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination City *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Row 4: Boarding & Dropping Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Boarding Points
              </label>
              <input
                type="text"
                name="boarding_point"
                value={formData.boarding_point}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dropping Points
              </label>
              <input
                type="text"
                name="dropping_point"
                value={formData.dropping_point}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>
          </div>

          {/* Row 5: Departure and Arrival Schedule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                name="arrival_date"
                value={formData.arrival_date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>
          </div>

          {/* Row 6: Capacity & Fare */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Seats Capacity *
              </label>
              <input
                type="number"
                min="10"
                max="60"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ticket Fare (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 font-bold"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Amenities
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/operator/buses"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBus;
