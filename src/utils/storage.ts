import type { Broker, Application } from '../types';

const KEYS = {
  BROKERS: 'mm_brokers',
  APPLICATIONS: 'mm_applications',
  CURRENT_BROKER: 'mm_current_broker',
  ADMIN_AUTH: 'mm_admin_auth',
  SIGNUP_DRAFT: 'mm_signup_draft',
};

// Brokers
export function getBrokers(): Broker[] {
  return JSON.parse(localStorage.getItem(KEYS.BROKERS) || '[]');
}

export function saveBroker(broker: Broker): void {
  const brokers = getBrokers();
  const idx = brokers.findIndex(b => b.id === broker.id);
  if (idx >= 0) brokers[idx] = broker;
  else brokers.push(broker);
  localStorage.setItem(KEYS.BROKERS, JSON.stringify(brokers));
}

export function getBrokerByEmail(email: string): Broker | undefined {
  return getBrokers().find(b => b.email.toLowerCase() === email.toLowerCase());
}

export function getBrokerById(id: string): Broker | undefined {
  return getBrokers().find(b => b.id === id);
}

// Applications
export function getApplications(): Application[] {
  return JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) || '[]');
}

export function saveApplication(app: Application): void {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx >= 0) apps[idx] = app;
  else apps.push(app);
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
}

export function getApplicationById(id: string): Application | undefined {
  return getApplications().find(a => a.id === id);
}

export function getApplicationsByBroker(brokerId: string): Application[] {
  return getApplications().filter(a => a.brokerId === brokerId);
}

// Session
export function setCurrentBroker(brokerId: string | null): void {
  if (brokerId) localStorage.setItem(KEYS.CURRENT_BROKER, brokerId);
  else localStorage.removeItem(KEYS.CURRENT_BROKER);
}

export function getCurrentBrokerId(): string | null {
  return localStorage.getItem(KEYS.CURRENT_BROKER);
}

export function setAdminAuth(value: boolean): void {
  if (value) localStorage.setItem(KEYS.ADMIN_AUTH, '1');
  else localStorage.removeItem(KEYS.ADMIN_AUTH);
}

export function isAdminAuthed(): boolean {
  return localStorage.getItem(KEYS.ADMIN_AUTH) === '1';
}

// Signup draft (persists across the multi-step flow)
export function setSignupDraft(data: Record<string, string>): void {
  localStorage.setItem(KEYS.SIGNUP_DRAFT, JSON.stringify(data));
}

export function getSignupDraft(): Record<string, string> {
  return JSON.parse(localStorage.getItem(KEYS.SIGNUP_DRAFT) || '{}');
}

export function clearSignupDraft(): void {
  localStorage.removeItem(KEYS.SIGNUP_DRAFT);
}

// Seed demo data on first load
export function seedDemoData(): void {
  if (getBrokers().length > 0) return;

  const now = new Date().toISOString();
  const broker: Broker = {
    id: 'MM-BR-DEMO0001',
    name: 'Sarah Thompson',
    companyName: 'Thompson Mortgage Advisors Ltd',
    officeAddress: '15 Finance Street, London',
    postalCode: 'EC2V 8RT',
    phoneNumber: '+44 20 7946 0123',
    email: 'demo@broker.com',
    password: 'demo1234',
    emailVerified: true,
    paymentCompleted: true,
    subscriptionStart: now,
    subscriptionEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
    uniqueUrl: `${window.location.origin}/broker-portal/MM-BR-DEMO0001`,
    createdAt: now,
  };
  saveBroker(broker);

  const apps: Application[] = [
    {
      id: 'MM-APP-DEMO0001',
      brokerId: 'MM-BR-DEMO0001',
      applicationName: 'Smith Property Purchase',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      status: 'approved',
      progress: 100,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      commitmentLetterName: 'commitment_smith.pdf',
      creditApplicationName: 'credit_smith.pdf',
      uniqueUrl: `${window.location.origin}/client/MM-APP-DEMO0001`,
      signatureStatus: 'signed',
      signedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'MM-APP-DEMO0002',
      brokerId: 'MM-BR-DEMO0001',
      applicationName: 'Patel Remortgage',
      clientName: 'Priya Patel',
      clientEmail: 'priya.patel@email.com',
      status: 'in-review',
      progress: 60,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      commitmentLetterName: 'commitment_patel.pdf',
      creditApplicationName: 'credit_patel.pdf',
      uniqueUrl: `${window.location.origin}/client/MM-APP-DEMO0002`,
      signatureStatus: 'pending',
    },
    {
      id: 'MM-APP-DEMO0003',
      brokerId: 'MM-BR-DEMO0001',
      applicationName: 'Williams First Home',
      clientName: 'Oliver Williams',
      clientEmail: 'o.williams@email.com',
      status: 'pending',
      progress: 30,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      uniqueUrl: `${window.location.origin}/client/MM-APP-DEMO0003`,
      signatureStatus: 'not-requested',
    },
  ];
  apps.forEach(saveApplication);
}
