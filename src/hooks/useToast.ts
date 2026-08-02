import { useEffect, useState } from 'react'

export function useToast() {
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!toastMessage) return
    const dismissalTimer = window.setTimeout(() => setToastMessage(''), 2400)
    return () => window.clearTimeout(dismissalTimer)
  }, [toastMessage])

  return { toastMessage, showToast: setToastMessage }
}
