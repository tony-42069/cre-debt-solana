// Property registration form validation utilities

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface PropertyFormData {
  // Step 1: Property Details
  propertyType: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  // Step 2: Valuation
  appraisedValue: number
  valuationDate: string
  valuationMethod: string
  valuationProvider: string
  valuationReport?: File

  // Step 3: Documentation
  propertyDeed?: File
  titleInsurance?: File
  survey?: File
  environmentalReport?: File
  additionalDocs?: File[]
}

// Property type validation
export const PROPERTY_TYPES = [
  'OFFICE', 'RETAIL', 'INDUSTRIAL', 'MULTIFAMILY',
  'HOSPITALITY', 'LAND', 'SPECIALTY'
] as const

export type PropertyType = typeof PROPERTY_TYPES[number]

// US States validation
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const

// Valuation methods validation
export const VALUATION_METHODS = [
  'APPRAISAL', 'AVM', 'INCOME', 'SALES_COMPARISON', 'COST_APPROACH'
] as const

export type ValuationMethod = typeof VALUATION_METHODS[number]

// File validation constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx'],
  images: ['.jpg', '.jpeg', '.png'],
  all: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
}

// Step 1: Property Details Validation
export const validatePropertyDetails = (data: Partial<PropertyFormData>): ValidationResult => {
  const errors: Record<string, string> = {}

  // Property Type validation
  if (!data.propertyType) {
    errors.propertyType = 'Property type is required'
  } else if (!PROPERTY_TYPES.includes(data.propertyType as PropertyType)) {
    errors.propertyType = 'Invalid property type selected'
  }

  // Address validation
  if (!data.address) {
    errors.address = 'Street address is required'
  } else if (data.address.length < 5) {
    errors.address = 'Please enter a complete street address'
  } else if (data.address.length > 200) {
    errors.address = 'Address is too long (maximum 200 characters)'
  }

  // City validation
  if (!data.city) {
    errors.city = 'City is required'
  } else if (data.city.length < 2) {
    errors.city = 'City name is too short'
  } else if (data.city.length > 100) {
    errors.city = 'City name is too long (maximum 100 characters)'
  } else if (!/^[a-zA-Z\s\-']+$/.test(data.city)) {
    errors.city = 'City name contains invalid characters'
  }

  // State validation
  if (!data.state) {
    errors.state = 'State is required'
  } else if (!US_STATES.includes(data.state as any)) {
    errors.state = 'Please select a valid US state'
  }

  // ZIP Code validation
  if (!data.zipCode) {
    errors.zipCode = 'ZIP code is required'
  } else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
    errors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
  }

  // Country validation
  if (!data.country) {
    errors.country = 'Country is required'
  } else if (data.country !== 'US') {
    errors.country = 'Currently only US properties are supported'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Step 2: Property Valuation Validation
export const validatePropertyValuation = (data: Partial<PropertyFormData>): ValidationResult => {
  const errors: Record<string, string> = {}

  // Appraised Value validation
  if (!data.appraisedValue || data.appraisedValue <= 0) {
    errors.appraisedValue = 'Valid appraised value is required'
  } else if (data.appraisedValue < 100000) {
    errors.appraisedValue = 'Minimum property value is $100,000'
  } else if (data.appraisedValue > 100000000) { // $100M
    errors.appraisedValue = 'Property value exceeds maximum limit of $100,000,000'
  }

  // Valuation Date validation
  if (!data.valuationDate) {
    errors.valuationDate = 'Valuation date is required'
  } else {
    const valuationDate = new Date(data.valuationDate)
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    if (valuationDate > now) {
      errors.valuationDate = 'Valuation date cannot be in the future'
    } else if (valuationDate < oneYearAgo) {
      errors.valuationDate = 'Valuation must be within the last 12 months'
    }
  }

  // Valuation Method validation
  if (!data.valuationMethod) {
    errors.valuationMethod = 'Valuation method is required'
  } else if (!VALUATION_METHODS.includes(data.valuationMethod as ValuationMethod)) {
    errors.valuationMethod = 'Invalid valuation method selected'
  }

  // Valuation Provider validation
  if (!data.valuationProvider) {
    errors.valuationProvider = 'Valuation provider is required'
  } else if (data.valuationProvider.length < 2) {
    errors.valuationProvider = 'Valuation provider name is too short'
  } else if (data.valuationProvider.length > 200) {
    errors.valuationProvider = 'Valuation provider name is too long'
  }

  // Optional valuation report validation
  if (data.valuationReport) {
    const fileErrors = validateFile(data.valuationReport, ALLOWED_FILE_TYPES.documents)
    if (fileErrors.length > 0) {
      errors.valuationReport = fileErrors[0]
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Step 3: Documentation Validation
export const validatePropertyDocumentation = (data: Partial<PropertyFormData>): ValidationResult => {
  const errors: Record<string, string> = {}

  // Required: Property Deed
  if (!data.propertyDeed) {
    errors.propertyDeed = 'Property deed is required'
  } else {
    const fileErrors = validateFile(data.propertyDeed, ALLOWED_FILE_TYPES.documents)
    if (fileErrors.length > 0) {
      errors.propertyDeed = fileErrors[0]
    }
  }

  // Optional documents validation
  const optionalDocs = [
    { key: 'titleInsurance' as keyof PropertyFormData, file: data.titleInsurance },
    { key: 'survey' as keyof PropertyFormData, file: data.survey },
    { key: 'environmentalReport' as keyof PropertyFormData, file: data.environmentalReport }
  ]

  optionalDocs.forEach(({ key, file }) => {
    if (file) {
      const fileErrors = validateFile(file, ALLOWED_FILE_TYPES.documents)
      if (fileErrors.length > 0) {
        errors[key] = fileErrors[0]
      }
    }
  })

  // Additional documents validation
  if (data.additionalDocs) {
    data.additionalDocs.forEach((file, index) => {
      const fileErrors = validateFile(file, ALLOWED_FILE_TYPES.all)
      if (fileErrors.length > 0) {
        errors[`additionalDocs_${index}`] = `${file.name}: ${fileErrors[0]}`
      }
    })
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Complete form validation
export const validatePropertyForm = (data: Partial<PropertyFormData>): ValidationResult => {
  const step1Validation = validatePropertyDetails(data)
  const step2Validation = validatePropertyValuation(data)
  const step3Validation = validatePropertyDocumentation(data)

  const allErrors = {
    ...step1Validation.errors,
    ...step2Validation.errors,
    ...step3Validation.errors
  }

  return {
    isValid: step1Validation.isValid && step2Validation.isValid && step3Validation.isValid,
    errors: allErrors
  }
}

// File validation utility
export const validateFile = (file: File, allowedTypes: string[]): string[] => {
  const errors: string[] = []

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
  }

  // File type validation
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }

  // File name validation
  if (file.name.length > 255) {
    errors.push('File name is too long (maximum 255 characters)')
  }

  return errors
}

// Utility functions for form handling
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const calculateMaxLoanAmount = (appraisedValue: number): number => {
  return Math.floor(appraisedValue * 0.9) // 90% LTV
}

export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number = 0.08,
  termMonths: number = 360
): number => {
  const monthlyRate = annualRate / 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
         (Math.pow(1 + monthlyRate, termMonths) - 1)
}

// Property type labels for display
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  OFFICE: 'Office Building',
  RETAIL: 'Retail/Commercial',
  INDUSTRIAL: 'Industrial/Warehouse',
  MULTIFAMILY: 'Multi-Family Residential',
  HOSPITALITY: 'Hotel/Hospitality',
  LAND: 'Land/Development',
  SPECIALTY: 'Specialty/Other'
}

// Valuation method labels for display
export const VALUATION_METHOD_LABELS: Record<ValuationMethod, string> = {
  APPRAISAL: 'Professional Appraisal',
  AVM: 'Automated Valuation Model (AVM)',
  INCOME: 'Income Capitalization',
  SALES_COMPARISON: 'Sales Comparison Approach',
  COST_APPROACH: 'Cost Approach'
}
