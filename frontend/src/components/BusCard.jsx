import React from "react";
import { Link } from "react-router-dom";
import {
  BusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "./Icons";
import StatusBadge from "./StatusBadge";

function BusCard({ bus, event }) {
  const item = bus || event;
  if (!item) return null;

  const availableSeats = item.available_seats_count ?? (item.total_seats || 40);
  const isAvailable = availableSeats > 0;

  // Split amenities into display chips
  const amenitiesList = item.amenities
    ? item.amenities.split(",").map((a) => a.trim()).slice(0, 4)
    : ["AC", "Charging", "Water"];

  return (
    <div className="group light-card light-card-hover rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden bg-white border border-slate-200 hover:border-rose-200">
      {/* Top Banner: Operator & Type */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-brand-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {item.bus_type || "Luxury AC Coach"}{" "}
                {item.bus_number && (
                  <span className="text-slate-400 font-mono">• {item.bus_number}</span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <StatusBadge status={item.status || "PUBLISHED"} size="sm" />
          </div>
        </div>

        {/* Route Details: From -> To with Departure and Arrival times */}
        <div className="my-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between gap-2">
            {/* Origin */}
            <div className="flex-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <MapPinIcon className="w-3.5 h-3.5 text-brand-500" />
                <span>From</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 line-clamp-1">
                {item.source || "Origin"}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
                <ClockIcon className="w-3 h-3 text-slate-400" />
                <span>{item.time ? String(item.time).slice(0, 5) : "--:--"}</span>
              </div>
            </div>

            {/* Travel Arrow */}
            <div className="flex flex-col items-center px-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Direct
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300 relative my-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border-t-2 border-r-2 border-brand-500" />
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                {item.date ? String(item.date) : "Today"}
              </span>
            </div>

            {/* Destination */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>To</span>
                <MapPinIcon className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <p className="text-sm font-extrabold text-slate-900 line-clamp-1">
                {item.destination || "Destination"}
              </p>
              <div className="flex items-center justify-end gap-1 text-xs text-slate-600 font-medium mt-0.5">
                <ClockIcon className="w-3 h-3 text-slate-400" />
                <span>
                  {item.arrival_time
                    ? String(item.arrival_time).slice(0, 5)
                    : "Next Morning"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenitiesList.map((amenity, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Price, Seats & Book Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                availableSeats > 5
                  ? "bg-emerald-500"
                  : availableSeats > 0
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-bold text-slate-700">
              {availableSeats > 0 ? `${availableSeats} Seats Available` : "Sold Out"}
            </span>
          </div>
          <div className="text-lg font-black text-slate-900">
            ₹{Number(item.ticket_price).toFixed(2)}
            <span className="text-xs font-normal text-slate-500 ml-1">/ ticket</span>
          </div>
        </div>

        <Link
          to={`/buses/${item.id}`}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
            isAvailable
              ? "gradient-brand gradient-brand-hover shadow-brand-500/20 hover:shadow-brand-500/30"
              : "bg-slate-300 cursor-not-allowed pointer-events-none"
          }`}
        >
          <span>{isAvailable ? "Book Tickets" : "Sold Out"}</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default BusCard;
