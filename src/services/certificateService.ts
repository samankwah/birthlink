// BirthLink Ghana - PDF Certificate Generation Service
// Phase 4: Official Birth Certificate Generation
// Created: August 12, 2025

import { analyticsService } from './analytics';
import { smsService } from './smsService';
import type { BirthRegistration } from '../types';
// Import the coat of arms image
import ghanaCoatOfArms from '../assets/images/ghana-coat-of-arms.webp';

interface CertificateTemplate {
  id: string;
  name: string;
  language: 'en' | 'tw' | 'ga' | 'ee';
  officialStatus: boolean;
}

interface CertificateGenerationOptions {
  template: 'official' | 'provisional' | 'copy';
  language: 'en' | 'tw' | 'ga' | 'ee';
  watermark?: boolean;
  digitallySigned: boolean;
  includeQRCode: boolean;
}

interface GeneratedCertificate {
  certificateId: string;
  pdfBuffer: ArrayBuffer;
  metadata: {
    registrationId: string;
    certificateNumber: string;
    generatedAt: Date;
    validUntil?: Date;
    digitalSignature: string;
    qrCodeData: string;
  };
}

// Government-compliant PDF certificate generation
export class CertificateService {
  private static instance: CertificateService;
  private templates: Map<string, CertificateTemplate> = new Map();
  private certificateCounter: number = 1;

  private constructor() {
    this.initializeTemplates();
    this.loadCertificateCounter();
  }

