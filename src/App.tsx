import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Gutter from './components/Gutter'
import type { GutterItem } from './components/Gutter'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Settings from './pages/Settings'

function AppLayout() {
  const [activeItem, setActiveItem] = useState<GutterItem>('files')
  const location = useLocation()
  const isSettingsPage = location.pathname === '/settings'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Gutter activeItem={activeItem} onItemClick={setActiveItem} />
      {!isSettingsPage && <Sidebar activeItem={activeItem} />}
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
