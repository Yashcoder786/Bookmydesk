'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, User, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const navigate = (to: string | number) => {
    if (typeof window !== 'undefined') {
      if (typeof to === 'number' && to === -1) {
        if (window.history.length > 1) {
          router.back()
          return
        }
        router.push('/')
        return
      }
      if (typeof to === 'string') {
        router.push(to)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login submitted:', formData, 'as role:', role)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.email.split('@')[0],
          role: role,
        }),
      })
      const data = await res.json()

      let userData: any = {
        id: `usr_${formData.email.replace(/[^a-z0-9]/gi, '_')}`,
        email: formData.email,
        name: formData.email.split('@')[0],
        role: role,
        isLoggedIn: true,
      }

      if (data.success && data.user) {
        userData = {
          ...data.user,
          role: role,
          isLoggedIn: true,
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmydesk_user', JSON.stringify(userData))
        window.dispatchEvent(new Event('auth-change'))

        // If signing in as admin, redirect directly to admin console
        if (role === 'ADMIN') {
          router.push('/admin')
        } else if (
          document.referrer &&
          document.referrer.includes(window.location.origin) &&
          !document.referrer.includes('/signin')
        ) {
          router.back()
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      console.error('Failed to log in:', err)
      const fallbackUser = {
        id: `usr_${formData.email.replace(/[^a-z0-9]/gi, '_')}`,
        email: formData.email,
        name: formData.email.split('@')[0],
        role: role,
        isLoggedIn: true,
      }
      localStorage.setItem('bookmydesk_user', JSON.stringify(fallbackUser))
      window.dispatchEvent(new Event('auth-change'))
      if (role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex signin-root">
      {/* Left Panel - Image Section */}
      <div className="flex-1 relative overflow-hidden signin-image-panel">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
            alt="BookMyDesk Workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-10 left-10 text-white z-10 max-w-md">
            <h2 className="text-2xl font-bold mb-2">BookMyDesk</h2>
            <p className="text-sm text-slate-200">
              Reserve premium desks, private cabins, and dynamic meeting rooms across leading workspace hubs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white signin-card-panel">
        <div className="w-full max-w-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {role === 'ADMIN' ? 'Admin Portal Sign In' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {role === 'ADMIN' ? (
                'Manage verified workspaces, partner listings & platform bookings audit trail.'
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Explore Desks
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Account Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.5rem',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                background: role === 'CUSTOMER' ? '#ffffff' : 'transparent',
                color: role === 'CUSTOMER' ? '#0f172a' : '#64748b',
                boxShadow: role === 'CUSTOMER' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} color={role === 'CUSTOMER' ? '#2563eb' : '#64748b'} />
              <span>Sign in as Customer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('ADMIN')
                if (!formData.email) {
                  setFormData(prev => ({ ...prev, email: 'admin@bookmydesk.in' }))
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.5rem',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                background: role === 'ADMIN' ? '#0f172a' : 'transparent',
                color: role === 'ADMIN' ? '#ffffff' : '#64748b',
                boxShadow: role === 'ADMIN' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} color={role === 'ADMIN' ? '#fbbf24' : '#64748b'} />
              <span>Sign in as Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: role === 'ADMIN' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#000000',
              }}
            >
              {role === 'ADMIN' ? (
                <>
                  <ShieldCheck size={18} color="#fbbf24" />
                  <span>Sign In as Admin</span>
                </>
              ) : (
                <>
                  <User size={18} />
                  <span>Sign In as Customer</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'alex.rivera@example.com', password: 'password123' }))
                }}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                {/* Google SVG */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'demo.developer@example.com', password: 'password123' }))
                }}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                {/* GitHub SVG */}
                <svg className="w-5 h-5 mr-2" fill="#24292f" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  GitHub
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
