import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Minus, Send, Bot, RotateCcw } from 'lucide-react'
import ChatMessage from './ChatMessage.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { getAssistantReply } from '../../lib/openai.js'
import TextAsset from '../../assets/TextAssets.json'

const INITIAL_MESSAGES = [
    {
        id: 1,
        role: 'assistant',
        text: TextAsset.Chatbot.greeting,
    },
]

function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [messages, setMessages] = useState(INITIAL_MESSAGES)
    const [nextId, setNextId] = useState(2)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Quick-reply suggestions disappear once the user sends anything.
    const showSuggestions = messages.length === 1 && !isTyping

    // Auto-scroll to the newest message / typing indicator.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // Focus the input whenever the panel opens.
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

    const sendMessage = async (text) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) {
            return
        }

        const userMessage = { id: nextId, role: 'user', text: trimmed }
        const history = [...messages, userMessage]

        setMessages(history)
        setNextId((id) => id + 2) // reserve an id for the reply
        setInput('')
        setIsTyping(true)

        try {
            const replyText = await getAssistantReply(history)
            setMessages((current) => [
                ...current,
                { id: userMessage.id + 1, role: 'assistant', text: replyText },
            ])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage(input)
        }
    }

    /** Clears the conversation back to the initial greeting. */
    const handleRefresh = () => {
        setMessages(INITIAL_MESSAGES)
        setNextId(2)
        setInput('')
        inputRef.current?.focus()
    }

    return (
        <>
            {/* Floating launcher button (hidden while the panel is open) */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label={TextAsset.Chatbot.openLabel}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600"
                >
                    <MessageCircle size={26} />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label={TextAsset.Chatbot.title}
                    className="fixed bottom-6 right-6 z-50 flex h-[480px] w-80 flex-col overflow-hidden rounded-xl border bg-white shadow-2xl"
                >
                    {/* Header — name, online status, refresh + minimize buttons */}
                    <div className="flex items-center justify-between border-b bg-white px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">
                                <Bot size={18} />
                            </span>
                            <div className="leading-tight">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {TextAsset.Chatbot.title}
                                </h2>
                                <p className="flex items-center gap-1 text-[11px] text-gray-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    {TextAsset.Chatbot.onlineStatus}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                aria-label={TextAsset.Chatbot.refreshLabel}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label={TextAsset.Chatbot.closeLabel}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                                <Minus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-4" data-testid="chatbot-messages">
                        {messages.map((message) => (
                            <ChatMessage key={message.id} role={message.role} text={message.text} />
                        ))}

                        {/* Quick-reply suggestions under the greeting */}
                        {showSuggestions && (
                            <div className="flex flex-wrap justify-end gap-2 pt-1">
                                {TextAsset.Chatbot.suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => sendMessage(suggestion)}
                                        className="rounded-full border border-red-500 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input row */}
                    <div className="flex items-center gap-2 border-t p-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={TextAsset.Chatbot.inputPlaceholder}
                            className="flex-1 rounded-full border bg-gray-50 px-4 py-2 text-sm outline-none focus:border-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isTyping}
                            aria-label={TextAsset.Chatbot.sendLabel}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                                !input.trim() || isTyping
                                    ? 'cursor-not-allowed bg-gray-300'
                                    : 'bg-red-500 hover:bg-red-600'
                            }`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatbotWidget
