import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const MOCK_USERS = {
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
    name: "Rajesh Agro Traders",
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
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.farmer);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const switchRole = (roleKey) => {
    if (MOCK_USERS[roleKey]) {
      setCurrentUser(MOCK_USERS[roleKey]);
    }
  };

  const loginWithPhone = (userObj) => {
    setCurrentUser(userObj);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      loginWithPhone,
      showOtpModal,
      setShowOtpModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
