/**
 * OpenAI chat service for the assistant widget.
 *
 * This is the ONLY file that talks to the model provider. When we later move
 * to a backend proxy (and pull customer context from Firebase), the widget
 * won't need to change — just this module.
 *
 * NOTE: the API key lives in .env.local (VITE_OPENAI_API_KEY) and is exposed
 * to the browser. That's acceptable for local prototyping, but before any real
 * deployment this call must move behind a server endpoint so the key stays
 * secret.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT = `You are the Verizon Assistant, a friendly helper embedded in an internal
Verizon employee portal. The portal has these pages:
- To-Do List: employees manage tasks with due dates and reminders
- Customers: customer records and details
- Plans: 5G, Broadband and Mobile internet plans ($25-$65/mo, some marked Best Value)
- Cart: review selected plans and place orders for customers
- Calendar and Settings

Answer questions helpfully and concisely (2-3 sentences max unless asked for detail).
If asked about specific customer data, explain that customer lookups are coming soon.
Stay professional but warm.`

/**
 * Sends the conversation to OpenAI and returns the assistant's reply.
 *
 * @param {Array<{role: 'user'|'assistant', text: string}>} messages
 *   The chat history from the widget (oldest first).
 * @returns {Promise<string>} The assistant's reply text.
 */
export async function getAssistantReply(messages) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
        return 'No OpenAI API key is configured yet. Add VITE_OPENAI_API_KEY to your .env.local file and restart the dev server.'
    }

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 300,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.map(({ role, text }) => ({ role, content: text })),
            ],
        }),
    })

    if (!response.ok) {
        // Surface a friendly message; log the real details for debugging.
        const errorBody = await response.json().catch(() => null)
        console.error('OpenAI request failed:', response.status, errorBody)

        if (response.status === 401) {
            return 'Your OpenAI API key was rejected. Double-check VITE_OPENAI_API_KEY in .env.local.'
        }
        if (response.status === 429) {
            return "I'm getting rate-limited right now — give me a few seconds and try again."
        }
        return 'Something went wrong reaching the assistant. Please try again in a moment.'
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() ?? "Sorry, I didn't catch that — try again?"
}