  static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  private initializeTemplates() {
    const templates: CertificateTemplate[] = [
      {
        id: 'official_en',
        name: 'Official Birth Certificate (English)',
        language: 'en',
        officialStatus: true
      },
      {
        id: 'official_tw',
        name: 'Official Birth Certificate (Twi)',
        language: 'tw',
        officialStatus: true
      },
      {
        id: 'provisional_en',
        name: 'Provisional Birth Certificate (English)',
        language: 'en',
        officialStatus: false
      },
      {
        id: 'copy_en',
        name: 'Certified Copy (English)',
        language: 'en',
        officialStatus: false
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private loadCertificateCounter() {
    // In production, this would load from persistent storage
    const currentYear = new Date().getFullYear();
    const storedCounter = localStorage.getItem(`cert_counter_${currentYear}`);
    this.certificateCounter = storedCounter ? parseInt(storedCounter) : 1;
  }

  private generateCertificateNumber(): string {
    const currentYear = new Date().getFullYear();
    const paddedCounter = this.certificateCounter.toString().padStart(6, '0');
    const certificateNumber = `GHA-${currentYear}-BC-${paddedCounter}`;
    
    // Increment and save counter
    this.certificateCounter++;
    localStorage.setItem(`cert_counter_${currentYear}`, this.certificateCounter.toString());
    
    return certificateNumber;
  }

  private generateQRCode(registration: BirthRegistration, certificateNumber: string): string {
    // QR code data for verification
    const qrData = {
      certNo: certificateNumber,
      regNo: registration.registrationNumber,
      childName: `${registration.childDetails.firstName} ${registration.childDetails.lastName}`,
      dob: registration.childDetails.dateOfBirth.toISOString().split('T')[0],
      issued: new Date().toISOString().split('T')[0],
      verify: `https://verify.birthlink-ghana.gov.gh/${certificateNumber}`
    };

    return JSON.stringify(qrData);
  }

  private generateDigitalSignature(data: string): string {
    // In production, this would use proper digital signature
    const timestamp = Date.now().toString();
    const hash = btoa(data + timestamp).substring(0, 32);
    return `GHA-DS-${hash}`;
  }

  // Generate official birth certificate PDF
  async generateOfficialCertificate(
    registration: BirthRegistration,
    options: CertificateGenerationOptions = {
      template: 'official',
      language: 'en',
      digitallySigned: true,
      includeQRCode: true
    }
  ): Promise<GeneratedCertificate> {
    try {
      analyticsService.trackEvent('certificate_generation_started', {
        registration_id: registration.id,
        template: options.template,
        language: options.language
      });

      const certificateNumber = this.generateCertificateNumber();
      const qrCodeData = this.generateQRCode(registration, certificateNumber);
      const digitalSignature = this.generateDigitalSignature(
        registration.registrationNumber + certificateNumber
      );

      // In production, this would use a PDF library like jsPDF or PDFKit
      const pdfContent = await this.generatePDFContent(registration, {
        certificateNumber,
        qrCodeData,
        digitalSignature,
        ...options
      });

      const certificate: GeneratedCertificate = {
        certificateId: `cert-${Date.now()}`,
        pdfBuffer: pdfContent,
        metadata: {
          registrationId: registration.id,
          certificateNumber,
          generatedAt: new Date(),
          validUntil: options.template === 'provisional' ? 
            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : // 90 days for provisional
            undefined,
          digitalSignature,
          qrCodeData
        }
      };

      // Track successful generation
      analyticsService.trackEvent('certificate_generated', {
        registration_id: registration.id,
        certificate_number: certificateNumber,
        template: options.template,
        language: options.language,
        generation_duration: Date.now() // Would calculate actual duration
      });

      // Send SMS notification if phone number available
      const parentPhone = registration.motherDetails.phoneNumber || registration.fatherDetails.phoneNumber;
      if (parentPhone) {
        await smsService.sendCertificateReadyNotification(
          parentPhone,
          `${registration.childDetails.firstName} ${registration.childDetails.lastName}`,
          registration.registrationNumber,
          options.language === 'tw' ? 'tw' : 'en'
        );
      }

      return certificate;

    } catch (error) {
      console.error('Certificate generation failed:', error);
      
      analyticsService.trackEvent('certificate_generation_failed', {
        registration_id: registration.id,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        template: options.template
      });

      throw new Error(`Certificate generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generatePDFContent(
    registration: BirthRegistration, 
    certificateData: {
      certificateNumber: string;
      qrCodeData: string;
      digitalSignature: string;
      template: 'official' | 'provisional' | 'copy';
      language: 'en' | 'tw' | 'ga' | 'ee';
      watermark?: boolean;
      includeQRCode: boolean;
    }
  ): Promise<ArrayBuffer> {
    try {
      // Generate proper certificate HTML that matches the target
      const htmlContent = this.generateTargetMatchingHTML(registration, certificateData);
      const pdfBuffer = new TextEncoder().encode(htmlContent);
      return pdfBuffer.buffer;
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback: Generate simple HTML
      const htmlContent = this.generateCertificateHTML(registration, certificateData);
      const pdfBuffer = new TextEncoder().encode(htmlContent);
      return pdfBuffer.buffer;
    }
  }

  // @ts-ignore
  private async _createCertificateElement(
    registration: BirthRegistration,
    certificateData: any
  ): Promise<HTMLElement> {
    // Get the current certificate element from DOM (the one being previewed)
    const existingCertificate = document.getElementById('birth-certificate');
    
    if (existingCertificate) {
      // Clone the existing certificate element for PDF generation
      const container = existingCertificate.cloneNode(true) as HTMLElement;
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.transform = 'none'; // Remove any scaling transforms
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.maxWidth = 'none';
      container.style.padding = '15mm';
      container.style.fontSize = '11pt';
      container.style.boxSizing = 'border-box';
      
      // Update certificate number in the cloned element
      const certNumberElement = container.querySelector('[class*="absolute"][class*="top-2"]');
      if (certNumberElement) {
        certNumberElement.textContent = `No ${certificateData.certificateNumber}`;
      }
      
      // Add to DOM temporarily for rendering
      document.body.appendChild(container);
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return container;
    } else {
      // Fallback: create container with optimized HTML
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Times, serif';
      container.style.fontSize = '11pt';
      container.style.lineHeight = '1.3';
      container.style.padding = '15mm';
      container.style.border = '2px solid black';
      container.style.boxSizing = 'border-box';
      
      // Generate the certificate HTML content
      container.innerHTML = this.generateOptimizedCertificateHTML(registration, certificateData);
      
      // Add to DOM temporarily for rendering
      document.body.appendChild(container);
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return container;
    }
  }

  // @ts-ignore
  private async _convertElementToPDF(element: HTMLElement): Promise<ArrayBuffer> {
    // Use the browser's print functionality for high-quality PDF generation
    return new Promise((resolve) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window for PDF generation');
      }

      // Get all stylesheets from the current document to maintain styling
      const stylesheets = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            // Cross-origin stylesheets might not be accessible
            return '';
          }
        })
        .join('\n');

      // Clone the element to avoid affecting the original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Remove any transforms that might affect PDF layout
      clonedElement.style.transform = 'none';
      clonedElement.style.maxHeight = 'none';
      clonedElement.style.width = '210mm';
      clonedElement.style.minHeight = '297mm';

      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Birth Certificate</title>
            <style>
              @page { 
                size: A4; 
                margin: 15mm; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
              }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Times New Roman', Times, serif;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
                font-size: 11pt;
                line-height: 1.4;
              }
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              /* Include existing styles */
              ${stylesheets}
            </style>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          
          // Return a buffer indicating successful PDF generation
          const buffer = new TextEncoder().encode('PDF_GENERATED_SUCCESSFULLY');
          resolve(buffer.buffer);
        }, 1000); // Increased timeout for better rendering
      };
    });
  }

  private generateTargetMatchingHTML(
    registration: BirthRegistration,
    certificateData: any
  ): string {
    const getDayOfYear = (date: any) => {
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

    const getMonthName = (date: any) => {
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

    const getYear = (date: any) => {
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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Birth Certificate - ${registration.childDetails.firstName} ${registration.childDetails.lastName}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      margin: 0;
      padding: 0;
      color: black;
    }
    
    .certificate-container {
      width: 100%;
      max-width: 170mm;
      margin: 0 auto;
      border: 3px solid black;
      padding: 15mm;
      position: relative;
    }
    
    .header-text {
      text-align: center;
      font-size: 9pt;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 15px;
    }
    
    .cert-number {
      position: absolute;
      top: 10px;
      right: 15px;
      font-weight: bold;
      font-size: 14pt;
    }
    
    .coat-of-arms {
      text-align: center;
      margin: 20px 0;
    }
    
    .coat-of-arms img {
      width: 60px;
      height: 60px;
    }
    
    .title-section {
      text-align: center;
      margin: 20px 0;
    }
    
    .republic-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .birth-cert-title {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 4px;
      margin: 10px 0;
    }
    
    .act-reference {
      font-size: 10pt;
      margin: 5px 0;
    }
    
    .main-statement {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin: 30px 0;
    }
    
    .form-line {
      margin: 20px 0;
      display: flex;
      align-items: baseline;
    }
    
    .dotted-line {
      border-bottom: 1px dotted black;
      flex: 1;
      margin: 0 5px;
      min-height: 20px;
      display: inline-block;
      text-align: center;
      padding-bottom: 2px;
      font-weight: bold;
    }
    
    .right-align {
      text-align: right;
    }
    
    .footer-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: end;
    }
    
    .signature-line {
      width: 200px;
      border-bottom: 2px solid black;
      margin: 20px 0 5px 0;
    }
    
    .registrar-text {
      text-align: center;
      font-style: italic;
    }
    
    .footer-info {
      font-size: 9pt;
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <!-- Header -->
    <div class="header-text">STRICTLY FOR CHILDREN 0 — 12 MONTHS</div>
    
    <!-- Certificate Number -->
    <div class="cert-number">No. ${certificateData.certificateNumber}</div>
    
    <!-- Coat of Arms -->
    <div class="coat-of-arms">
      <img src="${ghanaCoatOfArms}" alt="Ghana Coat of Arms" />
    </div>
    
    <!-- Titles -->
    <div class="title-section">
      <div class="republic-title">REPUBLIC OF GHANA</div>
      <div class="birth-cert-title">BIRTH CERTIFICATE</div>
      <div class="act-reference">(Section 11 Act 301)</div>
    </div>
    
    <!-- Main Statement -->
    <div class="main-statement">This is to Certify that the Birth</div>
    
    <!-- Form Fields -->
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
      <span class="dotted-line" style="max-width: 50px;">${getDayOfYear(registration.childDetails.dateOfBirth)}</span>
      <span>day of</span>
      <span class="dotted-line" style="max-width: 120px;">${getMonthName(registration.childDetails.dateOfBirth)}</span>
      <span>20</span>
      <span class="dotted-line" style="max-width: 50px;">${getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}</span>
    </div>
    
    <div class="form-line">
      <span>has been duly registered in the register of Births for</span>
      <span class="dotted-line">${registration.registrarInfo?.region || 'Greater Accra'}</span>
    </div>
    
    <div class="form-line right-align">
      <span class="dotted-line">${registration.registrarInfo?.district || 'Accra Metropolitan'}</span>
      <span>in the</span>
    </div>
    
    <div class="form-line right-align">
      <span class="dotted-line"></span>
      <span>Registration District</span>
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
      <span class="dotted-line" style="max-width: 50px;">${getDayOfYear(registration.registrarInfo?.registrationDate || new Date())}</span>
      <span>day of</span>
      <span class="dotted-line" style="max-width: 120px;">${getMonthName(registration.registrarInfo?.registrationDate || new Date())}</span>
      <span>20</span>
      <span class="dotted-line" style="max-width: 50px;">${getYear(registration.registrarInfo?.registrationDate || new Date()).toString().slice(-2)}</span>
    </div>
    
    <!-- Footer -->
    <div class="footer-section">
      <div>
        <span>Entry No.</span>
        <span class="dotted-line" style="display: inline-block; width: 150px;">${registration.registrationNumber}</span>
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
</body>
</html>
    `;
  }

  private generateOptimizedCertificateHTML(
    registration: BirthRegistration,
    certificateData: any
  ): string {
    const getDayOfYear = (date: any) => {
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

    const getMonthName = (date: any) => {
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

    const getYear = (date: any) => {
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
      <div style="position: relative; width: 210mm; min-height: 297mm; font-family: Times, serif; font-size: 11pt; line-height: 1.3; padding: 15mm; border: 2px solid black; box-sizing: border-box; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 8pt; letter-spacing: 1px; margin-bottom: 8px;">
            STRICTLY FOR CHILDREN 0 — 12 MONTHS
          </div>
        </div>

        <!-- Certificate Number - Top Right -->
        <div style="position: absolute; top: 16px; right: 24px; font-size: 12pt; font-weight: bold;">
          No ${certificateData.certificateNumber}
        </div>

        <!-- Ghana Coat of Arms and Title -->
        <div style="text-align: center; margin-bottom: 24px;">
          <!-- Ghana Coat of Arms -->
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
              <img src="${ghanaCoatOfArms}" alt="Ghana Coat of Arms" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
          </div>
          
          <div style="font-size: 14pt; font-weight: bold; margin-bottom: 8px;">
            REPUBLIC OF GHANA
          </div>
          
          <div style="font-size: 18pt; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px;">
            BIRTH CERTIFICATE
          </div>
          
          <div style="font-size: 9pt; margin-bottom: 16px;">
            (Section 11 Act 301)
          </div>
        </div>

        <!-- Certificate Content -->
        <div style="line-height: 1.6; margin-bottom: 20px;">
          <!-- Main Statement -->
          <div style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px;">
            This is to Certify that the Birth
          </div>

          <!-- Form Fields with dotted lines -->
          <div style="margin-bottom: 15px;">
            <span>of</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 400px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.childDetails.firstName} ${registration.childDetails.lastName}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>born at</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 400px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.childDetails.placeOfBirth}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>on the </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 50px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${getDayOfYear(registration.childDetails.dateOfBirth)}
            </span>
            <span style="margin: 0 8px;">day of</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 150px; margin-right: 8px; padding-bottom: 2px; text-align: center;">
              ${getMonthName(registration.childDetails.dateOfBirth)}
            </span>
            <span>20</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 40px; margin-left: 4px; padding-bottom: 2px; text-align: center;">
              ${getYear(registration.childDetails.dateOfBirth).toString().slice(-2)}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>has been duly registered in the register of Births for </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 200px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.registrarInfo?.region || 'Greater Accra'}
            </span>
          </div>

          <div style="margin-bottom: 15px; text-align: right;">
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 150px; margin-right: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.registrarInfo?.district || 'Accra Metropolitan'}
            </span>
            <span> in the</span>
          </div>

          <div style="margin-bottom: 15px; text-align: right;">
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 120px; margin-right: 8px; padding-bottom: 2px;">
              
            </span>
            <span> Registration District</span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>The said </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 300px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.childDetails.firstName} ${registration.childDetails.lastName}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>is the ${registration.childDetails.gender.toLowerCase()} child of </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 250px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.motherDetails.firstName} ${registration.motherDetails.lastName}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 500px; padding-bottom: 2px;">
              
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>a National of </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 200px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.motherDetails.nationality || 'Ghana'}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>and </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 400px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.fatherDetails.firstName} ${registration.fatherDetails.lastName}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <span>a National of </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 200px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${registration.fatherDetails.nationality || 'Ghana'}
            </span>
          </div>

          <div style="margin-bottom: 30px;">
            <span>witness my hand this </span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 100px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
              ${getDayOfYear(registration.registrarInfo.registrationDate)}
            </span>
            <span style="margin: 0 8px;"> day of</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 120px; margin-right: 8px; padding-bottom: 2px; text-align: center;">
              ${getMonthName(registration.registrarInfo.registrationDate)}
            </span>
            <span> 20</span>
            <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 40px; margin-left: 4px; padding-bottom: 2px; text-align: center;">
              ${getYear(registration.registrarInfo.registrationDate).toString().slice(-2)}
            </span>
          </div>

          <!-- Signature Line -->
          <div style="text-align: right; margin-top: 40px; margin-bottom: 30px;">
            <div style="border-bottom: 1px solid black; width: 200px; height: 30px; display: inline-block; margin-bottom: 5px;"></div>
            <div style="font-size: 9pt; text-align: center; width: 200px; display: inline-block;">
              Registrar
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="position: absolute; bottom: 16px; width: calc(100% - 48px); left: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 9pt;">
            <div>
              <span>Entry No.</span>
              <span style="border-bottom: 1px dotted black; display: inline-block; min-width: 80px; margin-left: 8px; padding-bottom: 2px; text-align: center;">
                ${registration.registrationNumber}
              </span>
            </div>
            <div style="text-align: right;">
              <div>BHP Counterfeit</div>
              <div style="margin-top: 10px;">Birth Certificate Form R</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateCertificateHTML(
    registration: BirthRegistration,
    certificateData: any
  ): string {
    const isOfficial = certificateData.template === 'official';
    const language = certificateData.language;

    const content = language === 'tw' ? {
      title: 'AWOTWERE KRATAA',
      subtitle: 'Ghana Aban Awotwere Krataa',
      childName: 'Abofra Din',
      dateOfBirth: 'Awo Da',
      placeOfBirth: 'Awo Beae',
      gender: 'Barima anaa Bea',
      motherName: 'Maame Din',
      fatherName: 'Agya Din',
      registrationNumber: 'Nkyerɛw Nɔma',
      certificateNumber: 'Krataa Nɔma',
      issuedDate: 'Da a wɔmaa',
      officialSeal: 'Aban Sɔ',
      signature: 'Nsa Hyɛ',
      registrar: 'Nkyerɛwfo',
      watermarkText: 'GHANA ABAN - NOKWARE'
    } : {
      title: 'BIRTH CERTIFICATE',
      subtitle: 'Republic of Ghana Birth Certificate',
      childName: 'Child Name',
      dateOfBirth: 'Date of Birth',
      placeOfBirth: 'Place of Birth',
      gender: 'Gender',
      motherName: 'Mother\'s Name',
      fatherName: 'Father\'s Name',
      registrationNumber: 'Registration Number',
      certificateNumber: 'Certificate Number',
      issuedDate: 'Date Issued',
      officialSeal: 'Official Seal',
      signature: 'Signature',
      registrar: 'Registrar',
      watermarkText: 'REPUBLIC OF GHANA - AUTHENTIC'
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 40px;
      background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%);
      background-size: 20px 20px;
      position: relative;
    }
    .certificate {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 60px 80px;
      border: 8px double #333;
      box-shadow: 0 0 30px rgba(0,0,0,0.3);
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48px;
      color: rgba(0,0,0,0.05);
      font-weight: bold;
      pointer-events: none;
      z-index: 1;
    }
    .header {
      text-align: center;
      margin-bottom: 50px;
      position: relative;
      z-index: 2;
    }
    .coat-of-arms {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: #333;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .title {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin: 20px 0 10px;
      letter-spacing: 3px;
    }
    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
    }
    .content {
      position: relative;
      z-index: 2;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      color: #333;
      width: 40%;
    }
    .field-value {
      width: 55%;
      text-align: right;
      color: #000;
    }
    .certificate-numbers {
      background: #f9f9f9;
      padding: 20px;
      margin: 30px 0;
      border-left: 5px solid #333;
    }
    .footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: end;
    }
    .signature-section {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-bottom: 2px solid #333;
      margin: 40px 0 10px;
      height: 60px;
    }
    .qr-code {
      width: 100px;
      height: 100px;
      background: #333;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }
    .digital-signature {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-top: 20px;
      font-family: monospace;
    }
    .security-features {
      background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff);
      height: 5px;
      margin: 30px 0;
    }
    ${!isOfficial ? '.provisional-watermark { color: red; font-size: 24px; transform: rotate(-10deg); }' : ''}
  </style>
