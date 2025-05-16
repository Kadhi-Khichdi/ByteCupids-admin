import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'


const AdminLoginPage = React.lazy(() => import('./pages/AdminLogin/AdminLoginPage'))

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLoginPage />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App
