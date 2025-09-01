/**
 * Validation Service - Comprehensive input validation for the Agile Assistant
 * 
 * Provides consistent validation for all API endpoints with:
 * - Language-consistent field definitions (German labels, English keys)
 * - Input sanitization with automatic trimming
 * - Comprehensive error and warning messages
 * - Support for multiple use cases (backlog, pitchdeck, etc.)
 */

// Required fields for backlog generation
const BACKLOG_REQUIRED_FIELDS = [
  { key: "q1_segment", label: "Target Segment/Users", hint: "e.g. New EU shop customers", minLength: 5 },
  { key: "q2_problem", label: "Problem / JTBD", hint: "Specific problem/job to be done", minLength: 10 },
  { key: "q3_behavior_change", label: "Behavior Change (Outcome)", hint: "e.g. more completed checkouts", minLength: 10 },
  { key: "q4_metrics", label: "Measurement (Baseline/Target)", hint: "e.g. Abandonment rate 65% → 45%", minLength: 5 },
  { key: "q5_constraints", label: "Constraints", hint: "Team/Timeline/Compliance/Tech", minLength: 5 },
  { key: "q6_assets", label: "Assets/Tech", hint: "Stripe, Feature Flags, Analytics etc.", minLength: 3 },
  { key: "q7_horizon", label: "Time Horizon & Rollout", hint: "Quarter, Pilot % via flags", minLength: 3 },
];

// Required fields for pitchdeck generation  
const PITCHDECK_REQUIRED_FIELDS = [
  { key: "project_name", label: "Project Name", hint: "Name of your startup/product", minLength: 2 },
  { key: "elevator_pitch", label: "Elevator Pitch", hint: "2-4 sentences about startup, target audience and problem", minLength: 20 },
];

// Optional fields for pitchdeck (enhance quality but not required)
const PITCHDECK_OPTIONAL_FIELDS = [
  { key: "geo_focus", label: "Geographic Focus", hint: "Initial markets and expansion strategy", minLength: 5 },
  { key: "time_horizon", label: "Time Horizon", hint: "Main goals and milestones", minLength: 5 },
  { key: "target_audience", label: "Target Audience for Pitch", hint: "Type of investors", minLength: 5 },
];

// Valid options for various fields
const VALID_USECASES = ["backlog", "roadmap", "estimation", "retro", "pitchdeck"];
const VALID_PROVIDERS = ["gpt", "claude"];
const VALID_FORMATS = ["json", "markdown"];
const VALID_STRUCTURES = ["epics_stories", "only_stories"];

/**
 * Sanitize input string by trimming whitespace and handling null/undefined
 * @param {any} value - Input value to sanitize
 * @returns {string} - Cleaned string value
 */
function sanitizeInput(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  // Disallow objects/arrays/dates/symbols to avoid accidental passes like "[object Object]"
  return "";
}

/**
 * Validate the main request body
 * @param {object} body - Request body to validate
 * @returns {string[]} - Array of error messages
 */
