import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Download, Share2, Mail, CheckCircle, AlertCircle, Send } from 'lucide-react';

const NavajoHousingGrantApp = () => {
  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputStyle = { fontSize: '16px' };
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleInitial: '',
    ssn: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    
    // Address Information
    currentAddress: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',
    
    // Tribal Information
    tribalId: '',
    bloodQuantum: '',
    
    // Housing Information
    currentHousing: '',
    householdSize: '',
    totalIncome: '',
    employmentStatus: '',
    
    // Grant Information
    grantType: '',
    requestedAmount: '',
    projectDescription: ''
  });
  
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Yá\'át\'ééh! I\'m here to help you complete your federal housing grant application. I can answer questions about the forms, explain requirements, and guide you through each step. How can I assist you today?'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  
  const formRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
  // Rate limiting constants
  const MAX_REQUESTS_PER_HOUR = 20;
  const MAX_TOKENS_PER_REQUEST = 150;
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Load rate limit data from localStorage
  useEffect(() => {
    const savedRequestCount = localStorage.getItem('requestCount');
    const savedLastRequestTime = localStorage.getItem('lastRequestTime');
    
    if (savedRequestCount && savedLastRequestTime) {
      const timeSinceLastRequest = Date.now() - parseInt(savedLastRequestTime);
      if (timeSinceLastRequest < RATE_LIMIT_WINDOW) {
        setRequestCount(parseInt(savedRequestCount));
        setLastRequestTime(parseInt(savedLastRequestTime));
      } else {
        // Reset if more than an hour has passed
        localStorage.removeItem('requestCount');
        localStorage.removeItem('lastRequestTime');
      }
    }
  }, [RATE_LIMIT_WINDOW]);
  
  const steps = [
    { id: 1, title: 'Personal Information', icon: '👤' },
    { id: 2, title: 'Address & Tribal Info', icon: '🏠' },
    { id: 3, title: 'Income & Employment', icon: '💼' },
    { id: 4, title: 'Grant Details', icon: '📋' },
    { id: 5, title: 'Review & Submit', icon: '✅' }
  ];
  
  const grantTypes = [
    'NAHASDA (Native American Housing Assistance)',
    'IHBG (Indian Housing Block Grant)',
    'Title VI Loan Guarantee',
    'Section 184 Indian Home Loan Guarantee',
    'Rural Development Section 502 Direct Loan',
    'USDA Rural Repair & Rehabilitation Grant'
  ];
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    // Reset counter if more than an hour has passed
    if (timeSinceLastRequest > RATE_LIMIT_WINDOW) {
      setRequestCount(0);
      setLastRequestTime(now);
      localStorage.removeItem('requestCount');
      localStorage.removeItem('lastRequestTime');
      return true;
    }
    
    // Check if within limits
    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      const timeUntilReset = RATE_LIMIT_WINDOW - timeSinceLastRequest;
      const minutesUntilReset = Math.ceil(timeUntilReset / (60 * 1000));
      setRateLimitMessage(`You've reached the hourly limit of ${MAX_REQUESTS_PER_HOUR} questions. Please try again in ${minutesUntilReset} minutes.`);
      return false;
    }
    
    return true;
  };
  
  const updateRateLimit = () => {
    const newCount = requestCount + 1;
    const now = Date.now();
    
    setRequestCount(newCount);
    setLastRequestTime(now);
    
    localStorage.setItem('requestCount', newCount.toString());
    localStorage.setItem('lastRequestTime', now.toString());
  };
  
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    // Clear any previous rate limit message
    setRateLimitMessage('');
    
    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }
    
    const userMessage = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Create focused system message for housing grants only
      const systemMessage = `You are a specialized AI assistant for the Navajo Housing Grant Application website. Your ONLY purpose is to help Navajo Nation members complete federal housing grant applications.
      
STRICT GUIDELINES:
- ONLY answer questions related to housing grants, federal assistance programs, form completion, eligibility requirements, and Navajo Nation housing resources
- If asked about anything unrelated to housing grants (food, weather, entertainment, general topics, etc.), politely redirect: "I'm specifically designed to help with housing grant applications. Please ask me questions about federal housing assistance, eligibility requirements, or completing your application."
- Keep responses helpful but concise (under 150 words)
- Be culturally respectful and encouraging
- Focus on practical, actionable guidance

Current user's form progress:
- Step ${currentStep} of 5
- Form data: ${JSON.stringify(formData, null, 2)}

User question: ${userMessage}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          max_tokens: MAX_TOKENS_PER_REQUEST,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      
      // Update rate limit after successful request
      updateRateLimit();
      
    } catch (error) {
      console.error('AI Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try your question again in a moment.' 
      }]);
    }
    
    setIsLoading(false);
  };
  
  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Federal Housing Grant Application</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .value { margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Federal Housing Grant Application</h1>
            <h2>Native American Housing Assistance Program</h2>
          </div>
          
          <div class="section">
            <h3>Personal Information</h3>
            <div class="field"><span class="label">Name:</span><span class="value">${formData.firstName} ${formData.middleInitial} ${formData.lastName}</span></div>
            <div class="field"><span class="label">SSN:</span><span class="value">${formData.ssn}</span></div>
            <div class="field"><span class="label">Date of Birth:</span><span class="value">${formData.dateOfBirth}</span></div>
            <div class="field"><span class="label">Phone:</span><span class="value">${formData.phone}</span></div>
            <div class="field"><span class="label">Email:</span><span class="value">${formData.email}</span></div>
          </div>
          
          <div class="section">
            <h3>Address Information</h3>
            <div class="field"><span class="label">Address:</span><span class="value">${formData.currentAddress}</span></div>
            <div class="field"><span class="label">City:</span><span class="value">${formData.city}</span></div>
            <div class="field"><span class="label">State:</span><span class="value">${formData.state}</span></div>
            <div class="field"><span class="label">ZIP Code:</span><span class="value">${formData.zipCode}</span></div>
            <div class="field"><span class="label">County:</span><span class="value">${formData.county}</span></div>
          </div>
          
          <div class="section">
            <h3>Tribal Information</h3>
            <div class="field"><span class="label">Tribal ID:</span><span class="value">${formData.tribalId}</span></div>
            <div class="field"><span class="label">Blood Quantum:</span><span class="value">${formData.bloodQuantum}</span></div>
          </div>
          
          <div class="section">
            <h3>Housing & Income Information</h3>
            <div class="field"><span class="label">Current Housing:</span><span class="value">${formData.currentHousing}</span></div>
            <div class="field"><span class="label">Household Size:</span><span class="value">${formData.householdSize}</span></div>
            <div class="field"><span class="label">Total Annual Income:</span><span class="value">${formData.totalIncome}</span></div>
            <div class="field"><span class="label">Employment Status:</span><span class="value">${formData.employmentStatus}</span></div>
          </div>
          
          <div class="section">
            <h3>Grant Information</h3>
            <div class="field"><span class="label">Grant Type:</span><span class="value">${formData.grantType}</span></div>
            <div class="field"><span class="label">Requested Amount:</span><span class="value">${formData.requestedAmount}</span></div>
            <div class="field"><span class="label">Project Description:</span><span class="value">${formData.projectDescription}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const shareForm = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Federal Housing Grant Application',
          text: 'My completed federal housing grant application',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert('Application link copied to clipboard!');
    }
  };
  
  const emailForm = () => {
    const subject = encodeURIComponent('Federal Housing Grant Application');
    const body = encodeURIComponent(`
