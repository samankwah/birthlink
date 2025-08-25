import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { BirthCertificate } from '../components/organisms';
import { Button } from '../components/atoms';
import { addNotification } from '../store/slices/uiSlice';
import type { BirthRegistration } from '../types';
import type { AppDispatch } from '../store';
import { FaDownload as Download, FaPrint as Printer, FaEye as Eye, FaArrowLeft as ArrowLeft, FaShare as Share } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      // Create a temporary div with the BirthCertificate component for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempDiv.style.height = '1123px'; // A4 height in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.boxSizing = 'border-box';
      
      // Clone the certificate content
      const clonedCertificate = certificateRef.current.cloneNode(true) as HTMLElement;
      clonedCertificate.style.width = '100%';
      clonedCertificate.style.maxWidth = 'none';
      clonedCertificate.style.transform = 'scale(1)';
      clonedCertificate.style.transformOrigin = 'top left';
      
      tempDiv.appendChild(clonedCertificate);
      document.body.appendChild(tempDiv);

      // Wait for images to load
      const images = tempDiv.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 5000); // 5 second timeout
        });
      });

      await Promise.all(imagePromises);

      // Generate canvas with high quality
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // High quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
      });

      // Remove temp div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

      // Add additional pages if content is too tall
      if (heightLeft > pageHeight) {
        let position = pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pageHeight;
        }
      }

      // Save the PDF
      const fileName = `Birth_Certificate_${registration.childDetails.firstName}_${registration.childDetails.lastName}_${serialNumber}.pdf`;
      pdf.save(fileName);

      dispatch(addNotification({
        type: 'success',
        message: 'Certificate PDF downloaded successfully!'
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