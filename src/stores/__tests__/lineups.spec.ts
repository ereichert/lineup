import Player from '@/models/Player'
import { useGameConfigStore } from '@/stores/game-config'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'

const testPlayers: Array<Player> = [
  new Player('01951f0d-77fd-70a7-a372-83ca9ea40b85', 'Player A'),
  new Player('01951f0d-77fd-7550-86d0-2e58561ecefc', 'Player B'),
  new Player('01951f0d-77fd-7a5b-ab23-bb9b3bec5014', 'Player C'),
  new Player('01951f0d-77fd-75e8-a296-493dcbcefd41', 'Player D'),
  new Player('01951f0d-77fd-7baf-9343-307713947988', 'Player E'),
  new Player('01951f0d-77fd-7b35-9d3e-32770c204350', 'Player F'),
  new Player('01951f0d-77fd-7398-aab2-16672864c9bf', 'Player G'),
  new Player('01951f0d-77fd-7359-9ae2-8f2302816a8a', 'Player H'),
  new Player('01951f0d-77fd-7858-a3fc-feed01e94f3d', 'Player I'),
  new Player('01951f0d-77fd-7d61-8407-42b9242413e1', 'Player J'),
  new Player('01951f0d-77fd-7535-90ad-7d33746e3ce0', 'Player K')
]

const PITCHER = 0
const CATCHER = 1
const CENTER = 7

beforeEach(() => {
  setActivePinia(createPinia())
  usePlayersStore().players = [...testPlayers]
})

describe('lineups store fielding slots', () => {
  it('starts with an empty slot for every position in every inning', () => {
    const { numInnings, fieldingPositions } = useGameConfigStore()
    const { fieldingLineup } = useLineupsStore()

    expect(fieldingLineup).toHaveLength(numInnings)
    fieldingLineup.forEach((inningLineup) => {
      expect(inningLineup).toHaveLength(fieldingPositions.length)
      expect(inningLineup.every((slot) => slot === null)).toBe(true)
    })
  })

  it('assigns a player to an empty slot', () => {
    const store = useLineupsStore()

    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    expect(store.fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[0].id)
  })

  it('replaces the player already occupying the target slot', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.assignPlayerToSlot(0, PITCHER, testPlayers[1])

    expect(store.fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[1].id)
  })

  it('clears the players previous position when reassigned within the same inning', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.assignPlayerToSlot(0, CENTER, testPlayers[0])

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
    expect(store.fieldingLineup[0][CENTER]?.id).toBe(testPlayers[0].id)
  })

  it('lets the same player be assigned in more than one inning', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.assignPlayerToSlot(1, CENTER, testPlayers[0])

    expect(store.fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[0].id)
    expect(store.fieldingLineup[1][CENTER]?.id).toBe(testPlayers[0].id)
  })

  it('never removes an assigned player from the roster pool', () => {
    const playersStore = usePlayersStore()
    const store = useLineupsStore()

    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])
    store.assignPlayerToSlot(1, CENTER, testPlayers[0])

    expect(playersStore.players).toHaveLength(testPlayers.length)
    expect(playersStore.players.map((player) => player.id)).toContain(testPlayers[0].id)
  })

  it('ignores an assignment to a slot that does not exist', () => {
    const store = useLineupsStore()

    store.assignPlayerToSlot(99, PITCHER, testPlayers[0])
    store.assignPlayerToSlot(0, 99, testPlayers[0])

    expect(store.fieldingLineup.flat().every((slot) => slot === null)).toBe(true)
  })

  it('empties a slot when it is cleared', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.clearFieldingSlot(0, PITCHER)

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
  })

  it('vacates the source slot when a player is moved within an inning', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.moveFieldingSlot({ inning: 0, positionIdx: PITCHER }, { inning: 0, positionIdx: CENTER })

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
    expect(store.fieldingLineup[0][CENTER]?.id).toBe(testPlayers[0].id)
  })

  it('vacates the source slot when a player is moved to another inning', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.moveFieldingSlot({ inning: 0, positionIdx: PITCHER }, { inning: 2, positionIdx: CENTER })

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
    expect(store.fieldingLineup[2][CENTER]?.id).toBe(testPlayers[0].id)
  })

  it('replaces the target occupant when a player is moved onto a filled slot', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])
    store.assignPlayerToSlot(0, CATCHER, testPlayers[1])

    store.moveFieldingSlot({ inning: 0, positionIdx: PITCHER }, { inning: 0, positionIdx: CATCHER })

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
    expect(store.fieldingLineup[0][CATCHER]?.id).toBe(testPlayers[0].id)
  })

  it('does nothing when an empty slot is moved', () => {
    const store = useLineupsStore()

    store.moveFieldingSlot({ inning: 0, positionIdx: PITCHER }, { inning: 0, positionIdx: CENTER })

    expect(store.fieldingLineup[0][CENTER]).toBeNull()
  })

  it('copies an inning without sharing the array', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.setInningLineup(3, store.fieldingLineup[0])
    store.clearFieldingSlot(0, PITCHER)

    expect(store.fieldingLineup[3][PITCHER]?.id).toBe(testPlayers[0].id)
    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
  })

  it('derives the bench from the players holding no position that inning', () => {
    const { fieldingPositions } = useGameConfigStore()
    const store = useLineupsStore()

    fieldingPositions.forEach((_, positionIdx) => {
      store.assignPlayerToSlot(0, positionIdx, testPlayers[positionIdx])
    })

    const benched = store.benchedPlayersByInning[0]

    expect(benched.map((player) => player.id)).toEqual(
      testPlayers.slice(fieldingPositions.length).map((player) => player.id)
    )
    // Nobody is assigned in a later inning, so the whole roster is on the bench for it.
    expect(store.benchedPlayersByInning[1]).toHaveLength(testPlayers.length)
  })

  it('clears players who are no longer on the roster', () => {
    const playersStore = usePlayersStore()
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])
    store.assignPlayerToSlot(0, CATCHER, testPlayers[1])

    playersStore.players = [testPlayers[1]]
    store.sanitizeFieldingLineup()

    expect(store.fieldingLineup[0][PITCHER]).toBeNull()
    expect(store.fieldingLineup[0][CATCHER]?.id).toBe(testPlayers[1].id)
  })

  it('empties every slot when the fielding lineup is reset', () => {
    const store = useLineupsStore()
    store.assignPlayerToSlot(0, PITCHER, testPlayers[0])

    store.resetFieldingLineup()

    expect(store.fieldingLineup.flat().every((slot) => slot === null)).toBe(true)
  })
})

