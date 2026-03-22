'use client'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from 'store/index'

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    import('mocks/mockApi')
      .then(({ setupMockApi }) => {
        setupMockApi()
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [])

  return <Provider store={store}>{ready ? children : null}</Provider>
}
