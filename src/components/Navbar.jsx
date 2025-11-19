import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const Navbar = () => {
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      setCurrentUser(JSON.parse(userString))
    }
  }, [location])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
      window.location.href = '/'
    }
  }

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-black font-black text-lg">R</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gold-gradient tracking-tight">RideFusion</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Rajpura Transport</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={location.pathname === '/' ? 'text-yellow-400 font-medium border-b-2 border-yellow-400' : 'text-gray-300 hover:text-white transition hover:scale-105'}>
              Home
            </Link>
            <Link to="/book-ride" className={location.pathname === '/book-ride' ? 'text-yellow-400 font-medium border-b-2 border-yellow-400' : 'text-gray-300 hover:text-white transition hover:scale-105'}>
              Find Rides
            </Link>
            <Link to="/offer-ride" className={location.pathname === '/offer-ride' ? 'text-yellow-400 font-medium border-b-2 border-yellow-400' : 'text-gray-300 hover:text-white transition hover:scale-105'}>
              Offer Rides
            </Link>
            
            <div className="pl-4 border-l border-gray-700">
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-400">Hello,</span>
                    <span className="text-yellow-400 font-bold text-sm leading-none">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/50 rounded-md hover:bg-red-600 hover:text-white transition text-xs font-bold"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-400 hover:text-white transition font-medium">
                    Login
                  </Link>
                  <Link to="/signup">
                    <button className="px-5 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold shadow-md text-sm">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

