import { KeyRound } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Stack } from '../../components/ui/Stack'
import { Typography } from '../../components/ui/Typography'
import { useMyNetDiaryCredentials } from '../../hooks/useMyNetDiaryCredentials'

export function MyNetDiaryAccountCard() {
  const credentials = useMyNetDiaryCredentials()
  const isConfigured = Boolean(credentials.configuredAccountHint)
  const accountStatus = isConfigured ? `Configured for ${credentials.configuredAccountHint}` : 'Required for automatic headless sync'
  const buttonLabel = credentials.isSavingCredentials ? 'Saving…' : isConfigured ? 'Update login' : 'Save login'

  return <Card variant="flat">
    <div className="flex items-center gap-control-wide"><div className="grid size-icon-small shrink-0 place-items-center rounded-icon bg-primary-soft text-primary"><KeyRound className="w-5" /></div><Stack gap="control"><strong className="text-body">MyNetDiary login</strong><Typography variant="caption">{accountStatus}</Typography></Stack></div>
    <Typography variant="caption" className="my-control-wide">Nourish stores this login in the Mac’s Keychain and uses it only when MyNetDiary asks the sync browser to sign in.</Typography>
    <Stack gap="controlWide">
      <Field label="Email or account name"><Input type="text" autoCapitalize="none" autoCorrect="off" value={credentials.accountName} onChange={event => credentials.setAccountName(event.target.value)} placeholder={isConfigured ? 'Enter to replace saved login' : 'MyNetDiary email'} /></Field>
      <Field label="Password"><Input type="password" value={credentials.password} onChange={event => credentials.setPassword(event.target.value)} placeholder={isConfigured ? 'Enter to replace saved password' : 'MyNetDiary password'} /></Field>
      <Button variant="secondary" fullWidth disabled={credentials.isSavingCredentials || !credentials.accountName || !credentials.password} onClick={credentials.saveMyNetDiaryCredentials}>{buttonLabel}</Button>
      {credentials.credentialMessage && <Typography variant="caption" className="text-primary-strong">{credentials.credentialMessage}</Typography>}
    </Stack>
  </Card>
}
