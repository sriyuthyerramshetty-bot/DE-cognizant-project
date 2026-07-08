import EmployeeTagBox from "./EmployeeTagBox.jsx"
import { ChevronLast, ChevronFirst } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useContext, createContext, useState } from "react"

const SidebarContext = createContext()

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true)

  return (
      <aside className={`sticky top-0 self-start h-screen shrink-0 z-30 transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className={`p-4 pb-2 flex items-center ${expanded ? "justify-between" : "justify-center"}`}>
          <span
            className={`overflow-hidden whitespace-nowrap font-semibold text-md transition-all ${
              expanded ? "w-44" : "w-0"
            }`}
          >
            Verizon Employee Portal
          </span>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t p-3">
          <EmployeeTagBox expanded={expanded} />
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, to, alert, end = false }) {
  const { expanded } = useContext(SidebarContext)
  
  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <li
          className={`
            relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${expanded ? "" : "justify-center"}
            ${
              isActive
                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                : "hover:bg-indigo-50 text-gray-600"
            }
        `}
        >
          {icon}
          <span
            className={`overflow-hidden whitespace-nowrap transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            {text}
          </span>
          {alert && (
            <div
              className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
                expanded ? "" : "top-2"
              }`}
            />
          )}

          {!expanded && (
            <div
              className={`
              absolute left-full rounded-md px-2 py-1 ml-6
              bg-indigo-100 text-indigo-800 text-sm whitespace-nowrap z-50
              invisible opacity-20 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
            >
              {text}
            </div>
          )}
        </li>
      )}
    </NavLink>
  )
}