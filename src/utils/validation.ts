import type { RegistrationFormData } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateGhanaPhoneNumber = (phone: string): boolean => {
  // Ghana phone number format: +233XXXXXXXXX or 0XXXXXXXXX
  // Network codes: 20, 23, 24, 26, 27, 28, 50, 54, 55, 56, 57, 59
  const phoneRegex = /^(\+233|0)[2-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const formatGhanaPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with +233, format as +233 XX XXX XXXX
  if (cleaned.startsWith('+233')) {
    const number = cleaned.substring(4);
    if (number.length >= 2) {
      const formatted = number.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      return `+233 ${formatted}`;
    }
    return cleaned;
  }
  
  // If starts with 0, format as 0XX XXX XXXX
  if (cleaned.startsWith('0')) {
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    return formatted;
  }
  
  return cleaned;
};

export const normalizeGhanaPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Convert 0XXXXXXXXX to +233XXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+233${cleaned.substring(1)}`;
  }
  
  // If already in +233 format, keep as is
  if (cleaned.startsWith('+233') && cleaned.length === 13) {
    return cleaned;
  }
  
  return cleaned;
};

export const validateGhanaID = (nationalId: string): boolean => {
  // Ghana National ID format: GHA-XXXXXXXXX-X
  const idRegex = /^GHA-[0-9]{9}-[0-9]$/;
  return idRegex.test(nationalId);
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date <= new Date();
};

export const validateParentAge = (parentBirthDate: string, childBirthDate: string): boolean => {
  const parentDate = new Date(parentBirthDate);
  const childDate = new Date(childBirthDate);
  
  if (isNaN(parentDate.getTime()) || isNaN(childDate.getTime())) {
    return false;
  }
  
  const ageDifference = childDate.getTime() - parentDate.getTime();
  const ageInYears = ageDifference / (1000 * 60 * 60 * 24 * 365.25);
  
  return ageInYears >= 15; // Parent must be at least 15 years older than child
};

export const validateRegistrationForm = (formData: RegistrationFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Child Details Validation
  if (!formData.childDetails.firstName.trim()) {
    errors.push({ field: 'childDetails.firstName', message: 'Child first name is required' });
  }
  if (!formData.childDetails.lastName.trim()) {
    errors.push({ field: 'childDetails.lastName', message: 'Child last name is required' });
  }
  if (!formData.childDetails.dateOfBirth) {
    errors.push({ field: 'childDetails.dateOfBirth', message: 'Child date of birth is required' });
  } else if (!validateDate(formData.childDetails.dateOfBirth)) {
    errors.push({ field: 'childDetails.dateOfBirth', message: 'Invalid date of birth' });
  }
  if (!formData.childDetails.placeOfBirth.trim()) {
    errors.push({ field: 'childDetails.placeOfBirth', message: 'Place of birth is required' });
  }
  if (!formData.childDetails.gender) {
    errors.push({ field: 'childDetails.gender', message: 'Child gender is required' });
  }

  // Mother Details Validation
  if (!formData.motherDetails.firstName.trim()) {
    errors.push({ field: 'motherDetails.firstName', message: 'Mother first name is required' });
  }
  if (!formData.motherDetails.lastName.trim()) {
    errors.push({ field: 'motherDetails.lastName', message: 'Mother last name is required' });
  }
  if (!formData.motherDetails.dateOfBirth) {
    errors.push({ field: 'motherDetails.dateOfBirth', message: 'Mother date of birth is required' });
  } else if (!validateDate(formData.motherDetails.dateOfBirth)) {
    errors.push({ field: 'motherDetails.dateOfBirth', message: 'Invalid mother date of birth' });
  } else if (formData.childDetails.dateOfBirth && 
             !validateParentAge(formData.motherDetails.dateOfBirth, formData.childDetails.dateOfBirth)) {
    errors.push({ field: 'motherDetails.dateOfBirth', message: 'Mother must be at least 15 years older than child' });
  }

  // Optional Mother National ID validation
  if (formData.motherDetails.nationalId && !validateGhanaID(formData.motherDetails.nationalId)) {
    errors.push({ field: 'motherDetails.nationalId', message: 'Invalid Ghana National ID format' });
  }

  // Father Details Validation
  if (!formData.fatherDetails.firstName.trim()) {
    errors.push({ field: 'fatherDetails.firstName', message: 'Father first name is required' });
  }
  if (!formData.fatherDetails.lastName.trim()) {
    errors.push({ field: 'fatherDetails.lastName', message: 'Father last name is required' });
  }
  if (!formData.fatherDetails.dateOfBirth) {
    errors.push({ field: 'fatherDetails.dateOfBirth', message: 'Father date of birth is required' });
  } else if (!validateDate(formData.fatherDetails.dateOfBirth)) {
    errors.push({ field: 'fatherDetails.dateOfBirth', message: 'Invalid father date of birth' });
  } else if (formData.childDetails.dateOfBirth && 
             !validateParentAge(formData.fatherDetails.dateOfBirth, formData.childDetails.dateOfBirth)) {
    errors.push({ field: 'fatherDetails.dateOfBirth', message: 'Father must be at least 15 years older than child' });
  }

  // Optional Father National ID validation
  if (formData.fatherDetails.nationalId && !validateGhanaID(formData.fatherDetails.nationalId)) {
    errors.push({ field: 'fatherDetails.nationalId', message: 'Invalid Ghana National ID format' });
  }

  // Registrar Information Validation (Step 4)
  if (!formData.registrarInfo?.region?.trim()) {
    errors.push({ field: 'registrarInfo.region', message: 'Region is required' });
  }
  if (!formData.registrarInfo?.district?.trim()) {
    errors.push({ field: 'registrarInfo.district', message: 'District is required' });
  }

  return errors;
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(e => e.field === fieldName);
  return error?.message;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert 0XXXXXXXXX to +233XXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+233${cleaned.substring(1)}`;
  }
  
  // If already in +233 format, keep as is
  if (cleaned.startsWith('233') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  return phone; // Return original if format is unclear
};

export const formatNationalId = (id: string): string => {
  // Remove all non-alphanumeric characters
  const cleaned = id.replace(/[^A-Za-z0-9]/g, '');
  
  // Format as GHA-XXXXXXXXX-X
  if (cleaned.length >= 12 && cleaned.startsWith('GHA')) {
    const digits = cleaned.substring(3);
    if (digits.length >= 10) {
      return `GHA-${digits.substring(0, 9)}-${digits.substring(9, 10)}`;
    }
  }
  
  return id; // Return original if format is unclear
};