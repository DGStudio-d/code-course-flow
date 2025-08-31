// File validation utilities for document upload

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    extension: string;
    sizeFormatted: string;
  };
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxNameLength?: number;
  requireContent?: boolean;
}

// Default validation options
const DEFAULT_OPTIONS: Required<FileValidationOptions> = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/pdf', // .pdf
    'text/plain', // .txt
    'application/rtf', // .rtf
  ],
  allowedExtensions: ['.docx', '.doc', '.pdf', '.txt', '.rtf'],
  maxNameLength: 255,
  requireContent: true,
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
};

/**
 * Check if file type is supported for quiz creation
 */
export const isSupportedFileType = (file: File): boolean => {
  const extension = getFileExtension(file.name);
  return DEFAULT_OPTIONS.allowedExtensions.includes(extension) || 
         DEFAULT_OPTIONS.allowedTypes.includes(file.type);
};

/**
 * Validate uploaded file for quiz document parsing
 */
export const validateQuizDocument = (
  file: File, 
  options: Partial<FileValidationOptions> = {}
): FileValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const extension = getFileExtension(file.name);
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    sizeFormatted: formatFileSize(file.size),
  };

  // Check file size
  if (file.size > opts.maxSize) {
    errors.push(`File size (${fileInfo.sizeFormatted}) exceeds maximum allowed size (${formatFileSize(opts.maxSize)})`);
  }

  // Check if file is empty
  if (opts.requireContent && file.size === 0) {
    errors.push('File appears to be empty');
  }

  // Check file type and extension
  const isValidType = opts.allowedTypes.includes(file.type);
  const isValidExtension = opts.allowedExtensions.includes(extension);
  
  if (!isValidType && !isValidExtension) {
    errors.push(`File type not supported. Allowed types: ${opts.allowedExtensions.join(', ')}`);
  }

  // Check filename length
  if (file.name.length > opts.maxNameLength) {
    errors.push(`Filename too long (${file.name.length} characters). Maximum allowed: ${opts.maxNameLength}`);
  }

  // Check for special characters in filename that might cause issues
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(file.name)) {
    warnings.push('Filename contains special characters that might cause issues');
  }

  // File type specific validations
  if (extension === '.pdf') {
    warnings.push('PDF files may have limited text extraction capabilities');
  }

  if (extension === '.txt') {
    warnings.push('Plain text files may require more structured formatting for optimal parsing');
  }

  // Size warnings
  if (file.size < 1024) { // Less than 1KB
    warnings.push('File seems very small and may not contain enough content for a quiz');
  }

  if (file.size > 5 * 1024 * 1024) { // Larger than 5MB
    warnings.push('Large files may take longer to process');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo,
  };
};

/**
 * Validate multiple files for batch upload
 */
export const validateMultipleFiles = (
  files: File[],
  options: Partial<FileValidationOptions> = {}
): { results: FileValidationResult[]; overallValid: boolean } => {
  const results = files.map(file => validateQuizDocument(file, options));
  const overallValid = results.every(result => result.isValid);
  
  return { results, overallValid };
};

/**
 * Check if file appears to be a quiz document based on content hints
 */
