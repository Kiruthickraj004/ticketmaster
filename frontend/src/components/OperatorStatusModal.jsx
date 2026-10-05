import React, { useState, useEffect } from "react";
import { checkOperatorStatus } from "../api/auth";
import StatusBadge from "./StatusBadge";
import {
  BusIcon,
  SearchIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from "./Icons";

export default function OperatorStatusModal({
  isOpen,
  onClose,
  initialIdentifier = "",
  onApprovedSignIn,
}) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialIdentifier) {
        setIdentifier(initialIdentifier);
        handleLookup(initialIdentifier);
      } else {
        setStatusData(null);
        setError("");
      }
    }
  }, [isOpen, initialIdentifier]);

  if (!isOpen) return null;

  const handleLookup = async (idToSearch) => {
    const query = (idToSearch !== undefined ? idToSearch : identifier).trim();
    if (!query) {
      setError("Please enter your username or registered email address.");
      return;
    }

    setError("");
    setStatusData(null);
    setLoading(true);

    try {
      const data = await checkOperatorStatus(query);
      setStatusData(data);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        "Could not retrieve application status. Please check your spelling and try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-xs">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Operator Approval Status
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Check the review status of your bus agency account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Search Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Username or Registered Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. sarah or busoperator@travels.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white gradient-brand gradient-brand-hover disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {loading ? "Checking..." : "Check"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Results Display */}
          {statusData && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {statusData.organization_name || statusData.username}
                  </h3>
                  <p className="text-xs text-slate-500">
                    User: <span className="font-semibold text-slate-700">{statusData.username}</span> ({statusData.email})
                  </p>
                </div>
                <StatusBadge status={statusData.approval_status} size="md" />
              </div>

              {/* Status Explanation Card */}
              <div
                className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed flex items-start gap-2.5 ${
                  statusData.approval_status === "APPROVED" || statusData.is_approved
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : statusData.approval_status === "REJECTED"
                    ? "bg-rose-50 border border-rose-200 text-rose-900"
                    : "bg-amber-50 border border-amber-200 text-amber-900"
                }`}
              >
                {statusData.approval_status === "APPROVED" || statusData.is_approved ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : statusData.approval_status === "REJECTED" ? (
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block mb-0.5">
                    {statusData.approval_status === "APPROVED" || statusData.is_approved
                      ? "Application Approved"
                      : statusData.approval_status === "REJECTED"
                      ? "Application Declined"
                      : "Under Administrator Review"}
                  </span>
                  <p>{statusData.message}</p>
                </div>
              </div>

              {/* Metadata */}
              {statusData.registered_on && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Application Submitted:</span>
                  <span className="font-medium text-slate-600">
                    {formatDate(statusData.registered_on)}
                  </span>
                </div>
              )}

              {/* Call to action for approved operators */}
              {(statusData.approval_status === "APPROVED" || statusData.is_approved) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onApprovedSignIn) {
                      onApprovedSignIn(statusData.username);
                    }
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Sign In Now as {statusData.username}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need help? Contact your platform admin</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
