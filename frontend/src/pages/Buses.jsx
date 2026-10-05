import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getBuses } from "../api/buses";
import BusCard from "../components/BusCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BusIcon,
  AlertCircleIcon,
  MapPinIcon,
  SwapIcon,
} from "../components/Icons";

function Buses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") || "");
  const [destFilter, setDestFilter] = useState(searchParams.get("destination") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [busTypeFilter, setBusTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("time"); // time, price_low, seats

  const loadBuses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBuses();
      setBuses(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load buses. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  // Sync params when searchParams change
  useEffect(() => {
    if (searchParams.get("source")) setSourceFilter(searchParams.get("source"));
    if (searchParams.get("destination")) setDestFilter(searchParams.get("destination"));
    if (searchParams.get("date")) setDateFilter(searchParams.get("date"));
  }, [searchParams]);

  const handleSwap = () => {
    const temp = sourceFilter;
    setSourceFilter(destFilter);
    setDestFilter(temp);
  };

  const handleClearFilters = () => {
    setSourceFilter("");
    setDestFilter("");
    setDateFilter("");
    setBusTypeFilter("ALL");
    setSearchParams({});
  };

  // Filtered and sorted buses
  const filteredBuses = useMemo(() => {
    let result = buses.filter((b) => {
      // Source match
      if (sourceFilter.trim()) {
        const sMatch = (b.source || "").toLowerCase().includes(sourceFilter.trim().toLowerCase());
        if (!sMatch) return false;
      }
      // Destination match
      if (destFilter.trim()) {
        const dMatch = (b.destination || "").toLowerCase().includes(destFilter.trim().toLowerCase());
        if (!dMatch) return false;
      }
      // Date match
      if (dateFilter.trim()) {
        if (b.date !== dateFilter.trim()) return false;
      }
      // Bus type match
      if (busTypeFilter !== "ALL") {
        const typeMatch = (b.bus_type || "").toLowerCase().includes(busTypeFilter.toLowerCase());
        if (!typeMatch) return false;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price_low") {
        return Number(a.ticket_price) - Number(b.ticket_price);
      }
      if (sortBy === "seats") {
        const aSeats = a.available_seats_count ?? a.total_seats;
        const bSeats = b.available_seats_count ?? b.total_seats;
        return bSeats - aSeats;
      }
      // Default: departure time
      return (a.time || "").localeCompare(b.time || "");
    });

    return result;
  }, [buses, sourceFilter, destFilter, dateFilter, busTypeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-600 text-xs font-bold mb-2">
              <BusIcon className="w-3.5 h-3.5" />
              <span>Available Bus Routes</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Search Buses
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Filter buses by origin, destination, date, and coach type.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              <option value="time">Departure Time (Earliest)</option>
              <option value="price_low">Ticket Fare (Lowest First)</option>
              <option value="seats">Available Seats (Most First)</option>
            </select>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-4 border-t border-slate-100 items-center">
          {/* Source */}
          <div className="lg:col-span-4 relative">
            <MapPinIcon className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="From City (e.g. Chennai, Coimbatore)"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Swap */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-brand-600 border border-slate-200 flex items-center justify-center transition-all"
            >
              <SwapIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="lg:col-span-4 relative">
            <MapPinIcon className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="To City (e.g. Madurai, Salem)"
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Date */}
          <div className="lg:col-span-2 relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Clear button */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full py-2.5 px-2 text-xs font-bold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bus Type Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400 mr-1">Coach Type:</span>
          {[
            { label: "All Coaches", value: "ALL" },
            { label: "AC Sleeper", value: "Sleeper" },
            { label: "Semi-Sleeper", value: "Semi-Sleeper" },
            { label: "Volvo / Luxury", value: "Volvo" },
            { label: "Seater", value: "Seater" },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setBusTypeFilter(type.value)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                busTypeFilter === type.value
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Buses List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Searching scheduled bus routes..." />
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 max-w-xl mx-auto text-center border border-rose-200 shadow-sm">
          <AlertCircleIcon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Buses</h3>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={loadBuses}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-brand"
          >
            Try Again
          </button>
        </div>
      ) : filteredBuses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <BusIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Buses Matching Your Search</h3>
          <p className="text-sm text-slate-500">
            We couldn't find any bus trips matching your filters. Try clearing the filters or searching for another city.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-brand-600 bg-rose-50 border border-rose-200 hover:bg-brand-500 hover:text-white transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing {filteredBuses.length} bus departure(s)</span>
            <span className="text-brand-600">⚡ Instant Seat Allocation Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Buses;
