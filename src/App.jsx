import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Todo from './pages/Todo.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import CartPage from './pages/CartPage.jsx'
import Sidebar, { SidebarItem } from './components/Sidebar.jsx'
import { Home, Calendar, Settings, GlobeCheck, ShoppingCart } from 'lucide-react'
import { plans } from './data/data.js'

function App() {
  return (
    <main className="App flex min-h-screen">
      <Sidebar>
        <SidebarItem icon={<Home />} text="Home" to="/" end />
        <SidebarItem icon={<Calendar />} text="Calendar" to="/calendar" />
        <SidebarItem icon={<Settings />} text="Settings" to="/settings" />
        <SidebarItem icon={<GlobeCheck />} text="Plans" to="/plan" />
        <SidebarItem icon={<ShoppingCart />} text="Cart" to="/cart" />
      </Sidebar>

      <section className="flex-1">
        <Routes>
          <Route path="/" element={<Todo />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/plan" element={<PlanPage plans={plans} />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </section>
    </main>
  )
}

export default App