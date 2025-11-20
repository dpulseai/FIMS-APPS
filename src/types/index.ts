import { User } from '@supabase/supabase-js';

export interface UserPermission {
  application_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_admin: boolean;
  role_name: string;
}

export interface UserProfile {
  name: string | null;
  role_name: string | null;
  role_description: string | null;
  email: string | null;
  phone_number: string | null;
}

export interface Inspection {
  id: string;
  category_id: string;
  category_name?: string;
  category_name_marathi?: string;
  form_type?: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'revisit';
  location_name?: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  location_address: string | null;
  inspector_id: string;
  filled_by_name: string | null;
  assigned_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  photos?: InspectionPhoto[];
}

export interface InspectionPhoto {
  id: string;
  inspection_id: string;
  photo_url: string;
  photo_name: string;
  description: string | null;
  photo_order: number;
  created_at: string;
}

export interface InspectionCategory {
  id: string;
  name: string;
  name_marathi: string;
  form_type: string;
  description: string | null;
  icon_name: string | null;
  color: string | null;
  is_active: boolean;
}

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  tableName: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address: string | null;
  timestamp: number;
}

export interface PhotoData {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  fileSize: number;
  timestamp: number;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Inspections: undefined;
  NewInspection: undefined;
  Profile: undefined;
};

export type InspectionsStackParamList = {
  InspectionsList: undefined;
  InspectionDetail: { inspectionId: string };
};

export type FormsStackParamList = {
  CategorySelection: undefined;
  FIMSOfficeInspection: { categoryId: string; inspectionId?: string };
  AnganwadiTapasani: { categoryId: string; inspectionId?: string };
  HealthInspection: { categoryId: string; inspectionId?: string };
  SubCenterMonitoring: { categoryId: string; inspectionId?: string };
  BandhkamVibhag1: { categoryId: string; inspectionId?: string };
  BandhkamVibhag2: { categoryId: string; inspectionId?: string };
  RajyaShaishanikPrashikshan: { categoryId: string; inspectionId?: string };
  RajyaGunwattaNirikshak: { categoryId: string; inspectionId?: string };
  MumbaiNyayalay: { categoryId: string; inspectionId?: string };
  PahuvaidhakiyaTapasani: { categoryId: string; inspectionId?: string };
  MahatmaGandhiRojgarHami: { categoryId: string; inspectionId?: string };
  GrampanchayatInspection: { categoryId: string; inspectionId?: string };
  ZPDarMahinyala: { categoryId: string; inspectionId?: string };
};

export { User };
