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

// Regional data structure for Ghana
const REGIONS_DISTRICTS = {
  'Greater Accra': [
    'Accra Metropolitan', 'Tema Metropolitan', 'Ga East Municipal', 'Ga West Municipal',
    'Ga Central Municipal', 'Ga South Municipal', 'Ga North Municipal', 'Kpone Katamanso Municipal',
    'Ashaiman Municipal', 'Ledzokuku Municipal', 'Krowor Municipal', 'Adenta Municipal',
    'La-Nkwantanang-Madina Municipal', 'Shai-Osudoku', 'Ningo-Prampram'
  ],
  'Ashanti': [
    'Kumasi Metropolitan', 'Obuasi Municipal', 'Ejisu Municipal', 'Juaben Municipal',
    'Bosomtwe', 'Atwima Kwanwoma', 'Atwima Mponua', 'Atwima Nwabiagya North',
    'Atwima Nwabiagya South', 'Afigya Kwabre North', 'Afigya Kwabre South',
    'Asante Akim North Municipal', 'Asante Akim South Municipal', 'Bekwai Municipal',
    'Bosome Freho', 'Ejura Sekyedumase Municipal', 'Mampong Municipal', 'Offinso Municipal',
    'Offinso North', 'Asokore Mampong Municipal', 'Adansi North', 'Adansi South',
    'Oforikrom Municipal', 'Old Tafo Municipal', 'Suame Municipal'
  ],
  'Western': [
    'Sekondi-Takoradi Metropolitan', 'Shama', 'Ahanta West', 'Nzema East Municipal',
    'Ellembelle', 'Jomoro', 'Wassa East', 'Wassa Amenfi West', 'Wassa Amenfi Central',
    'Wassa Amenfi East Municipal', 'Mpohor', 'Tarkwa-Nsuaem Municipal', 'Prestea Huni-Valley Municipal'
  ],
  'Central': [
    'Cape Coast Metropolitan', 'Elmina', 'Komenda-Edina-Eguafo-Abirem Municipal',
    'Abura-Asebu-Kwamankese', 'Mfantsiman Municipal', 'Gomoa West', 'Gomoa Central',
    'Gomoa East', 'Effutu Municipal', 'Awutu Senya East Municipal', 'Awutu Senya West',
    'Agona West Municipal', 'Agona East', 'Nyendokyere', 'Assin Central Municipal',
    'Assin North', 'Assin South', 'Twifo Atti-Morkwa', 'Twifo-Heman-Lower Denkyira',
    'Upper Denkyira East Municipal', 'Upper Denkyira West'
  ],
  'Eastern': [
    'New-Juaben South Municipal', 'New-Juaben North Municipal', 'Nsawam-Adoagyir Municipal',
    'Akuapim North Municipal', 'Akuapim South', 'Okere', 'Yilo Krobo Municipal',
    'Lower Manya Krobo Municipal', 'Upper Manya Krobo', 'Asuogyaman', 'West Akim Municipal',
    'East Akim Municipal', 'Birim North', 'Birim South', 'Atiwa West', 'Atiwa East',
    'Fanteakwa North', 'Fanteakwa South', 'Suhum Municipal', 'Akwatia', 'Denkyembour',
    'Kwaebibirem Municipal', 'Abuakwa North Municipal', 'Abuakwa South Municipal'
  ],
  'Volta': [
    'Ho Municipal', 'Ho West', 'Adaklu', 'Agotime Ziope', 'South Dayi', 'North Dayi',
    'Hohoe Municipal', 'Jasikan', 'Kadjebi', 'Biakoye', 'Nkwanta South Municipal',
    'Nkwanta North', 'Krachi East Municipal', 'Krachi West', 'Krachi Nchumuru'
  ],
  'Northern': [
    'Tamale Metropolitan', 'Sagnarigu Municipal', 'Tatale Sanguli', 'Zabzugu',
    'Kumbungu', 'Tolon', 'Savelugu Municipal', 'Nanton', 'Karaga', 'Gushagu Municipal',
    'Saboba', 'Chereponi', 'East Gonja Municipal', 'Central Gonja', 'West Gonja Municipal',
    'North Gonja', 'Bunkpurugu Nyankpanduri', 'Yunyoo', 'Mamprugu Moagduri'
  ],
  'Upper East': [
    'Bolgatanga Municipal', 'Talensi', 'Nabdam', 'Builsa North Municipal', 'Builsa South',
    'Kassena Nankana West', 'Kassena Nankana Municipal', 'Bawku West', 'Bawku Municipal',
    'Pusiga', 'Garu', 'Tempane', 'Binduri'
  ],
  'Upper West': [
    'Wa Municipal', 'Wa East', 'Wa West', 'Nadowli-Kaleo', 'Jirapa Municipal',
    'Lambussie Karni', 'Lawra Municipal', 'Nandom Municipal', 'Sissala East Municipal',
    'Sissala West'
  ],
  'Brong Ahafo': [
    'Sunyani Municipal', 'Sunyani West', 'Berekum Municipal', 'Dormaa Central Municipal',
    'Dormaa East', 'Dormaa West', 'Jaman North', 'Jaman South Municipal', 'Tain',
    'Wenchi Municipal', 'Techiman Municipal', 'Techiman North', 'Nkoranza North',
    'Nkoranza South Municipal', 'Kintampo North Municipal', 'Kintampo South',
    'Atebubu-Amantin Municipal', 'Sene West', 'Sene East', 'Pru West', 'Pru East'
  ],
  'Western North': [
    'Sefwi Wiawso Municipal', 'Sefwi Akontombra', 'Bodi', 'Juaboso',
    'Bia West', 'Bia East'
  ],
  'Ahafo': [
    'Goaso Municipal', 'Asutifi North', 'Asutifi South', 'Tano North Municipal',
    'Tano South'
  ],
  'Bono East': [
    'Techiman Municipal', 'Techiman North', 'Nkoranza North', 'Nkoranza South Municipal',
    'Kintampo North Municipal', 'Kintampo South', 'Atebubu-Amantin Municipal',
    'Sene West', 'Sene East', 'Pru West', 'Pru East'
  ],
  'North East': [
    'Nalerigu-Gambaga', 'Bunkpurugu Nyankpanduri', 'Yunyoo', 'Mamprugu Moagduri',
    'East Mamprusi Municipal', 'West Mamprusi Municipal'
  ],
  'Savannah': [
    'Damongo Municipal', 'Sawla-Tuna-Kalba', 'West Gonja Municipal', 'North Gonja',
    'Central Gonja', 'East Gonja Municipal', 'Bole', 'Yapei-Kusawgu'
  ],
  'Oti': [
    'Dambai', 'Krachi East Municipal', 'Krachi West', 'Krachi Nchumuru',
    'Nkwanta South Municipal', 'Nkwanta North', 'Kadjebi', 'Biakoye'
  ]
};

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
  const { createOfflineRegistration, isOnline } = useOfflineRegistrations();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<Array<{value: string; label: string}>>([]);
  
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
      region: initialData?.registrarInfo?.region || '',
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
        region: data.registrarInfo?.region || '',
        district: data.registrarInfo?.district || ''
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

    // Handle region change to update available districts
    if (section === 'registrarInfo' && field === 'region') {
      const districts = REGIONS_DISTRICTS[value as keyof typeof REGIONS_DISTRICTS] || [];
      setAvailableDistricts(districts.map(district => ({ value: district, label: district })));
      
      // Clear district field when region changes
      setFormData(prev => ({
        ...prev,
        registrarInfo: {
          ...prev.registrarInfo,
          district: ''
        }
      }));
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

  const generatePrintableCertificate = (registration: BirthRegistration) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Birth Certificate - ${registration.childDetails.firstName} ${registration.childDetails.lastName}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.8;
              margin: 0;
              padding: 0;
              color: black;
            }
            
            .certificate-container {
              width: 100%;
              border: 4px solid black;
              padding: 20mm;
              position: relative;
              min-height: 250mm;
            }
            
            .header-text {
              text-align: center;
              font-size: 9pt;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 15px;
            }
            
            .cert-number {
              position: absolute;
              top: 15px;
              right: 20px;
              font-weight: bold;
              font-size: 14pt;
            }
            
            .title-section {
              text-align: center;
              margin: 30px 0;
            }
            
            .republic-title {
              font-size: 14pt;
              font-weight: bold;
              margin: 10px 0;
            }
            
            .birth-cert-title {
              font-size: 20pt;
              font-weight: bold;
              letter-spacing: 4px;
              margin: 10px 0;
            }
            
            .act-reference {
              font-size: 10pt;
              margin: 5px 0;
            }
            
            .main-statement {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin: 30px 0;
            }
            
            .form-line {
              margin: 20px 0;
              display: flex;
              align-items: baseline;
            }
            
            .dotted-line {
              border-bottom: 1px dotted black;
              flex: 1;
              margin: 0 5px;
              min-height: 20px;
              text-align: center;
              padding-bottom: 2px;
              font-weight: bold;
            }
            
            .footer-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: end;
            }
            
            .signature-line {
              width: 200px;
              border-bottom: 2px solid black;
              margin: 20px 0 5px 0;
              height: 30px;
            }
            
            .registrar-text {
              text-align: center;
              font-style: italic;
            }
            
            .footer-info {
              font-size: 9pt;
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            
            .short-line {
              width: 50px;
              display: inline-block;
            }
            
            .medium-line {
              width: 120px;
              display: inline-block;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="certificate-container">
            <div class="header-text">STRICTLY FOR CHILDREN 0 — 12 MONTHS</div>
            
            <div class="cert-number">No. ${registration.registrationNumber}</div>
            
            <div class="title-section">
              <div class="republic-title">REPUBLIC OF GHANA</div>
              <div class="birth-cert-title">BIRTH CERTIFICATE</div>
              <div class="act-reference">(Section 11 Act 301)</div>
            </div>
            
            <div class="main-statement">This is to Certify that the Birth</div>
            
            <div class="form-line">
              <span>of</span>
              <span class="dotted-line">${registration.childDetails.firstName} ${registration.childDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>born at</span>
              <span class="dotted-line">${registration.childDetails.placeOfBirth}</span>
            </div>
            
            <div class="form-line">
              <span>on the</span>
              <span class="dotted-line short-line">${new Date(registration.childDetails.dateOfBirth).getDate()}</span>
              <span>day of</span>
              <span class="dotted-line medium-line">${new Date(registration.childDetails.dateOfBirth).toLocaleDateString('en-GB', { month: 'long' })}</span>
              <span>20</span>
              <span class="dotted-line short-line">${new Date(registration.childDetails.dateOfBirth).getFullYear().toString().slice(-2)}</span>
            </div>
            
            <div class="form-line">
              <span>has been duly registered in the register of Births for</span>
              <span class="dotted-line">${registration.registrarInfo?.region || ''}</span>
              <span>, in the</span>
            </div>
            
            <div class="form-line">
              <span class="dotted-line">${registration.registrarInfo?.district || ''}</span>
              <span>Registration District.</span>
            </div>
            
            <div class="form-line">
              <span>The said</span>
              <span class="dotted-line">${registration.childDetails.firstName} ${registration.childDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>is the ${registration.childDetails.gender.toLowerCase()} child of</span>
              <span class="dotted-line">${registration.motherDetails.firstName} ${registration.motherDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span class="dotted-line"></span>
            </div>
            
            <div class="form-line">
              <span>a National of</span>
              <span class="dotted-line">${registration.motherDetails.nationality || 'Ghana'}</span>
            </div>
            
            <div class="form-line">
              <span>and</span>
              <span class="dotted-line">${registration.fatherDetails.firstName} ${registration.fatherDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>a National of</span>
              <span class="dotted-line">${registration.fatherDetails.nationality || 'Ghana'}</span>
            </div>
            
            <div class="form-line">
              <span>witness my hand this</span>
              <span class="dotted-line short-line">${new Date().getDate()}</span>
              <span>day of</span>
              <span class="dotted-line medium-line">${new Date().toLocaleDateString('en-GB', { month: 'long' })}</span>
              <span>20</span>
              <span class="dotted-line short-line">${new Date().getFullYear().toString().slice(-2)}</span>
            </div>
            
            <div class="footer-section">
              <div>
                <span>Entry No.</span>
                <span class="dotted-line" style="display: inline-block; width: 150px; margin-left: 10px;">${registration.registrationNumber}</span>
              </div>
              
              <div>
                <div class="signature-line"></div>
                <div class="registrar-text">Registrar</div>
              </div>
            </div>
            
            <div class="footer-info">
              <div>BHP Counterfeit</div>
              <div>Birth Certificate Form R</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(certificateHTML);
    printWindow.document.close();
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
      console.log('Generating certificate from form data:', formData);
      
      let registrationData: BirthRegistration;
      
      if (isOnline) {
        // Try online creation first
        console.log('Attempting online registration...');
        const result = await dispatch(createRegistration(formData)).unwrap();
        console.log('Registration created successfully:', result);
        registrationData = result;
        
        dispatch(addNotification({
          type: 'success',
          message: 'Registration saved successfully!'
        }));
      } else {
        // Use offline creation
        console.log('Using offline registration...');
        await createOfflineRegistration(formData);
        
        // Create registration object for certificate generation
        registrationData = {
          id: `offline-${Date.now()}`,
          registrationNumber: `GHA-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
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
            nationality: formData.motherDetails.nationality,
            phoneNumber: formData.motherDetails.phoneNumber || ''
          },
          fatherDetails: {
            firstName: formData.fatherDetails.firstName,
            lastName: formData.fatherDetails.lastName,
            dateOfBirth: new Date(formData.fatherDetails.dateOfBirth),
            nationalId: formData.fatherDetails.nationalId,
            occupation: formData.fatherDetails.occupation,
            nationality: formData.fatherDetails.nationality,
            phoneNumber: formData.fatherDetails.phoneNumber || ''
          },
          registrarInfo: {
            registrarId: 'current-user',
            registrationDate: new Date(),
            location: formData.registrarInfo?.location || 'Ghana',
            region: formData.registrarInfo?.region || '',
            district: formData.registrarInfo?.district || ''
          },
          status: 'submitted' as const,
          syncStatus: 'pending' as const,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        };
        
        dispatch(addNotification({
          type: 'success',
          message: 'Registration saved offline successfully!'
        }));
      }
      
      // Store registration data for future access
      localStorage.setItem('lastRegistration', JSON.stringify(registrationData));
      
      // Redirect to certificate list page
      navigate('/birth-certificate');
      
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
          navigate('/birth-certificate');
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
          value={formData.registrarInfo?.region || ''}
          onChange={(e) => handleInputChange('registrarInfo', 'region', e.target.value)}
          error={getFieldError(validationErrors, 'registrarInfo.region')}
          options={[
            { value: '', label: 'Select Region...' },
            { value: 'Greater Accra', label: 'Greater Accra Region' },
            { value: 'Ashanti', label: 'Ashanti Region' },
            { value: 'Western', label: 'Western Region' },
            { value: 'Central', label: 'Central Region' },
            { value: 'Eastern', label: 'Eastern Region' },
            { value: 'Volta', label: 'Volta Region' },
            { value: 'Northern', label: 'Northern Region' },
            { value: 'Upper East', label: 'Upper East Region' },
            { value: 'Upper West', label: 'Upper West Region' },
            { value: 'Brong Ahafo', label: 'Brong Ahafo Region' },
            { value: 'Western North', label: 'Western North Region' },
            { value: 'Ahafo', label: 'Ahafo Region' },
            { value: 'Bono East', label: 'Bono East Region' },
            { value: 'North East', label: 'North East Region' },
            { value: 'Savannah', label: 'Savannah Region' },
            { value: 'Oti', label: 'Oti Region' }
          ]}
        />
        
        <FormField
          label={t('registration.district', 'District')}
          name="district"
          type="select"
          required
          value={formData.registrarInfo?.district || ''}
          onChange={(e) => handleInputChange('registrarInfo', 'district', e.target.value)}
          error={getFieldError(validationErrors, 'registrarInfo.district')}
          options={[
            { value: '', label: formData.registrarInfo?.region ? 'Select District...' : 'Select Region First' },
            ...availableDistricts
          ]}
          disabled={!formData.registrarInfo?.region}
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
                    className="w-full sm:w-auto"
                  >
                    {mode === 'create' 
                      ? 'Generate' 
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('certificate.preview')}
              </h2>
            </div>
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
                  // Expanded dimensions for better preview visibility
                  width: '100%',
                  maxWidth: '900px', // Increased from 800px
                  height: '700px', // Increased from 600px
                  minHeight: '700px'
                }}
              >
                <div className="w-full h-full overflow-hidden">
                  {showPreview && previewRegistration ? (
                    <div className="transform scale-[0.5] origin-top-left w-[200%] h-[200%]">
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