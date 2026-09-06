import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import PrintView from '@/views/PrintView.vue'
import Player from '@/models/Player'
import { useGameConfigStore } from '@/stores/game-config'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'

const testPlayers: Array<Player> = Array.from(
  { length: 11 },
  (_, idx) => new Player(`id-${idx}`, `Player ${String.fromCharCode(65 + idx)}`)
)

beforeEach(() => {
  setActivePinia(createPinia())
  usePlayersStore().players = [...testPlayers]
})

// PrintView reads the stores once at setup, so the lineup has to be in place before mounting.
const mountWithFirstInningFilled = () => {
  const { fieldingPositions } = useGameConfigStore()
  const lineupsStore = useLineupsStore()
  lineupsStore.battingLineup = [...testPlayers]
  fieldingPositions.forEach((_, positionIdx) => {
    lineupsStore.assignPlayerToSlot(0, positionIdx, testPlayers[positionIdx])
  })

  return mount(PrintView, { global: { stubs: { RouterLink: true } } })
}

const fieldingRows = (wrapper: ReturnType<typeof mountWithFirstInningFilled>) =>
  wrapper
    .findAll('.print-grid')[0]
    .findAll('.print-grid-row')
    .slice(1)
    .map((row) => row.findAll('.print-grid-cell').map((cell) => cell.text()))

describe('PrintView fielding sheet', () => {
  it('gives every benched player their own row, without a bench number', () => {
    const { fieldingPositions } = useGameConfigStore()
    const rows = fieldingRows(mountWithFirstInningFilled())
    const benchRows = rows.filter(([position]) => position === 'Bench')

    expect(benchRows).toEqual([
      ['Bench', 'Player J'],
      ['Bench', 'Player K']
    ])
    expect(rows).toHaveLength(fieldingPositions.length + benchRows.length)
  })

  it('still numbers the bench rows underneath the label it prints', () => {
    const benchRows = mountWithFirstInningFilled()
      .findAll('.print-grid')[0]
      .findAll('[data-position^="Bench"]')

    expect(benchRows.map((row) => row.attributes('data-position'))).toEqual(['Bench 1', 'Bench 2'])
    expect(benchRows.map((row) => row.findAll('.print-grid-cell')[0].text())).toEqual([
      'Bench',
      'Bench'
    ])
  })

  it('lists the fielding positions before the bench', () => {
    const { fieldingPositions } = useGameConfigStore()
    const rows = fieldingRows(mountWithFirstInningFilled())

    expect(rows.slice(0, fieldingPositions.length).map(([position]) => position)).toEqual(
      fieldingPositions
    )
  })

  it('benches the whole roster for an inning that was never filled in', () => {
    const wrapper = mountWithFirstInningFilled()
    const secondInningRows = wrapper
      .findAll('.print-grid')[2]
      .findAll('.print-grid-row')
      .slice(1)
      .map((row) => row.findAll('.print-grid-cell').map((cell) => cell.text()))

    expect(secondInningRows.filter(([position]) => position === 'Bench')).toHaveLength(
      testPlayers.length
    )
    // Every position is unfilled, so its player cell prints empty.
    expect(secondInningRows[0]).toEqual(['Pitcher', ''])
  })
})

describe('PrintView navigation', () => {
  it('sends the edit view links back to the lineup editor', () => {
    const wrapper = mountWithFirstInningFilled()
    const links = wrapper.findAll('router-link-stub')

    expect(links.length).toBeGreaterThan(0)
    links.forEach((link) => {
      expect(link.attributes('to')).toBe('/editlineups')
    })
  })
})
