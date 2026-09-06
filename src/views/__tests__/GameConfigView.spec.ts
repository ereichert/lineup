import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import GameConfigView from '@/views/GameConfigView.vue'
import luValidations from '@/validation/lineup-validators'
import { useValidationSettingsStore } from '@/stores/validation-settings'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'
import { useGameConfigStore } from '@/stores/game-config'
import { buildLineupExport } from '@/persistence/lineup-file'
import Player from '@/models/Player'

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

const namesOf = (roster: Array<{ name: string }>) => roster.map((player) => player.name)

const parseRoster = async (wrapper: ReturnType<typeof mountView>, names: string) => {
  await wrapper.find('#players').setValue(names)
  await wrapper.find('.button-container button').trigger('click')
}

const selectFile = async (wrapper: ReturnType<typeof mountView>, contents: string) => {
  const file = new File([contents], 'lineup.json', { type: 'application/json' })
  // jsdom does not implement Blob.text(), which browsers have supported since 2020.
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(contents) })
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

describe('GameConfigView roster parsing', () => {
  it('lists the parsed players alphabetically', async () => {
    const wrapper = mountView()

    await parseRoster(wrapper, 'Cal, Ava, Ben')

    expect(namesOf(usePlayersStore().players)).toEqual(['Ava', 'Ben', 'Cal'])
    expect(wrapper.findAll('.player-list li').map((item) => item.text())).toEqual([
      'Ava',
      'Ben',
      'Cal'
    ])
  })

  it('keeps existing assignments and appends a newly added player', async () => {
    const wrapper = mountView()
    await parseRoster(wrapper, 'Cal, Ava')
    const lineupsStore = useLineupsStore()
    const ava = usePlayersStore().players[0]
    lineupsStore.assignPlayerToSlot(0, 0, ava)

    await parseRoster(wrapper, 'Cal, Ava, Zoe')

    expect(lineupsStore.fieldingLineup[0][0]?.id).toBe(ava.id)
    expect(namesOf(lineupsStore.battingLineup).at(-1)).toBe('Zoe')
  })
})

describe('GameConfigView lineup import', () => {
  const savedLineup = () => {
    const { fieldingPositions, numInnings } = useGameConfigStore()
    const cal = new Player('id-cal', 'Cal')
    const ava = new Player('id-ava', 'Ava')
    const fieldingLineup: Array<Array<Player | null>> = Array.from({ length: numInnings }, () =>
      new Array<Player | null>(fieldingPositions.length).fill(null)
    )
    fieldingLineup[0][0] = ava
    return JSON.stringify(
      buildLineupExport([cal, ava], fieldingLineup, fieldingPositions, numInnings)
    )
  }

  it('offers a link for importing a saved lineup', () => {
    expect(mountView().find('.import-lineup .link-button').text()).toContain('Import')
  })

  it('derives the roster from the imported lineup and shows it', async () => {
    const wrapper = mountView()

    await selectFile(wrapper, savedLineup())

    expect(namesOf(usePlayersStore().players)).toEqual(['Ava', 'Cal'])
    expect(wrapper.findAll('.player-list li').map((item) => item.text())).toEqual(['Ava', 'Cal'])
  })

  it('fills the player input with the imported players', async () => {
    const wrapper = mountView()

    await selectFile(wrapper, savedLineup())

    expect((wrapper.find('#players').element as HTMLTextAreaElement).value).toBe('Ava, Cal')
  })

  it('restores the batting order and the position assignments', async () => {
    const wrapper = mountView()

    await selectFile(wrapper, savedLineup())

    const lineupsStore = useLineupsStore()
    expect(namesOf(lineupsStore.battingLineup)).toEqual(['Cal', 'Ava'])
    expect(lineupsStore.fieldingLineup[0][0]?.name).toBe('Ava')
  })

  it('adds a new player to the imported lineup without disturbing it', async () => {
    const wrapper = mountView()
    await selectFile(wrapper, savedLineup())

    await parseRoster(wrapper, 'Ava, Cal, Zoe')

    const lineupsStore = useLineupsStore()
    expect(namesOf(lineupsStore.battingLineup)).toEqual(['Cal', 'Ava', 'Zoe'])
    expect(lineupsStore.fieldingLineup[0][0]?.name).toBe('Ava')
    expect(namesOf(lineupsStore.benchedPlayersByInning[0])).toContain('Zoe')
  })

  it('reports a file it cannot read and leaves the roster alone', async () => {
    const wrapper = mountView()
    await parseRoster(wrapper, 'Ava, Ben')

    await selectFile(wrapper, 'this is not a lineup')

    expect(wrapper.find('.import-error').text()).toMatch(/not valid JSON/)
    expect(namesOf(usePlayersStore().players)).toEqual(['Ava', 'Ben'])
  })
})
