import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { BirthRegistrationForm } from "../components/organisms/BirthRegistrationForm";
import { useRegistrationById, useDocumentTitle } from "../hooks";

export const NewRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Determine if this is edit mode based on route parameter
  const isEditMode = !!id;
  const { registration, isLoading, error } = useRegistrationById(isEditMode ? id : undefined);
  
  // Set page title based on mode
  useDocumentTitle(isEditMode ? "Edit Registration" : "New Registration");

  const handleCancel = () => {
    navigate("/registrations");
  };

  // Show loading state while fetching registration data for edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading registration data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if registration couldn't be loaded
  if (isEditMode && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600">⚠</span>
            </div>
            <p className="text-red-600 font-medium">Error loading registration</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode 
              ? t("registration.editRegistration", "Edit Registration")
              : t("registration.newRegistration")}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode 
              ? "Update the birth registration details below"
              : "Fill in the birth registration details below"}
          </p>
        </div>
      </div>

      <BirthRegistrationForm 
        mode={isEditMode ? "edit" : "create"} 
        initialData={registration || undefined}
        onCancel={handleCancel} 
      />
    </div>
  );
};
