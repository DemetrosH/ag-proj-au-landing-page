'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RentalContextType {
  startDate: string | null;
  endDate: string | null;
  setDates: (start: string | null, end: string | null) => void;
  durationInDays: number;
  isDateSet: boolean;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    const savedStart = sessionStorage.getItem('rental_start');
    const savedEnd = sessionStorage.getItem('rental_end');
    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);
  }, []);

  const setDates = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start) sessionStorage.setItem('rental_start', start);
    else sessionStorage.removeItem('rental_start');
    
    if (end) sessionStorage.setItem('rental_end', end);
    else sessionStorage.removeItem('rental_end');
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  return (
    <RentalContext.Provider 
      value={{ 
        startDate, 
        endDate, 
        setDates, 
        durationInDays: calculateDuration(),
        isDateSet: !!(startDate && endDate)
      }}
    >
      {children}
    </RentalContext.Provider>
  );
}

export function useRental() {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}
