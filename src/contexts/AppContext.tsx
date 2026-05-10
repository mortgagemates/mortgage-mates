import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Broker, Application } from '../types';
import * as storage from '../utils/storage';

interface AppContextType {
  currentBroker: Broker | null;
  isAdminAuthed: boolean;
  loginBroker: (email: string, password: string) => boolean;
  logoutBroker: () => void;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  getBrokers: () => Broker[];
  saveBroker: (broker: Broker) => void;
  getApplicationsByBroker: (brokerId: string) => Application[];
  getAllApplications: () => Application[];
  saveApplication: (app: Application) => void;
  getApplicationById: (id: string) => Application | undefined;
  getBrokerById: (id: string) => Broker | undefined;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_EMAIL = 'admin@mortgagemates.com';
const ADMIN_PASSWORD = 'admin@MM2024';

export function AppProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const storedBrokerId = storage.getCurrentBrokerId();
  const currentBroker = storedBrokerId ? storage.getBrokerById(storedBrokerId) ?? null : null;
  const isAdminAuthed = storage.isAdminAuthed();

  const loginBroker = (email: string, password: string): boolean => {
    const broker = storage.getBrokerByEmail(email);
    if (!broker || broker.password !== password) return false;
    if (!broker.emailVerified || !broker.paymentCompleted) return false;
    storage.setCurrentBroker(broker.id);
    refresh();
    return true;
  };

  const logoutBroker = () => {
    storage.setCurrentBroker(null);
    refresh();
  };

  const loginAdmin = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      storage.setAdminAuth(true);
      refresh();
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    storage.setAdminAuth(false);
    refresh();
  };

  const saveBroker = (broker: Broker) => {
    storage.saveBroker(broker);
    refresh();
  };

  const saveApplication = (app: Application) => {
    storage.saveApplication(app);
    refresh();
  };

  return (
    <AppContext.Provider
      value={{
        currentBroker,
        isAdminAuthed,
        loginBroker,
        logoutBroker,
        loginAdmin,
        logoutAdmin,
        getBrokers: storage.getBrokers,
        saveBroker,
        getApplicationsByBroker: storage.getApplicationsByBroker,
        getAllApplications: storage.getApplications,
        saveApplication,
        getApplicationById: storage.getApplicationById,
        getBrokerById: storage.getBrokerById,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
