'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from 'hooks/useAuth'
import Input from 'commoncomponent/Input'
import Button from 'commoncomponent/Button'
import { ClipboardCheckIcon } from 'icons'

interface FormValues {
  username: string
  password: string
}

interface FormErrors {
  username?: string
  password?: string
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.username.trim()) errors.username = 'Username is required'
  if (!values.password) errors.password = 'Password is required'
  return errors
}

export default function Login() {
  const router = useRouter()
  const { login, isAuthenticated, loading, error, clearError } = useAuth()

  const [values, setValues] = useState<FormValues>({ username: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    if (touched[name as keyof FormValues]) {
      setErrors(validate({ ...values, [name]: value }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(validate(values))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const allTouched = { username: true, password: true }
    setTouched(allTouched)
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    await login(values)
  }

  return (
    <div className="min-h-screen bg-white-200 dark:bg-black-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-300 mb-4">
            <ClipboardCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black-300 dark:text-white">TaskFlow</h1>
          <p className="text-sm text-gray-300 dark:text-gray-200 mt-1">Sign in to your workspace</p>
        </div>

        <div className="bg-white dark:bg-black-700 rounded-2xl shadow-sm border border-white-300 dark:border-black-500 p-6">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              touched={touched.username}
              autoFocus
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            {error && (
              <div
                className="rounded-lg bg-red dark:bg-red-900 border border-red-200 dark:border-red-800 px-4 py-3"
                role="alert"
              >
                <p className="text-sm text-red-400 dark:text-red-200">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-white-300 dark:border-black-500">
            <p className="text-xs text-gray-300 dark:text-gray-400 text-center">
              Demo credentials: <span className="font-medium text-gray-400 dark:text-gray-200">test / test123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
