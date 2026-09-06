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

const mountPrintView = () => mount(PrintView, { global: { stubs: { RouterLink: true } } })

// PrintView reads the stores once at setup, so the lineup has to be in place before mounting.
const fillFirstInning = () => {
  const { fieldingPositions } = useGameConfigStore()
  const lineupsStore = useLineupsStore()
  lineupsStore.battingLineup = [...testPlayers]
  fieldingPositions.forEach((_, positionIdx) => {
    lineupsStore.assignPlayerToSlot(0, positionIdx, testPlayers[positionIdx])
  })
}

// Shifting the roster by one each inning fills every position in every inning and leaves a
// different pair on the bench each time, so the sheet has something to show in every cell.
const fillEveryInning = () => {
  const { numInnings, fieldingPositions } = useGameConfigStore()
  const lineupsStore = useLineupsStore()
  lineupsStore.battingLineup = [...testPlayers]
  for (let inning = 0; inning < numInnings; inning++) {
    fieldingPositions.forEach((_, positionIdx) => {
      lineupsStore.assignPlayerToSlot(
        inning,
        positionIdx,
        testPlayers[(inning + positionIdx) % testPlayers.length]
      )
    })
  }
}

type Wrapper = ReturnType<typeof mountPrintView>

const fieldingGrid = (wrapper: Wrapper) => wrapper.findAll('.print-grid')[0]

const rowsOf = (grid: ReturnType<typeof fieldingGrid>) =>
  grid.findAll('.print-grid-row').map((row) => row.findAll('.print-grid-cell').map((c) => c.text()))

describe('PrintView fielding sheet', () => {
  it('gives every inning its own column on a single sheet', () => {
    const { numInnings } = useGameConfigStore()
    fillEveryInning()

    const [header] = rowsOf(fieldingGrid(mountPrintView()))

    expect(header).toEqual(['Position', '1', '2', '3', '4', '5', '6'])
    expect(header).toHaveLength(numInnings + 1)
    // The old sheet repeated a two column table per inning; there is only one grid per lineup now.
    expect(mountPrintView().findAll('.print-grid')).toHaveLength(2)
  })

  it('reads one position across all of the innings', () => {
    fillEveryInning()

    const [pitcherRow] = rowsOf(fieldingGrid(mountPrintView())).slice(1)

    expect(pitcherRow).toEqual([
      'Pitcher',
      'Player A',
      'Player B',
      'Player C',
      'Player D',
      'Player E',
      'Player F'
    ])
  })

  it('lists the fielding positions before the bench', () => {
    const { fieldingPositions } = useGameConfigStore()
    fillEveryInning()

    const rows = rowsOf(fieldingGrid(mountPrintView())).slice(1)

    expect(rows.slice(0, fieldingPositions.length).map(([position]) => position)).toEqual(
      fieldingPositions
    )
    expect(rows.slice(fieldingPositions.length).map(([position]) => position)).toEqual([
      'Bench',
      'Bench'
    ])
  })

  it('gives every benched player their own row, without a bench number', () => {
    fillEveryInning()

    const benchRows = rowsOf(fieldingGrid(mountPrintView())).filter(
      ([position]) => position === 'Bench'
    )

    // Roster order decides which of the two benched players lands on which row.
    expect(benchRows).toEqual([
      ['Bench', 'Player J', 'Player A', 'Player A', 'Player B', 'Player C', 'Player D'],
      ['Bench', 'Player K', 'Player K', 'Player B', 'Player C', 'Player D', 'Player E']
    ])
  })

  it('still numbers the bench rows underneath the label it prints', () => {
    fillEveryInning()

    const benchRows = fieldingGrid(mountPrintView()).findAll('[data-position^="Bench"]')

    expect(benchRows.map((row) => row.attributes('data-position'))).toEqual(['Bench 1', 'Bench 2'])
    expect(benchRows.map((row) => row.findAll('.print-grid-cell')[0].text())).toEqual([
      'Bench',
      'Bench'
    ])
  })

  it('leaves a cell blank for a position nobody was assigned to', () => {
    fillFirstInning()

    const [pitcherRow] = rowsOf(fieldingGrid(mountPrintView())).slice(1)

    expect(pitcherRow).toEqual(['Pitcher', 'Player A', '', '', '', '', ''])
  })

  it('benches the whole roster for an inning that was never filled in', () => {
    fillFirstInning()

    const benchRows = rowsOf(fieldingGrid(mountPrintView())).filter(
      ([position]) => position === 'Bench'
    )

    // Innings two through six are untouched, so the bench is as deep as the whole roster.
    expect(benchRows).toHaveLength(testPlayers.length)
    // Only the two players left out of inning one are benched in it.
    expect(benchRows.map((row) => row[1])).toEqual([
      'Player J',
      'Player K',
      ...Array(testPlayers.length - 2).fill('')
    ])
    expect(benchRows.map((row) => row[2])).toEqual(testPlayers.map((player) => player.name))
  })
})

describe('PrintView batting sheet', () => {
  it('prints the batting order once rather than once per inning', () => {
    fillEveryInning()

    const battingRows = rowsOf(mountPrintView().findAll('.print-grid')[1]).slice(1)

    expect(battingRows).toEqual(
      testPlayers.map((player, idx) => [String(idx + 1), player.name])
    )
  })
})

describe('PrintView navigation', () => {
  it('sends the edit view links back to the lineup editor', () => {
    fillEveryInning()
    const links = mountPrintView().findAll('router-link-stub')

    expect(links.length).toBeGreaterThan(0)
    links.forEach((link) => {
      expect(link.attributes('to')).toBe('/editlineups')
    })
  })
})
