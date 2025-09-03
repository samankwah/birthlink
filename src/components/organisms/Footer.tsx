import React from "react";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left side - Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* <p className="text-sm text-gray-600 max-w-md">
              {t('footer.description', 'Modernizing birth registration for all Ghanaian children')}
            </p> */}
          </div>

          {/* Right side - Copyright info */}
          <div className="flex flex-col items-center md:items-end text-end md:text-right">
            <div className="text-xs text-gray-500">
              © {currentYear}{" "}
              {t(
                "footer.copyright",
                "Government of Ghana. All rights reserved."
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
