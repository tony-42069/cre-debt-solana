'use client'

import { FC } from 'react'
import { FileText, Upload, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'

interface PropertyFormData {
  propertyDeed?: File
  titleInsurance?: File
  survey?: File
  environmentalReport?: File
  additionalDocs?: File[]
}

interface PropertyDocumentationStepProps {
  data: Partial<PropertyFormData>
  errors: Record<string, string>
  onUpdate: (updates: Partial<PropertyFormData>) => void
  onNext: () => void
  onPrevious: () => void
}

const REQUIRED_DOCUMENTS = [
  {
    key: 'propertyDeed' as keyof PropertyFormData,
    label: 'Property Deed',
    description: 'Original property deed or title document',
    required: true,
    accept: '.pdf,.doc,.docx'
  },
  {
    key: 'titleInsurance' as keyof PropertyFormData,
    label: 'Title Insurance',
    description: 'Current title insurance policy',
    required: false,
    accept: '.pdf'
  },
  {
    key: 'survey' as keyof PropertyFormData,
    label: 'Property Survey',
    description: 'Recent property survey (within 5 years)',
    required: false,
    accept: '.pdf'
  },
  {
    key: 'environmentalReport' as keyof PropertyFormData,
    label: 'Environmental Report',
    description: 'Phase I environmental assessment',
    required: false,
    accept: '.pdf'
  }
]

export const PropertyDocumentationStep: FC<PropertyDocumentationStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext
}) => {
  const handleFileChange = (key: keyof PropertyFormData, file: File | null) => {
    if (file) {
      onUpdate({ [key]: file })
    }
  }

  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentAdditional = data.additionalDocs || []
    onUpdate({ additionalDocs: [...currentAdditional, ...files] })
  }

  const removeAdditionalFile = (index: number) => {
    const currentAdditional = data.additionalDocs || []
    const updated = currentAdditional.filter((_, i) => i !== index)
    onUpdate({ additionalDocs: updated })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isRequiredDocumentUploaded = (key: keyof PropertyFormData) => {
    const doc = REQUIRED_DOCUMENTS.find(d => d.key === key)
    if (!doc?.required) return true
    return !!data[key]
  }

  const allRequiredDocumentsUploaded = REQUIRED_DOCUMENTS
    .filter(doc => doc.required)
    .every(doc => !!data[doc.key])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Documentation
        </h2>
        <p className="text-gray-600">
          Upload required documents for property verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Documents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Required Documents
          </h3>

          {REQUIRED_DOCUMENTS.map((doc) => (
            <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {isRequiredDocumentUploaded(doc.key) ? (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    ) : doc.required ? (
                      <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{doc.description}</p>

                  {/* File Upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept={doc.accept}
                      onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                      className="hidden"
                      id={`file-${doc.key}`}
                    />
                    <label
                      htmlFor={`file-${doc.key}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 mb-1">
                        {data[doc.key] ? 'Replace file' : 'Choose file'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doc.accept.replace(/\./g, '').toUpperCase()} files only
                      </span>
                    </label>
                  </div>

                  {/* Uploaded File Display */}
                  {data[doc.key] && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {(data[doc.key] as File).name}
                        </span>
                        <span className="text-xs text-green-600 ml-2">
                          ({((data[doc.key] as File).size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {errors[doc.key] && (
                    <p className="mt-2 text-sm text-red-600">{errors[doc.key]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Documents */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Additional Documents (Optional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload any additional documents that may support your property valuation or loan application
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleAdditionalFileChange}
              className="hidden"
              id="additional-files"
            />
            <label
              htmlFor="additional-files"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 mb-1">Add additional files</span>
              <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG</span>
            </label>
          </div>

          {/* Additional Files List */}
          {data.additionalDocs && data.additionalDocs.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Uploaded Files:</h4>
              {data.additionalDocs.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Document Security & Processing
              </h4>
              <p className="text-sm text-blue-700">
                All documents are encrypted and securely stored. Our team will review them within 24 hours
                as part of the property verification process.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!allRequiredDocumentsUploaded}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center ${
              allRequiredDocumentsUploaded
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Review & Submit
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
