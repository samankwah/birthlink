import { Timestamp } from 'firebase/firestore';

// User Types
export type UserRole = 'admin' | 'registrar' | 'viewer';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type Language = 'en' | 'tw' | 'ga' | 'ee';
export type Gender = 'Male' | 'Female';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region?: string;
  district?: string;
  location?: {
    region: string;
    district: string;
  };
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  occupation?: string;
  department?: string;
  organization?: string;
}

export interface UserPreferences {
  language: Language;
  notifications: boolean;
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  status: UserStatus;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

// Birth Registration Types
export interface ChildDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: Gender;
  hospitalOfBirth?: string;
}

export interface ParentDetails {
  firstName: string;
  lastName: string;
  nationalId?: string;
  dateOfBirth: Date;
  occupation?: string;
  phoneNumber?: string;
}

export interface RegistrarInfo {
  registrarId: string;
  registrationDate: Date;
  location: string;
  region: string;
  district: string;
}

export interface SyncMetadata {
  clientId: string;
  clientTimestamp: Timestamp;
  serverTimestamp: Timestamp;
  version: number;
}

export type RegistrationStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface BirthRegistration {
  id: string;
  registrationNumber: string;
  childDetails: ChildDetails;
  motherDetails: ParentDetails;
  fatherDetails: ParentDetails;
  registrarInfo: RegistrarInfo;
  syncMetadata?: SyncMetadata;
  status: RegistrationStatus;
  syncStatus: SyncStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Form Types
export interface RegistrationFormData {
  childDetails: Omit<ChildDetails, 'dateOfBirth'> & { dateOfBirth: string };
  motherDetails: Omit<ParentDetails, 'dateOfBirth'> & { dateOfBirth: string };
  fatherDetails: Omit<ParentDetails, 'dateOfBirth'> & { dateOfBirth: string };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Sync Queue Types
export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SyncQueueItem {
  id: string;
  userId: string;
  operationType: SyncOperationType;
  collectionName: string;
  documentId: string;
  data: Record<string, unknown>;
  timestamp: Timestamp;
  retryCount: number;
  status: SyncQueueStatus;
}

// System Configuration Types
export interface SystemConfig {
  registrationNumberSequence: number;
  supportedLanguages: Language[];
  systemMaintenance: boolean;
  apiLimits: {
    registrationsPerDay: number;
    syncBatchSize: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// UI Component Types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Ghana Regions
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Volta',
  'Eastern',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong-Ahafo',
  'Western North',
  'Ahafo',
  'Bono East',
  'North East',
  'Savannah',
  'Oti'
] as const;

export type GhanaRegion = typeof GHANA_REGIONS[number];