import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDocumentTitle } from '../hooks';

interface FAQItem {
  question: string;
  answer: string;
  tags?: string[];
}

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  responseTime?: number;
}

export const HelpSupport: React.FC = () => {
  // Set page title
  useDocumentTitle("Help & Support");
  
  const [activeSection, setActiveSection] = useState('faq');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ 
    subject: '', 
    description: '', 
    priority: 'medium',
    category: 'general',
    email: ''
  });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  // Basic keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchTerm('');
        setShowTicketForm(false);
        setOpenFAQ(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const faqItems: FAQItem[] = [
    {
      question: "How do I register a new birth?",
      answer: "To register a new birth, navigate to the 'New Registration' page from the main menu. Fill in all required information including child details, parent information, and birth location. Make sure you have all necessary documents ready.",
      tags: ["registration", "birth", "new"]
    },
    {
      question: "What documents are required for birth registration?",
      answer: "You typically need the hospital birth certificate, parents' identification documents, marriage certificate (if applicable), and any other supporting documents as required by your region's regulations.",
      tags: ["documents", "requirements", "registration"]
    },
    {
      question: "How can I generate a birth certificate?",
      answer: "Go to the 'Certificates' section and select 'Generate Certificate'. Choose the registration record and select the certificate type. The system will generate a PDF certificate that you can download and print.",
      tags: ["certificate", "generate", "download"]
    },
    {
      question: "Can I edit a registration after it's been submitted?",
      answer: "Yes, if you have registrar privileges, you can edit registrations by going to the 'Registrations' page and clicking the edit button next to the record you want to modify.",
      tags: ["edit", "modify", "registrar"]
    },
    {
      question: "How do I change my password?",
      answer: "Go to your Profile settings and look for the 'Change Password' section. You'll need to enter your current password and then your new password twice for confirmation.",
      tags: ["password", "security", "account"]
    },
    {
      question: "What should I do if I forget my password?",
      answer: "On the login page, click 'Forgot Password?' and enter your email address. You'll receive instructions to reset your password via email.",
      tags: ["password", "reset", "forgot"]
    },
    {
      question: "How do I change the system language?",
      answer: "Click on your profile dropdown in the top right corner and select your preferred language from the language menu. The system supports English, Twi, Ga, and Ewe.",
      tags: ["language", "localization", "settings"]
    },
    {
      question: "What are the different user roles in the system?",
      answer: "There are three main roles: Viewer (can view registrations and generate certificates), Registrar (can create and edit registrations), and Admin (full system access including user management and settings).",
      tags: ["roles", "permissions", "access"]
    },
    {
      question: "How do I export registration data?",
      answer: "Navigate to the Registrations page and use the 'Export' button. You can choose from various formats including CSV, Excel, and PDF. Filters can be applied before exporting.",
      tags: ["export", "data", "csv", "excel"]
    },
    {
      question: "What browsers are supported?",
      answer: "BirthLink supports all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, ensure your browser is updated to the latest version.",
      tags: ["browser", "compatibility", "technical"]
    }
  ];

  const systemServices: SystemService[] = [
    { name: "User Authentication", status: "operational", uptime: 99.9, responseTime: 120 },
    { name: "Birth Registration", status: "operational", uptime: 99.8, responseTime: 340 },
    { name: "Certificate Generation", status: "operational", uptime: 99.9, responseTime: 890 },
    { name: "Database Services", status: "operational", uptime: 99.9, responseTime: 45 },
    { name: "File Storage", status: "operational", uptime: 99.7, responseTime: 230 },
    { name: "Email Notifications", status: "operational", uptime: 99.5, responseTime: 1200 }
  ];

  // Enhanced FAQ filtering with search and tags
  const filteredFAQs = useMemo(() => {
    if (!searchTerm) return faqItems;
    const term = searchTerm.toLowerCase();
    return faqItems.filter(item => 
      item.question.toLowerCase().includes(term) ||
      item.answer.toLowerCase().includes(term) ||
      item.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }, [searchTerm, faqItems]);

  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQ(prev => prev === index ? null : index);
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTicket(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setTicketForm({ 
      subject: '', 
      description: '', 
      priority: 'medium',
      category: 'general',
      email: ''
    });
    setShowTicketForm(false);
    setIsSubmittingTicket(false);
    
    // Show success message
    alert('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };


  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-1">Find answers to common questions about BirthLink</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-blue-800 text-sm">
            {filteredFAQs.length > 0 
              ? `Showing ${filteredFAQs.length} result${filteredFAQs.length !== 1 ? 's' : ''} for "${searchTerm}"`
              : `No results found for "${searchTerm}"`
            }
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {filteredFAQs.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg bg-white">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
              aria-expanded={openFAQ === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-medium text-gray-900 pr-4">{item.question}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                  openFAQ === index ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQ === index && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredFAQs.length === 0 && searchTerm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No matching questions found.</p>
          <button 
            onClick={() => setActiveSection('contact')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Contact Support
          </button>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact Support</h2>
        <p className="text-gray-600">
          Get in touch with our support team for assistance with any questions or issues.
        </p>
      </div>
      
      {/* Support Ticket Form */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Submit a Support Ticket</h3>
            <p className="text-gray-600 text-sm mt-1">Get help from our support team</p>
          </div>
          <button
            onClick={() => setShowTicketForm(!showTicketForm)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showTicketForm ? 'Hide Form' : 'Create Ticket'}
          </button>
        </div>
        
        {showTicketForm && (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="general">General Support</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Brief description of your issue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                required
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Please provide as much detail as possible..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Issue affecting work</option>
                <option value="high">High - Urgent issue</option>
                <option value="critical">Critical - System down</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isSubmittingTicket}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmittingTicket ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </form>
        )}
      </div>
      
      {/* Contact Methods */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Technical Support",
            email: "support@birthlink.gov.gh",
            phone: "+233 XX XXX XXXX",
            hours: "Monday - Friday, 8:00 AM - 5:00 PM GMT"
          },
          {
            title: "Registration Help",
            email: "registrar@birthlink.gov.gh",
            phone: "+233 XX XXX XXXX",
            hours: "Monday - Friday, 8:00 AM - 5:00 PM GMT"
          },
          {
            title: "Account Support",
            email: "accounts@birthlink.gov.gh",
            phone: "+233 XX XXX XXXX",
            hours: "Monday - Friday, 9:00 AM - 4:00 PM GMT"
          }
        ].map((contact, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">{contact.title}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-500 text-xs">{contact.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Support */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">Emergency Support</h3>
        <p className="text-red-700 text-sm mb-2">For critical system issues:</p>
        <div className="flex items-center space-x-2 text-red-900 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>+233 XX XXX XXXX (24/7)</span>
        </div>
      </div>
    </div>
  );

  const renderGuides = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Guides & Resources</h2>
        <p className="text-gray-600">
          Download guides and tutorials to help you use BirthLink effectively
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Getting Started Guide",
            description: "Complete walkthrough for new users",
            downloadUrl: "#"
          },
          {
            title: "Birth Registration Manual",
            description: "Step-by-step registration instructions",
            downloadUrl: "#"
          },
          {
            title: "Certificate Generation Guide",
            description: "How to generate and print certificates",
            downloadUrl: "#"
          },
          {
            title: "User Management Manual",
            description: "Admin guide for managing users and roles",
            downloadUrl: "#"
          },
          {
            title: "System Settings Guide",
            description: "Configuration and customization options",
            downloadUrl: "#"
          },
          {
            title: "Troubleshooting Guide",
            description: "Solutions to common problems",
            downloadUrl: "#"
          }
        ].map((guide, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
            <a
              href={guide.downloadUrl}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemStatus = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Status</h2>
        <p className="text-gray-600">
          Current status of BirthLink services and system health
        </p>
      </div>
      
      {/* Overall Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <span className="text-green-800 font-semibold">All systems operational</span>
              <p className="text-green-700 text-sm">All services running normally</p>
            </div>
          </div>
          <div className="text-right text-sm text-green-700">
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {systemServices.map((service, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(service.status)}`}></div>
                <span className={`text-xs font-medium capitalize ${getStatusTextColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{service.uptime}%</span>
              </div>
              {service.responseTime && (
                <div className="flex justify-between">
                  <span>Response:</span>
                  <span>{service.responseTime}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Scheduled Maintenance</h3>
        <p className="text-blue-800 text-sm">
          No scheduled maintenance at this time. Users will be notified in advance of any planned downtime.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive resource for getting the most out of BirthLink. Find answers, get support, and access helpful guides.
          </p>
          
          {/* Keyboard shortcuts hint */}
          <div className="mt-6 inline-flex items-center space-x-4 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200">
            <span>Quick navigation:</span>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1-4</kbd>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">K</kbd>
              <span>to search</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap justify-center space-x-2 lg:space-x-8 border-b border-gray-200 bg-white rounded-t-xl px-4">
            {[
              { id: 'faq', label: 'FAQ', icon: '❓', desc: 'Quick answers' },
              { id: 'contact', label: 'Support', icon: '💬', desc: 'Get help' },
              { id: 'guides', label: 'Guides', icon: '📚', desc: 'Learn more' },
              { id: 'status', label: 'Status', icon: '📊', desc: 'System health' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`group py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap flex flex-col items-center space-y-1 transition-all duration-200 ${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                <span className={`text-xs ${activeSection === tab.id ? 'text-blue-500' : 'text-gray-400'}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px]">
          <div>
            {activeSection === 'faq' && renderFAQ()}
            {activeSection === 'contact' && renderContact()}
            {activeSection === 'guides' && renderGuides()}
            {activeSection === 'status' && renderSystemStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};