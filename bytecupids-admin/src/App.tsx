import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { DashboardProvider } from './context/DashboardContext'


const lazyWithMinTime = (
  factory: () => Promise<any>,
  minDisplayTimeMs = 2000
) => {
  return React.lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, minDisplayTimeMs)),
    ]).then(([moduleExports]) => moduleExports)
  );
};

const ThemedLoaderComponent = () => (
  <div className="themed-loader cursor-bg">
    <div className="particle-burst-loader">
      <div className="particle-arm p1">
        <div className="particle-head"></div>
      </div>
      <div className="particle-arm p2">
        <div className="particle-head"></div>
      </div>
      <div className="particle-arm p3">
        <div className="particle-head"></div>
      </div>
      <div className="particle-arm p4">
        <div className="particle-head"></div>
      </div>
      <div className="particle-arm p5">
        <div className="particle-head"></div>
      </div>
    </div>
  </div>
);

const AdminLoginPage = lazyWithMinTime(() => import('./pages/AdminLogin/AdminLoginPage'))
const DashboardPage = lazyWithMinTime(() => import('./pages/Dashboard/DashboardPage'))
const EditorPage = lazyWithMinTime(() => import('./pages/Editor/EditorPage'))


function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLoginPage />} />
          <Route path="/dashboard" element={
            <Suspense fallback={<ThemedLoaderComponent />}>
              <DashboardProvider>
                <DashboardPage />
              </DashboardProvider>
            </Suspense>
          } />
          <Route path="/editor" element={
            <Suspense fallback={<ThemedLoaderComponent />}>
              <EditorPage />
            </Suspense>
          } />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App
