import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on reload
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token and fetch fresh user profile
          const response = await API.get("/auth/me");
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token, user: loggedUser } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true };
      }
      return { success: false, message: response.data.message || "Login failed" };
    } catch (error) {
      console.error("Login request failed:", error);
      const message = error.response?.data?.message || "Invalid credentials or server error";
      return { success: false, message };
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const response = await API.post("/auth/register", { name, email, password, role });
      if (response.data.success) {
        const { token, user: registeredUser } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(registeredUser));
        // Note: registeredUser returned from register endpoint might contain password if not excluded,
        // but it has role and _id. Let's make sure it standardizes User structure.
        const cleanUser = {
          id: registeredUser._id || registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          role: registeredUser.role,
        };
        setUser(cleanUser);
        return { success: true };
      }
      return { success: false, message: response.data.message || "Registration failed" };
    } catch (error) {
      console.error("Registration request failed:", error);
      const message = error.response?.data?.message || "Email might be in use or details invalid";
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
