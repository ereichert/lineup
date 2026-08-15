import luValidations from '@/validation/lineup-validators'
import { useValidationSettingsStore } from '@/stores/validation-settings'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('validation settings store', () => {
  it('defaults every participation rule to disabled', () => {
    const { enabledRules } = useValidationSettingsStore()

    luValidations.participationRules.forEach((rule) => {
      expect(enabledRules[rule.id]).toBe(false)
    })
  })

  it('reflects an enabled rule after it is toggled', () => {
    const store = useValidationSettingsStore()
    const [firstRule] = luValidations.participationRules

    store.enabledRules[firstRule.id] = true

    expect(store.enabledRules[firstRule.id]).toBe(true)
  })
})
