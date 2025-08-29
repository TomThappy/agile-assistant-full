/**
 * Validation Service - Comprehensive input validation for the Agile Assistant
 */

// Required fields for backlog generation
export const REQUIRED_FIELDS = [
  { key: "q1_segment", label: "Ziel-Segment/Nutzer", hint: "z. B. Neukunden EU-Shop", minLength: 5 },
  { key: "q2_problem", label: "Problem / JTBD", hint: "konkretes Problem/Job", minLength: 10 },
  { key: "q3_behavior_change", label: "Verhaltensänderung (Outcome)", hint: "z. B. mehr abgeschlossene Checkouts", minLength: 10 },
  { key: "q4_metrics", label: "Messung (Baseline/Target)", hint: "z. B. Abbruchrate 65% → 45%", minLength: 5 },
  { key: "q5_constraints", label: "Constraints", hint: "Team/Zeitrahmen/Compliance/Tech", minLength: 5 },
  { key: "q6_assets", label: "Assets/Tech", hint: "Stripe, FF, Analytics etc.", minLength: 3 },
  { key: "q7_horizon", label: "Zeithorizont & Rollout", hint: "Qx, Pilot % via Flag", minLength: 3 },
];

export const VALID_USECASES = ["backlog", "roadmap", "estimation", "retro"];
export const VALID_PROVIDERS = ["gpt", "claude"];
export const VALID_FORMATS = ["json", "markdown"];
export const VALID_STRUCTURES = ["epics_stories", "only_stories"];

/**
 * Validate the main request body
 */
export function validateRequest(body) {
  const errors = [];
  
  if (!body || typeof body !== "object") {
    errors.push("Request body must be a valid object");
    return errors;
  }

  // Validate usecase
  if (!body.usecase) {
    errors.push("usecase is required");
  } else if (!VALID_USECASES.includes(body.usecase)) {
    errors.push(`usecase must be one of: ${VALID_USECASES.join(", ")}`);
  }

  // Validate provider
  if (body.provider && !VALID_PROVIDERS.includes(body.provider)) {
    errors.push(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`);
  }

  // Validate format
  if (body.format && !VALID_FORMATS.includes(body.format)) {
    errors.push(`format must be one of: ${VALID_FORMATS.join(", ")}`);
  }

  // Validate structure
  if (body.structure && !VALID_STRUCTURES.includes(body.structure)) {
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
 * Validate answers completeness and quality
 */
export function validateAnswers(answers) {
  const missing = [];
  const warnings = [];
  
  if (!answers || typeof answers !== "object") {
    return { missing: [{ label: "Answers", hint: "Complete answers object is required" }], warnings };
  }

  REQUIRED_FIELDS.forEach((field) => {
    const value = (answers[field.key] || "").trim();
    
    if (!value) {
      missing.push({ label: field.label, hint: field.hint });
    } else if (value.length < field.minLength) {
      warnings.push(`${field.label}: Response seems too short (${value.length} chars, minimum ${field.minLength})`);
    }
  });

  return { missing, warnings };
}

/**
 * Validate guidelines if provided
 */
export function validateGuidelines(guidelines) {
  const warnings = [];
  
  if (guidelines && typeof guidelines === "string") {
    if (guidelines.length > 500) {
      warnings.push("Guidelines are very long - consider keeping them concise for better AI processing");
    }
    
    // Check for potentially problematic content
    const problematicPatterns = [
      /ignore.{1,20}(instruction|prompt|system)/i,
      /override.{1,20}(instruction|prompt|system)/i,
      /(jailbreak|hack|exploit)/i
    ];
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(guidelines)) {
        warnings.push("Guidelines contain potentially problematic instructions that may interfere with AI processing");
        break;
      }
    }
  }
  
  return warnings;
}

/**
 * Comprehensive validation of the entire request
 */
export function validateAll(body) {
  const requestErrors = validateRequest(body);
  if (requestErrors.length > 0) {
    return { valid: false, errors: requestErrors, warnings: [] };
  }
  
  const { missing, warnings: answerWarnings } = validateAnswers(body.answers);
  const guidelineWarnings = validateGuidelines(body.guidelines);
  
  return {
    valid: missing.length === 0,
    errors: missing.map(m => `Missing required field: ${m.label} (${m.hint})`),
    warnings: [...answerWarnings, ...guidelineWarnings],
    missingFields: missing
  };
}
