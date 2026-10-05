import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBuses } from "../api/buses";
import BusCard from "../components/BusCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  MapPinIcon,
  SwapIcon,
  TicketIcon,
  SearchIcon,
  PlusIcon,
} from "../components/Icons";

function Home() {
  const { user, isCustomer, isOperator, isAdmin } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filter state
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await getBuses();
        setBuses(data);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to backend server. Make sure Django is running on port 8000.");
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const handleReset = () => {
    setSource("");
    setDestination("");
    setDate("");
    setTypeFilter("ALL");
  };

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      if (source.trim() && !bus.source?.toLowerCase().includes(source.trim().toLowerCase())) {
        return false;
      }
      if (destination.trim() && !bus.destination?.toLowerCase().includes(destination.trim().toLowerCase())) {
        return false;
      }
      if (date.trim() && bus.date !== date.trim()) {
        return false;
      }
      if (typeFilter !== "ALL" && !bus.bus_type?.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [buses, source, destination, date, typeFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
            <BusIcon className="w-3.5 h-3.5" />
            <span>Bus Ticket Booking Project</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            TicketMaster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select number of tickets to get seats auto-allotted, with easy ticket modifications anytime.
          </p>
        </div>

        {/* Quick User Actions */}
        <div className="flex items-center gap-2">
          {isCustomer && (
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-rose-50 border border-rose-200 hover:bg-brand-500 hover:text-white transition-all shadow-xs"
            >
              <TicketIcon className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          )}

          {isOperator && (
            <>
              <Link
                to="/operator/buses"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
              >
                <BusIcon className="w-4 h-4 text-brand-600" />
                <span>My Bus Trips</span>
              </Link>
              <Link
                to="/operator/buses/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-brand shadow-xs"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Schedule New Bus</span>
              </Link>
            </>
          )}

        </div>
      </div>


      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Source City */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              From (Source)
            </label>
            <div className="relative">
              <MapPinIcon className="w-4 h-4 text-brand-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Chennai, Coimbatore"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          {/* Swap */}
          <div className="hidden lg:flex lg:col-span-1 justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin and Destination"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-brand-600 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <SwapIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination City */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              To (Destination)
            </label>
            <div className="relative">
              <MapPinIcon className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Madurai, Salem"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          {/* Travel Date */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Travel Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500"
            />
          </div>

          {/* Reset */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-2 text-xs font-bold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Coach Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400">Coach Type:</span>
          {[
            { label: "All Coaches", value: "ALL" },
            { label: "AC Sleeper", value: "Sleeper" },
            { label: "Semi-Sleeper", value: "Semi-Sleeper" },
            { label: "Volvo / Luxury", value: "Volvo" },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setTypeFilter(type.value)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                typeFilter === type.value
                  ? "bg-brand-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Buses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Available Buses ({filteredBuses.length})</span>
          <span className="text-brand-600 font-bold">✓ Auto Seat Allocation Enabled</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner message="Loading bus schedules..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <BusIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No buses matching your filters</p>
            <p className="text-xs text-slate-500">Try clearing the search inputs to view all scheduled buses.</p>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Show All Buses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
