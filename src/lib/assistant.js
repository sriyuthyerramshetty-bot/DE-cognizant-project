/**
 * AI chat service for the assistant widget, powered by Puter.js.
 *
 * This is the ONLY file that talks to the model provider — the widget just
 * calls getAssistantReply(). Puter.js (loaded via a <script> tag in
 * index.html) provides free, keyless access to AI models: requests go to
 * Puter's servers, which cover the model costs under their "user pays" model.
 * No API key, no .env config, and no CORS/proxy setup needed.
 */

import { getDataSummary, searchCustomers, searchPlans, getPlans, getRecommendedPlans } from './dataAccessLayer.js'
import { sanitizePrompt, validateConversation, checkRateLimit } from './promptSanitizer.js'

const MODEL = 'gpt-4o-mini'

/**
 * Builds the system prompt, embedding the portal's live data files (plans and
 * customer records) plus the logged-in employee's name so the assistant can
 * address them directly and answer data questions accurately.
 *
 * @param {{ userName?: string }} context
 */
const buildSystemPrompt = ({ userName } = {}) => {
  const summary = getDataSummary();
  const allPlans = getPlans(); // Get actual plan data
  const planSummary = allPlans.map(p => `- ${p.name} (${p.type}): ${p.speed} Mbps, $${p.price}/mo`).join('\n');
  
  return `You are the Verizon Assistant, a friendly helper embedded in an internal
Verizon employee portal. The portal has these pages:
- To-Do List: employees manage tasks with due dates and reminders
- Customers: customer records and details
- Plans: internet/mobile plans that can be added to a customer's cart
- Cart: review selected plans and place orders for customers
- Calendar and Settings

${userName ? `You are talking to the employee "${userName}". Address them by name when it feels natural (e.g., in greetings), but don't overdo it.` : ''}

Here are the available PLANS:
${planSummary}

Use this data to answer questions about plans accurately.
Answer questions helpfully and concisely (2-3 sentences max unless asked for detail).
Stay professional but warm.`;
};

/**
 * Sends the conversation to the AI and returns the assistant's reply.
 *
 * @param {Array<{role: 'user'|'assistant', text: string}>} messages
 *   The chat history from the widget (oldest first).
 * @param {{ userName?: string }} [context]
 *   Optional info about the logged-in employee.
 * @returns {Promise<string>} The assistant's reply text.
 */
export async function getAssistantReply(messages, context = {}) {
    // Puter.js attaches itself to window when its script tag loads.
    if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
        return 'The AI service has not loaded yet. Check that the Puter.js script tag is in index.html, then refresh the page.'
    }

    // 1. Sanitize and validate the conversation
    const validation = validateConversation(messages);
    if (!validation.isValid) {
        console.warn('Invalid conversation:', validation.reason);
        return 'Your message could not be processed. Please try a different question.';
    }

    // 2. Get user ID from context (or use a session/browser fingerprint)
    const userId = context.userName || 'anonymous';

    // 3. Rate limit check (max 10 requests per minute per user)
    const rateCheck = checkRateLimit(userId, 10);
    if (!rateCheck.allowed) {
        return `You're sending messages too quickly. Please wait ${rateCheck.retryAfter} seconds and try again.`;
    }

    // 4. Sanitize the most recent user message
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'user') {
            const sanitized = sanitizePrompt(lastMsg.text);
            if (!sanitized.isClean) {
                console.warn('Blocked prompt:', sanitized.reason);
                return 'Your message was blocked for safety reasons. Please ask something else.';
            }
        }
    }

    try {
        const response = await window.puter.ai.chat(
            [
                { role: 'system', content: buildSystemPrompt(context) },
                ...messages.map(({ role, text }) => ({ role, content: text })),
            ],
            { model: MODEL },
        )

        // puter.ai.chat returns an OpenAI-style message object; content can be
        // a plain string or (for some models) an array of content parts.
        const content = response?.message?.content
        const text = Array.isArray(content)
            ? content.map((part) => part?.text ?? '').join('')
            : content

        return text?.trim() || "Sorry, I didn't catch that — try again?"
    } catch (error) {
        console.error('Puter AI request failed:', error)
        return 'Something went wrong reaching the assistant. Please try again in a moment.'
    }
}
