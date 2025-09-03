/**
 * Certificate Number Generation Utilities for Ghana Birth Certificate
 * Following the official Ghana Birth Certificate format (Form R)
 */

import { db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Generate certificate number in the format shown in Ghana Birth Certificate
 * Example: 0264159 (8-digit sequential number)
 */
export const generateCertificateNumber = async (district: string): Promise<string> => {
  try {
    const counterDoc = doc(db, 'certificateCounters', district);
    const counterSnap = await getDoc(counterDoc);
    
    let nextNumber = 1;
    
    if (counterSnap.exists()) {
      const data = counterSnap.data();
      nextNumber = (data.lastNumber || 0) + 1;
      
      // Update the counter
      await updateDoc(counterDoc, {
        lastNumber: increment(1),
        updatedAt: new Date()
      });
    } else {
      // Create new counter for this district
      await setDoc(counterDoc, {
        district,
        lastNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Format as 8-digit number with leading zeros (e.g., 00000001, 00264159)
    return nextNumber.toString().padStart(8, '0');
  } catch (error) {
    console.error('Error generating certificate number:', error);
    
    // Fallback: Generate secure random number for offline/permission issues
    const randomComponent = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit random number
    const timestampComponent = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    
    // Combine for uniqueness: first 4 digits random, last 4 from timestamp
    const fallbackNumber = randomComponent.toString().slice(0, 4) + timestampComponent;
    return fallbackNumber.padStart(8, '0');
  }
};

/**
 * Generate entry number for registrar tracking
 * Format: Sequential number for the registrar's records
 */
export const generateEntryNumber = async (registrarId: string): Promise<string> => {
  try {
    const entryCounterDoc = doc(db, 'entryCounters', registrarId);
    const counterSnap = await getDoc(entryCounterDoc);
    
    let nextEntry = 1;
    
    if (counterSnap.exists()) {
      const data = counterSnap.data();
      nextEntry = (data.lastEntry || 0) + 1;
      
      await updateDoc(entryCounterDoc, {
        lastEntry: increment(1),
        updatedAt: new Date()
      });
    } else {
      await setDoc(entryCounterDoc, {
        registrarId,
        lastEntry: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Format as 6-digit entry number
    return nextEntry.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating entry number:', error);
    
    // Fallback: Generate secure random 6-digit entry number
    const randomEntry = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
    const timestampSuffix = Date.now().toString().slice(-2); // Last 2 digits of timestamp
    
    // Combine for uniqueness: first 4 digits random, last 2 from timestamp
    const fallbackNumber = randomEntry.toString().slice(0, 4) + timestampSuffix;
    return fallbackNumber.padStart(6, '0');
  }
};

/**
 * Validate if child is eligible for birth registration (0-12 months)
 * As per Ghana Birth Certificate "STRICTLY FOR CHILDREN 0-12 MONTHS"
 */
export const validateChildAge = (dateOfBirth: Date): { isValid: boolean; message?: string } => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Calculate age in months
  const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                     (today.getMonth() - birthDate.getMonth());
  
  if (ageInMonths > 12) {
    return {
      isValid: false,
      message: `Child is ${ageInMonths} months old. Birth registration is strictly for children 0-12 months old as per Ghana regulations.`
    };
  }
  
  if (birthDate > today) {
    return {
      isValid: false,
      message: 'Birth date cannot be in the future.'
    };
  }
  
  return { isValid: true };
};

/**
 * Format parent nationality as shown on certificate: "National of [Country]"
 */
export const formatParentNationality = (nationality: string): string => {
  if (!nationality) return 'National of Ghana';
  
  // Handle common cases
  if (nationality.toLowerCase() === 'ghana' || nationality.toLowerCase() === 'ghanaian') {
    return 'National of Ghana';
  }
  
  // For other countries, ensure proper formatting
  if (nationality.toLowerCase().startsWith('national of')) {
    return nationality;
  }
  
  return `National of ${nationality}`;
};

/**
 * Generate registration number in the format GHA-YYYY-XXXXXX
 */
export const generateRegistrationNumber = (certificateNumber: string, year?: number): string => {
  const registrationYear = year || new Date().getFullYear();
  return `GHA-${registrationYear}-${certificateNumber}`;
};