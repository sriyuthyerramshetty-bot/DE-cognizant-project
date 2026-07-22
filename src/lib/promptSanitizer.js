/**
 * Prompt sanitization utilities to prevent AI abuse, prompt injection,
 * and malicious prompts from reaching the model.
 *
 * Sanitization layers:
 * 1. Length limits — prevent token exhaustion attacks
 * 2. Pattern blocking — filter known jailbreak & injection patterns
 * 3. Content filtering — block harmful keywords and abuse attempts
 * 4. Encoding validation — reject suspicious character encodings
 */

// Maximum length for a single user message (tokens ≈ chars / 4)
const MAX_MESSAGE_LENGTH = 2000;

// Maximum number of conversation turns to prevent context exhaustion
const MAX_CONVERSATION_TURNS = 50;

// Patterns that indicate prompt injection, jailbreak attempts, or abuse
const MALICIOUS_PATTERNS = [
  // Prompt injection attempts (ignore system prompt / override instructions)
  /ignore.*instructions|forget.*context|new.*instructions|disregard/i,
  /system.*prompt|system.*override|system.*message/i,
  /as an ai|pretend.*to.*be|act.*as.*if|roleplay/i,
  
  // SQL injection / code injection attempts
  /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b).*from/i,
  /(\bexec\b|\bexecute\b|\beval\b|\bscript\b|<script|javascript:|onerror)/i,
  
  // Attempts to access sensitive data or bypass restrictions
  /api.key|secret.key|password|token|credentials/i,
  /database|private|confidential|restricted/i,
  
  // Jailbreak keywords (trying to get model to ignore safety guidelines)
  /without.*restrictions|no.*limitations|ignore.*safety|bypass.*filter/i,
  /don't.*care.*about.*rules|ignore.*policy|screw.*ethics/i,
  
  // DAN (Do Anything Now) and similar jailbreak prompts
  /\bdan\b|do.*anything.*now|unrestricted mode|unleash/i,
];

// Blocked keywords and abusive content patterns
const BLOCKED_KEYWORDS = [
  // Hate speech and slurs (generalized patterns)
  /discriminat|racial|racist|sexist|homophob/i,
  
  // Explicit instructions to harm
  /how.*to.*kill|how.*to.*harm|how.*to.*poison|how.*to.*exploit/i,
  
  // Illegal activities
  /illegal|unlawful|bomb|cocaine|heroin|fentanyl/i,
  /phishing|malware|ransomware|ddos/i,
  
  // NSFW / adult content
  /porn|xxx|nsfw|adult.*content|explicit/i,
];

/**
 * Sanitize a single user message before sending to the AI model.
 * Returns { isClean: boolean, message: string, reason?: string }
 *
 * @param {string} userMessage - The raw user input
 * @returns {{ isClean: boolean; message: string; reason?: string }}
 */
function sanitizePrompt(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return { isClean: false, message: '', reason: 'Empty message' };
  }

  const trimmed = userMessage.trim();

  // 1. Length check
  if (trimmed.length === 0) {
    return { isClean: false, message: '', reason: 'Empty message' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      isClean: false,
      message: '',
      reason: `Message too long (${trimmed.length} chars, max ${MAX_MESSAGE_LENGTH})`,
    };
  }

  // 2. Check for malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isClean: false,
        message: '',
        reason: 'Message contains suspicious patterns',
      };
    }
  }

  // 3. Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (keyword.test(trimmed)) {
      return {
        isClean: false,
        message: '',
        reason: 'Message contains restricted content',
      };
    }
  }

  // 4. Encoding validation — reject unusual Unicode/encoding tricks
  if (!isValidEncoding(trimmed)) {
    return {
      isClean: false,
      message: '',
      reason: 'Message contains suspicious encoding',
    };
  }

  // 5. Basic normalization (remove extra whitespace, trim)
  const normalized = trimmed.replace(/\s+/g, ' ').trim();

  return { isClean: true, message: normalized };
}

/**
 * Validate that the message uses normal characters (no homoglyph attacks
 * or unusual Unicode tricks).
 */
function isValidEncoding(text) {
  // Reject messages with excessive non-ASCII characters or control codes
  let asciiCount = 0;
  let suspiciousCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // ASCII printable + common whitespace
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
      asciiCount++;
    }
    // Control characters or unusual Unicode
    else if (code < 32 || (code >= 127 && code < 160)) {
      suspiciousCount++;
    }
  }

  // If > 20% of the message is suspicious encoding, reject it
  const suspiciousRatio = suspiciousCount / text.length;
  return suspiciousRatio < 0.2;
}

/**
 * Validate the entire conversation history to prevent context exhaustion.
 * Returns { isValid: boolean, reason?: string }
 *
 * @param {Array} messages - Array of { role, text } objects
 * @returns {{ isValid: boolean; reason?: string }}
 */
function validateConversation(messages) {
  if (!Array.isArray(messages)) {
    return { isValid: false, reason: 'Invalid message format' };
  }

  if (messages.length > MAX_CONVERSATION_TURNS) {
    return {
      isValid: false,
      reason: `Conversation too long (${messages.length} turns, max ${MAX_CONVERSATION_TURNS})`,
    };
  }

  // Validate each message
  for (const msg of messages) {
    if (!msg || typeof msg.role !== 'string' || typeof msg.text !== 'string') {
      return { isValid: false, reason: 'Invalid message structure' };
    }

    // Only user messages need sanitization (assistant replies are our own)
    if (msg.role === 'user') {
      const { isClean } = sanitizePrompt(msg.text);
      if (!isClean) {
        return { isValid: false, reason: 'Conversation contains blocked content' };
      }
    }
  }

  return { isValid: true };
}

/**
 * Rate limit check — returns { allowed: boolean, retryAfter?: number }
 * Simple in-memory rate limiter. For production, use Redis or similar.
 *
 * @param {string} userId - Unique identifier for the user
 * @param {number} maxRequestsPerMinute - Default 10
 * @returns {{ allowed: boolean; retryAfter?: number }}
 */
const userRequestTimes = {}; // { userId: [timestamp, timestamp, ...] }

function checkRateLimit(userId, maxRequestsPerMinute = 10) {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Initialize if needed
  if (!userRequestTimes[userId]) {
    userRequestTimes[userId] = [];
  }

  // Clean old timestamps
  userRequestTimes[userId] = userRequestTimes[userId].filter(
    (t) => t > oneMinuteAgo
  );

  // Check limit
  if (userRequestTimes[userId].length >= maxRequestsPerMinute) {
    const oldestRequest = userRequestTimes[userId][0];
    const retryAfter = Math.ceil((oldestRequest + 60000 - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Record this request
  userRequestTimes[userId].push(now);
  return { allowed: true };
}

export { sanitizePrompt, validateConversation, checkRateLimit };
