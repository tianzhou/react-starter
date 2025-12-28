import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Gutter from './components/Gutter'
import type { GutterItem } from './components/Gutter'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import Settings from './pages/Settings'
import { useSession } from './lib/auth-client'

function AppLayout() {
  const [activeItem, setActiveItem] = useState<GutterItem>('files')
  const location = useLocation()
  const { data: session, isPending } = useSession()

  const isSettingsPage = location.pathname === '/settings'
  const showSidebar = !isSettingsPage && !!session

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-white">
        <Gutter activeItem={activeItem} onItemClick={setActiveItem} />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<SignIn />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Gutter activeItem={activeItem} onItemClick={setActiveItem} />
      {showSidebar && <Sidebar activeItem={activeItem} />}
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
