import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms';
import { FormField } from '../molecules';
import { BirthCertificate } from './BirthCertificate';
import type { RootState, AppDispatch } from '../../store';
import { createRegistration } from '../../store/slices/registrationSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useOfflineRegistrations } from '../../hooks/useOfflineRegistrations';
import type { RegistrationFormData, BirthRegistration } from '../../types';
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
      occupation: initialData?.motherDetails?.occupation || '',
      nationality: initialData?.motherDetails?.nationality || 'Ghana'
    },
    fatherDetails: {
      firstName: initialData?.fatherDetails?.firstName || '',
      lastName: initialData?.fatherDetails?.lastName || '',
      nationalId: initialData?.fatherDetails?.nationalId || '',
      dateOfBirth: initialData?.fatherDetails?.dateOfBirth || '',
      occupation: initialData?.fatherDetails?.occupation || '',
      nationality: initialData?.fatherDetails?.nationality || 'Ghana'
    },
    // Add registrar info fields
    registrarInfo: {
      region: initialData?.registrarInfo?.region || 'Greater Accra',
      district: initialData?.registrarInfo?.district || '',
      location: initialData?.registrarInfo?.location || ''
    }
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewRegistration, setPreviewRegistration] = useState<BirthRegistration | null>(null);

  // Convert form data to registration format for certificate preview
  const convertToRegistration = (data: RegistrationFormData): BirthRegistration => {
    return {
      id: 'preview-' + Date.now(),
      registrationNumber: 'GHA-' + new Date().getFullYear() + '-000000',
      childDetails: {
        ...data.childDetails,
        dateOfBirth: new Date(data.childDetails.dateOfBirth || new Date().toISOString().split('T')[0])
      },
      motherDetails: {
        ...data.motherDetails,
        dateOfBirth: new Date(data.motherDetails.dateOfBirth || new Date().toISOString().split('T')[0])
      },
      fatherDetails: {
        ...data.fatherDetails,
        dateOfBirth: new Date(data.fatherDetails.dateOfBirth || new Date().toISOString().split('T')[0])
      },
      registrarInfo: {
        registrarId: 'preview-registrar',
        registrationDate: new Date(),
        location: data.registrarInfo?.location || data.childDetails.placeOfBirth || 'Ghana',
        region: data.registrarInfo?.region || 'Greater Accra',
        district: data.registrarInfo?.district || 'Accra Metropolitan'
      },
      syncStatus: 'pending' as const,
      status: 'draft' as const,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
    };
  };

  // Update preview registration when form data changes
  useEffect(() => {
    if (formData.childDetails.firstName || formData.childDetails.lastName) {
      const updatedRegistration = convertToRegistration(formData);
      setPreviewRegistration(updatedRegistration);
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [formData]);

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
      case 4: // Registrar Information
        stepErrors = errors.filter(e => e.field.startsWith('registrarInfo'));
        break;
      default:
        stepErrors = errors;
    }
    
    setValidationErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
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
      console.log('Submitting form data:', formData);
      
      if (isOnline) {
        // Try online creation first
        console.log('Attempting online registration...');
        const result = await dispatch(createRegistration(formData)).unwrap();
        console.log('Registration created successfully:', result);
        
        dispatch(addNotification({
          type: 'success',
          message: t('registration.registrationCreated', 'Registration created successfully!')
        }));
        
        // Store registration data for certificate generation
        localStorage.setItem('lastRegistration', JSON.stringify(result));
        
        // Navigate to certificate generation
        navigate('/certificate', { 
          state: { registration: result },
          replace: true 
        });
      } else {
        // Use offline creation
        console.log('Using offline registration...');
        await createOfflineRegistration(formData);
        dispatch(addNotification({
          type: 'success',
          message: 'Registration saved offline and will sync when connection is restored'
        }));
        
        // For offline registrations, create a mock registration object for certificate
        const offlineRegistration = {
          id: `offline-${Date.now()}`,
          registrationNumber: `TEMP-${Date.now()}`,
          childDetails: {
            firstName: formData.childDetails.firstName,
            lastName: formData.childDetails.lastName,
            dateOfBirth: new Date(formData.childDetails.dateOfBirth),
            placeOfBirth: formData.childDetails.placeOfBirth,
            gender: formData.childDetails.gender,
            hospitalOfBirth: formData.childDetails.hospitalOfBirth
          },
          motherDetails: {
            firstName: formData.motherDetails.firstName,
            lastName: formData.motherDetails.lastName,
            dateOfBirth: new Date(formData.motherDetails.dateOfBirth),
            nationalId: formData.motherDetails.nationalId,
            occupation: formData.motherDetails.occupation,
            phoneNumber: formData.motherDetails.phoneNumber
          },
          fatherDetails: {
            firstName: formData.fatherDetails.firstName,
            lastName: formData.fatherDetails.lastName,
            dateOfBirth: new Date(formData.fatherDetails.dateOfBirth),
            nationalId: formData.fatherDetails.nationalId,
            occupation: formData.fatherDetails.occupation,
            phoneNumber: formData.fatherDetails.phoneNumber
          },
          registrarInfo: {
            registrarId: 'current-user',
            registrationDate: new Date(),
            location: 'Current Location',
            region: 'Eastern',
            district: 'Fanteakwa'
          },
          status: 'submitted' as const,
          syncStatus: 'pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        localStorage.setItem('lastRegistration', JSON.stringify(offlineRegistration));
        navigate('/certificate', { 
          state: { registration: offlineRegistration },
          replace: true 
        });
      }
    } catch (error: any) {
      console.error('Registration submission error:', error);
      
      // Fallback to offline if online creation fails
      if (isOnline) {
        console.log('Online registration failed, trying offline...');
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
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-6 sm:w-8 h-1 ${
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
        
        <FormField
          label={t('registration.nationality')}
          name="motherNationality"
          type="select"
          value={formData.motherDetails.nationality}
          onChange={(e) => handleInputChange('motherDetails', 'nationality', e.target.value)}
          options={[
            { value: 'Ghana', label: 'Ghana' },
            { value: 'Nigeria', label: 'Nigeria' },
            { value: 'Burkina Faso', label: 'Burkina Faso' },
            { value: 'Togo', label: 'Togo' },
            { value: 'Ivory Coast', label: 'Ivory Coast' },
            { value: 'Other', label: 'Other' }
          ]}
        />
      </div>
    </div>
  );

  const renderFatherDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('registration.fatherInformation')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
        
        <FormField
          label={t('registration.nationality')}
          name="fatherNationality"
          type="select"
          value={formData.fatherDetails.nationality}
          onChange={(e) => handleInputChange('fatherDetails', 'nationality', e.target.value)}
          options={[
            { value: 'Ghana', label: 'Ghana' },
            { value: 'Nigeria', label: 'Nigeria' },
            { value: 'Burkina Faso', label: 'Burkina Faso' },
            { value: 'Togo', label: 'Togo' },
            { value: 'Ivory Coast', label: 'Ivory Coast' },
            { value: 'Other', label: 'Other' }
          ]}
        />
      </div>
    </div>
  );

  const renderRegistrarInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('registration.registrarInfo', 'Registration Information')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormField
          label={t('registration.region', 'Region')}
          name="region"
          type="select"
          required
          value={formData.registrarInfo?.region || 'Greater Accra'}
          onChange={(e) => handleInputChange('registrarInfo', 'region', e.target.value)}
          error={getFieldError(validationErrors, 'registrarInfo.region')}
          options={[
            { value: 'Greater Accra', label: 'Greater Accra Region' },
            { value: 'Ashanti', label: 'Ashanti Region' },
            { value: 'Western', label: 'Western Region' },
            { value: 'Central', label: 'Central Region' },
            { value: 'Eastern', label: 'Eastern Region' },
            { value: 'Volta', label: 'Volta Region' },
            { value: 'Northern', label: 'Northern Region' },
            { value: 'Upper East', label: 'Upper East Region' },
            { value: 'Upper West', label: 'Upper West Region' },
            { value: 'Brong Ahafo', label: 'Brong Ahafo Region' }
          ]}
        />
        
        <FormField
          label={t('registration.district', 'District')}
          name="district"
          type="text"
          required
          value={formData.registrarInfo?.district || ''}
          onChange={(e) => handleInputChange('registrarInfo', 'district', e.target.value)}
          error={getFieldError(validationErrors, 'registrarInfo.district')}
        />
        
        <FormField
          label={t('registration.registrationLocation', 'Registration Location')}
          name="location"
          type="text"
          value={formData.registrarInfo?.location || ''}
          onChange={(e) => handleInputChange('registrarInfo', 'location', e.target.value)}
          helperText={t('common.optional')}
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
      case 4:
        return renderRegistrarInfoStep();
      default:
        return renderChildDetailsStep();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Registration Form */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrevStep}
                    className="w-full sm:w-auto"
                  >
                    {t('common.previous')}
                  </Button>
                )}
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                  >
                    {t('common.cancel')}
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto"
                  >
                    {t('common.next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
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

        {/* Certificate Preview */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t('certificate.preview')}
            </h2>
            <p className="text-sm text-gray-600">
              {showPreview 
                ? t('certificate.livePreview', 'Certificate updates as you fill the form')
                : t('certificate.enterChildName', 'Enter child name to see certificate preview')
              }
            </p>
          </div>

          {/* Mobile/Desktop responsive certificate container */}
          <div className="w-full">
            <div className="relative">
              {/* Improved preview container for better visibility */}
              <div 
                className="mx-auto border border-gray-200 shadow-sm overflow-hidden rounded-lg"
                style={{
                  // Increased dimensions for better preview visibility
                  width: '100%',
                  maxWidth: '700px', // Increased from 500px
                  height: '550px', // Increased from 400px
                  minHeight: '550px'
                }}
              >
                <div className="w-full h-full overflow-auto">
                  {showPreview && previewRegistration ? (
                    <div className="transform scale-[0.35] sm:scale-[0.4] md:scale-[0.45] lg:scale-[0.5] xl:scale-[0.55] origin-top-left w-[286%] sm:w-[250%] md:w-[222%] lg:w-[200%] xl:w-[182%] h-[286%] sm:h-[250%] md:h-[222%] lg:h-[200%] xl:h-[182%]">
                      <BirthCertificate 
                        registration={previewRegistration} 
                        serialNumber="PREVIEW-2024-000001"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-4">📜</div>
                        <p className="text-sm">
                          {t('certificate.previewPlaceholder', 'Certificate preview will appear here')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};