import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AdminLogin from './components/auth/AdminLogin'
import AdminRegister from './components/auth/AdminRegister'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import BookDetails from './pages/BookDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/book/:id" element={
          <ProtectedRoute>
            <BookDetails />
          </ProtectedRoute>
        } />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App
