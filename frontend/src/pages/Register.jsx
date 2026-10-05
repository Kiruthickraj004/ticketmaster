import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import {
  BusIcon,
  UserIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    organization_name: "",
    contact_number: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const res = await registerUser(formData);
      if (formData.role === "OPERATOR") {
        setSuccess(
          res.detail ||
            "Operator registration request submitted successfully! Your account is pending administrator approval. You will be able to log in once approved."
        );
        setTimeout(() => {
          navigate("/login?checkStatus=true", {
            state: {
              infoMessage:
                "Your bus operator account registration request has been sent to the administrator. You can check your application review status anytime.",
            },
          });
        }, 2800);
      } else {
        setSuccess("Account registered successfully! Redirecting you to sign in...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      const detailMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
              .join(" | ")
          : "Registration failed. Please check the provided information.");
      setError(detailMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto text-white shadow-lg shadow-brand-500/20">
            <BusIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Join TicketMaster to book comfortable journeys or manage your bus fleet
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-lg space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "CUSTOMER" })}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    formData.role === "CUSTOMER"
                      ? "border-brand-500 bg-rose-50/70 text-brand-600 ring-2 ring-brand-500/20 shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <UserIcon className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="font-extrabold text-xs block">Passenger</span>
                  <span className="text-[10px] text-slate-400">Book bus tickets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "OPERATOR" })}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    formData.role === "OPERATOR"
                      ? "border-brand-500 bg-rose-50/70 text-brand-600 ring-2 ring-brand-500/20 shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <BusIcon className="w-5 h-5 mx-auto mb-1 text-current" />
                  <span className="font-extrabold text-xs block">Bus Operator</span>
                  <span className="text-[10px] text-slate-400">Manage bus routes</span>
                </button>
              </div>
            </div>

            {/* Operator Approval Notice */}
            {formData.role === "OPERATOR" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Admin Approval Required</span>
                  Operator registrations require administrator review before login. Already submitted an application?{" "}
                  <Link
                    to="/login?checkStatus=true"
                    className="font-bold underline text-amber-900 hover:text-brand-600 ml-1"
                  >
                    Check review status here
                  </Link>
                </div>
              </div>
            )}

            {/* Common Credentials */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Operator-Specific Profile Details */}
            {formData.role === "OPERATOR" && (
              <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                  Bus Agency / Travels Profile
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Agency / Travels Name *
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    placeholder="e.g. Royal Star Travels"
                    value={formData.organization_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Support / Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    placeholder="+1 800 555 0199"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Description / Operating Routes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    placeholder="Brief description of your bus service or operating regions"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:border-brand-500"
                  />
                </div>
              </div>
            )}


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white gradient-brand gradient-brand-hover shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;