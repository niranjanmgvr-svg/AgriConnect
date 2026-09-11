import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const MOCK_USERS = {
  farmer: {
    id: 1,
    name: "Basavaraj Gowda",
    phone: "9876543210",
    role: "farmer",
    state: "Karnataka",
    district: "Bengaluru Rural",
    is_verified: true,
    rating: 4.9
  },
  buyer: {
    id: 5,
    name: "Kaveri Agro Traders",
    phone: "9876543220",
    role: "buyer",
    state: "Karnataka",
    district: "Bengaluru",
    business_name: "Kaveri Agro Traders Pvt Ltd",
    gstin_pan: "29AAAAA0000A1Z5",
    is_verified: true,
    rating: 4.9
  },
  admin: {
    id: 9,
    name: "Karnataka APMC Admin",
    phone: "9999999999",
    role: "admin",
    state: "Karnataka",
    district: "Bengaluru",
    is_verified: true,
    rating: 5.0
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('kisan'); // 'kisan' | 'technical'

  const quickLogin = (roleKey = 'farmer') => {
    const user = MOCK_USERS[roleKey] || MOCK_USERS.farmer;
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = (googleUser = {}) => {
    const user = {
      id: googleUser.id || 101,
      name: googleUser.name || "Basavaraj Gowda",
      email: googleUser.email || "basavaraj.gowda@gmail.com",
      phone: googleUser.phone || "9876543210",
      role: googleUser.role || "farmer",
      state: "Karnataka",
      district: "Bengaluru Rural",
      business_name: googleUser.role === 'buyer' ? 'Kaveri Agro Traders' : null,
      avatar: googleUser.picture || "https://lh3.googleusercontent.com/a/default-user",
      auth_provider: "google",
      is_verified: true,
      rating: 4.9
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const loginWithPhone = (userObj) => {
    setCurrentUser({
      id: userObj.id || 1,
      name: userObj.name || `User ${userObj.phone?.slice(-4)}`,
      phone: userObj.phone,
      role: userObj.role || 'farmer',
      state: userObj.state || 'Karnataka',
      district: userObj.district || 'Bengaluru Rural',
      business_name: userObj.business_name || (userObj.role === 'buyer' ? 'Kaveri Agro Traders' : null),
      is_verified: userObj.is_verified ?? true,
      rating: 4.8
    });
    setIsAuthenticated(true);
  };

  const switchRole = (roleKey) => {
    if (MOCK_USERS[roleKey]) {
      setCurrentUser(MOCK_USERS[roleKey]);
      setIsAuthenticated(true);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'kisan' ? 'technical' : 'kisan'));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      viewMode,
      setViewMode,
      toggleViewMode,
      quickLogin,
      loginWithGoogle,
      loginWithPhone,
      switchRole,
      logout,
      MOCK_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
