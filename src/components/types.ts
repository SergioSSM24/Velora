export type UserRole = 'corporativo' | 'corporativo-plus' | 'personal-tienda' | 'supervisor';

export interface User {
  username: string;
  role: UserRole;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  author: string;
  lastModified: Date;
  category: string;
  tags: string[];
  attachedFiles?: string[];
  status: 'draft' | 'review' | 'published';
  priority: 'normal' | 'high';
  requiresEvidence: boolean;
  evidenceFiles: { [userId: string]: string[] };
  isFavorite?: { [userId: string]: boolean };
  assignedSupervisor?: string; // Supervisor asignado para revisión
  targetUserGroups: UserRole[]; // Grupos de usuario que pueden ver el documento
  reviewedBy?: string; // Usuario que envió a revisión
}

export interface CalendarEvent {
  id: string;
  dates: Date[]; // Cambiado de date a dates para múltiples días
  title: string;
  type: 'important' | 'inactive';
  description?: string;
  createdBy: string;
  color?: string; // Color personalizable
}

export type ViewMode = 'grid' | 'list' | 'compact';

export const hasReadPermission = (role: UserRole): boolean => {
  return ['corporativo', 'corporativo-plus', 'personal-tienda', 'supervisor'].includes(role);
};

export const hasEditPermission = (role: UserRole): boolean => {
  return ['corporativo-plus', 'supervisor'].includes(role);
};

export const hasSuperEditPermission = (role: UserRole): boolean => {
  return role === 'supervisor';
};

export const canDeleteDocuments = (role: UserRole): boolean => {
  return role === 'supervisor';
};

export const canManageCalendar = (role: UserRole): boolean => {
  return ['corporativo-plus', 'supervisor'].includes(role);
};

export const canUploadEvidence = (role: UserRole): boolean => {
  return ['corporativo', 'personal-tienda'].includes(role);
};

export const getRoleName = (role: UserRole): string => {
  const roleNames = {
    'corporativo': 'Corporativo',
    'corporativo-plus': 'Corporativo+',
    'personal-tienda': 'Personal de Tienda',
    'supervisor': 'Supervisor'
  };
  return roleNames[role];
};

// Función para verificar si un usuario puede ver un documento
export const canViewDocument = (userRole: UserRole, document: Document, username: string): boolean => {
  // Los documentos en revisión solo pueden ser vistos por Corporativo+ y el autor
  if (document.status === 'review') {
    return userRole === 'corporativo-plus' || userRole === 'supervisor' || document.author === username;
  }
  
  // Para documentos publicados, verificar si el usuario está en los grupos objetivo
  if (document.status === 'published') {
    return document.targetUserGroups.includes(userRole);
  }
  
  // Para borradores, solo el autor puede verlos
  if (document.status === 'draft') {
    return document.author === username;
  }
  
  return false;
};

// Función para obtener usuarios supervisores disponibles (mock data)
export const getSupervisors = (): { username: string; displayName: string }[] => {
  return [
    { username: 'supervisor1', displayName: 'Ana García (Supervisor)' },
    { username: 'supervisor2', displayName: 'Carlos López (Supervisor)' },
    { username: 'supervisor3', displayName: 'María Rodríguez (Supervisor)' }
  ];
};

// Función para simular envío de email
export const sendEmailNotification = (to: string, subject: string, message: string): void => {
  // En un sistema real, esto sería una llamada a la API
  console.log(`Email enviado a ${to}: ${subject} - ${message}`);
};