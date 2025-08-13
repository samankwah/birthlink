import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '../store';
import { Button } from '../components/atoms';
import { ProfileEdit } from '../components/organisms';
import { Camera, Edit, User, Phone, MapPin, Briefcase, Calendar, IdCard } from 'lucide-react';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [, setShowProfilePictureUpload] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.notLoggedIn')}</h2>
          <p className="text-gray-600">{t('profile.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | { toDate?: () => Date } | undefined) => {
    if (!date) return t('profile.notProvided');
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      // Firebase Timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return t('profile.notProvided');
    }
    
    return dateObj.toLocaleDateString();
  };

  const getUserRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      registrar: 'bg-blue-100 text-blue-800',
      viewer: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {t(`profile.roles.${role}`)}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <Button
            variant="secondary"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? t('profile.cancelEdit') : t('profile.editProfile')}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <ProfileEdit onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profile.profilePicture ? (
                    <img 
                      src={user.profile.profilePicture} 
                      alt={t('profile.profilePicture')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => setShowProfilePictureUpload(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                  title={t('profile.changeProfilePicture')}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {user.profile.firstName} {user.profile.lastName}
              </h2>
              
              <p className="text-gray-600 mb-3">{user.email}</p>
              
              <div className="mb-4">
                {getUserRoleBadge(user.role)}
              </div>
              
              <div className="text-left space-y-2 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{t('profile.memberSince')}: {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{t('profile.status')}: {t(`profile.statuses.${user.status}`)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.personalInformation')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.firstName')}
                  </label>
                  <p className="text-gray-900">{user.profile.firstName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.lastName')}
                  </label>
                  <p className="text-gray-900">{user.profile.lastName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.email')}
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {t('profile.phoneNumber')}
                  </label>
                  <p className="text-gray-900">{user.profile.phoneNumber}</p>
                </div>
                
                {user.profile.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('profile.dateOfBirth')}
                    </label>
                    <p className="text-gray-900">{formatDate(user.profile.dateOfBirth)}</p>
                  </div>
                )}
                
                {user.profile.nationalId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <IdCard className="w-4 h-4" />
                      {t('profile.nationalId')}
                    </label>
                    <p className="text-gray-900">{user.profile.nationalId}</p>
                  </div>
                )}
              </div>
              
              {user.profile.bio && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.bio')}
                  </label>
                  <p className="text-gray-900">{user.profile.bio}</p>
                </div>
              )}
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t('profile.locationInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.region')}
                  </label>
                  <p className="text-gray-900">
                    {user.profile.location?.region || user.profile.region || t('profile.notProvided')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.district')}
                  </label>
                  <p className="text-gray-900">
                    {user.profile.location?.district || user.profile.district || t('profile.notProvided')}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {t('profile.professionalInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.role')}
                  </label>
                  <div>{getUserRoleBadge(user.role)}</div>
                </div>
                
                {user.profile.occupation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.occupation')}
                    </label>
                    <p className="text-gray-900">{user.profile.occupation}</p>
                  </div>
                )}
                
                {user.profile.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.department')}
                    </label>
                    <p className="text-gray-900">{user.profile.department}</p>
                  </div>
                )}
                
                {user.profile.organization && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.organization')}
                    </label>
                    <p className="text-gray-900">{user.profile.organization}</p>
                  </div>
                )}
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
                  <p className="text-gray-900">{t(`languages.${user.preferences.language}`)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.notifications')}
                  </label>
                  <p className="text-gray-900">
                    {user.preferences.notifications ? t('common.enabled') : t('common.disabled')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};