import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import StaffAccounts from "../data/StaffAccount";
import clinicLogo from "../assets/clinic.jpg";
import bgclinic from "../assets/bgclinic.jpg";

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const staffId = formData.get("staffId").trim();
    const password = formData.get("password");

    if (!staffId) {
      alert("Please enter your Staff ID.");
      return;
    }

    if (!password) {
      alert("Please enter your Password.");
      return;
    }

    const user = StaffAccounts.find(
      (account) => account.staffId === staffId && account.password === password,
    );

    if (!user) {
      alert("Invalid Staff ID or Password.");
      return;
    }

    onLogin(user);
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const staffId = formData.get("resetStaffId").trim();

    if (!staffId) {
      alert("Please enter your Staff ID.");
      return;
    }

    const user = StaffAccounts.find((account) => account.staffId === staffId);

    if (!user) {
      alert("Staff ID not found.");
      return;
    }

    alert(
      `Password reset request submitted for Staff ID: ${staffId}. Please contact the clinic administrator for further assistance.`,
    );
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${bgclinic})` }}
    >
      <div className="absolute inset-0 bg-green-900/50"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-green-900 p-8 shadow-2xl">
        {showForgotPassword ? (
          <div>
            <div className="mb-8 text-center">
              <img
                src={clinicLogo}
                alt="UDM Clinic Logo"
                className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
              />

              <h1 className="text-3xl font-bold text-white">UDM CLINIC</h1>

              <p className="mt-2 text-sm text-white">
                Healthcare Monitoring System
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Forgot Password
              </h2>

              <p className="mt-1 text-sm text-green-100">
                Enter your Staff ID to request a password reset.
              </p>
            </div>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-6">
                <label
                  htmlFor="resetStaffId"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Staff ID
                </label>

                <input
                  id="resetStaffId"
                  name="resetStaffId"
                  type="text"
                  placeholder="Enter your Staff ID"
                  className="w-full rounded-lg border border-green-700 bg-green-800 px-4 py-3 text-white outline-none placeholder:text-white focus:border-white focus:ring-2 focus:ring-green-200"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-green-900 hover:bg-green-200"
              >
                Continue
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="mt-4 w-full text-sm text-white hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8 text-center">
              <img
                src={clinicLogo}
                alt="UDM Clinic Logo"
                className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
              />

              <h1 className="text-3xl font-bold text-white">UDM CLINIC</h1>

              <p className="mt-2 text-sm text-white">
                Healthcare Monitoring System
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Authorized Personnel Login
              </h2>

              <p className="mt-1 text-sm text-white">
                Sign in to access the clinic system.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="staffid"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Staff ID
                </label>

                <input
                  id="staffid"
                  name="staffId"
                  type="text"
                  placeholder="Enter your Staff ID"
                  className="w-full rounded-lg border border-green-700 bg-green-800 px-4 py-3 text-white outline-none placeholder:text-white focus:border-white focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    className="w-full rounded-lg border border-green-700 bg-green-800 px-4 py-3 pr-12 text-white outline-none placeholder:text-white focus:border-white focus:ring-2 focus:ring-green-200"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-green-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="h-4 w-4 rounded border-green-700"
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-white hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-green-900 hover:bg-green-200"
              >
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
