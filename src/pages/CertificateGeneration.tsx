import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { BirthCertificate } from '../components/organisms';
import { Button } from '../components/atoms';
import { addNotification } from '../store/slices/uiSlice';
// import { certificateService } from '../services/certificateService';
import type { BirthRegistration } from '../types';
import type { AppDispatch } from '../store';
import { Download, Printer, Eye, ArrowLeft, Share } from 'lucide-react';

export const CertificateGeneration: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [registration, setRegistration] = useState<BirthRegistration | null>(null);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    // Get registration data from navigation state or localStorage
    const registrationData = location.state?.registration || 
                           JSON.parse(localStorage.getItem('lastRegistration') || 'null');
    
    if (registrationData) {
      setRegistration(registrationData);
      setSerialNumber(generateSerialNumber());
    } else {
      // No registration data, redirect to new registration
      dispatch(addNotification({
        type: 'error',
        message: t('certificate.noRegistrationData')
      }));
      navigate('/registrations/new');
    }
    
    setIsLoading(false);
  }, [location.state, dispatch, navigate, t]);

  const generateSerialNumber = (): string => {
    const prefix = 'GH';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${random}`;
  };

  // Ghana Coat of Arms as base64 - ensures it displays in PDFs
  const ghanaCoatOfArmsBase64 = "data:image/png;base64,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";

  const generateCertificateHTML = (registration: BirthRegistration, serialNumber: string): string => {
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

    return `
      <div class="certificate-container">
        <div class="header-text">STRICTLY FOR CHILDREN 0 — 12 MONTHS</div>
        
        <div class="cert-number">No. ${serialNumber}</div>
        
        <div class="coat-of-arms">
          <div class="coat-of-arms-image">
            <img src="${ghanaCoatOfArmsBase64}" alt="Ghana Coat of Arms" width="45" height="45" style="display: block; margin: 0 auto;" />
          </div>
        </div>
        
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
          <span class="dotted-line short-line">${getDayOfYear(registration.childDetails.dateOfBirth)}</span>
          <span>day of</span>
          <span class="dotted-line medium-line">${getMonthName(registration.childDetails.dateOfBirth)}</span>
          <span>20</span>
          <span class="dotted-line short-line">${getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}</span>
        </div>
        
        <div class="form-line">
          <span>has been duly registered in the register of Births for</span>
          <span class="dotted-line">${registration.registrarInfo?.region || 'Greater Accra'}</span>
          <span>, in the</span>
        </div>
        
        <div class="form-line">
          <span class="dotted-line">${registration.registrarInfo?.district || 'Accra Metropolitan'}</span>
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
          <span class="dotted-line short-line">${getDayOfYear(registration.registrarInfo?.registrationDate || new Date())}</span>
          <span>day of</span>
          <span class="dotted-line medium-line">${getMonthName(registration.registrarInfo?.registrationDate || new Date())}</span>
          <span>20</span>
          <span class="dotted-line short-line">${getYear(registration.registrarInfo?.registrationDate || new Date()).toString().slice(-2)}</span>
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
    `;
  };

  const handlePrintCertificate = () => {
    if (!certificateRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      dispatch(addNotification({
        type: 'error',
        message: t('certificate.printBlockedError')
      }));
      return;
    }

    const certificateHTML = certificateRef.current.innerHTML;
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('certificate.title')} - ${registration?.childDetails.firstName} ${registration?.childDetails.lastName}</title>
          <style>
            @page { 
              size: A4; 
              margin: 0.5cm; 
            }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              margin: 0; 
              padding: 0; 
              background: white; 
              color: black; 
              line-height: 1.2; 
            }
            .certificate-container { 
              width: 100%; 
              max-width: none; 
              padding: 20px; 
              box-sizing: border-box; 
            }
            * { 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            @media print { 
              body { -webkit-print-color-adjust: exact; } 
              .no-print { display: none !important; } 
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">${certificateHTML}</div>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        
        dispatch(addNotification({
          type: 'success',
          message: t('certificate.printSuccess')
        }));
      }, 500);
    };
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !registration) return;

    setIsGenerating(true);
    
    try {
      // Create printable version matching the birth certificate design
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        dispatch(addNotification({
          type: 'error',
          message: 'Please allow pop-ups to download the certificate'
        }));
        setIsGenerating(false);
        return;
      }

      // Generate certificate HTML that matches the BirthCertificate component design
      const certificateHTML = generateCertificateHTML(registration, serialNumber);
      
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Birth Certificate - ${registration.childDetails.firstName} ${registration.childDetails.lastName}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
              }
              
              body {
                font-family: 'Times New Roman', Times, serif;
                font-size: 11pt;
                line-height: 1.4;
                margin: 0;
                padding: 0;
                color: black;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .certificate-container {
                width: 100%;
                border: 3px solid black;
                padding: 15mm;
                position: relative;
                height: 267mm;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
              }
              
              .header-text {
                text-align: center;
                font-size: 8pt;
                font-weight: bold;
                letter-spacing: 1px;
                margin-bottom: 8px;
              }
              
              .cert-number {
                position: absolute;
                top: 10px;
                right: 15px;
                font-weight: bold;
                font-size: 12pt;
              }
              
              .coat-of-arms {
                text-align: center;
                margin: 8px 0;
              }
              
              .coat-of-arms-image {
                display: flex;
                justify-content: center;
                align-items: center;
              }
              
              .coat-of-arms svg {
                width: 45px;
                height: 45px;
              }
              
              .title-section {
                text-align: center;
                margin: 15px 0 20px 0;
              }
              
              .republic-title {
                font-size: 12pt;
                font-weight: bold;
                margin: 5px 0;
              }
              
              .birth-cert-title {
                font-size: 16pt;
                font-weight: bold;
                letter-spacing: 3px;
                margin: 5px 0;
              }
              
              .act-reference {
                font-size: 9pt;
                margin: 5px 0;
              }
              
              .main-statement {
                text-align: center;
                font-size: 13pt;
                font-weight: bold;
                margin: 15px 0;
              }
              
              .form-line {
                margin: 12px 0;
                display: flex;
                align-items: baseline;
              }
              
              .dotted-line {
                border-bottom: 1px dotted black;
                flex: 1;
                margin: 0 4px;
                min-height: 16px;
                text-align: center;
                padding-bottom: 2px;
                font-weight: bold;
              }
              
              .short-line {
                width: 50px;
                display: inline-block;
              }
              
              .medium-line {
                width: 120px;
                display: inline-block;
              }
              
              .footer-section {
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                align-items: end;
                margin-bottom: 15px;
              }
              
              .signature-line {
                width: 150px;
                border-bottom: 2px solid black;
                margin: 15px 0 3px 0;
                height: 25px;
              }
              
              .registrar-text {
                text-align: center;
                font-style: italic;
                font-size: 9pt;
              }
              
              .footer-info {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 8pt;
              }
              
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              
              @media print { 
                body { -webkit-print-color-adjust: exact; } 
                .no-print { display: none !important; } 
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${certificateHTML}
          </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();

      dispatch(addNotification({
        type: 'success',
        message: 'Certificate download initiated. Please check your downloads.'
      }));

    } catch (error) {
      console.error('Certificate download failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to download certificate. Please try again.'
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareCertificate = async () => {
    if (!registration) return;

    const shareData = {
      title: `${t('certificate.title')} - ${registration.childDetails.firstName} ${registration.childDetails.lastName}`,
      text: `${t('certificate.shareText')} ${registration.registrationNumber}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        dispatch(addNotification({
          type: 'success',
          message: t('certificate.shareSuccess')
        }));
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        dispatch(addNotification({
          type: 'success',
          message: t('certificate.linkCopied')
        }));
      }
    } catch (error) {
      console.error('Share failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: t('certificate.shareError')
      }));
    }
  };

  const handleGenerateNewCertificate = () => {
    setSerialNumber(generateSerialNumber());
    dispatch(addNotification({
      type: 'success',
      message: t('certificate.regenerated')
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('certificate.loading')}</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('certificate.noDataTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('certificate.noDataMessage')}</p>
          <Button onClick={() => navigate('/registrations/new')}>
            {t('certificate.createNewRegistration')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 space-y-4 sm:space-y-0 sm:h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/registrations')}
                className="mr-4"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {t('certificate.pageTitle')}
              </h1>
            </div>
            
            {/* Mobile Action Buttons - Horizontal Scroll */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                size="sm"
                className="flex-shrink-0"
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {showPreview ? t('certificate.hidePreview') : t('certificate.showPreview')}
                </span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleShareCertificate}
                size="sm"
                className="flex-shrink-0"
              >
                <Share className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('certificate.share')}</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={handlePrintCertificate}
                size="sm"
                className="flex-shrink-0"
              >
                <Printer className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('certificate.print')}</span>
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                size="sm"
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">{t('certificate.generating')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('certificate.downloadPDF')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Registration Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('certificate.registrationSummary')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registration.childName')}
              </label>
              <p className="text-lg font-semibold text-gray-900 break-words">
                {registration.childDetails.firstName} {registration.childDetails.lastName}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('registration.registrationNumber')}
              </label>
              <p className="text-lg font-semibold text-blue-600 break-all">
                {registration.registrationNumber}
              </p>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('certificate.serialNumber')}
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <p className="text-lg font-semibold text-green-600 break-all">{serialNumber}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateNewCertificate}
                  className="text-xs self-start sm:self-auto"
                >
                  {t('certificate.regenerate')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('certificate.preview')}
              </h2>
              
              <div className="text-sm text-gray-500">
                {t('certificate.previewNote')}
              </div>
            </div>
            
            {/* Mobile-responsive certificate container */}
            <div className="w-full overflow-x-auto bg-gray-50 rounded-lg p-2 sm:p-4">
              <div className="flex justify-center">
                <div 
                  id="birth-certificate" 
                  ref={certificateRef}
                  className="w-full"
                  style={{ 
                    // Mobile-first responsive scaling
                    transform: window.innerWidth < 640 ? 'scale(0.65)' : window.innerWidth < 1024 ? 'scale(0.85)' : 'scale(1)',
                    transformOrigin: 'top center',
                    marginBottom: window.innerWidth < 640 ? '-35%' : window.innerWidth < 1024 ? '-15%' : '0',
                    maxWidth: '800px'
                  }}
                >
                  <BirthCertificate 
                    registration={registration} 
                    serialNumber={serialNumber}
                  />
                </div>
              </div>
            </div>
            
            {/* Actions below certificate */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <Button
                variant="secondary"
                onClick={handlePrintCertificate}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Printer className="w-4 h-4" />
                {t('certificate.print')}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('certificate.generating')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t('certificate.downloadPDF')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Additional Actions */}
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('certificate.nextSteps')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t('certificate.officialUse')}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t('certificate.officialUseDescription')}
              </p>
              <Button
                variant="secondary"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {t('certificate.downloadOfficial')}
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t('certificate.verification')}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t('certificate.verificationDescription')}
              </p>
              <Button
                variant="ghost"
                onClick={() => window.open(`https://verify.birthlink-ghana.gov.gh/${serialNumber}`, '_blank')}
                className="w-full sm:w-auto"
              >
                {t('certificate.verifyOnline')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};