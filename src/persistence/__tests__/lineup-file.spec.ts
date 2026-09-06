import Player from '@/models/Player'
import {
  buildLineupExport,
  parseLineupExport,
  toLineupState,
  LINEUP_FILE_VERSION
} from '@/persistence/lineup-file'
import { describe, it, expect } from 'vitest'

const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First',
  'Second',
  'Shortstop',
  'Third',
  'Left',
  'Center',
  'Right'
]
const NUM_INNINGS = 6

const ava = new Player('id-ava', 'Ava')
const ben = new Player('id-ben', 'Ben')
const cal = new Player('id-cal', 'Cal')

// Batting order is deliberately not alphabetical so the roster derivation can be checked.
const battingLineup = [cal, ava, ben]

const fieldingLineup = (): Array<Array<Player | null>> =>
  Array.from({ length: NUM_INNINGS }, (_, inning) => {
    const inningLineup = new Array<Player | null>(POSITIONS.length).fill(null)
    if (inning === 0) {
      inningLineup[0] = ava
      inningLineup[7] = ben
    }
    return inningLineup
  })

const exported = () => buildLineupExport(battingLineup, fieldingLineup(), POSITIONS, NUM_INNINGS)

describe('building a lineup export', () => {
  it('stamps the format version and the positions the slots refer to', () => {
    const document = exported()

    expect(document.formatVersion).toBe(LINEUP_FILE_VERSION)
    expect(document.fieldingPositions).toEqual(POSITIONS)
    expect(document.numInnings).toBe(NUM_INNINGS)
  })

  it('writes the batting lineup in order and the fielding lineup as player ids', () => {
    const document = exported()

    expect(document.battingLineup).toEqual([
      { id: 'id-cal', name: 'Cal' },
      { id: 'id-ava', name: 'Ava' },
      { id: 'id-ben', name: 'Ben' }
    ])
    expect(document.fieldingLineup[0][0]).toBe('id-ava')
    expect(document.fieldingLineup[0][7]).toBe('id-ben')
    expect(document.fieldingLineup[0][1]).toBeNull()
  })

  it('does not store a separate roster', () => {
    expect(exported()).not.toHaveProperty('players')
  })
})

describe('reading a lineup export', () => {
  const roundTrip = () => {
    const document = parseLineupExport(JSON.stringify(exported()))
    return toLineupState(document, POSITIONS, NUM_INNINGS)
  }

  it('restores the batting lineup in its saved order', () => {
    expect(roundTrip().battingLineup.map((player) => player.name)).toEqual(['Cal', 'Ava', 'Ben'])
  })

  it('derives the roster from the batting lineup, listed alphabetically', () => {
    expect(roundTrip().players.map((player) => player.name)).toEqual(['Ava', 'Ben', 'Cal'])
  })

  it('restores every position assignment', () => {
    const { fieldingLineup: restored } = roundTrip()

    expect(restored[0][0]?.id).toBe('id-ava')
    expect(restored[0][7]?.id).toBe('id-ben')
    expect(restored[0][1]).toBeNull()
    expect(restored[1].every((slot) => slot === null)).toBe(true)
  })

  it('keeps the roster and the batting lineup pointing at the same players', () => {
    const { players, battingLineup: restored } = roundTrip()
    const restoredAva = restored.find((player) => player.name === 'Ava')

    expect(players.find((player) => player.name === 'Ava')).toBe(restoredAva)
  })

  it('matches slots by position name rather than by index', () => {
    const document = exported()
    // A file written with the outfield listed first still has to land correctly.
    const reordered = ['Left', 'Center', 'Right', ...POSITIONS.slice(0, 6)]
    document.fieldingLineup = document.fieldingLineup.map((inningLineup) => [
      ...inningLineup.slice(6, 9),
      ...inningLineup.slice(0, 6)
    ])
    document.fieldingPositions = reordered

    const { fieldingLineup: restored } = toLineupState(document, POSITIONS, NUM_INNINGS)

    expect(restored[0][POSITIONS.indexOf('Pitcher')]?.id).toBe('id-ava')
    expect(restored[0][POSITIONS.indexOf('Center')]?.id).toBe('id-ben')
  })

  it('pads out innings the file does not cover', () => {
    const document = exported()
    document.fieldingLineup = document.fieldingLineup.slice(0, 2)

    const { fieldingLineup: restored } = toLineupState(document, POSITIONS, NUM_INNINGS)

    expect(restored).toHaveLength(NUM_INNINGS)
    expect(restored[5].every((slot) => slot === null)).toBe(true)
  })

  it('drops innings beyond the ones being played', () => {
    const document = exported()
    document.fieldingLineup = [...document.fieldingLineup, ...document.fieldingLineup]

    expect(toLineupState(document, POSITIONS, NUM_INNINGS).fieldingLineup).toHaveLength(NUM_INNINGS)
  })

  it('empties a slot naming a player who is not in the batting lineup', () => {
    const document = exported()
    document.fieldingLineup[0][0] = 'id-nobody'

    expect(toLineupState(document, POSITIONS, NUM_INNINGS).fieldingLineup[0][0]).toBeNull()
  })
})

describe('rejecting an unreadable file', () => {
  it('rejects something that is not JSON', () => {
    expect(() => parseLineupExport('not a lineup')).toThrowError(/not valid JSON/)
  })

  it('rejects JSON that is not an object', () => {
    expect(() => parseLineupExport('[1, 2, 3]')).toThrowError(/does not contain a saved lineup/)
  })

  it('rejects a file with no batting lineup', () => {
    const document = exported()
    document.battingLineup = []

    expect(() => parseLineupExport(JSON.stringify(document))).toThrowError(/no players/)
  })

  it('rejects a file whose fielding lineup is not slots of player ids', () => {
    const document = { ...exported(), fieldingLineup: [[{ nope: true }]] }

    expect(() => parseLineupExport(JSON.stringify(document))).toThrowError(/unreadable fielding/)
  })

  it('rejects a file that does not name its positions', () => {
    const document = { ...exported(), fieldingPositions: 'Pitcher' }

    expect(() => parseLineupExport(JSON.stringify(document))).toThrowError(/which positions/)
  })
})
