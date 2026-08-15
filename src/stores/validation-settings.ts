import { defineStore } from 'pinia'
import luValidations from '@/validation/lineup-validators'

export const useValidationSettingsStore = defineStore('validationSettings', {
  state: () => ({
    enabledRules: Object.fromEntries(
      luValidations.participationRules.map((rule) => [rule.id, false])
    ) as Record<string, boolean>
  })
})
