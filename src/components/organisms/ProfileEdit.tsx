import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage } from '../../services/firebase';
import { updateUserProfile, updateUserPreferences } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { type RootState, type AppDispatch } from '../../store';
import { Button, Select } from '../atoms';
import { FormField } from '../molecules';
import { GHANA_REGIONS, type UserProfile, type Language } from '../../types';
import { Camera, Upload, X, Save, User } from 'lucide-react';

interface ProfileEditProps {
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ onSave, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, firebaseUser, isLoading } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || 'User',
    phoneNumber: user?.profile.phoneNumber || '0243999631',
    region: user?.profile.region || user?.profile.location?.region || 'Eastern',
    district: user?.profile.district || user?.profile.location?.district || 'Fanteakwa',
    profilePicture: user?.profile.profilePicture || '',
    bio: user?.profile.bio || '',
    dateOfBirth: user?.profile.dateOfBirth,
    nationalId: user?.profile.nationalId || '',
    occupation: user?.profile.occupation || '',
    department: user?.profile.department || '',
    organization: user?.profile.organization || ''
  });
  
  const [preferences, setPreferences] = useState({
    language: user?.preferences.language || 'en' as Language,
    notifications: user?.preferences.notifications || true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(true);

  const formatDateForInput = (date: Date | string | { toDate?: () => Date } | undefined): string => {
    if (!date) return '';
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      // Firebase Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.required', { field: t('profile.firstName') });
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.required', { field: t('profile.lastName') });
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('validation.required', { field: t('profile.phoneNumber') });
    } else {
      // More flexible phone validation - just check it's not empty and has numbers
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length < 9) {
        newErrors.phoneNumber = t('validation.invalidPhoneNumber');
      }
    }

    if (formData.nationalId && formData.nationalId.trim()) {
      // More flexible National ID validation - just check basic format
      if (formData.nationalId.length < 5) {
        newErrors.nationalId = t('validation.invalidNationalId');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle date fields specially
    if (name === 'dateOfBirth') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? new Date(value) : undefined 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Mark form as changed
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferenceChange = (name: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: t('validation.invalidFileType') }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: t('validation.fileTooLarge') }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) return;

    setUploadingImage(true);
    setErrors(prev => ({ ...prev, profilePicture: '' }));

    try {
      // In development mode, use a mock URL
      if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload delay
        const mockUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, profilePicture: mockUrl }));
        setImagePreview(null);
        setHasChanges(true);
        console.warn('🚧 Development mode: Using mock profile picture upload');
        return;
      }

      // Production Firebase Storage upload
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, profilePicture: downloadURL }));
      setImagePreview(null);
      setHasChanges(true);
      
      // Update Firebase Auth profile
      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          photoURL: downloadURL
        });
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      setErrors(prev => ({ 
        ...prev, 
        profilePicture: t('profile.uploadError') 
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 Profile save started...', { formData, preferences });
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, proceeding with save...');
    try {
      // Prepare profile data
      const profileUpdates = {
        ...formData,
        location: formData.region && formData.district ? {
          region: formData.region,
          district: formData.district
        } : undefined
      };

      // Remove undefined values to avoid overwriting with undefined
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof typeof profileUpdates] === undefined) {
          delete profileUpdates[key as keyof typeof profileUpdates];
        }
      });

      // Update profile
      console.log('📝 Updating profile with data:', profileUpdates);
      await dispatch(updateUserProfile(profileUpdates)).unwrap();
      console.log('✅ Profile updated successfully');

      // Update preferences
      console.log('🔧 Updating preferences:', preferences);
      await dispatch(updateUserPreferences(preferences)).unwrap();
      console.log('✅ Preferences updated successfully');

      // Clear any previous errors
      setErrors({});

      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: t('profile.updateSuccess')
      }));

      console.log('🎉 Profile save completed successfully!');
      onSave();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: t('profile.updateError') 
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.profilePicture')}</h3>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            {uploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2"
            >
              {uploadingImage ? (
                <>
                  <Upload className="w-4 h-4 animate-pulse" />
                  {t('profile.uploading')}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  {t('profile.changePhoto')}
                </>
              )}
            </Button>
            
            {formData.profilePicture && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              {t('profile.photoHint')}
            </p>
          </div>
        </div>
        
        {errors.profilePicture && (
          <p className="text-red-600 text-sm mt-2">{errors.profilePicture}</p>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.personalInformation')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t('profile.firstName')}
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            required
          />
          
          <FormField
            label={t('profile.lastName')}
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            required
          />
          
          <FormField
            label={t('profile.phoneNumber')}
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
            required
          />
          
          <FormField
            label={t('profile.nationalId')}
            name="nationalId"
            value={formData.nationalId}
            onChange={handleInputChange}
            error={errors.nationalId}
            placeholder="GHA-123456789-1"
          />
          
          <FormField
            label={t('profile.dateOfBirth')}
            name="dateOfBirth"
            type="date"
            value={formatDateForInput(formData.dateOfBirth)}
            onChange={handleInputChange}
          />
          
          <FormField
            label={t('profile.occupation')}
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.bio')}
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('profile.bioPlaceholder')}
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.locationInformation')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.region')}
            </label>
            <Select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              options={[
                { value: '', label: t('common.selectRegion') },
                ...GHANA_REGIONS.map(region => ({ value: region, label: region }))
              ]}
            />
          </div>
          
          <FormField
            label={t('profile.district')}
            name="district"
            value={formData.district}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.professionalInformation')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t('profile.department')}
            name="department"
            value={formData.department}
            onChange={handleInputChange}
          />
          
          <FormField
            label={t('profile.organization')}
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.preferences')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.language')}
            </label>
            <Select
              name="language"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              options={[
                { value: 'en', label: t('languages.en') },
                { value: 'tw', label: t('languages.tw') },
                { value: 'ga', label: t('languages.ga') },
                { value: 'ee', label: t('languages.ee') }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.notifications')}
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">
                {t('profile.enableNotifications')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-lg">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        
        {/* Debug button - temporary */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            console.log('🐛 Debug state:', { 
              formData, 
              preferences, 
              errors, 
              hasChanges, 
              isLoading, 
              uploadingImage 
            });
          }}
        >
          Debug
        </Button>
        
        
        <Button
          type="submit"
          disabled={isLoading || uploadingImage || !hasChanges}
          className="flex items-center gap-2"
          onClick={() => console.log('💾 Save button clicked!', { isLoading, uploadingImage, hasChanges })}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('profile.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('profile.saveChanges')}
            </>
          )}
        </Button>
      </div>
      
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}
    </form>
  );
};