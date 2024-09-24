import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from './pages/Login'
import LoginByForm from './pages/LoginByForm'
import Register from './pages/Register'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import SharedFormPage from './pages/SharedFormPage'
import ForosPage from './pages/ForosPage'
import AnswerPage from './pages/AnswersPage'

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/foros" element={<ProtectedRoute><ForosPage /></ProtectedRoute>} />
          <Route path="/answers/:formReference" element={<ProtectedRoute><AnswerPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/loginByForm/:formReference" element={<LoginByForm />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="/sharedForm/:formReference" element={<SharedFormPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
