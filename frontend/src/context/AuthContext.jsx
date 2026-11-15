import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'u1',
    name: 'Keith Miller',
    role: 'Herd Manager & Farm Owner',
    email: 'keith@livestockpro.farm',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  });

  const [farms, setFarms] = useState([
    { id: 'f1', name: 'Highland Ridge Ranch', location: 'Section 4, North Pastures', herdCount: 48, dairyCount: 28, beefCount: 20 },
    { id: 'f2', name: 'Valley Green Dairy Farm', location: 'East River Road', herdCount: 120, dairyCount: 120, beefCount: 0 },
    { id: 'f3', name: 'Cedar Creek Feedlot', location: 'South County Line', herdCount: 85, dairyCount: 0, beefCount: 85 }
  ]);

  const [currentFarm, setCurrentFarm] = useState(farms[0]);

  return (
    <AuthContext.Provider value={{ user, setUser, farms, currentFarm, setCurrentFarm }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
