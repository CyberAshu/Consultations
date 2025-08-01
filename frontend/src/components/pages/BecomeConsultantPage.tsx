import React, { useState } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export function BecomeConsultantPage() {
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
    practiceType: 'independent', // independent or affiliated
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
    ciccRegisterScreenshot: null,
    proofOfGoodStanding: null,
    insuranceCertificate: null,
    governmentPhotoID: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
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

  if (isSubmitted) {
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 px-4">Application Submitted Successfully!</h1>
              </div>
              
              <div className="prose prose-sm sm:prose-base lg:prose-lg mx-auto text-left bg-gray-50 rounded-lg p-4 sm:p-6">
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  <strong>Thank you!</strong> Your application has been successfully submitted.
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  We've received your details and documents. Our admin team will carefully review your 
                  application within <strong>2–3 business days</strong> to ensure all licensing and compliance 
                  requirements are met.
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  If your application is approved, you'll receive an email with login access to your consultant 
                  dashboard, along with instructions to complete your onboarding and begin accepting client bookings.
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  If additional information or clarification is needed, we'll reach out to you directly via the 
                  email you provided.
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  In the meantime, if you have any questions or need to make updates to your submission, please 
                  contact us at <strong>support@[yourdomain].ca</strong>.
                </p>
              </div>
              
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium text-sm sm:text-base">
                  We're excited to have you join our growing network of trusted Canadian immigration consultants!
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
            Become a Consultant
          </h1>
          <p className="mt-3 sm:mt-5 max-w-xl mx-auto text-base sm:text-lg lg:text-xl text-gray-500 px-4">
            Submit your application to join our team of experts.
          </p>
        </div>
        
        <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Section 1: Personal & Contact Information */}
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
                      placeholder="Enter your mobile phone number"
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
                      City & Province of Residence *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeZones.map((tz, i) => (
                      <option key={i} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

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
                      placeholder="R######"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearOfInitialLicensing" className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Initial Licensing *
                    </label>
                    <Input
                      id="yearOfInitialLicensing"
                      name="yearOfInitialLicensing"
                      type="number"
                      required
                      min="2000"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {membershipStatuses.map((status, i) => (
                      <option key={i} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Required Document Uploads:</h4>
                  
                  <div>
                    <label htmlFor="ciccRegisterScreenshot" className="block text-sm font-medium text-gray-700 mb-2">
                      Screenshot or PDF of CICC Public Register Page *
                    </label>
                    <input
                      id="ciccRegisterScreenshot"
                      name="ciccRegisterScreenshot"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="proofOfGoodStanding" className="block text-sm font-medium text-gray-700 mb-2">
                      Proof of Good Standing (PDF or screenshot from CICC portal) *
                    </label>
                    <input
                      id="proofOfGoodStanding"
                      name="proofOfGoodStanding"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="insuranceCertificate" className="block text-sm font-medium text-gray-700 mb-2">
                      Errors and Omissions Insurance Certificate (PDF) *
                    </label>
                    <input
                      id="insuranceCertificate"
                      name="insuranceCertificate"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="governmentPhotoID" className="block text-sm font-medium text-gray-700 mb-2">
                      Government-issued Photo ID (passport or driver's license) *
                    </label>
                    <input
                      id="governmentPhotoID"
                      name="governmentPhotoID"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Are you affiliated with an immigration firm or operating independently? *
                  </label>
                  <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
                    <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="practiceType"
                        value="independent"
                        checked={formData.practiceType === 'independent'}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-full focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 checked:bg-blue-600 checked:border-blue-600"
                        required
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 select-none">Independent</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="practiceType"
                        value="affiliated"
                        checked={formData.practiceType === 'affiliated'}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-full focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 checked:bg-blue-600 checked:border-blue-600"
                        required
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 select-none">Affiliated</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="businessFirmName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business or Firm Name (if any)
                  </label>
                  <Input
                    id="businessFirmName"
                    name="businessFirmName"
                    type="text"
                    value={formData.businessFirmName}
                    onChange={handleInputChange}
                    placeholder="Enter business or firm name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="websiteLinkedIn" className="block text-sm font-medium text-gray-700 mb-2">
                    Website or LinkedIn (optional)
                  </label>
                  <Input
                    id="websiteLinkedIn"
                    name="websiteLinkedIn"
                    type="url"
                    value={formData.websiteLinkedIn}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com or https://linkedin.com/in/username"
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      id="hasBusinessRegistration"
                      name="hasBusinessRegistration"
                      type="checkbox"
                      checked={formData.hasBusinessRegistration}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                    />
                    <label htmlFor="hasBusinessRegistration" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      Do you hold a valid Canadian business registration number?
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="isIRBAuthorized"
                      name="isIRBAuthorized"
                      type="checkbox"
                      checked={formData.isIRBAuthorized}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                    />
                    <label htmlFor="isIRBAuthorized" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      Are you authorized under IRB (L3-RCIC)?
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="takingPrivateClients"
                      name="takingPrivateClients"
                      type="checkbox"
                      checked={formData.takingPrivateClients}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                    />
                    <label htmlFor="takingPrivateClients" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      Are you currently taking clients in private practice?
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="representsClientsIRCC"
                      name="representsClientsIRCC"
                      type="checkbox"
                      checked={formData.representsClientsIRCC}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                    />
                    <label htmlFor="representsClientsIRCC" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      Do you currently represent clients before IRCC or IRB?
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
                    Check all that apply: *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {expertiseAreas.map((area, i) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          name="areasOfExpertise"
                          value={area}
                          checked={formData.areasOfExpertise.includes(area)}
                          onChange={(e) => handleCheckboxArrayChange('areasOfExpertise', area, e.target.checked)}
                          className="form-checkbox mr-2"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="otherExpertise" className="block text-sm font-medium text-gray-700 mb-2">
                    Other (please specify)
                  </label>
                  <Input
                    id="otherExpertise"
                    name="otherExpertise"
                    type="text"
                    value={formData.otherExpertise}
                    onChange={handleInputChange}
                    placeholder="Specify other areas of expertise"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Languages Spoken */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                  Section 5: Languages Spoken
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map((lang, i) => (
                      <option key={i} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Other Languages (multi-select)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {languages.filter(lang => lang !== formData.primaryLanguage).map((lang, i) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          name="otherLanguages"
                          value={lang}
                          checked={formData.otherLanguages.includes(lang)}
                          onChange={(e) => handleCheckboxArrayChange('otherLanguages', lang, e.target.checked)}
                          className="form-checkbox mr-2"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
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
                    className="form-checkbox"
                  />
                  <label htmlFor="multiLanguageConsultations" className="ml-2 text-sm text-gray-700">
                    Are you comfortable conducting consultations in more than one language?
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
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="confirmLicensedRCIC"
                      checked={formData.confirmLicensedRCIC}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1 mr-3"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I confirm that I am a licensed RCIC in good standing with the CICC. *
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1 mr-3"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree to abide by the platform's Terms of Use, Consultant Guidelines, and the CICC Code of Professional Conduct. *
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToIRPACompliance"
                      checked={formData.agreeToIRPACompliance}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1 mr-3"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I understand that all consultations must comply with IRPA and IRPR. *
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeNoPersonalContact"
                      checked={formData.agreeNoPersonalContact}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1 mr-3"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree not to share personal contact information with clients outside of the platform. *
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="consentToReviews"
                      checked={formData.consentToReviews}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1 mr-3"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I consent to platform-administered session reviews and feedback monitoring. *
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Signature & Submission */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 px-2 sm:px-0">
                  Section 7: Signature & Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div>
                  <label htmlFor="digitalSignature" className="block text-sm font-medium text-gray-700 mb-2">
                    Typed Full Name (acts as digital signature) *
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
                </div>

                <div>
                  <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Submission *
                  </label>
                  <Input
                    id="submissionDate"
                    name="submissionDate"
                    type="date"
                    required
                    value={formData.submissionDate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold mt-6"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Application...
                    </span>
                  ) : (
                    '📋 Submit Application'
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </main>
  );
}
