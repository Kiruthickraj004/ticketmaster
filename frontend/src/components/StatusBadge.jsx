import React from "react";

export default function StatusBadge({ status, size = "md" }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs tracking-wider",
    lg: "px-3.5 py-1.5 text-sm",
  }[size] || "px-2.5 py-1 text-xs";

  const colorStyles = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SCHEDULED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    BOOKED: "bg-rose-50 text-rose-700 border-rose-200",
    COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
    CUSTOMER: "bg-sky-50 text-sky-700 border-sky-200",
    OPERATOR: "bg-purple-50 text-purple-700 border-purple-200",
    ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  }[normalized] || "bg-slate-100 text-slate-700 border-slate-200";


  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-sm uppercase ${sizeClasses} ${colorStyles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {normalized}
    </span>
  );
}
