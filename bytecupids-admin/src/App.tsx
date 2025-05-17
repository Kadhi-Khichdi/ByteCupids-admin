import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { DashboardProvider } from './context/DashboardContext'


const AdminLoginPage = React.lazy(() => import('./pages/AdminLogin/AdminLoginPage'))
const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'))
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLoginPage />} />
          <Route path="/dashboard" element={
            <Suspense fallback={<div>Loading...</div>}>
              <DashboardProvider>
                <DashboardPage />
              </DashboardProvider>
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
  );
}

export default App
