import { forwardRef } from 'react';
import type { BirthRegistration } from '../../types';

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
        className="bg-white relative"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          fontFamily: 'Times, serif',
          fontSize: '11pt',
          lineHeight: '1.3',
          padding: '15mm',
          border: '2px solid black',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div style={{ fontSize: '8pt', letterSpacing: '1px', marginBottom: '8px' }}>
            STRICTLY FOR CHILDREN 0 — 12 MONTHS
          </div>
        </div>

        {/* Certificate Number - Top Right */}
        <div className="absolute top-4 right-6" style={{ fontSize: '12pt', fontWeight: 'bold' }}>
          No {serialNumber || registration.registrationNumber}
        </div>

        {/* Ghana Coat of Arms and Title */}
        <div className="text-center mb-6">
          {/* Coat of Arms Placeholder */}
          <div className="flex justify-center mb-3">
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '2px solid black', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8pt',
              fontWeight: 'bold'
            }}>
              GHANA<br/>COAT<br/>OF<br/>ARMS
            </div>
          </div>
          
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px' }}>
            REPUBLIC OF GHANA
          </div>
          
          <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '4px' }}>
            BIRTH CERTIFICATE
          </div>
          
          <div style={{ fontSize: '9pt', marginBottom: '16px' }}>
            (Section 11 Act 301)
          </div>
        </div>

        {/* Certificate Content */}
        <div style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          {/* Main Statement */}
          <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '20px' }}>
            This is to Certify that the Birth
          </div>

          {/* Form Fields with dotted lines */}
          <div style={{ marginBottom: '15px' }}>
            <span>of</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '400px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>born at</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '400px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.childDetails.placeOfBirth}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>on the </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '50px', 
              marginLeft: '8px',
              paddingBottom: '2px',
              textAlign: 'center'
            }}>
              {getDayOfYear(registration.childDetails.dateOfBirth)}
            </span>
            <span style={{ margin: '0 8px' }}>day of</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '150px', 
              marginRight: '8px',
              paddingBottom: '2px'
            }}>
              {getMonthName(registration.childDetails.dateOfBirth)}
            </span>
            <span>20</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '40px', 
              marginLeft: '4px',
              paddingBottom: '2px',
              textAlign: 'center'
            }}>
              {getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>has been duly registered in the register of Births for </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '200px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.registrarInfo.district}
            </span>
          </div>

          <div style={{ marginBottom: '15px', textAlign: 'right' }}>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '150px', 
              marginRight: '8px',
              paddingBottom: '2px'
            }}>
              {registration.registrarInfo.region}
            </span>
            <span> in the</span>
          </div>

          <div style={{ marginBottom: '15px', textAlign: 'right' }}>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '120px', 
              marginRight: '8px',
              paddingBottom: '2px'
            }}>
              
            </span>
            <span> Registration District</span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>The said </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '300px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.childDetails.firstName} {registration.childDetails.lastName}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>is the {registration.childDetails.gender.toLowerCase()}/female Child of </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '250px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.motherDetails.firstName} {registration.motherDetails.lastName}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '500px', 
              paddingBottom: '2px'
            }}>
              
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>a National of </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '200px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              Ghana
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>and </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '400px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              {registration.fatherDetails.firstName} {registration.fatherDetails.lastName}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span>a National of</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '200px', 
              marginLeft: '8px',
              paddingBottom: '2px'
            }}>
              Ghana
            </span>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <span>witness my hand this </span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '100px', 
              marginLeft: '8px',
              paddingBottom: '2px',
              textAlign: 'center'
            }}>
              {new Date().getDate()}
            </span>
            <span style={{ margin: '0 8px' }}> day of</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '120px', 
              marginRight: '8px',
              paddingBottom: '2px'
            }}>
              {new Date().toLocaleDateString('en-GB', { month: 'long' })}
            </span>
            <span> 20</span>
            <span style={{ 
              borderBottom: '1px dotted black', 
              display: 'inline-block', 
              minWidth: '40px', 
              marginLeft: '4px',
              paddingBottom: '2px',
              textAlign: 'center'
            }}>
              {new Date().getFullYear().toString().slice(-2)}
            </span>
          </div>

          {/* Signature Line */}
          <div style={{ textAlign: 'right', marginTop: '40px', marginBottom: '30px' }}>
            <div style={{ 
              borderBottom: '1px solid black', 
              width: '200px', 
              height: '30px', 
              display: 'inline-block',
              marginBottom: '5px'
            }}></div>
            <div style={{ fontSize: '9pt', textAlign: 'center', width: '200px', display: 'inline-block' }}>
              Registrar
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 w-full left-0 px-6">
          <div className="flex justify-between" style={{ fontSize: '9pt' }}>
            <div>
              <span>Entry No.</span>
              <span style={{ 
                borderBottom: '1px dotted black', 
                display: 'inline-block', 
                minWidth: '80px', 
                marginLeft: '8px',
                paddingBottom: '2px'
              }}>
                {registration.registrationNumber}
              </span>
            </div>
            <div className="text-right">
              <div>BHP Counterfeit</div>
              <div style={{ marginTop: '10px' }}>Birth Certificate Form R</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BirthCertificate.displayName = 'BirthCertificate';