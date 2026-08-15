import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import GameConfigView from '@/views/GameConfigView.vue'
import luValidations from '@/validation/lineup-validators'
import { useValidationSettingsStore } from '@/stores/validation-settings'

beforeEach(() => {
  setActivePinia(createPinia())
})

const mountView = () =>
  mount(GameConfigView, {
    global: {
      stubs: { RouterLink: true }
    }
  })

describe('GameConfigView validation rule checkboxes', () => {
  it('renders one labeled, unchecked checkbox per participation rule', () => {
    const wrapper = mountView()
    const checkboxes = wrapper.findAll('.rule-item input[type="checkbox"]')

    expect(checkboxes).toHaveLength(luValidations.participationRules.length)
    checkboxes.forEach((checkbox, index) => {
      expect((checkbox.element as HTMLInputElement).checked).toBe(false)
      expect(wrapper.text()).toContain(luValidations.participationRules[index].label)
    })
  })

  it('enables a rule in the store when its checkbox is checked', async () => {
    const wrapper = mountView()
    const [firstRule] = luValidations.participationRules
    const checkbox = wrapper.find('.rule-item input[type="checkbox"]')

    await checkbox.setValue(true)

    expect(useValidationSettingsStore().enabledRules[firstRule.id]).toBe(true)
  })
})
