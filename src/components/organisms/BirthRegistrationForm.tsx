import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms';
import { FormField } from '../molecules';
import type { RootState, AppDispatch } from '../../store';
import { createRegistration } from '../../store/slices/registrationSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useOfflineRegistrations } from '../../hooks/useOfflineRegistrations';
import type { RegistrationFormData } from '../../types';
import { validateRegistrationForm, getFieldError, type ValidationError } from '../../utils/validation';

interface BirthRegistrationFormProps {
  initialData?: Partial<RegistrationFormData>;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export const BirthRegistrationForm: React.FC<BirthRegistrationFormProps> = ({
  initialData,
  mode = 'create',
  onCancel
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.registrations);
  const { createOfflineRegistration, isOnline } = useOfflineRegistrations();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    childDetails: {
      firstName: initialData?.childDetails?.firstName || '',
      lastName: initialData?.childDetails?.lastName || '',
      dateOfBirth: initialData?.childDetails?.dateOfBirth || '',
      placeOfBirth: initialData?.childDetails?.placeOfBirth || '',
      gender: initialData?.childDetails?.gender || 'Male',
      hospitalOfBirth: initialData?.childDetails?.hospitalOfBirth || ''
    },
    motherDetails: {
      firstName: initialData?.motherDetails?.firstName || '',
      lastName: initialData?.motherDetails?.lastName || '',
      nationalId: initialData?.motherDetails?.nationalId || '',
      dateOfBirth: initialData?.motherDetails?.dateOfBirth || '',
      occupation: initialData?.motherDetails?.occupation || ''
    },
    fatherDetails: {
      firstName: initialData?.fatherDetails?.firstName || '',
      lastName: initialData?.fatherDetails?.lastName || '',
      nationalId: initialData?.fatherDetails?.nationalId || '',
      dateOfBirth: initialData?.fatherDetails?.dateOfBirth || '',
      occupation: initialData?.fatherDetails?.occupation || ''
    }
  });

  const handleInputChange = (section: keyof RegistrationFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear validation error for this field when user starts typing
    const fieldPath = `${section}.${field}`;
    if (validationErrors.some(e => e.field === fieldPath)) {
      setValidationErrors(prev => prev.filter(e => e.field !== fieldPath));
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors = validateRegistrationForm(formData);
    
    // Filter errors based on current step
    let stepErrors: ValidationError[] = [];
    
    switch (currentStep) {
      case 1: // Child Details
        stepErrors = errors.filter(e => e.field.startsWith('childDetails'));
        break;
      case 2: // Mother Details
        stepErrors = errors.filter(e => e.field.startsWith('motherDetails'));
        break;
      case 3: // Father Details
        stepErrors = errors.filter(e => e.field.startsWith('fatherDetails'));
        break;
      default:
        stepErrors = errors;
    }
    
    setValidationErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allErrors = validateRegistrationForm(formData);
    setValidationErrors(allErrors);
    
    if (allErrors.length > 0) {
      dispatch(addNotification({
        type: 'error',
        message: t('registration.registrationError')
      }));
      return;
    }

    try {
      if (isOnline) {
        // Try online creation first
        await dispatch(createRegistration(formData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: t('registration.registrationCreated')
        }));
      } else {
        // Use offline creation
        await createOfflineRegistration(formData);
        dispatch(addNotification({
          type: 'success',
          message: 'Registration saved offline and will sync when connection is restored'
        }));
      }
      navigate('/registrations');
    } catch {
      // Fallback to offline if online creation fails
      if (isOnline) {
        try {
          await createOfflineRegistration(formData);
          dispatch(addNotification({
            type: 'warning',
            message: 'Registration saved offline due to connection issues. Will sync automatically.'
          }));
          navigate('/registrations');
        } catch {
          dispatch(addNotification({
            type: 'error',
            message: t('registration.registrationError')
          }));
        }
      } else {
        dispatch(addNotification({
          type: 'error',
          message: t('registration.registrationError')
        }));
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderChildDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('registration.childInformation')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t('registration.firstName')}
          name="firstName"
          type="text"
          required
          value={formData.childDetails.firstName}
          onChange={(e) => handleInputChange('childDetails', 'firstName', e.target.value)}
          error={getFieldError(validationErrors, 'childDetails.firstName')}
        />
        
        <FormField
          label={t('registration.lastName')}
          name="lastName"
          type="text"
          required
          value={formData.childDetails.lastName}
          onChange={(e) => handleInputChange('childDetails', 'lastName', e.target.value)}
          error={getFieldError(validationErrors, 'childDetails.lastName')}
        />
        
        <FormField
          label={t('registration.dateOfBirth')}
          name="dateOfBirth"
          type="date"
          required
          value={formData.childDetails.dateOfBirth}
          onChange={(e) => handleInputChange('childDetails', 'dateOfBirth', e.target.value)}
          error={getFieldError(validationErrors, 'childDetails.dateOfBirth')}
        />
        
        <FormField
          label={t('registration.gender')}
          name="gender"
          type="select"
          required
          value={formData.childDetails.gender}
          onChange={(e) => handleInputChange('childDetails', 'gender', e.target.value)}
          options={[
            { value: 'Male', label: t('registration.male') },
            { value: 'Female', label: t('registration.female') }
          ]}
          error={getFieldError(validationErrors, 'childDetails.gender')}
        />
        
        <FormField
          label={t('registration.placeOfBirth')}
          name="placeOfBirth"
          type="text"
          required
          value={formData.childDetails.placeOfBirth}
          onChange={(e) => handleInputChange('childDetails', 'placeOfBirth', e.target.value)}
          error={getFieldError(validationErrors, 'childDetails.placeOfBirth')}
        />
        
        <FormField
          label={t('registration.hospitalOfBirth')}
          name="hospitalOfBirth"
          type="text"
          value={formData.childDetails.hospitalOfBirth}
          onChange={(e) => handleInputChange('childDetails', 'hospitalOfBirth', e.target.value)}
          helperText={t('common.optional')}
        />
      </div>
    </div>
  );

  const renderMotherDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('registration.motherInformation')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t('registration.firstName')}
          name="motherFirstName"
          type="text"
          required
          value={formData.motherDetails.firstName}
          onChange={(e) => handleInputChange('motherDetails', 'firstName', e.target.value)}
          error={getFieldError(validationErrors, 'motherDetails.firstName')}
        />
        
        <FormField
          label={t('registration.lastName')}
          name="motherLastName"
          type="text"
          required
          value={formData.motherDetails.lastName}
          onChange={(e) => handleInputChange('motherDetails', 'lastName', e.target.value)}
          error={getFieldError(validationErrors, 'motherDetails.lastName')}
        />
        
        <FormField
          label={t('registration.dateOfBirth')}
          name="motherDateOfBirth"
          type="date"
          required
          value={formData.motherDetails.dateOfBirth}
          onChange={(e) => handleInputChange('motherDetails', 'dateOfBirth', e.target.value)}
          error={getFieldError(validationErrors, 'motherDetails.dateOfBirth')}
        />
        
        <FormField
          label={t('registration.occupation')}
          name="motherOccupation"
          type="text"
          value={formData.motherDetails.occupation}
          onChange={(e) => handleInputChange('motherDetails', 'occupation', e.target.value)}
          helperText={t('common.optional')}
        />
        
        <FormField
          label={t('registration.nationalId')}
          name="motherNationalId"
          type="text"
          value={formData.motherDetails.nationalId}
          onChange={(e) => handleInputChange('motherDetails', 'nationalId', e.target.value)}
          error={getFieldError(validationErrors, 'motherDetails.nationalId')}
          helperText={`${t('common.optional')} - Format: GHA-XXXXXXXXX-X`}
        />
      </div>
    </div>
  );

  const renderFatherDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('registration.fatherInformation')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t('registration.firstName')}
          name="fatherFirstName"
          type="text"
          required
          value={formData.fatherDetails.firstName}
          onChange={(e) => handleInputChange('fatherDetails', 'firstName', e.target.value)}
          error={getFieldError(validationErrors, 'fatherDetails.firstName')}
        />
        
        <FormField
          label={t('registration.lastName')}
          name="fatherLastName"
          type="text"
          required
          value={formData.fatherDetails.lastName}
          onChange={(e) => handleInputChange('fatherDetails', 'lastName', e.target.value)}
          error={getFieldError(validationErrors, 'fatherDetails.lastName')}
        />
        
        <FormField
          label={t('registration.dateOfBirth')}
          name="fatherDateOfBirth"
          type="date"
          required
          value={formData.fatherDetails.dateOfBirth}
          onChange={(e) => handleInputChange('fatherDetails', 'dateOfBirth', e.target.value)}
          error={getFieldError(validationErrors, 'fatherDetails.dateOfBirth')}
        />
        
        <FormField
          label={t('registration.occupation')}
          name="fatherOccupation"
          type="text"
          value={formData.fatherDetails.occupation}
          onChange={(e) => handleInputChange('fatherDetails', 'occupation', e.target.value)}
          helperText={t('common.optional')}
        />
        
        <FormField
          label={t('registration.nationalId')}
          name="fatherNationalId"
          type="text"
          value={formData.fatherDetails.nationalId}
          onChange={(e) => handleInputChange('fatherDetails', 'nationalId', e.target.value)}
          error={getFieldError(validationErrors, 'fatherDetails.nationalId')}
          helperText={`${t('common.optional')} - Format: GHA-XXXXXXXXX-X`}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderChildDetailsStep();
      case 2:
        return renderMotherDetailsStep();
      case 3:
        return renderFatherDetailsStep();
      default:
        return renderChildDetailsStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {mode === 'create' 
              ? t('registration.newRegistration') 
              : t('registration.editRegistration')
            }
          </h1>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                >
                  {t('common.previous')}
                </Button>
              )}
              
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                >
                  {t('common.cancel')}
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {mode === 'create' 
                    ? t('registration.createRegistration') 
                    : t('registration.updateRegistration')
                  }
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};