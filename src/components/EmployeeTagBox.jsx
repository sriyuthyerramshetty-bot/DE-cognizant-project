import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

function EmployeeTagBox({ expanded }) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    // Firebase accounts created with only email/password have no displayName,
    // so fall back to the email's local part, then a generic label.
    const displayName = user?.displayName || user?.email?.split("@")[0] || "User"

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <div className="flex items-center pl-1.5">
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ffa49e&color=ff1100&bold=true`}
                alt=""
                className="w-10 h-10 rounded-md"
            />
            <div
                className={`
                    flex justify-between items-center
                    overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
                `}
            >
                <div className="leading-4">
                    <h4 className="font-semibold">{displayName}</h4>
                    <span className="text-xs text-gray-600">{user?.email}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Sign out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    )
}

export default EmployeeTagBox;