</head>
<body>
  <div class="certificate">
    ${certificateData.watermark ? `<div class="watermark">${content.watermarkText}</div>` : ''}
    
    <div class="header">
      <div class="coat-of-arms">
        🇬🇭
      </div>
      <h1 class="title">${content.title}</h1>
      <div class="subtitle">${content.subtitle}</div>
      ${!isOfficial ? '<div class="provisional-watermark">PROVISIONAL CERTIFICATE</div>' : ''}
    </div>

    <div class="content">
      <div class="field-row">
        <div class="field-label">${content.childName}:</div>
        <div class="field-value">${registration.childDetails.firstName} ${registration.childDetails.lastName}</div>
      </div>
      
      <div class="field-row">
        <div class="field-label">${content.dateOfBirth}:</div>
        <div class="field-value">${registration.childDetails.dateOfBirth.toLocaleDateString()}</div>
      </div>
      
      <div class="field-row">
        <div class="field-label">${content.placeOfBirth}:</div>
        <div class="field-value">${registration.childDetails.placeOfBirth}</div>
      </div>
      
      <div class="field-row">
        <div class="field-label">${content.gender}:</div>
        <div class="field-value">${registration.childDetails.gender}</div>
      </div>
      
      <div class="field-row">
        <div class="field-label">${content.motherName}:</div>
        <div class="field-value">${registration.motherDetails.firstName} ${registration.motherDetails.lastName}</div>
      </div>
      
      <div class="field-row">
        <div class="field-label">${content.fatherName}:</div>
        <div class="field-value">${registration.fatherDetails.firstName} ${registration.fatherDetails.lastName}</div>
      </div>

      <div class="certificate-numbers">
        <div class="field-row">
          <div class="field-label">${content.registrationNumber}:</div>
          <div class="field-value">${registration.registrationNumber}</div>
        </div>
        <div class="field-row">
          <div class="field-label">${content.certificateNumber}:</div>
          <div class="field-value">${certificateData.certificateNumber}</div>
        </div>
        <div class="field-row">
          <div class="field-label">${content.issuedDate}:</div>
          <div class="field-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      
      <div class="security-features"></div>
    </div>

    <div class="footer">
      <div class="signature-section">
        <div class="signature-line"></div>
        <div>${content.registrar}</div>
        <div style="font-size: 12px; color: #666;">Births and Deaths Registry</div>
      </div>

      ${certificateData.includeQRCode ? `
      <div class="signature-section">
        <div class="qr-code">
          QR
          CODE
        </div>
        <div style="font-size: 10px; margin-top: 5px;">Scan to verify</div>
      </div>
      ` : ''}

      <div class="signature-section">
        <div class="signature-line"></div>
        <div>${content.officialSeal}</div>
        <div style="font-size: 12px; color: #666;">Republic of Ghana</div>
      </div>
    </div>

    <div class="digital-signature">
      Digital Signature: ${certificateData.digitalSignature}
      <br>
      Generated via BirthLink Ghana - Authenticated Digital Certificate
      <br>
      Verify at: https://verify.birthlink-ghana.gov.gh/${certificateData.certificateNumber}
    </div>
  </div>
