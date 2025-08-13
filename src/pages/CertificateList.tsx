import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms';
import { fetchRegistrations, deleteRegistration } from '../store/slices/registrationSlice';
import { addNotification } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';
import type { BirthRegistration } from '../types';
import { Edit3, Trash2, FileText, Eye, Plus, Download, Printer } from 'lucide-react';

export const CertificateList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { registrations, isLoading } = useSelector((state: RootState) => state.registrations);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'approved'>('all');

  useEffect(() => {
    // Fetch registrations for the current user
    if (user) {
      dispatch(fetchRegistrations({ 
        userId: user.uid,
        pageSize: 50 
      }));
    }
  }, [dispatch, user]);

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = 
      registration.childDetails.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.childDetails.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || registration.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewCertificate = (registration: BirthRegistration) => {
    // Store registration data and navigate to certificate generation page
    localStorage.setItem('lastRegistration', JSON.stringify(registration));
    navigate('/certificate/generate');
  };

  const handleEditRegistration = (registration: BirthRegistration) => {
    // Navigate to edit form with registration data
    navigate('/registrations/new', { 
      state: { 
        mode: 'edit', 
        registrationData: registration 
      } 
    });
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (window.confirm(t('certificate.confirmDelete', 'Are you sure you want to delete this registration?'))) {
      try {
        await dispatch(deleteRegistration(registrationId)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: t('certificate.deleteSuccess', 'Registration deleted successfully')
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: t('certificate.deleteError', 'Failed to delete registration')
        }));
      }
    }
  };

  const handlePrintCertificate = (registration: BirthRegistration) => {
    // Generate printable certificate in new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const certificateHTML = `
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
              border: 4px solid black;
              padding: 20mm;
              position: relative;
              min-height: 250mm;
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
              top: 15px;
              right: 20px;
              font-weight: bold;
              font-size: 14pt;
            }
            
            .title-section {
              text-align: center;
              margin: 30px 0;
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
              text-align: center;
              padding-bottom: 2px;
              font-weight: bold;
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
              height: 30px;
            }
            
            .registrar-text {
              text-align: center;
              font-style: italic;
            }
            
            .short-line {
              width: 50px;
              display: inline-block;
            }
            
            .medium-line {
              width: 120px;
              display: inline-block;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="certificate-container">
            <div class="header-text">STRICTLY FOR CHILDREN 0 — 12 MONTHS</div>
            
            <div class="cert-number">No. ${registration.registrationNumber}</div>
            
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
              <span class="dotted-line short-line">${new Date(registration.childDetails.dateOfBirth).getDate()}</span>
              <span>day of</span>
              <span class="dotted-line medium-line">${new Date(registration.childDetails.dateOfBirth).toLocaleDateString('en-GB', { month: 'long' })}</span>
              <span>20</span>
              <span class="dotted-line short-line">${new Date(registration.childDetails.dateOfBirth).getFullYear().toString().slice(-2)}</span>
            </div>
            
            <div class="form-line">
              <span>has been duly registered in the register of Births for</span>
              <span class="dotted-line">${registration.registrarInfo?.region || ''}</span>
              <span>, in the</span>
            </div>
            
            <div class="form-line">
              <span class="dotted-line">${registration.registrarInfo?.district || ''}</span>
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
              <span>and</span>
              <span class="dotted-line">${registration.fatherDetails.firstName} ${registration.fatherDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>a National of</span>
              <span class="dotted-line">${registration.motherDetails.nationality || 'Ghana'}</span>
            </div>
            
            <div class="form-line">
              <span>and</span>
              <span class="dotted-line">${registration.fatherDetails.nationality || 'Ghana'}</span>
            </div>
            
            <div class="form-line">
              <span>witness my hand this</span>
              <span class="dotted-line short-line">${new Date().getDate()}</span>
              <span>day of</span>
              <span class="dotted-line medium-line">${new Date().toLocaleDateString('en-GB', { month: 'long' })}</span>
              <span>20</span>
              <span class="dotted-line short-line">${new Date().getFullYear().toString().slice(-2)}</span>
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
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(certificateHTML);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'submitted':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Birth Certificates</h1>
              <p className="text-gray-600">Manage and view all birth registrations</p>
            </div>
            <Button onClick={() => navigate('/registrations/new')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Registration
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by child name or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No matching registrations' : 'No registrations yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by creating your first birth registration'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => navigate('/registrations/new')}>
                Create First Registration
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {registration.childDetails.firstName} {registration.childDetails.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {registration.registrationNumber}
                      </p>
                    </div>
                    <span className={getStatusBadge(registration.status)}>
                      {registration.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Date of Birth:</span> {' '}
                      {new Date(registration.childDetails.dateOfBirth).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Place:</span> {' '}
                      {registration.childDetails.placeOfBirth}
                    </div>
                    <div>
                      <span className="font-medium">Region:</span> {' '}
                      {registration.registrarInfo?.region || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {' '}
                      {new Date(registration.createdAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewCertificate(registration)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePrintCertificate(registration)}
                      className="flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRegistration(registration)}
                      className="flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRegistration(registration.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};