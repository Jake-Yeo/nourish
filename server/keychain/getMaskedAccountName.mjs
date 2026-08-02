export function getMaskedAccountName(accountName) {
  return accountName ? accountName.replace(/^(.{1,2}).*(@.*)$/, '$1•••$2') : ''
}