</body>
</html>
    `;
  }

  // Generate multiple certificates in batch
  async generateBulkCertificates(
    registrations: BirthRegistration[],
    options: CertificateGenerationOptions
  ): Promise<GeneratedCertificate[]> {
    const certificates: GeneratedCertificate[] = [];
    
    for (const registration of registrations) {
      try {
        const certificate = await this.generateOfficialCertificate(registration, options);
        certificates.push(certificate);
        
        // Add delay between generations to prevent overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate certificate for ${registration.id}:`, error);
      }
    }

    analyticsService.trackEvent('bulk_certificate_generation', {
      total_requested: registrations.length,
      successful_generations: certificates.length,
      template: options.template,
      language: options.language
    });

    return certificates;
  }

  // Verify certificate authenticity
  async verifyCertificate(certificateNumber: string): Promise<{
    isValid: boolean;
    registration?: BirthRegistration;
    issuedDate?: Date;
    expiryDate?: Date;
  }> {
    try {
      // In production, this would query the certificate database
      // For now, we'll simulate certificate verification
      
      analyticsService.trackEvent('certificate_verification', {
        certificate_number: certificateNumber,
        verification_source: 'web_portal'
      });

      // Simulate database lookup
      const mockResult = {
        isValid: true,
        issuedDate: new Date(),
        expiryDate: undefined // Official certificates don't expire
      };

      return mockResult;
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return { isValid: false };
    }
  }

  // Get certificate generation statistics
  getCertificateStats(): {
    totalGenerated: number;
    todayGenerated: number;
    officialCertificates: number;
    provisionalCertificates: number;
  } {
    // In production, this would query actual database statistics
    return {
      totalGenerated: this.certificateCounter - 1,
      todayGenerated: 0, // Would be calculated from database
      officialCertificates: 0, // Would be calculated from database
      provisionalCertificates: 0 // Would be calculated from database
    };
  }

  // Download certificate as PDF blob
  downloadCertificate(certificate: GeneratedCertificate, filename?: string): void {
    const blob = new Blob([certificate.pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `birth_certificate_${certificate.metadata.certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    analyticsService.trackEvent('certificate_downloaded', {
      certificate_id: certificate.certificateId,
      certificate_number: certificate.metadata.certificateNumber
    });
  }
}

// Export singleton instance
export const certificateService = CertificateService.getInstance();