export const analyzeFileForQuizContent = async (file: File): Promise<{
  likelyContainsQuestions: boolean;
  estimatedQuestionCount: number;
  detectedPatterns: string[];
  confidence: 'low' | 'medium' | 'high';
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        resolve({
          likelyContainsQuestions: false,
          estimatedQuestionCount: 0,
          detectedPatterns: [],
          confidence: 'low'
        });
        return;
      }

      const detectedPatterns: string[] = [];
      let estimatedQuestionCount = 0;

      // Look for question patterns
      const questionPatterns = [
        /\b\d+[\.\)]\s+.+\?/g, // "1. What is...?"
        /^.+\?$/gm, // Lines ending with question marks
        /[A-D][\)\.]?\s+.+/g, // Multiple choice options "A) option"
        /_{3,}/g, // Fill in the blank underscores
        /\btrue\b.*\bfalse\b/gi, // True/false questions
        /\bexplain\b|\bdescribe\b|\bdiscuss\b/gi, // Essay question keywords
      ];

      questionPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          switch (index) {
            case 0:
              detectedPatterns.push('Numbered questions');
              estimatedQuestionCount += matches.length;
              break;
            case 1:
              detectedPatterns.push('Question marks');
              estimatedQuestionCount += Math.min(matches.length, 50); // Cap to avoid over-counting
              break;
            case 2:
              detectedPatterns.push('Multiple choice options');
              break;
            case 3:
              detectedPatterns.push('Fill-in-the-blank');
              estimatedQuestionCount += matches.length;
              break;
            case 4:
              detectedPatterns.push('True/False questions');
              estimatedQuestionCount += matches.length;
              break;
            case 5:
              detectedPatterns.push('Essay questions');
              estimatedQuestionCount += matches.length;
              break;
          }
        }
      });

      // Determine confidence level
      let confidence: 'low' | 'medium' | 'high' = 'low';
      if (detectedPatterns.length >= 3) {
        confidence = 'high';
      } else if (detectedPatterns.length >= 2) {
        confidence = 'medium';
      }

      resolve({
        likelyContainsQuestions: detectedPatterns.length > 0,
        estimatedQuestionCount: Math.max(estimatedQuestionCount, 0),
        detectedPatterns,
        confidence
      });
    };

    reader.onerror = () => {
      resolve({
        likelyContainsQuestions: false,
        estimatedQuestionCount: 0,
        detectedPatterns: [],
        confidence: 'low'
      });
    };

    // Only analyze text files directly
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For other file types, we can't easily analyze content in the browser
      resolve({
        likelyContainsQuestions: true, // Assume it might contain questions
        estimatedQuestionCount: 0,
        detectedPatterns: ['Document format requires server-side analysis'],
        confidence: 'medium'
      });
    }
  });
};

/**
 * Generate file upload recommendations based on validation results
 */
export const generateUploadRecommendations = (
  validationResult: FileValidationResult
): string[] => {
  const recommendations: string[] = [];
  
  if (!validationResult.isValid) {
    recommendations.push('Please fix the validation errors before uploading');
  }

  if (validationResult.fileInfo.extension === '.pdf') {
    recommendations.push('Consider converting PDF to Word format for better text extraction');
  }

  if (validationResult.fileInfo.size > 5 * 1024 * 1024) {
    recommendations.push('Large files may take longer to process - please be patient');
  }

  if (validationResult.fileInfo.extension === '.txt') {
    recommendations.push('Ensure your text file follows a clear question format for best results');
  }

  if (validationResult.warnings.length > 0) {
    recommendations.push('Review the warnings to ensure optimal processing');
  }

  return recommendations;
};

/**
 * Create a safe filename for download/storage
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters
  const sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Ensure filename isn't too long
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    const extension = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    return nameWithoutExt.substring(0, maxLength - extension.length) + extension;
  }
  
  return sanitized;
};

/**
 * Check if browser supports file drag and drop
 */
export const supportsDragAndDrop = (): boolean => {
  const div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 
         'FormData' in window && 
         'FileReader' in window;
};

/**
 * Estimate processing time based on file size and type
 */
export const estimateProcessingTime = (file: File): {
  estimatedSeconds: number;
  displayText: string;
} => {
  const sizeInMB = file.size / (1024 * 1024);
  let baseTime = 5; // Base 5 seconds
  
  // Add time based on file size
  baseTime += Math.ceil(sizeInMB * 2); // 2 seconds per MB
  
  // Add time based on file type complexity
  const extension = getFileExtension(file.name);
  switch (extension) {
    case '.pdf':
      baseTime += 10; // PDFs take longer to parse
      break;
    case '.docx':
      baseTime += 5; // DOCX files need unzipping and XML parsing
      break;
    case '.doc':
      baseTime += 8; // Legacy format is more complex
      break;
    case '.txt':
      baseTime += 2; // Plain text is fastest
      break;
  }
  
  const estimatedSeconds = Math.min(Math.max(baseTime, 5), 120); // Between 5 seconds and 2 minutes
  
  let displayText: string;
  if (estimatedSeconds < 30) {
    displayText = 'Less than 30 seconds';
  } else if (estimatedSeconds < 60) {
    displayText = 'About 1 minute';
  } else {
    displayText = `About ${Math.ceil(estimatedSeconds / 60)} minutes`;
  }
  
  return { estimatedSeconds, displayText };
};