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
        className="bg-white relative w-full max-w-4xl mx-auto border-4 border-black print:w-full print:max-w-none"
        style={{ 
          fontFamily: 'Times New Roman, Times, serif',
          fontSize: '12pt',
          lineHeight: '1.8',
          padding: '20mm',
          boxSizing: 'border-box',
          minHeight: '297mm'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4" style={{ fontSize: '9pt', fontWeight: 'bold', letterSpacing: '2px' }}>
          STRICTLY FOR CHILDREN 0 — 12 MONTHS
        </div>

        {/* Certificate Number - Top Right */}
        <div className="absolute top-4 right-6" style={{ fontSize: '14pt', fontWeight: 'bold' }}>
          No. {serialNumber || registration.registrationNumber}
        </div>

        {/* Ghana Coat of Arms */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <img 
              src={ghanaCoatOfArms} 
              alt="Ghana Coat of Arms"
              style={{ width: '50px', height: '50px' }}
            />
          </div>
          
          {/* Titles */}
          <div style={{ fontSize: '14pt', fontWeight: 'bold', margin: '10px 0' }}>
            REPUBLIC OF GHANA
          </div>
          
          <div style={{ fontSize: '20pt', fontWeight: 'bold', letterSpacing: '4px', margin: '10px 0' }}>
            BIRTH CERTIFICATE
          </div>
          
          <div style={{ fontSize: '10pt', margin: '5px 0' }}>
            (Section 11 Act 301)
          </div>
        </div>

        {/* Main Statement */}
        <div className="text-center mb-8" style={{ fontSize: '16pt', fontWeight: 'bold' }}>
          This is to Certify that the Birth
        </div>

        {/* Form Fields with dotted lines - optimized spacing */}
        <div className="space-y-3">
          
          {/* Child Name */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          {/* Place of Birth */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>born at</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.childDetails.placeOfBirth}
            </span>
          </div>

          {/* Date of Birth */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>on the</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '50px', display: 'inline-block' }}
            >
              {getDayOfYear(registration.childDetails.dateOfBirth)}
            </span>
            <span>day of</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '120px', display: 'inline-block' }}
            >
              {getMonthName(registration.childDetails.dateOfBirth)}
            </span>
            <span>20</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '50px', display: 'inline-block' }}
            >
              {getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}
            </span>
          </div>

          {/* Registration Region and District */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>has been duly registered in the register of Births for</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.registrarInfo?.region}
            </span>
            <span>, in the</span>
          </div>

          {/* District Registration Line */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span 
              className="border-b border-dotted border-black flex-1 mr-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.registrarInfo?.district}
            </span>
            <span>Registration District.</span>
          </div>

          {/* Child Name Again */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>The said</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          {/* Mother Details */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>is the {registration.childDetails.gender.toLowerCase()} child of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.motherDetails.firstName} {registration.motherDetails.lastName}
            </span>
          </div>

          {/* Empty Line */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span 
              className="border-b border-dotted border-black w-full text-center"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
            </span>
          </div>

          {/* Mother Nationality */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>a National of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.motherDetails.nationality || 'Ghana'}
            </span>
          </div>

          {/* Father Details */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>and</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.fatherDetails.firstName} {registration.fatherDetails.lastName}
            </span>
          </div>

          {/* Father Nationality */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>a National of</span>
            <span 
              className="border-b border-dotted border-black flex-1 mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px' }}
            >
              {registration.fatherDetails.nationality || 'Ghana'}
            </span>
          </div>

          {/* Witness Line */}
          <div className="flex items-baseline" style={{ margin: '12px 0' }}>
            <span>witness my hand this</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '50px', display: 'inline-block' }}
            >
              {getDayOfYear(registration.registrarInfo?.registrationDate || new Date())}
            </span>
            <span>day of</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '120px', display: 'inline-block' }}
            >
              {getMonthName(registration.registrarInfo?.registrationDate || new Date())}
            </span>
            <span>20</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '50px', display: 'inline-block' }}
            >
              {getYear(registration.registrarInfo?.registrationDate || new Date()).toString().slice(-2)}
            </span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-12">
          <div className="flex items-baseline">
            <span>Entry No.</span>
            <span 
              className="border-b border-dotted border-black mx-2 text-center font-bold"
              style={{ minHeight: '20px', paddingBottom: '2px', width: '150px', display: 'inline-block' }}
            >
              {registration.registrationNumber}
            </span>
          </div>
          
          <div className="text-center">
            <div 
              className="border-b-2 border-black mb-2"
              style={{ width: '200px', height: '30px' }}
            ></div>
            <div style={{ fontStyle: 'italic' }}>Registrar</div>
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