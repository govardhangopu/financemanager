import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from "./components/Navbar"
import Index from "./pages/Index"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import OAuthCallback from "./pages/OAuthCallback";
import Dashboard from "./pages/Dashboard"
import AddTransaction from "./pages/AddTransaction"
import EditTransaction from "./pages/EditTransaction"
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets"
import BudgetDetail from "./pages/BudgetDetail"
import Scenarios from "./pages/Scenarios"
import ScenarioDetail from './pages/ScenarioDetail'
import Forecast from './pages/Forecast'
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute"
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/addtransaction" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
            <Route path="/edittransaction/:id" element={<ProtectedRoute><EditTransaction /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/budgets/:id" element={<ProtectedRoute><BudgetDetail /></ProtectedRoute>} />
            <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
            <Route path='/scenarios/:id' element={<ProtectedRoute><ScenarioDetail /></ProtectedRoute>} />
            <Route path='/forecast' element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>

      </Router>
    </>
  )
}

export default App
