import { Bot } from 'lucide-react'

function ChatMessage({ role, text }) {
    const isUser = role === 'user'

    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <Bot size={16} />
                </span>
            )}
            <p
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    isUser
                        ? 'rounded-br-sm bg-red-500 text-white'
                        : 'rounded-bl-sm bg-gray-100 text-gray-900'
                }`}
            >
                {text}
            </p>
        </div>
    )
}

export default ChatMessage
