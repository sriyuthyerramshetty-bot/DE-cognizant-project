import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Todo from './pages/Todo.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { plans } from './data/data.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { UserInfoProvider } from './context/UserInfoContext.jsx'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <UserInfoProvider>
          <Routes>
            {/* Public route — no sidebar */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — redirect to /login when signed out */}
            <Route element={<ProtectedRoute />}>
              {/* Shared layout with the sidebar */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Todo />} />
                <Route path="/plan" element={<PlanPage plans={plans} />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </UserInfoProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App