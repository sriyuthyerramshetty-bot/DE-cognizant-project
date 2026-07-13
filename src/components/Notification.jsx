import { useEffect } from "react"

function Notification({message, onDone, duration = 2600}) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onDone?.()
        }, duration)

        return () => clearTimeout(timer)
    }, [message, onDone, duration])

    if (!message) {
        return null
    }

    return (
        <div className="fixed inset-x-0 bottom-4 z-[9999] flex justify-center pointer-events-none">
            <div
                role="status"
                aria-live="polite"
                className="animate-rise-fade rounded-xl bg-red-500 px-4 py-2 text-sm text-white shadow-xl"
            >
                {message}
            </div>
        </div>
    );

}

export default Notification