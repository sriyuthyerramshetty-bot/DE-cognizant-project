import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function LoginField({ icon, label, type, placeholder, value, onChange, toggleable }) {
    // Tracks whether a toggleable (password) field is currently revealed.
    const [showText, setShowText] = useState(false);

    // When toggleable and revealed, switch the input to plain text so the
    // typed characters are visible; otherwise use the passed-in type.
    const inputType = toggleable && showText ? 'text' : type;

    return (
        <>
            <label className="text-sm text-gray-600">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full border rounded-md py-2 text-sm outline-none focus:border-gray-400 ${icon ? 'pl-9' : 'pl-3'} ${toggleable ? 'pr-9' : 'pr-3'}`}
                />
                {toggleable && (
                    <button
                        type="button"
                        onClick={() => setShowText((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showText ? 'Hide password' : 'Show password'}
                    >
                        {showText ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </>
    )
}

export default LoginField;