Please find my completed federal housing grant application details below:

Name: ${formData.firstName} ${formData.lastName}
Grant Type: ${formData.grantType}
Requested Amount: ${formData.requestedAmount}

Complete application can be viewed at: ${window.location.href}
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial</label>
                <input
                  type="text"
                  maxLength="1"
                  value={formData.middleInitial}
                  onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number *</label>
                <input
                  type="text"
                  placeholder="XXX-XX-XXXX"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Address & Tribal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
                <input
                  type="text"
                  value={formData.currentAddress}
                  onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                >
                  <option value="">Select State</option>
                  <option value="AZ">Arizona</option>
                  <option value="NM">New Mexico</option>
                  <option value="UT">Utah</option>
                  <option value="CO">Colorado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                <input
                  type="text"
                  value={formData.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tribal ID Number *</label>
                <input
                  type="text"
                  value={formData.tribalId}
                  onChange={(e) => handleInputChange('tribalId', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Quantum *</label>
                <input
                  type="text"
                  placeholder="e.g., 1/2, 1/4, 4/4"
                  value={formData.bloodQuantum}
                  onChange={(e) => handleInputChange('bloodQuantum', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Income & Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Housing Situation *</label>
                <select
                  value={formData.currentHousing}
                  onChange={(e) => handleInputChange('currentHousing', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Housing Situation</option>
                  <option value="Renting">Renting</option>
                  <option value="Own with mortgage">Own with mortgage</option>
                  <option value="Own without mortgage">Own without mortgage</option>
                  <option value="Living with family">Living with family</option>
                  <option value="Homeless">Homeless</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Household Size *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.householdSize}
                  onChange={(e) => handleInputChange('householdSize', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Annual Household Income *</label>
                <input
                  type="number"
                  placeholder="$"
                  value={formData.totalIncome}
                  onChange={(e) => handleInputChange('totalIncome', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Employment Status</option>
                  <option value="Employed full-time">Employed full-time</option>
                  <option value="Employed part-time">Employed part-time</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Retired">Retired</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Grant Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grant Type *</label>
                <select
                  value={formData.grantType}
                  onChange={(e) => handleInputChange('grantType', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Grant Type</option>
                  {grantTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount *</label>
                <input
                  type="number"
                  placeholder="$"
                  value={formData.requestedAmount}
                  onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
                <textarea
                  rows="4"
                  placeholder="Describe your housing project, including what you plan to build, repair, or purchase..."
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  className={inputClassName}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Your Application</h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800">Personal Information</h4>
                <p>{formData.firstName} {formData.middleInitial} {formData.lastName}</p>
                <p>DOB: {formData.dateOfBirth}</p>
                <p>Phone: {formData.phone}</p>
                <p>Email: {formData.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Address</h4>
                <p>{formData.currentAddress}</p>
                <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                <p>County: {formData.county}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Tribal Information</h4>
                <p>Tribal ID: {formData.tribalId}</p>
                <p>Blood Quantum: {formData.bloodQuantum}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Housing & Income</h4>
                <p>Current Housing: {formData.currentHousing}</p>
                <p>Household Size: {formData.householdSize}</p>
                <p>Annual Income: ${formData.totalIncome}</p>
                <p>Employment: {formData.employmentStatus}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Grant Request</h4>
                <p>Type: {formData.grantType}</p>
                <p>Amount: ${formData.requestedAmount}</p>
                <p>Description: {formData.projectDescription}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                Download PDF
              </button>
              <button
                onClick={shareForm}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Share2 size={20} />
                Share Application
              </button>
              <button
                onClick={emailForm}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Mail size={20} />
                Email Application
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-red-800 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Navajo Nation Housing Grant Assistant</h1>
          <p className="text-red-100">Welcome! Complete your federal housing grant application with AI assistance</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Form */}
          <div className="flex-1 min-w-0">
            {/* Progress Steps */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 lg:mb-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6 overflow-x-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                      currentStep >= step.id ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.id ? <CheckCircle size={16} className="sm:w-5 sm:h-5" /> : <span className="text-xs sm:text-base">{step.icon}</span>}
                    </div>
                    <div className="ml-1 sm:ml-2 hidden md:block">
                      <p className={`text-xs sm:text-sm font-medium ${
                        currentStep >= step.id ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${
                        currentStep >= step.id ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 w-4 sm:w-8 md:w-16 mx-1 sm:mx-2 ${
                        currentStep > step.id ? 'bg-red-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
              <div ref={formRef}>
                {renderStep()}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 lg:mt-8">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  disabled={currentStep === 5}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {currentStep === 5 ? 'Complete' : 'Next'}
                </button>
              </div>
            </div>
          </div>
          
          {/* AI Chat Assistant */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md flex flex-col max-w-full">
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center gap-2 text-red-600 font-semibold w-full justify-center lg:justify-start text-sm sm:text-base"
                >
                  <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                  AI Assistant {showChat ? '▼' : '▶'}
                </button>
                <div className="text-xs text-gray-500 mt-1 text-center lg:text-left">
                  {requestCount}/{MAX_REQUESTS_PER_HOUR} questions used this hour
                </div>
              </div>
              
              {showChat && (
                <>
                  <div ref={chatMessagesRef} className="p-3 sm:p-4 overflow-y-auto h-60 sm:h-64 lg:h-96 space-y-3 sm:space-y-4 max-w-full min-h-0 flex-shrink-0">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-2 sm:p-3 rounded-lg max-w-full ${
                          message.role === 'user'
                            ? 'bg-red-100 ml-2 sm:ml-4'
                            : 'bg-gray-100 mr-2 sm:mr-4'
                        }`}
                      >
                        <p className="text-xs sm:text-sm break-words">{message.content}</p>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="bg-gray-100 mr-2 sm:mr-4 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Assistant is typing...</p>
                      </div>
                    )}
                    {rateLimitMessage && (
                      <div className="bg-yellow-100 border border-yellow-400 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-yellow-800">{rateLimitMessage}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex gap-2 max-w-full">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about housing grants..."
                        className="flex-1 min-w-0 px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                        style={{ fontSize: '16px' }}
                        disabled={isLoading || requestCount >= MAX_REQUESTS_PER_HOUR}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !currentMessage.trim() || requestCount >= MAX_REQUESTS_PER_HOUR}
                        className="px-2 sm:px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Send size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Information Panel */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• This application assists with federal housing grant paperwork for Navajo Nation members</li>
                <li>• All information is kept secure and private</li>
                <li>• The AI assistant can help explain requirements and eligibility (limited to {MAX_REQUESTS_PER_HOUR} questions per hour)</li>
                <li>• You can save, download, or email your completed application</li>
                <li>• For technical support, contact your local housing authority</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavajoHousingGrantApp;