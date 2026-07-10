import { Bot } from 'lucide-react'

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2 justify-start" data-testid="chatbot-typing">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                <Bot size={16} />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
        </div>
    )
}

export default TypingIndicator
