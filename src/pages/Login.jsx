import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      const currentUser = JSON.parse(userString)
      console.log('User already logged in:', currentUser.name)
    }
  }, [])

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePassword = (password) => {
    return password.trim().length > 0
  }

  const showError = (setter, value) => {
    setter(value)
  }

  const hideError = (setter) => {
    setter('')
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
  }

  const handleEmailBlur = () => {
    if (!validateEmail(email)) {
      showError(setEmailError, 'Please enter a valid email')
    } else {
      hideError(setEmailError)
    }
  }

  const handlePasswordBlur = () => {
    if (!validatePassword(password)) {
      showError(setPasswordError, 'Password is required')
    } else {
      hideError(setPasswordError)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailVal = email.trim()
    const passwordVal = password.trim()

    let isValid = true

    if (!validateEmail(emailVal)) {
      showError(setEmailError, 'Please enter a valid email')
      isValid = false
    }

    if (!validatePassword(passwordVal)) {
      showError(setPasswordError, 'Password is required')
      isValid = false
    }

    if (!isValid) {
      showMessage('Please fix the errors above', 'error')
      return
    }

    setIsLoading(true)

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailVal)
        .eq('password', passwordVal)
        .maybeSingle()

      if (error) throw error

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
        showMessage('✅ Login successful! Redirecting...', 'success')
        setTimeout(() => {
          navigate('/book-ride')
        }, 1500)
      } else {
        showMessage('❌ Invalid email or password', 'error')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      showMessage('🔴 Connection error. Please verify your Supabase setup and try again!', 'error')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/11901454/pexels-photo-11901454.jpeg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-black/75"></div>
      
      <div className="relative flex-1 w-full flex items-center justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-md p-10 rounded-3xl shadow-[0_0_25px_rgba(212,175,55,0.6)] bg-gradient-to-br from-black/90 via-gray-900/90 to-gray-800/95 border border-yellow-600/70">
          
          <h2 className="text-3xl font-bold text-center text-yellow-400 mb-8 tracking-wide drop-shadow-[0_0_8px_rgba(255,193,7,0.7)]">
            RideFusion Login
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-yellow-400">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  hideError(setEmailError)
                  setMessage({ text: '', type: '' })
                }}
                onBlur={handleEmailBlur}
                className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${emailError ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.5)] transition`}
              />
              {emailError && <span className="block text-red-400 text-sm mt-1">{emailError}</span>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-yellow-400">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  hideError(setPasswordError)
                  setMessage({ text: '', type: '' })
                }}
                onBlur={handlePasswordBlur}
                className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${passwordError ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.5)] transition`}
              />
              {passwordError && <span className="block text-red-400 text-sm mt-1">{passwordError}</span>}
            </div>
            
            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition duration-200">Forgot Password?</a>
            </div>
            
            {message.text && (
              <div className={`p-4 rounded-xl text-center text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500 text-green-400' 
                  : 'bg-red-500/20 border border-red-500 text-red-400'
              }`}>
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-lg font-semibold rounded-xl shadow-[0_0_15px_rgba(255,193,7,0.7)] hover:from-yellow-400 hover:to-yellow-500 hover:shadow-[0_0_25px_rgba(255,193,7,1)] transform hover:scale-105 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-300">
            Don't have an account?
            <Link to="/signup" className="font-semibold text-yellow-400 hover:text-yellow-300 transition duration-200 ml-1">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

