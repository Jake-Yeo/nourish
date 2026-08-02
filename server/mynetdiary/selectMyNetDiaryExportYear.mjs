export async function selectMyNetDiaryExportYear(page, exportYear) {
  await page.locator('select, input').evaluateAll((formControls, selectedYear) => {
    for (const formControl of formControls) {
      const controlIdentity = `${formControl.getAttribute('name') || ''} ${formControl.id || ''} ${formControl.getAttribute('aria-label') || ''}`.toLowerCase()
      if (!controlIdentity.includes('year')) continue
      formControl.value = selectedYear
      formControl.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }, exportYear)
}
