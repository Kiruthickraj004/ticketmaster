import React from "react";
import { ArmchairIcon, BusIcon, SparklesIcon } from "./Icons";

export default function SeatGrid({ seats, ticketCount = 1, allocatedSeats = [] }) {
  if (!seats || seats.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">Seats information is loading...</p>
      </div>
    );
  }

  const bookedCount = seats.filter((s) => s.status === "BOOKED").length;
  const availableCount = seats.length - bookedCount;

  // Next seats that would be auto-allocated
  const availableSeats = seats.filter((s) => s.status !== "BOOKED");
  const previewAllocated = allocatedSeats.length > 0
    ? allocatedSeats
    : availableSeats.slice(0, ticketCount).map((s) => s.seat);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Informative Banner */}
      <div className="w-full bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 mb-6 flex items-start gap-3">
        <SparklesIcon className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-700">
          <span className="font-bold text-slate-900 block mb-0.5">
            Automatic Seat Allocation
          </span>
          No manual seat clicking needed! Select your ticket count, and the platform automatically allocates the best available consecutive seats (
          <span className="font-bold text-brand-600">
            {previewAllocated.length > 0 ? previewAllocated.join(", ") : "Next available"}
          </span>
          ) for you.
        </div>
      </div>

      {/* Seat Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 mb-6 text-xs text-slate-600 bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-300 shadow-xs" />
          <span>Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-500 border border-brand-600 shadow-xs" />
          <span className="text-brand-600 font-bold">Auto-Allocated ({previewAllocated.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300 opacity-70" />
          <span className="text-slate-400">Booked ({bookedCount})</span>
        </div>
      </div>

      {/* Bus Graphic Container */}
      <div className="w-full max-w-sm bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-4 relative">
        {/* Bus Front Windshield & Steering */}
        <div className="w-full h-12 rounded-t-2xl bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BusIcon className="w-4 h-4 text-brand-600" />
            Front of Bus
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            Driver Cabin 🛞
          </span>
        </div>

        {/* Bus Seat Grid: 4 columns (2 left, aisle, 2 right) */}
        <div className="grid grid-cols-4 gap-2.5 px-2 py-1 max-h-80 overflow-y-auto pr-1">
          {seats.map((s, idx) => {
            const isBooked = s.status === "BOOKED";
            const isAutoAllotted = previewAllocated.includes(s.seat);

            let seatClasses =
              "h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-150 relative ";

            if (isAutoAllotted) {
              seatClasses +=
                "bg-brand-500 text-white shadow-sm ring-2 ring-brand-300 font-extrabold scale-105";
            } else if (isBooked) {
              seatClasses +=
                "bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed opacity-60";
            } else {
              seatClasses +=
                "bg-white text-slate-700 border border-slate-200 hover:border-brand-300";
            }

            return (
              <div
                key={s.id || idx}
                className={seatClasses}
                title={`${s.seat}: ${isAutoAllotted ? "Will be assigned to you" : s.status}`}
              >
                <span>{s.seat}</span>
              </div>
            );
          })}
        </div>

        {/* Bus Rear */}
        <div className="w-full h-6 rounded-b-xl bg-slate-50 border-t border-slate-100 mt-4 flex items-center justify-center">
          <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-400">
            Rear of Bus
          </span>
        </div>
      </div>
    </div>
  );
}
