import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p className="font-bold text-slate-700">
          TicketMaster — Bus Ticket Booking Application
        </p>
        <p className="text-slate-400">
          Built with Django Rest Framework & ReactJS
        </p>
      </div>
    </footer>
  );
}
