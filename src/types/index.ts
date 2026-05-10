export type ApplicationStatus =
  | 'draft'
  | 'pending'
  | 'in-review'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'completed';

export type SignatureStatus = 'not-requested' | 'pending' | 'signed';

export interface Broker {
  id: string;
  name: string;
  companyName: string;
  officeAddress: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  emailVerified: boolean;
  paymentCompleted: boolean;
  subscriptionStart: string;
  subscriptionEnd: string;
  uniqueUrl: string;
  createdAt: string;
}

export interface Application {
  id: string;
  brokerId: string;
  applicationName: string;
  clientName: string;
  clientEmail: string;
  status: ApplicationStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  commitmentLetterName?: string;
  creditApplicationName?: string;
  extractedData?: Record<string, string>;
  intakeFormData?: Record<string, string>;
  uniqueUrl: string;
  signatureStatus: SignatureStatus;
  signedAt?: string;
  clientSignature?: string;
  clientNotes?: string;
}

export interface SignupFormData {
  name: string;
  companyName: string;
  officeAddress: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}
