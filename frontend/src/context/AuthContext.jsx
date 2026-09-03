import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const MOCK_USERS = {
  farmer: {
    id: 1,
    name: "Ramesh Kumar",
    phone: "9876543210",
    role: "farmer",
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    is_verified: true,
    rating: 4.9
  },
  buyer: {
    id: 5,
    name: "Rajesh Patel",
    phone: "9876543220",
    role: "buyer",
    state: "Delhi",
    district: "North Delhi",
    business_name: "Rajesh Agro Traders Pvt Ltd",
    gstin_pan: "07AAAAA0000A1Z5",
    is_verified: true,
    rating: 4.9
  },
  admin: {
    id: 9,
    name: "Agmarknet Admin",
    phone: "9999999999",
    role: "admin",
    state: "Delhi",
    district: "New Delhi",
    is_verified: true,
    rating: 5.0
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const quickLogin = (roleKey = 'farmer') => {
    const user = MOCK_USERS[roleKey] || MOCK_USERS.farmer;
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const loginWithPhone = (userObj) => {
    setCurrentUser({
      id: userObj.id || 1,
      name: userObj.name || `User ${userObj.phone?.slice(-4)}`,
      phone: userObj.phone,
      role: userObj.role || 'farmer',
      state: userObj.state || 'Maharashtra',
      district: userObj.district || 'Nashik',
      business_name: userObj.business_name || (userObj.role === 'buyer' ? 'Rajesh Agro Traders' : null),
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

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      quickLogin,
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
