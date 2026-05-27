/**
 * Prompt injection protection for the chatbot.
 * 
 * Two layers:
 * 1. sanitizeInput() — strips injection patterns from user messages, enforces length cap
 * 2. sanitizeChunks() — strips injection patterns from RAG results
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|guidelines?)/gi,
  /disregard\s+(your|the|all|previous)\s+(instructions?|prompts?|rules?|guidelines?)/gi,
  /forget\s+(everything|all|your)\s+(you|instructions?|rules?)/gi,
  /override\s+(your|the|all)\s+(instructions?|prompts?|rules?)/gi,
  
  // Role/persona hijacking
  /you\s+are\s+now\s+(a|an|the|my)/gi,
  /act\s+as\s+(a|an|the|if)/gi,
  /pretend\s+(to\s+be|you're|you\s+are)/gi,
  /new\s+system\s+prompt/gi,
  /system:\s*/gi,
  /\[system\]/gi,
  
  // XML/tag injection
  /<\/?(system|instruction|prompt|role)>/gi,
  /\[(INST|\/INST)\]/gi,  // Llama-style tags
  
  // Common jailbreak prefixes
  /DAN\s+mode/gi,
  /jailbreak/gi,
  /do\s+anything\s+now/gi,
];

const MAX_INPUT_LENGTH = 1000;

/**
 * Sanitize user input before sending to AI.
 * - Strips injection patterns
 * - Enforces length cap
 * - Trims whitespace
 */
export function sanitizeInput(text: string): string {
  if (!text) return "";
  
  let sanitized = text;
  
  // Strip injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  
  // Collapse multiple spaces/newlines
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  
  // Enforce length cap
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitize RAG chunks before inserting into prompt.
 * - Strips injection patterns
 * - Preserves chunk boundaries
 */
export function sanitizeChunks(chunks: string[]): string[] {
  return chunks.map(chunk => {
    let sanitized = chunk;
    
    for (const pattern of INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    
    return sanitized;
  });
}
