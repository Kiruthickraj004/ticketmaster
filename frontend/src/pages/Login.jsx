import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BusIcon, AlertCircleIcon, ArrowRightIcon } from "../components/Icons";
import OperatorStatusModal from "../components/OperatorStatusModal";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkStatus") === "true") {
      setIsStatusModalOpen(true);
    }
  }, [searchParams]);

  const infoMessage = location.state?.infoMessage;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedUser = await login(username, password);
      // Route based on role
      if (loggedUser.role === "OPERATOR") {
        navigate("/operator/events");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const detailMsg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.non_field_errors)
          ? err.response.data.non_field_errors.join(" ")
          : "Invalid credentials. Please verify your username and password.");
      setError(detailMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingApprovalError =
    error.toLowerCase().includes("pending") ||
    error.toLowerCase().includes("approval") ||
    error.toLowerCase().includes("administrator");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto text-white shadow-lg shadow-brand-500/20">
            <BusIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to TicketMaster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sign in to manage your journeys or operator fleet
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-lg space-y-6">
          {infoMessage && !error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p>{infoMessage}</p>
            </div>
          )}

          {error && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                isPendingApprovalError
                  ? "bg-amber-50 border border-amber-300 text-amber-900"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              <AlertCircleIcon
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isPendingApprovalError ? "text-amber-600" : "text-rose-600"
                }`}
              />
              <div className="w-full">
                {isPendingApprovalError && (
                  <span className="font-bold block mb-0.5">Approval Required</span>
                )}
                <p>{error}</p>
                {isPendingApprovalError && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-medium">Want to check live review status?</span>
                    <button
                      type="button"
                      onClick={() => setIsStatusModalOpen(true)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Check Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to My Account</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Logins Info Pill */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Quick Demo Accounts:</span>
              <span className="text-[10px] text-slate-400 font-mono">Password123!</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername("john");
                  setPassword("Password123!");
                  setError("");
                }}
                className="py-1.5 px-2 bg-white hover:bg-rose-50 hover:text-brand-600 text-slate-700 font-semibold rounded-lg border border-slate-200 text-center transition-colors shadow-2xs cursor-pointer text-[11px]"
              >
                Passenger
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername("sarah");
                  setPassword("Password123!");
                  setError("");
                }}
                className="py-1.5 px-2 bg-white hover:bg-rose-50 hover:text-brand-600 text-slate-700 font-semibold rounded-lg border border-slate-200 text-center transition-colors shadow-2xs cursor-pointer text-[11px]"
              >
                Operator
              </button>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Dedicated Operator Application Status Card */}
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <BusIcon className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Registered as a Bus Operator?</span>
            </div>
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl font-bold text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-colors cursor-pointer text-center"
            >
              Check Application Status
            </button>
          </div>
        </div>
      </div>

      {/* Operator Status Modal */}
      <OperatorStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        initialIdentifier={username}
        onApprovedSignIn={(approvedUser) => {
          setUsername(approvedUser);
          setPassword("");
          setError("");
        }}
      />
    </div>
  );
}

export default Login;