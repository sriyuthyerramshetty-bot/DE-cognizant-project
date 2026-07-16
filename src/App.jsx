import './styles/App.css'
import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Todo from './pages/Todo.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import CartPage from './pages/CartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { plans } from '../server/data/data.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { UserInfoProvider } from './context/UserInfoContext.jsx'
import { TodoProvider } from './context/TodoContext.jsx'

function App() {
  // Card view vs. List view toggle for the Plans page. Kept here (above the
  // router) so it survives navigating away and back during a session, while
  // still defaulting to list view on a full refresh or fresh sign-in.
  const [planCardView, setPlanCardView] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <UserInfoProvider>
          <TodoProvider>
            <Routes>
              {/* Public route — no sidebar */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes — redirect to /login when signed out */}
              <Route element={<ProtectedRoute />}>
                {/* Shared layout with the sidebar */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Todo />} />
                  <Route path="/plan" element={<PlanPage plans={plans} cardView={planCardView} setCardView={setPlanCardView} />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                </Route>
              </Route>
            </Routes>
          </TodoProvider>
        </UserInfoProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App