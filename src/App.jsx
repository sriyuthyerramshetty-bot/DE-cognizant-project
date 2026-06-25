import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Todo from './pages/Todo.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import Sidebar, { SidebarItem } from './components/Sidebar.jsx'
import { Home, Calendar, Settings } from 'lucide-react'

function App() {
  return (
    <main className="App flex min-h-screen">
      <Sidebar>
        <SidebarItem icon={<Home />} text="Home" to="/" end />
        <SidebarItem icon={<Calendar />} text="Calendar" to="/calendar" />
        <SidebarItem icon={<Settings />} text="Settings" to="/settings" />
      </Sidebar>

      <section className="flex-1">
        <Routes>
          <Route path="/" element={<Todo />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </section>
    </main>
  )
}

export default App