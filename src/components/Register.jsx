

import React, { useState } from "react";

const Register = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" // 👈 NEW
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // use your existing proxy or env var
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role) newErrors.role = "Please select a role"; // 👈 NEW

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      console.log("Making registration API call to:", `${API_URL}/auth/register`);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: formData.role, // 👈 include role
        }),
      });

      const data = await res.json();
      console.log("Registration response:", data);

      if (res.ok && data.success) {
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        onRegister?.(data.data.user);
        // optionally send them to login:
        // switchToLogin();
      } else {
        setErrors({ general: data.message || "Registration failed" });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ general: "Network error. Please check if the server is running." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    alert("Google Sign Up will be implemented with OAuth integration");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-sm text-gray-600 mb-2">
            <span>Home</span> <span className="mx-2">/</span> <span>Sign Up Page</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-8">Sign Up Page</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">Accreditation</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {/* icon omitted for brevity */}
            Sign Up with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <span className="block sm:inline">{errors.general}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md`}
              placeholder="Full Name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}

            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.phone ? "border-red-300" : "border-gray-300"} rounded-md`}
              placeholder="Phone Number"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}

            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-md`}
              placeholder="Email Address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}

            <input
              type="password" name="password" value={formData.password} onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.password ? "border-red-300" : "border-gray-300"} rounded-md`}
              placeholder="Password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

            <input
              type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.confirmPassword ? "border-red-300" : "border-gray-300"} rounded-md`}
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}

            {/* ROLE SELECT */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-3 border ${errors.role ? "border-red-300" : "border-gray-300"} rounded-md bg-white`}
            >
              <option value="">Select role…</option>
              <option value="coordinator">Coordinator</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <button onClick={switchToLogin} className="font-medium text-blue-600 underline">
                Sign In
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