describe('applying a parsed roster', () => {
  const PITCHER_IDX = PITCHER
  const namesOf = (roster: Array<{ name: string }>) => roster.map((player) => player.name)

  beforeEach(() => {
    usePlayersStore().players = []
  })

  it('lists the roster alphabetically whatever order it was typed in', () => {
    const store = useLineupsStore()

    store.applyRoster(['Cal', 'Ava', 'Ben'])

    expect(namesOf(usePlayersStore().players)).toEqual(['Ava', 'Ben', 'Cal'])
  })

  it('ignores a name typed twice', () => {
    const store = useLineupsStore()

    store.applyRoster(['Ava', 'Ben', 'Ava'])

    expect(namesOf(usePlayersStore().players)).toEqual(['Ava', 'Ben'])
    expect(store.battingLineup).toHaveLength(2)
  })

  it('keeps a players id when the roster is parsed again', () => {
    const store = useLineupsStore()
    store.applyRoster(['Ava', 'Ben'])
    const avaId = usePlayersStore().players[0].id

    store.applyRoster(['Ava', 'Ben'])

    expect(usePlayersStore().players[0].id).toBe(avaId)
  })

  it('leaves an existing lineup untouched when the roster is parsed again', () => {
    const store = useLineupsStore()
    store.applyRoster(['Ava', 'Ben'])
    const ava = usePlayersStore().players[0]
    store.assignPlayerToSlot(0, PITCHER_IDX, ava)

    store.applyRoster(['Ava', 'Ben'])

    expect(store.fieldingLineup[0][PITCHER_IDX]?.id).toBe(ava.id)
  })

  it('appends a newly added player to the bottom of the batting lineup', () => {
    const store = useLineupsStore()
    store.applyRoster(['Cal', 'Ava'])
    store.battingLineup = [...store.battingLineup].reverse()
    const battingBefore = namesOf(store.battingLineup)

    store.applyRoster(['Cal', 'Ava', 'Zoe'])

    expect(namesOf(store.battingLineup)).toEqual([...battingBefore, 'Zoe'])
  })

  it('puts a newly added player on the bench for every inning', () => {
    const { numInnings } = useGameConfigStore()
    const store = useLineupsStore()
    store.applyRoster(['Ava', 'Ben'])

    store.applyRoster(['Ava', 'Ben', 'Zoe'])

    for (let inning = 0; inning < numInnings; inning++) {
      expect(namesOf(store.benchedPlayersByInning[inning])).toContain('Zoe')
    }
  })

  it('drops a removed player from the batting lineup and frees their position', () => {
    const store = useLineupsStore()
    store.applyRoster(['Ava', 'Ben'])
    const [ava, ben] = usePlayersStore().players
    store.assignPlayerToSlot(0, PITCHER_IDX, ava)
    store.assignPlayerToSlot(0, CATCHER, ben)

    store.applyRoster(['Ben'])

    expect(namesOf(store.battingLineup)).toEqual(['Ben'])
    expect(store.fieldingLineup[0][PITCHER_IDX]).toBeNull()
    expect(store.fieldingLineup[0][CATCHER]?.id).toBe(ben.id)
  })
})

describe('importing a saved lineup', () => {
  it('replaces the roster, the batting lineup and the fielding lineup', () => {
    const { numInnings, fieldingPositions } = useGameConfigStore()
    const store = useLineupsStore()
    const cal = new Player('id-cal', 'Cal')
    const ava = new Player('id-ava', 'Ava')
    const imported = {
      players: [ava, cal],
      battingLineup: [cal, ava],
      fieldingLineup: Array.from({ length: numInnings }, () =>
        new Array<Player | null>(fieldingPositions.length).fill(null)
      )
    }
    imported.fieldingLineup[0][PITCHER] = ava

    store.importLineup(imported)

    expect(usePlayersStore().players.map((player) => player.name)).toEqual(['Ava', 'Cal'])
    expect(store.battingLineup.map((player) => player.name)).toEqual(['Cal', 'Ava'])
    expect(store.fieldingLineup[0][PITCHER]?.id).toBe('id-ava')
    expect(store.benchedPlayersByInning[0].map((player) => player.name)).toEqual(['Cal'])
  })
})
