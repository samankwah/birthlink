import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms";
import {
  fetchRegistrations,
  deleteRegistration,
} from "../store/slices/registrationSlice";
import { addNotification } from "../store/slices/uiSlice";
import type { RootState, AppDispatch } from "../store";
import type { BirthRegistration } from "../types";
import {
  FaEdit as Edit3,
  FaTrash as Trash2,
  FaFileAlt as FileText,
  FaEye as Eye,
  FaTh as Grid3X3,
  FaList as List,
  FaPrint as Printer,
  FaSearch as Search,
  FaFilter as Filter,
  FaChartBar as BarChart3,
  FaUsers as Users,
  FaCalendar as Calendar,
  FaCheckCircle as CheckCircle,
  FaChevronLeft as ChevronLeft,
  FaChevronRight as ChevronRight,
} from "react-icons/fa";

export const CertificateList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { registrations, isLoading } = useSelector(
    (state: RootState) => state.registrations
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "submitted" | "approved"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  // Removed unused setter
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Fetch registrations for the current user
    if (user) {
      dispatch(
        fetchRegistrations({
          userId: user.uid,
          pageSize: 50,
        })
      );
    }
  }, [dispatch, user]);

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.childDetails.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.childDetails.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || registration.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleViewCertificate = (registration: BirthRegistration) => {
    // Store registration data and navigate to certificate generation page
    localStorage.setItem("lastRegistration", JSON.stringify(registration));
    navigate("/certificate/generate");
  };

  const handleEditRegistration = (registration: BirthRegistration) => {
    // Navigate to edit form with registration data
    navigate("/registrations/new", {
      state: {
        mode: "edit",
        registrationData: registration,
      },
    });
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (
      window.confirm(
        t(
          "certificate.confirmDelete",
          "Are you sure you want to delete this registration?"
        )
      )
    ) {
      try {
        await dispatch(deleteRegistration(registrationId)).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: t(
              "certificate.deleteSuccess",
              "Registration deleted successfully"
            ),
          })
        );
      } catch (error) {
        dispatch(
          addNotification({
            type: "error",
            message: t(
              "certificate.deleteError",
              "Failed to delete registration"
            ),
          })
        );
      }
    }
  };

  const handlePrintCertificate = (registration: BirthRegistration) => {
    // Generate printable certificate in new window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Helper functions to handle date formatting
    const getDayOfYear = (date: Date | string) => {
      const dateObj = new Date(date);
      return dateObj.getDate();
    };

    const getMonthName = (date: Date | string) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString("en-GB", { month: "long" });
    };

    const getYear = (date: Date | string) => {
      const dateObj = new Date(date);
      return dateObj.getFullYear();
    };

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Birth Certificate - ${registration.childDetails.firstName} ${
      registration.childDetails.lastName
    }</title>
          <style>
            @page {
              size: A4;
              margin: 2mm;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 10pt;
              line-height: 1.2;
              margin: 0;
              padding: 3mm;
              color: black;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .certificate-container {
              width: 100%;
              max-width: 190mm;
              max-height: 250mm;
              border: none;
              padding: 5mm;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            
            /* Override all font sizes */
            * {
              font-size: 10pt !important;
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
          <div class="certificate-container">
            <div class="header-text">STRICTLY FOR CHILDREN 0 — 12 MONTHS</div>
            
            <div class="cert-number">No. ${
              registration.registrationNumber
            }</div>
            
            <div class="coat-of-arms">
              <div class="coat-of-arms-image">
                <img src="data:image/webp;base64,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" alt="Ghana Coat of Arms" style="width: 45px; height: 45px;" />
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
              <span class="dotted-line">${
                registration.childDetails.firstName
              } ${registration.childDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>born at</span>
              <span class="dotted-line">${
                registration.childDetails.placeOfBirth
              }</span>
            </div>
            
            <div class="form-line">
              <span>on the</span>
              <span class="dotted-line short-line">${getDayOfYear(
                registration.childDetails.dateOfBirth
              )}</span>
              <span>day of</span>
              <span class="dotted-line short-line">${getMonthName(
                registration.childDetails.dateOfBirth
              )}</span>
              <span>20</span>
              <span class="dotted-line short-line">${getYear(
                registration.childDetails.dateOfBirth
              )
                .toString()
                .slice(-2)}</span>
            </div>
            
            <div class="form-line">
              <span>has been duly registered in the register of Births for</span>
              <span class="dotted-line">${
                registration.registrarInfo?.region || "Greater Accra"
              }</span>
              <span>, in the</span>
            </div>
            
            <div class="form-line">
              <span class="dotted-line">${
                registration.registrarInfo?.district || "Accra Metropolitan"
              }</span>
              <span>Registration District.</span>
            </div>
            
            <div class="form-line">
              <span>The said</span>
              <span class="dotted-line">${
                registration.childDetails.firstName
              } ${registration.childDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>is the ${registration.childDetails.gender.toLowerCase()} child of</span>
              <span class="dotted-line">${
                registration.motherDetails.firstName
              } ${registration.motherDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span class="dotted-line"></span>
            </div>
            
            <div class="form-line">
              <span>a National of</span>
              <span class="dotted-line">${
                registration.motherDetails.nationality || "Ghana"
              }</span>
            </div>
            
            <div class="form-line">
              <span>and</span>
              <span class="dotted-line">${
                registration.fatherDetails.firstName
              } ${registration.fatherDetails.lastName}</span>
            </div>
            
            <div class="form-line">
              <span>a National of</span>
              <span class="dotted-line">${
                registration.fatherDetails.nationality || "Ghana"
              }</span>
            </div>
            
            <div class="form-line">
              <span>witness my hand this</span>
              <span class="dotted-line short-line">${getDayOfYear(
                registration.registrarInfo?.registrationDate || new Date()
              )}</span>
              <span>day of</span>
              <span class="dotted-line medium-line">${getMonthName(
                registration.registrarInfo?.registrationDate || new Date()
              )}</span>
              <span>20</span>
              <span class="dotted-line short-line">${getYear(
                registration.registrarInfo?.registrationDate || new Date()
              )
                .toString()
                .slice(-2)}</span>
            </div>
            
            <div class="footer-section">
              <div>
                <span>Entry No.</span>
                <span class="dotted-line" style="display: inline-block; width: 150px; margin-left: 10px;">${
                  registration.registrationNumber
                }</span>
              </div>
              
              <div>
                <div class="signature-line"></div>
                <div class="registrar-text">Registrar</div>
              </div>
            </div>
            
           
          </div>
        </body> <div class="footer-info">
              <div>BHP Counterfeit</div>
              <div>Birth Certificate Form R</div>
            </div>
      </html>
    `;

    printWindow.document.write(certificateHTML);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "draft":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "submitted":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "approved":
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

  // Calculate metrics
  const totalRegistrations = registrations.length;
  const pendingRegistrations = registrations.filter(
    (r) => r.status === "draft"
  ).length;
  const approvedRegistrations = registrations.filter(
    (r) => r.status === "approved"
  ).length;
  const thisMonthRegistrations = registrations.filter((r) => {
    const regDate = new Date(r.createdAt.seconds * 1000);
    const now = new Date();
    return (
      regDate.getMonth() === now.getMonth() &&
      regDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Metrics */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Birth Certificates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and view all birth registrations
              </p>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <Users className="w-8 h-8 opacity-75" />
                  <div className="ml-3">
                    <p className="text-sm font-medium opacity-75">
                      Total Certificates
                    </p>
                    <p className="text-2xl font-bold">{totalRegistrations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 opacity-75" />
                  <div className="ml-3">
                    <p className="text-sm font-medium opacity-75">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold">{pendingRegistrations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 opacity-75" />
                  <div className="ml-3">
                    <p className="text-sm font-medium opacity-75">Approved</p>
                    <p className="text-2xl font-bold">
                      {approvedRegistrations}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 opacity-75" />
                  <div className="ml-3">
                    <p className="text-sm font-medium opacity-75">This Month</p>
                    <p className="text-2xl font-bold">
                      {thisMonthRegistrations}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search, Filter, and View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by child name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-32"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "No matching certificates"
                  : "No certificates yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first birth certificate registration"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={() => navigate("/registrations/new")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create First Registration
                </Button>
              )}
            </div>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRegistrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.childDetails.firstName}{" "}
                          {registration.childDetails.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.childDetails.placeOfBirth}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {registration.registrationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(
                          registration.childDetails.dateOfBirth
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.registrarInfo?.region || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(registration.status)}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewCertificate(registration)}
                            className="p-2"
                            title="View Certificate"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePrintCertificate(registration)}
                            className="p-2"
                            title="Print Certificate"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRegistration(registration)}
                            className="p-2"
                            title="Edit Registration"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteRegistration(registration.id)
                            }
                            className="p-2 text-red-600 hover:text-red-700"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {registration.childDetails.firstName}{" "}
                        {registration.childDetails.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate font-mono">
                        {registration.registrationNumber}
                      </p>
                    </div>
                    <span className={getStatusBadge(registration.status)}>
                      {registration.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Birth:</span>
                      <span>
                        {new Date(
                          registration.childDetails.dateOfBirth
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-gray-400">📍</div>
                      <span className="font-medium">Place:</span>
                      <span className="truncate">
                        {registration.childDetails.placeOfBirth}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-gray-400">🏛️</div>
                      <span className="font-medium">Region:</span>
                      <span>{registration.registrarInfo?.region || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewCertificate(registration)}
                        className="p-2 hover:bg-blue-50"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePrintCertificate(registration)}
                        className="p-2 hover:bg-green-50"
                        title="Print Certificate"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditRegistration(registration)}
                        className="p-2 hover:bg-yellow-50"
                        title="Edit Registration"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRegistration(registration.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls - Arrow Only */}
        {totalPages > 1 && (
          <div className="mt-8">
            {/* Mobile Pagination */}
            <div className="flex items-center justify-between md:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(endIndex, totalItems)}
                  </span>{" "}
                  of <span className="font-semibold">{totalItems}</span> results
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <nav
                  className="flex items-center gap-2"
                  aria-label="Pagination"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
