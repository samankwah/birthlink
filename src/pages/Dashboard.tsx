import React, { useState, useMemo, useEffect } from "react";
// import { useTranslation } from "react-i18next"; // Currently unused
// import { useSelector } from "react-redux"; // Currently unused
import { useNavigate } from "react-router-dom";
// import type { RootState } from "../store"; // Currently unused
import {
  StatCard,
  // QuickActionCard, // Currently unused
  // DashboardSection, // Currently unused
} from "../components/molecules";
import {
  useDashboardStats,
  useRecentRegistrations,
  // useQuickActions, // Currently unused
} from "../hooks";

export const Dashboard: React.FC = () => {
  // const { t } = useTranslation(); // Currently unused
  const navigate = useNavigate();
  // const { user } = useSelector((state: RootState) => state.auth); // Currently unused
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useDashboardStats();
  const {
    registrations,
    isLoading: recentLoading,
    error: recentError,
  } = useRecentRegistrations(50); // Fetch more data for pagination
  // const quickActions = useQuickActions(); // Currently unused

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination values
  const totalItems = registrations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page items
  const currentRegistrations = useMemo(() => {
    return registrations.slice(startIndex, endIndex);
  }, [registrations, startIndex, endIndex]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Actions dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Action handlers
  const handleView = (registrationId: string) => {
    navigate(`/certificate/generate?id=${registrationId}`);
  };

  const handleEdit = (registrationId: string) => {
    navigate(`/registrations/edit/${registrationId}`);
  };

  const handleDownload = (registrationId: string) => {
    console.log("Downloading certificate for:", registrationId);
    // Implement download logic here
  };

  const handlePrint = (registrationId: string) => {
    console.log("Printing certificate for:", registrationId);
    // Implement print logic here
  };

  const handleDelete = (registrationId: string) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      console.log("Deleting registration:", registrationId);
      // Implement delete logic here
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest(".relative")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="container mx-auto space-y-6">
        {/* Dashboard Header */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Birth registration system overview and key metrics
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsError ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600">⚠</span>
                </div>
                <div>
                  <p className="text-red-800 font-medium">
                    Error loading statistics
                  </p>
                  <p className="text-red-600 text-sm">{statsError}</p>
                  <button
                    onClick={refreshStats}
                    className="text-red-700 underline text-sm mt-1 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : (
            stats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                isLoading={statsLoading}
                trend={stat.trend}
                status={stat.status}
                percentage={stat.percentage}
                subtitle={stat.subtitle}
                animationDelay={index * 150}
              />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Common tasks and shortcuts
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h3v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45-1.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
                  clipRule="evenodd"
                />
              </svg>
              Manage Certificates
            </button>

            <button className="inline-flex items-center px-6 py-3 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors shadow-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              System Settings
            </button>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Recent Registrations
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Latest birth certificates you've registered
            </p>
          </div>

          {/* Search Filters */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search registration ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search national ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search district..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search certificate ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Search type...</option>
                  <option>Birth Registration</option>
                  <option>Death Certificate</option>
                  <option>Marriage Certificate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {recentError ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600">⚠</span>
                </div>
                <p className="text-red-600 font-medium">
                  Error loading registrations
                </p>
                <p className="text-red-500 text-sm">{recentError}</p>
              </div>
            ) : recentLoading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      National ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRegistrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No recent registrations found
                      </td>
                    </tr>
                  ) : (
                    currentRegistrations.map((registration, index) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`w-1 h-8 rounded-full mr-3 ${
                                index % 3 === 0
                                  ? "bg-yellow-400"
                                  : index % 3 === 1
                                  ? "bg-red-400"
                                  : "bg-green-400"
                              }`}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {registration.registrationNumber ||
                                `REG${String(index + 1).padStart(3, "0")}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-gray-600">
                                {(registration.childName || "Child Name")[0]}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {registration.childName || "Child Name"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {`${
                            Math.floor(Math.random() * 9000000000) + 1000000000
                          }`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Eastern Region
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            CERT{String(index + 1).padStart(3, "0")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Birth Registration
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            Date.now() + 365 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            {/* Quick Action Buttons */}
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleView(registration.id)}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(registration.id)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Edit Registration"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>

                              {/* More Actions Dropdown */}
                              <button
                                onClick={() =>
                                  setOpenDropdown(
                                    openDropdown === registration.id
                                      ? null
                                      : registration.id
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="More Actions"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>

                            {/* Dropdown Menu */}
                            {openDropdown === registration.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleDownload(registration.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Download Certificate
                                  </button>
                                  <button
                                    onClick={() => {
                                      handlePrint(registration.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Print Certificate
                                  </button>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => {
                                      handleDelete(registration.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                                      />
                                      <path
                                        fillRule="evenodd"
                                        d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h3v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 112 0v3a1 1 0 11-2 0V7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Delete Registration
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Items per page and showing info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-500">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-500">entries</span>
                </div>
                <p className="text-sm text-gray-500">
                  Showing {Math.min(startIndex + 1, totalItems)} to{" "}
                  {Math.min(endIndex, totalItems)} of {totalItems} entries
                </p>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    } transition-colors`}
                    aria-label="Previous page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                      </>
                    )}

                    {/* Current page and surrounding pages */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return Math.abs(page - currentPage) <= 2;
                      })
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            page === currentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    } transition-colors`}
                    aria-label="Next page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
