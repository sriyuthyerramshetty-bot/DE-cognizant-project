function LoginField({ icon, label, type, placeholder }) {
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
                    type={type}
                    placeholder={placeholder}
                    className={`w-full border rounded-md py-2 pr-3 text-sm outline-none focus:border-gray-400 ${icon ? 'pl-9' : 'pl-3'}`}
                />
            </div>
        </>
    )
}

export default LoginField;