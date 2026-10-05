import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BusIcon,
  TicketIcon,
  LogOutIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
} from "./Icons";

function Navbar() {
  const { user, logout, isOperator, isCustomer, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLinkClasses = (path) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
      isActive(path)
        ? "bg-rose-50 text-brand-600 border border-rose-200 shadow-sm"
        : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
    }`;

  const organizationName =
    user?.operator_profile?.organization_name ||
    user?.organizer_profile?.organization_name ||
    "";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 group"
            >
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <BusIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Ticket<span className="text-brand-500">Master</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {isOperator ? "Operator Portal" : "Bus Booking"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Role Based */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Passenger & Guest: Show Search Buses */}
              {(!user || isCustomer) && (
                <Link to="/buses" className={navLinkClasses("/buses")}>
                  <BusIcon className="w-4 h-4" />
                  <span>Search Buses</span>
                </Link>
              )}

              {/* Passenger only: Show My Bookings */}
              {isCustomer && (
                <Link to="/bookings" className={navLinkClasses("/bookings")}>
                  <TicketIcon className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
              )}

              {/* Operator: Bus fleet & trip management */}
              {isOperator && (
                <Link to="/operator/buses" className={navLinkClasses("/operator/buses")}>
                  <BusIcon className="w-4 h-4" />
                  <span>My Bus Trips</span>
                </Link>
              )}

              {/* Admin: Show All Bus Trips */}
              {isAdmin && (
                <Link to="/buses" className={navLinkClasses("/buses")}>
                  <BusIcon className="w-4 h-4" />
                  <span>All Bus Trips</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Operator Quick Action */}
            {isOperator && (
              <Link
                to="/operator/buses/create"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-brand-600 border border-rose-200 hover:bg-brand-500 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Schedule New Bus</span>
              </Link>
            )}

            {/* Admin Quick Action */}
            {isAdmin && (
              <a
                href="http://localhost:8000/admin/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5 border border-slate-200"
                title="Open Django Admin"
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 text-brand-600" />
                <span>Django Admin</span>
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-600 font-bold text-xs uppercase shadow-sm">
                    {user.username?.[0] || "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                      {isOperator
                        ? organizationName || "Bus Operator"
                        : isAdmin
                        ? "Administrator"
                        : "Passenger"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white gradient-brand gradient-brand-hover shadow-sm hover:shadow transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {(!user || isCustomer) && (
            <Link
              to="/buses"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base ${navLinkClasses("/buses")}`}
            >
              Search Buses
            </Link>
          )}

          {isCustomer && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base ${navLinkClasses("/bookings")}`}
            >
              My Bookings
            </Link>
          )}

          {isOperator && (
            <>
              <Link
                to="/operator/buses"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base ${navLinkClasses("/operator/buses")}`}
              >
                My Bus Trips
              </Link>
              <Link
                to="/operator/buses/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base text-brand-600 bg-rose-50 border border-rose-200 font-semibold"
              >
                + Schedule New Bus
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/buses"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base ${navLinkClasses("/buses")}`}
              >
                All Bus Trips
              </Link>
              <a
                href="http://localhost:8000/admin/"
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 rounded-lg text-base text-slate-700 font-medium hover:bg-slate-50"
              >
                Django Admin ↗
              </a>
            </>
          )}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-brand-600 border border-rose-200 flex items-center justify-center font-bold text-xs uppercase">
                    {user.username?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{user.username}</div>
                    <div className="text-xs text-slate-500">
                      {isOperator
                        ? organizationName || "Bus Operator"
                        : isAdmin
                        ? "Administrator"
                        : "Passenger"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-white gradient-brand"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;