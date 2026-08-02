import { useEffect, useState } from 'react'

export function useMyNetDiaryCredentials() {
  const [accountName, setAccountName] = useState('')
  const [password, setPassword] = useState('')
  const [configuredAccountHint, setConfiguredAccountHint] = useState('')
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)
  const [credentialMessage, setCredentialMessage] = useState('')

  useEffect(() => {
    fetch('/api/mynetdiary-credentials').then(response => response.json()).then(result => setConfiguredAccountHint(String(result.emailHint || ''))).catch(() => setCredentialMessage('Could not check MyNetDiary login status.'))
  }, [])

  const saveMyNetDiaryCredentials = async () => {
    setIsSavingCredentials(true)
    setCredentialMessage('')
    try {
      const response = await fetch('/api/mynetdiary-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accountName, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save MyNetDiary login.')
      setConfiguredAccountHint(result.emailHint || accountName)
      setAccountName('')
      setPassword('')
      setCredentialMessage('Saved securely in this Mac’s Keychain.')
    } catch (error) {
      setCredentialMessage(error instanceof Error ? error.message : 'Could not save MyNetDiary login.')
    } finally {
      setIsSavingCredentials(false)
    }
  }

  return { accountName, configuredAccountHint, credentialMessage, isSavingCredentials, password, saveMyNetDiaryCredentials, setAccountName, setPassword }
}
