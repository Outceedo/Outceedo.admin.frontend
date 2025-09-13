import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUserShield,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import bg from "@/assets/images/football.jpg";
import logo from "@/assets/images/outceedologo.png";

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_PORT}/auth/login`, // Fixed API endpoint
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Get the API key from response headers
        const apiKey = response.headers["api-key"];

        if (apiKey) {
          // Store admin credentials
          localStorage.setItem("adminToken", apiKey);
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              email: formData.email,
              // Add other user properties if available from your backend
            })
          );
          localStorage.setItem("isAdmin", "true");

          Swal.fire({
            icon: "success",
            title: "Welcome Back!",
            text: `Successfully logged in as ${formData.email}`,
            timer: 2000,
            showConfirmButton: false,
          });

          // Redirect to admin dashboard
          navigate("/admin/dashboard");
        } else {
          setError("Authentication failed. No token received.");
        }
      }
    } catch (error: any) {
      console.error("Admin login error:", error);

      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 404) {
        setError(
          error.response?.data?.message || "Email or password not found"
        );
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} className="w-56 mx-auto mb-4" alt="Outceedo Logo" />
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Admin Login
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Enter your credentials to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <AlertDescription className="text-red-800 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@example.com"
                    className="pl-10 h-12 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 h-12 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                    Sign In as Admin
                  </div>
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is a secure admin portal. Unauthorized access is
                prohibited.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-white text-shadow-lg">
            © 2025 Outceedo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
