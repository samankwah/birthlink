import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { Button } from '../atoms';
import type { BirthRegistration } from '../../types';

export const CertificateQuickTest: React.FC = () => {
  const navigate = useNavigate();

  const createTestRegistration = (): BirthRegistration => {
    return {
      id: `test-${Date.now()}`,
      registrationNumber: `TEST-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      childDetails: {
        firstName: 'Kwame',
        lastName: 'Asante',
        dateOfBirth: new Date('2024-06-15'),
        placeOfBirth: 'Eastern Regional Hospital, Koforidua',
        gender: 'Male',
        hospitalOfBirth: 'Eastern Regional Hospital'
      },
      motherDetails: {
        firstName: 'Ama',
        lastName: 'Asante',
        dateOfBirth: new Date('1990-03-20'),
        nationalId: 'GHA-123456789-1',
        occupation: 'Teacher',
        phoneNumber: '0243999631'
      },
      fatherDetails: {
        firstName: 'Kofi',
        lastName: 'Asante',
        dateOfBirth: new Date('1988-08-10'),
        nationalId: 'GHA-987654321-2',
        occupation: 'Engineer',
        phoneNumber: '0244123456'
      },
      registrarInfo: {
        registrarId: 'registrar-001',
        registrationDate: new Date(),
        location: 'Koforidua Registration Office',
        region: 'Eastern',
        district: 'New Juaben Municipal'
      },
      status: 'approved',
      syncStatus: 'synced',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
  };

  const handleTestCertificate = () => {
    const testRegistration = createTestRegistration();
    localStorage.setItem('lastRegistration', JSON.stringify(testRegistration));
    
    navigate('/certificate', {
      state: { registration: testRegistration }
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        🧪 Test Certificate Generation
      </h3>
      <p className="text-blue-700 text-sm mb-3">
        Generate a sample birth certificate with test data to see how the system works.
      </p>
      <Button 
        variant="secondary"
        onClick={handleTestCertificate}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Generate Test Certificate
      </Button>
    </div>
  );
};