import { forwardRef } from 'react';
import type { BirthRegistration } from '../../types';
import ghanaCoatOfArms from '../../assets/Coat_of_arms_of_Ghana.svg.webp';

interface BirthCertificateProps {
  registration: BirthRegistration;
  serialNumber?: string;
}

export const BirthCertificate = forwardRef<HTMLDivElement, BirthCertificateProps>(
  ({ registration, serialNumber }, ref) => {

    const getDayOfYear = (date: Date | string | { toDate?: () => Date }) => {
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date();
      }
      return dateObj.getDate();
    };

    const getMonthName = (date: Date | string | { toDate?: () => Date }) => {
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date();
      }
      return dateObj.toLocaleDateString('en-GB', { month: 'long' });
    };

    const getYear = (date: Date | string | { toDate?: () => Date }) => {
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date();
      }
      return dateObj.getFullYear();
    };

    return (
      <div 
        ref={ref}
        className="bg-white relative w-full max-w-4xl mx-auto print:w-full print:max-w-none"
        style={{ 
          fontFamily: 'Times New Roman, Times, serif',
          fontSize: '12pt',
          lineHeight: '1.5',
          padding: '15mm',
          boxSizing: 'border-box',
          minHeight: '297mm',
          border: '3px solid black',
          borderRadius: '0'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4" style={{ fontSize: '9pt', fontWeight: 'bold', letterSpacing: '2px' }}>
          STRICTLY FOR CHILDREN 0 — 12 MONTHS
        </div>

        {/* Certificate Number - Top Right */}
        <div className="absolute top-4 right-6" style={{ fontSize: '14pt', fontWeight: 'bold' }}>
          N° {serialNumber || registration.registrationNumber}
        </div>

        {/* Ghana Coat of Arms */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <img 
              src={ghanaCoatOfArms} 
              alt="Ghana Coat of Arms"
              style={{ width: '60px', height: '60px' }}
            />
          </div>
          
          {/* Titles */}
          <div style={{ fontSize: '13pt', fontWeight: 'bold', margin: '8px 0' }}>
            REPUBLIC OF GHANA
          </div>
          
          <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '3px', margin: '8px 0' }}>
            BIRTH CERTIFICATE
          </div>
          
          <div style={{ fontSize: '9pt', margin: '5px 0' }}>
            (Section 11 Act 301)
          </div>
        </div>

        {/* Main Statement */}
        <div className="text-center mb-6" style={{ fontSize: '14pt', fontWeight: 'bold' }}>
          This is to Certify that the Birth
        </div>

        {/* Form Fields with dotted lines - optimized spacing */}
        <div className="space-y-4">
          
          {/* Child Name */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          {/* Place of Birth */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>born at</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.childDetails.placeOfBirth}
            </span>
          </div>

          {/* Date of Birth */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>on the</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '50px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getDayOfYear(registration.childDetails.dateOfBirth)}
            </span>
            <span>day of</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '120px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getMonthName(registration.childDetails.dateOfBirth)}
            </span>
            <span>20</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '50px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}
            </span>
          </div>

          {/* Registration Region and District */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>has been duly registered in the register of Births for</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.registrarInfo?.region}
            </span>
            <span>, in the</span>
          </div>

          {/* District Registration Line */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span 
              className="border-b border-dotted border-black flex-1 mr-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.registrarInfo?.district}
            </span>
            <span>Registration District.</span>
          </div>

          {/* Child Name Again */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>The said</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          {/* Mother Details */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>is the {registration.childDetails.gender.toLowerCase()} child of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.motherDetails.firstName} {registration.motherDetails.lastName}
            </span>
          </div>

          {/* Empty Line */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span 
              className="border-b border-dotted border-black w-full text-center"
              style={{ minHeight: '22px', paddingBottom: '3px' }}
            >
            </span>
          </div>

          {/* Mother Nationality */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>a National of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.motherDetails.nationality || 'Ghana'}
            </span>
          </div>

          {/* Father Details */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>and</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.fatherDetails.firstName} {registration.fatherDetails.lastName}
            </span>
          </div>

          {/* Father Nationality */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>a National of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', fontSize: '12pt' }}
            >
              {registration.fatherDetails.nationality || 'Ghana'}
            </span>
          </div>

          {/* Witness Line */}
          <div className="flex items-baseline" style={{ margin: '14px 0' }}>
            <span>witness my hand this</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '50px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getDayOfYear(registration.registrarInfo?.registrationDate || new Date())}
            </span>
            <span>day of</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '120px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getMonthName(registration.registrarInfo?.registrationDate || new Date())}
            </span>
            <span>20</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '50px', display: 'inline-block', fontSize: '12pt' }}
            >
              {getYear(registration.registrarInfo?.registrationDate || new Date()).toString().slice(-2)}
            </span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-16">
          <div className="flex items-baseline">
            <span>Entry No.</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '22px', paddingBottom: '3px', width: '150px', display: 'inline-block', fontSize: '12pt' }}
            >
              {registration.registrationNumber}
            </span>
          </div>
          
          <div className="text-center">
            <div 
              className="border-b-2 border-black mb-2"
              style={{ width: '200px', height: '35px' }}
            ></div>
            <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>Registrar</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between mt-6" style={{ fontSize: '9pt' }}>
          <div>BHP Counterfeit</div>
          <div>Birth Certificate Form R</div>
        </div>
      </div>
    );
  }
);

BirthCertificate.displayName = 'BirthCertificate';