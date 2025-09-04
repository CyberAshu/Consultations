import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { consultantApplicationService } from '../../services/consultantApplicationService';
import { ConsultantApplication } from '../../services/types';

export function BecomeConsultantPage() {
  const [currentStep, setCurrentStep] = useState<'initial' | 'additional' | 'complete'>('initial');
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [existingApplication, setExistingApplication] = useState<ConsultantApplication | null>(null);
  
  const [formData, setFormData] = useState({
    // Section 1: Personal & Contact Information
    fullLegalName: '',
    preferredDisplayName: '',
    email: '',
    mobilePhone: '',
    dateOfBirth: '',
    cityProvince: '',
    timeZone: 'Eastern Time (ET)',
    
    // Section 2: Licensing & Credentials
    rcicLicenseNumber: '',
    yearOfInitialLicensing: new Date().getFullYear(),
    ciccMembershipStatus: 'Active',
    
    // Section 3: Practice Details
    practiceType: 'independent',
    businessFirmName: '',
    websiteLinkedIn: '',
    hasBusinessRegistration: false,
    isIRBAuthorized: false,
    takingPrivateClients: true,
    representsClientsIRCC: true,
    
    // Section 4: Areas of Expertise
    areasOfExpertise: [] as string[],
    otherExpertise: '',
    
    // Section 5: Languages
    primaryLanguage: 'English',
    otherLanguages: [] as string[],
    multiLanguageConsultations: false,
    
    // Section 6: Declarations & Agreements
    confirmLicensedRCIC: false,
    agreeToTerms: false,
    agreeToIRPACompliance: false,
    agreeNoPersonalContact: false,
    consentToReviews: false,
    
    // Section 7: Signature
    digitalSignature: '',
    submissionDate: new Date().toISOString().split('T')[0]
  });
  
  const [files, setFiles] = useState({
    ciccRegisterScreenshot: null as File | null,
    proofOfGoodStanding: null as File | null,
    insuranceCertificate: null as File | null,
    governmentPhotoID: null as File | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const timeZones = [
    'Pacific Time (PT)', 'Mountain Time (MT)', 'Central Time (CT)', 
    'Eastern Time (ET)', 'Atlantic Time (AT)', 'Newfoundland Time (NT)'
  ];
  
  const membershipStatuses = ['Active', 'Inactive', 'Suspended', 'Under Review'];
  
  const expertiseAreas = [
    'Study Permits', 'Post-Graduation Work Permits', 'Express Entry',
    'Spousal Sponsorship', 'LMIA & Work Permits', 'Provincial Nominee Programs',
    'Visitor Visas / TRVs', 'Permanent Residency Applications', 
    'Business / Investor Immigration', 'Refugee Claims & Appeals',
    'Citizenship Applications', 'Family Sponsorship', 'PR Card Renewals',
    'Procedural Fairness Responses'
  ];
  
  const languages = [
    'English', 'French', 'Spanish', 'Mandarin', 'Hindi', 'Arabic', 
    'Portuguese', 'Russian', 'German', 'Italian', 'Korean', 'Japanese',
    'Tagalog', 'Vietnamese', 'Persian', 'Punjabi', 'Tamil', 'Urdu'
  ];

  // Check for existing application on component mount
  useEffect(() => {
    const checkExistingApplication = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      const appId = urlParams.get('application_id');
      
      if (email && appId) {
        try {
          const application = await consultantApplicationService.getApplicationById(parseInt(appId));
          setExistingApplication(application);
          setApplicationId(application.id);
          
          // If sections are requested, show additional sections
          if (application.sections_requested && application.sections_requested.length > 0 && application.section_1_completed === true) {
            setCurrentStep('additional');
            // Pre-fill form with existing data
            setFormData(prev => ({
              ...prev,
              fullLegalName: application.full_legal_name || '',
              preferredDisplayName: application.preferred_display_name || '',
              email: application.email || '',
              mobilePhone: application.mobile_phone || '',
              dateOfBirth: application.date_of_birth || '',
              cityProvince: application.city_province || '',
              timeZone: application.time_zone || 'Eastern Time (ET)',
              rcicLicenseNumber: application.rcic_license_number || '',
              yearOfInitialLicensing: application.year_of_initial_licensing || new Date().getFullYear(),
              ciccMembershipStatus: application.cicc_membership_status || 'Active',
              practiceType: application.practice_type || 'independent',
              businessFirmName: application.business_firm_name || '',
              websiteLinkedIn: application.website_linkedin || '',
              hasBusinessRegistration: application.canadian_business_registration || false,
              isIRBAuthorized: application.irb_authorization || false,
              takingPrivateClients: application.taking_clients_private_practice || true,
              representsClientsIRCC: application.representing_clients_ircc_irb || true,
              areasOfExpertise: application.areas_of_expertise || [],
              otherExpertise: application.other_expertise || '',
              primaryLanguage: application.primary_language || 'English',
              otherLanguages: application.other_languages || [],
              multiLanguageConsultations: application.multilingual_consultations || false,
              confirmLicensedRCIC: application.confirm_licensed_rcic || false,
              agreeToTerms: application.agree_terms_guidelines || false,
              agreeToIRPACompliance: application.agree_compliance_irpa || false,
              agreeNoPersonalContact: application.agree_no_outside_contact || false,
              consentToReviews: application.consent_session_reviews || false,
              digitalSignature: application.digital_signature_name || ''
            }));
          }
        } catch (error) {
          console.error('Error loading existing application:', error);
        }
      }
    };
    
    checkExistingApplication();
  }, []);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const submitFormData = new FormData();
      
      // Add only Section 1 fields
      submitFormData.append('full_legal_name', formData.fullLegalName);
      submitFormData.append('preferred_display_name', formData.preferredDisplayName);
      submitFormData.append('email', formData.email);
      submitFormData.append('mobile_phone', formData.mobilePhone);
      submitFormData.append('date_of_birth', formData.dateOfBirth);
      submitFormData.append('city_province', formData.cityProvince);
      submitFormData.append('time_zone', formData.timeZone);
      submitFormData.append('rcic_license_number', formData.rcicLicenseNumber);
      
      const result = await consultantApplicationService.createInitialApplication(submitFormData);
      setApplicationId(result.id);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting initial application:', error);
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdditionalSectionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const submitFormData = new FormData();
      
      // Add all additional sections
      submitFormData.append('rcic_license_number', formData.rcicLicenseNumber);
      submitFormData.append('year_of_initial_licensing', formData.yearOfInitialLicensing.toString());
      submitFormData.append('cicc_membership_status', formData.ciccMembershipStatus);
      
      // Add file uploads
      if (files.ciccRegisterScreenshot) {
        submitFormData.append('cicc_register_screenshot', files.ciccRegisterScreenshot);
      }
      if (files.proofOfGoodStanding) {
        submitFormData.append('proof_of_good_standing', files.proofOfGoodStanding);
      }
      if (files.insuranceCertificate) {
        submitFormData.append('insurance_certificate', files.insuranceCertificate);
      }
      if (files.governmentPhotoID) {
        submitFormData.append('government_id', files.governmentPhotoID);
      }
      
      // Section 3: Practice Details
      submitFormData.append('practice_type', formData.practiceType);
      submitFormData.append('business_firm_name', formData.businessFirmName);
      submitFormData.append('website_linkedin', formData.websiteLinkedIn);
      submitFormData.append('canadian_business_registration', formData.hasBusinessRegistration.toString());
      submitFormData.append('irb_authorization', formData.isIRBAuthorized.toString());
      submitFormData.append('taking_clients_private_practice', formData.takingPrivateClients.toString());
      submitFormData.append('representing_clients_ircc_irb', formData.representsClientsIRCC.toString());
      
      // Section 4: Areas of Expertise
      submitFormData.append('areas_of_expertise', JSON.stringify(formData.areasOfExpertise));
      submitFormData.append('other_expertise', formData.otherExpertise);
      
      // Section 5: Languages
      submitFormData.append('primary_language', formData.primaryLanguage);
      submitFormData.append('other_languages', JSON.stringify(formData.otherLanguages));
      submitFormData.append('multilingual_consultations', formData.multiLanguageConsultations.toString());
      
      // Section 6: Declarations
      submitFormData.append('confirm_licensed_rcic', formData.confirmLicensedRCIC.toString());
      submitFormData.append('agree_terms_guidelines', formData.agreeToTerms.toString());
      submitFormData.append('agree_compliance_irpa', formData.agreeToIRPACompliance.toString());
      submitFormData.append('agree_no_outside_contact', formData.agreeNoPersonalContact.toString());
      submitFormData.append('consent_session_reviews', formData.consentToReviews.toString());
      
      // Section 7: Signature
      submitFormData.append('digital_signature_name', formData.digitalSignature);
      
      console.log('Submitting additional sections for application:', applicationId);
      console.log('Form data being sent:', Object.fromEntries(submitFormData.entries()));
      
      const result = await consultantApplicationService.completeAdditionalSections(applicationId, submitFormData);
      console.log('Submission result:', result);
      
      setCurrentStep('complete');
    } catch (error: any) {
      console.error('Error submitting additional sections:', error);
      setSubmitError(error.message || 'Failed to submit additional sections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleCheckboxArrayChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  // Success message for initial submission
  if (isSubmitted && currentStep === 'initial') {
    return (
      <main className="min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-lg shadow-lg">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Thank You for Your Application!
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Thank you for expressing interest in becoming a Verified Partner with Immigration Connect. Your submission has been received successfully.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm text-left mb-4">
                  We take onboarding seriously to ensure quality and compliance. Our team will now verify your initial details. Once verified, you will receive an email with further instructions to complete your application.
                </p>
                <p className="text-blue-800 text-sm text-left">
                  We appreciate your patience and look forward to welcoming you soon.
                </p>
              </div>
              
              <p className="text-sm text-gray-500">
                Application ID: {applicationId}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Success message for complete submission
  if (currentStep === 'complete') {
    return (
      <main className="min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-lg shadow-lg">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Thank You for Submitting Your Full Application!
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your detailed application has been received. Our compliance and onboarding teams are currently reviewing your information. You can expect a response within 24 to 48 business hours. We may contact you if any supporting documents or clarifications are needed.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm text-left">
                  Thank you for your time and effort. You're one step closer to joining Immigration Connect!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight">
            Become a Partner
          </h1>
          <p className="mt-3 sm:mt-5 max-w-xl mx-auto text-base sm:text-lg lg:text-xl text-gray-500 px-4">
            {currentStep === 'initial' 
              ? 'Submit your initial application to join our team of experts.'
              : 'Complete the remaining sections of your application.'
            }
          </p>
        </div>
        
        <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
          {submitError && (
            <div className="bg-red-50 border border-red-300 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={currentStep === 'initial' ? handleInitialSubmit : handleAdditionalSectionsSubmit} className="space-y-6 sm:space-y-8">
            
            {/* Section 1: Personal & Contact Information - Always shown */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                  Section 1: Personal & Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullLegalName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Legal Name (as per CICC records) *
                    </label>
                    <Input
                      id="fullLegalName"
                      name="fullLegalName"
                      type="text"
                      required
                      value={formData.fullLegalName}
                      onChange={handleInputChange}
                      placeholder="Enter your full legal name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="preferredDisplayName" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Display Name (optional)
                    </label>
                    <Input
                      id="preferredDisplayName"
                      name="preferredDisplayName"
                      type="text"
                      value={formData.preferredDisplayName}
                      onChange={handleInputChange}
                      placeholder="Enter preferred display name"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (login + notifications) *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Phone Number *
                    </label>
                    <Input
                      id="mobilePhone"
                      name="mobilePhone"
                      type="tel"
                      required
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="cityProvince" className="block text-sm font-medium text-gray-700 mb-2">
                      City & Province *
                    </label>
                    <Input
                      id="cityProvince"
                      name="cityProvince"
                      type="text"
                      required
                      value={formData.cityProvince}
                      onChange={handleInputChange}
                      placeholder="e.g., Toronto, ON"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone *
                    </label>
                    <select
                      id="timeZone"
                      name="timeZone"
                      required
                      value={formData.timeZone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {timeZones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rcicLicenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      RCIC License Number *
                    </label>
                    <Input
                      id="rcicLicenseNumber"
                      name="rcicLicenseNumber"
                      type="text"
                      required
                      value={formData.rcicLicenseNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your RCIC license number"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Sections - Only shown when requested */}
            {currentStep === 'additional' && (
              <>
                {/* Section 2: Licensing & Credentials */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 2: Licensing & Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="yearOfInitialLicensing" className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Initial Licensing *
                        </label>
                        <Input
                          id="yearOfInitialLicensing"
                          name="yearOfInitialLicensing"
                          type="number"
                          required
                          min="1990"
                          max={new Date().getFullYear()}
                          value={formData.yearOfInitialLicensing}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ciccMembershipStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        CICC Membership Status *
                      </label>
                      <select
                        id="ciccMembershipStatus"
                        name="ciccMembershipStatus"
                        required
                        value={formData.ciccMembershipStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {membershipStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* File uploads for Section 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ciccRegisterScreenshot" className="block text-sm font-medium text-gray-700 mb-2">
                          CICC Register Screenshot *
                        </label>
                        <input
                          id="ciccRegisterScreenshot"
                          name="ciccRegisterScreenshot"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="proofOfGoodStanding" className="block text-sm font-medium text-gray-700 mb-2">
                          Proof of Good Standing *
                        </label>
                        <input
                          id="proofOfGoodStanding"
                          name="proofOfGoodStanding"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="insuranceCertificate" className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Certificate *
                        </label>
                        <input
                          id="insuranceCertificate"
                          name="insuranceCertificate"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="governmentPhotoID" className="block text-sm font-medium text-gray-700 mb-2">
                          Government Photo ID *
                        </label>
                        <input
                          id="governmentPhotoID"
                          name="governmentPhotoID"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Practice Details */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 3: Practice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div>
                      <label htmlFor="practiceType" className="block text-sm font-medium text-gray-700 mb-2">
                        Practice Type *
                      </label>
                      <select
                        id="practiceType"
                        name="practiceType"
                        required
                        value={formData.practiceType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="independent">Independent Practice</option>
                        <option value="affiliated">Affiliated with Firm</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="businessFirmName" className="block text-sm font-medium text-gray-700 mb-2">
                          Business/Firm Name
                        </label>
                        <Input
                          id="businessFirmName"
                          name="businessFirmName"
                          type="text"
                          value={formData.businessFirmName}
                          onChange={handleInputChange}
                          placeholder="Enter business/firm name"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="websiteLinkedIn" className="block text-sm font-medium text-gray-700 mb-2">
                          Website/LinkedIn
                        </label>
                        <Input
                          id="websiteLinkedIn"
                          name="websiteLinkedIn"
                          type="url"
                          value={formData.websiteLinkedIn}
                          onChange={handleInputChange}
                          placeholder="Enter website or LinkedIn URL"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          id="hasBusinessRegistration"
                          name="hasBusinessRegistration"
                          type="checkbox"
                          checked={formData.hasBusinessRegistration}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hasBusinessRegistration" className="ml-2 block text-sm text-gray-900">
                          Canadian Business Registration
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="isIRBAuthorized"
                          name="isIRBAuthorized"
                          type="checkbox"
                          checked={formData.isIRBAuthorized}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isIRBAuthorized" className="ml-2 block text-sm text-gray-900">
                          IRB Authorization (L3-RCIC)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          id="takingPrivateClients"
                          name="takingPrivateClients"
                          type="checkbox"
                          checked={formData.takingPrivateClients}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="takingPrivateClients" className="ml-2 block text-sm text-gray-900">
                          Taking Private Practice Clients
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="representsClientsIRCC"
                          name="representsClientsIRCC"
                          type="checkbox"
                          checked={formData.representsClientsIRCC}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="representsClientsIRCC" className="ml-2 block text-sm text-gray-900">
                          Representing Clients at IRCC/IRB
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4: Areas of Expertise */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 4: Areas of Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Areas of Expertise (Select all that apply) *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {expertiseAreas.map(area => (
                          <div key={area} className="flex items-center">
                            <input
                              id={`expertise-${area}`}
                              type="checkbox"
                              checked={formData.areasOfExpertise.includes(area)}
                              onChange={(e) => handleCheckboxArrayChange('areasOfExpertise', area, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`expertise-${area}`} className="ml-2 block text-sm text-gray-900">
                              {area}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="otherExpertise" className="block text-sm font-medium text-gray-700 mb-2">
                        Other Areas of Expertise
                      </label>
                      <textarea
                        id="otherExpertise"
                        name="otherExpertise"
                        value={formData.otherExpertise}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Please describe any other areas of expertise..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5: Languages */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 5: Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div>
                      <label htmlFor="primaryLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Language *
                      </label>
                      <select
                        id="primaryLanguage"
                        name="primaryLanguage"
                        required
                        value={formData.primaryLanguage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {languages.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Other Languages Spoken
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {languages.filter(lang => lang !== formData.primaryLanguage).map(lang => (
                          <div key={lang} className="flex items-center">
                            <input
                              id={`language-${lang}`}
                              type="checkbox"
                              checked={formData.otherLanguages.includes(lang)}
                              onChange={(e) => handleCheckboxArrayChange('otherLanguages', lang, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`language-${lang}`} className="ml-2 block text-sm text-gray-900">
                              {lang}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="multiLanguageConsultations"
                        name="multiLanguageConsultations"
                        type="checkbox"
                        checked={formData.multiLanguageConsultations}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="multiLanguageConsultations" className="ml-2 block text-sm text-gray-900">
                        Comfortable conducting consultations in multiple languages
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6: Declarations & Agreements */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 6: Declarations & Agreements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          id="confirmLicensedRCIC"
                          name="confirmLicensedRCIC"
                          type="checkbox"
                          required
                          checked={formData.confirmLicensedRCIC}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="confirmLicensedRCIC" className="ml-2 block text-sm text-gray-900">
                          I confirm that I am a licensed RCIC in good standing with the CICC *
                        </label>
                      </div>
                      
                      <div className="flex items-start">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          required
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                          I agree to comply with all platform terms, guidelines, and policies *
                        </label>
                      </div>
                      
                      <div className="flex items-start">
                        <input
                          id="agreeToIRPACompliance"
                          name="agreeToIRPACompliance"
                          type="checkbox"
                          required
                          checked={formData.agreeToIRPACompliance}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="agreeToIRPACompliance" className="ml-2 block text-sm text-gray-900">
                          I agree to maintain compliance with IRPA and all applicable regulations *
                        </label>
                      </div>
                      
                      <div className="flex items-start">
                        <input
                          id="agreeNoPersonalContact"
                          name="agreeNoPersonalContact"
                          type="checkbox"
                          required
                          checked={formData.agreeNoPersonalContact}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="agreeNoPersonalContact" className="ml-2 block text-sm text-gray-900">
                          I agree not to solicit clients for outside contact or services *
                        </label>
                      </div>
                      
                      <div className="flex items-start">
                        <input
                          id="consentToReviews"
                          name="consentToReviews"
                          type="checkbox"
                          required
                          checked={formData.consentToReviews}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="consentToReviews" className="ml-2 block text-sm text-gray-900">
                          I consent to session reviews for quality assurance purposes *
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7: Signature */}
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                      Section 7: Digital Signature
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div>
                      <label htmlFor="digitalSignature" className="block text-sm font-medium text-gray-700 mb-2">
                        Digital Signature (Type your full name) *
                      </label>
                      <Input
                        id="digitalSignature"
                        name="digitalSignature"
                        type="text"
                        required
                        value={formData.digitalSignature}
                        onChange={handleInputChange}
                        placeholder="Type your full name as digital signature"
                        className="w-full"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        By typing your name above, you acknowledge that this constitutes a legal signature.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : currentStep === 'initial' ? 'Submit Initial Application' : 'Submit Complete Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
