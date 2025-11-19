import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)

  const validateName = (name) => name.trim().length >= 3
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/[\s-]/g, ''))
  const validatePassword = (password) => password.length >= 6
  const passwordsMatch = (pass, confirm) => pass === confirm
  const isChitkaraEmail = (email) => email.toLowerCase().endsWith('.chitkara.edu')

  const showError = (field, msg) => {
    setErrors(prev => ({ ...prev, [field]: msg }))
  }

  const hideError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    hideError(field)
    setMessage({ text: '', type: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })

    const { fullName, email, phone, studentId, password, confirmPassword } = formData
    const domainQualified = isChitkaraEmail(email)

    let isValid = true

    if (!validateName(fullName)) {
      showError('fullName', 'Name too short')
      isValid = false
    }
    if (!validateEmail(email)) {
      showError('email', 'Invalid email')
      isValid = false
    }
    if (!validatePhone(phone)) {
      showError('phone', 'Invalid phone')
      isValid = false
    }
    if (!validatePassword(password)) {
      showError('password', 'Password too short')
      isValid = false
    }
    if (!passwordsMatch(password, confirmPassword)) {
      showError('confirmPassword', 'Passwords mismatch')
      isValid = false
    }

    if (!isValid) return

    setIsLoading(true)

    const userData = {
      name: fullName,
      email: email,
      phone: phone,
      studentId: studentId,
      isStudent: studentId.length > 0 || domainQualified,
      studentDomain: domainQualified ? '.chitkara.edu' : '',
      password: password,
      createdAt: new Date().toISOString()
    }

    try {
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (searchError) throw searchError

      if (existingUser) {
        showMessage('❌ Email already exists. Please login.', 'error')
        setIsLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select()

      if (insertError) throw insertError

      localStorage.setItem('currentUser', JSON.stringify(data[0]))
      showMessage('✅ Account created! Redirecting...', 'success')
      setTimeout(() => navigate('/login'), 2000)

    } catch (error) {
      console.error('Detailed Supabase Error:', error)
      showMessage(`❌ Error: ${error.message || error.details || 'Unknown Database Error'}`, 'error')
      setIsLoading(false)
    }
  }

  const hasStudentId = formData.studentId.trim().length > 0
  const hasDomain = isChitkaraEmail(formData.email.trim() || '')

  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/11901454/pexels-photo-11901454.jpeg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-black/75"></div>
      
      <div className="relative flex-1 w-full flex items-center justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-2xl p-10 rounded-3xl shadow-[0_0_25px_rgba(212,175,55,0.6)] bg-gradient-to-br from-black/90 via-gray-900/90 to-gray-800/95 border border-yellow-600/70 my-8">
          
          <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2 tracking-wide drop-shadow-[0_0_8px_rgba(255,193,7,0.7)]">Join RideFusion</h2>
          <p className="text-center text-gray-400 mb-6">Create your account to start riding</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-yellow-400">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${errors.fullName ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
                />
                {errors.fullName && <span className="block text-red-400 text-sm mt-1">{errors.fullName}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-yellow-400">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${errors.email ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
                />
                {errors.email && <span className="block text-red-400 text-sm mt-1">{errors.email}</span>}
                {hasDomain && !errors.email && (
                  <span className="block text-green-400 text-sm mt-1">🎓 Chitkara email detected! Student perks unlocked.</span>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-yellow-400">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${errors.phone ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
                />
                {errors.phone && <span className="block text-red-400 text-sm mt-1">{errors.phone}</span>}
              </div>

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-yellow-400">Student ID (Optional)</label>
                <input
                  id="studentId"
                  type="text"
                  placeholder="For 15% discount"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-black/70 border border-yellow-600 text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                />
                {(hasStudentId || hasDomain) && (
                  <span className="block text-green-400 text-sm mt-1">🎓 Student discount will be applied!</span>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-yellow-400">Password *</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${errors.password ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
                />
                {errors.password && <span className="block text-red-400 text-sm mt-1">{errors.password}</span>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-yellow-400">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-black/70 border ${errors.confirmPassword ? 'border-red-500' : 'border-yellow-600'} text-yellow-100 placeholder-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
                />
                {errors.confirmPassword && <span className="block text-red-400 text-sm mt-1">{errors.confirmPassword}</span>}
              </div>
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
              {isLoading ? 'Connecting...' : 'Create Account'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?
            <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300 transition duration-200 ml-1">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup

