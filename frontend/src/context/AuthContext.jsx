import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check logged-in user when application starts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data);
      } catch (error) {
        sessionStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Register user
  const register = async (userData) => {
    const response = await api.post(
      "/api/auth/register",
      userData
    );

    return response.data;
  };

  // Login user
  const login = async (email, password) => {
    const response = await api.post(
      "/api/auth/login",
      { email, password }
    );

    const token = response.data.access_token;

    sessionStorage.setItem("access_token", token);

    try {
      const userResponse = await api.get("/api/auth/me");
      setUser(userResponse.data);

      return userResponse.data;
    } catch (error) {
      sessionStorage.removeItem("access_token");
      setUser(null);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    sessionStorage.removeItem("access_token");
    setUser(null);
  };

  const authInfo = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};