function validateRequest(body) {
  const errors = [];
  
  if (!body || typeof body !== "object") {
    errors.push("Request body must be a valid object");
    return errors;
  }

  // Validate usecase (required)
  const usecase = sanitizeInput(body.usecase);
  if (!usecase) {
    errors.push("usecase is required");
  } else if (!VALID_USECASES.includes(usecase)) {
    errors.push(`usecase must be one of: ${VALID_USECASES.join(", ")}`);
  }

  // Validate provider (optional)
  const provider = sanitizeInput(body.provider);
  if (provider && !VALID_PROVIDERS.includes(provider)) {
    errors.push(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`);
  }

  // Validate format (optional)
  const format = sanitizeInput(body.format);
  if (format && !VALID_FORMATS.includes(format)) {
    errors.push(`format must be one of: ${VALID_FORMATS.join(", ")}`);
  }

  // Validate structure (optional)
  const structure = sanitizeInput(body.structure);
  if (structure && !VALID_STRUCTURES.includes(structure)) {
    errors.push(`structure must be one of: ${VALID_STRUCTURES.join(", ")}`);
  }

  // Validate answers object
  if (!body.answers) {
    errors.push("answers object is required");
  } else if (typeof body.answers !== "object") {
    errors.push("answers must be an object");
  }

  return errors;
}

/**
 * Validate answers completeness and quality based on usecase
 * @param {object} answers - Answers object to validate
 * @param {string} usecase - Use case type (backlog, pitchdeck, etc.)
 * @returns {object} - Validation result with missing fields and warnings
 */
function validateAnswers(answers, usecase = "backlog") {
  const missing = [];
  const warnings = [];
  
  if (!answers || typeof answers !== "object") {
    return { 
      missing: [{ label: "Answers", hint: "Complete answers object is required" }], 
      warnings 
    };
  }

  // Get required fields based on usecase
  let requiredFields = BACKLOG_REQUIRED_FIELDS;
  let optionalFields = [];
  
  if (usecase === "pitchdeck") {
    requiredFields = PITCHDECK_REQUIRED_FIELDS;
    optionalFields = PITCHDECK_OPTIONAL_FIELDS;
  }

  // Validate required fields with consistent input sanitization
  requiredFields.forEach((field) => {
    const value = sanitizeInput(answers[field.key]);
    
    if (!value) {
      missing.push({ label: field.label, hint: field.hint });
    } else if (value.length < field.minLength) {
      warnings.push(
        `${field.label}: Response seems too short (${value.length} chars, minimum ${field.minLength})`
      );
    }
  });

  // Check optional fields for quality warnings
  optionalFields.forEach((field) => {
    const value = sanitizeInput(answers[field.key]);
    
    if (value && value.length < field.minLength) {
      warnings.push(
        `${field.label}: Response seems too short (${value.length} chars, minimum ${field.minLength})`
      );
    }
  });

  return { missing, warnings };
}

/**
 * Validate guidelines if provided
 * @param {string} guidelines - Guidelines string to validate
 * @returns {string[]} - Array of warning messages
 */
function validateGuidelines(guidelines) {
  const warnings = [];
  
  const sanitizedGuidelines = sanitizeInput(guidelines);
  
  if (sanitizedGuidelines) {
    if (sanitizedGuidelines.length > 500) {
      warnings.push(
        "Guidelines are very long - consider keeping them concise for better AI processing"
      );
    }
    
    // Check for potentially problematic content
    const problematicPatterns = [
      /ignore.{1,20}(instruction|prompt|system)/i,
      /override.{1,20}(instruction|prompt|system)/i,
      /(jailbreak|hack|exploit)/i
    ];
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(sanitizedGuidelines)) {
        warnings.push(
          "Guidelines contain potentially problematic instructions that may interfere with AI processing"
        );
        break;
      }
    }
  }
  
  return warnings;
}

/**
 * Comprehensive validation of the entire request
 * @param {object} body - Request body to validate
 * @returns {object} - Complete validation result
 */
function validateAll(body) {
  const requestErrors = validateRequest(body);
  if (requestErrors.length > 0) {
    return { valid: false, errors: requestErrors, warnings: [] };
  }
  
  const { missing, warnings: answerWarnings } = validateAnswers(
    body.answers, 
    sanitizeInput(body.usecase)
  );
  const guidelineWarnings = validateGuidelines(body.guidelines);
  
  return {
    valid: missing.length === 0,
    errors: missing.map(m => `Missing required field: ${m.label} (${m.hint})`),
    warnings: [...answerWarnings, ...guidelineWarnings],
    missingFields: missing
  };
}

// Export all public functions and constants with consistent pattern
export {
  // Constants
  BACKLOG_REQUIRED_FIELDS,
  PITCHDECK_REQUIRED_FIELDS, 
  PITCHDECK_OPTIONAL_FIELDS,
  VALID_USECASES,
  VALID_PROVIDERS,
  VALID_FORMATS,
  VALID_STRUCTURES,
  
  // Functions
  sanitizeInput,
  validateRequest,
  validateAnswers,
  validateGuidelines,
  validateAll
};
