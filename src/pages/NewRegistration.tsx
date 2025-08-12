import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BirthRegistrationForm } from '../components/organisms/BirthRegistrationForm';

export const NewRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/registrations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('registration.newRegistration')}
          </h1>
          <p className="mt-2 text-gray-600">
            Fill in the birth registration details below
          </p>
        </div>
      </div>

      <BirthRegistrationForm
        mode="create"
        onCancel={handleCancel}
      />
    </div>
  );
};