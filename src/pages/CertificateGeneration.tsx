import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { BirthCertificate } from '../components/organisms';
import { Button } from '../components/atoms';
import { addNotification } from '../store/slices/uiSlice';
import { certificateService } from '../services/certificateService';
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
      // Generate certificate using the service
      const certificateData = await certificateService.generateOfficialCertificate(registration, {
        template: 'official',
        language: 'en',
        digitallySigned: true,
        includeQRCode: true
      });

      // Download the certificate
      certificateService.downloadCertificate(
        certificateData,
        `birth_certificate_${registration.childDetails.firstName}_${registration.childDetails.lastName}.pdf`
      );

      dispatch(addNotification({
        type: 'success',
        message: t('certificate.downloadSuccess')
      }));

    } catch (error) {
      console.error('Certificate download failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: t('certificate.downloadError')
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/registrations')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('certificate.pageTitle')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? t('certificate.hidePreview') : t('certificate.showPreview')}
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleShareCertificate}
              >
                <Share className="w-4 h-4 mr-2" />
                {t('certificate.share')}
              </Button>
              
              <Button
                variant="secondary"
                onClick={handlePrintCertificate}
              >
                <Printer className="w-4 h-4 mr-2" />
                {t('certificate.print')}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2"
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Registration Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('certificate.registrationSummary')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('registration.childName')}
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {registration.childDetails.firstName} {registration.childDetails.lastName}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('registration.registrationNumber')}
              </label>
              <p className="text-lg font-semibold text-blue-600">
                {registration.registrationNumber}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('certificate.serialNumber')}
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-green-600">{serialNumber}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateNewCertificate}
                  className="text-xs"
                >
                  {t('certificate.regenerate')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('certificate.preview')}
              </h2>
              
              <div className="text-sm text-gray-500">
                {t('certificate.previewNote')}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div 
                id="birth-certificate" 
                ref={certificateRef}
                className="transform scale-75 origin-top"
                style={{ width: '210mm', transformOrigin: 'top center' }}
              >
                <BirthCertificate 
                  registration={registration} 
                  serialNumber={serialNumber}
                />
              </div>
            </div>
            
            {/* Actions below certificate */}
            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t">
              <Button
                variant="secondary"
                onClick={handlePrintCertificate}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {t('certificate.print')}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2"
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
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('certificate.nextSteps')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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