import Player from '@/models/Player'
import luValidations from '@/validation/lineup-validators'
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

const testCompleteBattingLineup: Array<Player> = [...testPlayers]

const testIncompleteBattingLineup: Array<Player> = [
  testPlayers[0],
  testPlayers[2],
  testPlayers[3],
  testPlayers[5],
  testPlayers[6],
  testPlayers[7],
  testPlayers[9],
  testPlayers[10]
]

const NUM_INNINGS = 6
const NUM_POSITIONS = 9
const PITCHER = 0

// Rotating the roster by three each inning fills all nine positions and works every player
// through left, center and right (positions 6, 7 and 8) at least once.
const rotatedFieldingLineup = (): Array<Array<Player | null>> =>
  Array.from({ length: NUM_INNINGS }, (_, inning) => {
    const offset = (inning * 3) % testPlayers.length
    const rotated = [...testPlayers.slice(offset), ...testPlayers.slice(0, offset)]
    return rotated.slice(0, NUM_POSITIONS) as Array<Player | null>
  })

// The same nine players every inning, so the last two on the roster are never assigned at all.
const sameNinePlayersEveryInning = (): Array<Array<Player | null>> =>
  Array.from(
    { length: NUM_INNINGS },
    () => testPlayers.slice(0, NUM_POSITIONS) as Array<Player | null>
  )

// A full lineup in which Player A pitches every inning and so never reaches the outfield.
const playerAlwaysPitching = (): Array<Array<Player | null>> =>
  rotatedFieldingLineup().map((inningLineup) => {
    const lineup = [...inningLineup]
    const currentIdx = lineup.findIndex((slot) => slot?.id === testPlayers[0].id)
    if (currentIdx === -1) {
      lineup[PITCHER] = testPlayers[0]
    } else {
      lineup[currentIdx] = lineup[PITCHER]
      lineup[PITCHER] = testPlayers[0]
    }
    return lineup
  })

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('outfield position assignments', () => {
  it('should pass when all players have at least one outfield position', () => {
    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(testPlayers, rotatedFieldingLineup())
    ).toBeTruthy()
  })

  it('should fail when a player is never assigned to any position', () => {
    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(
        testPlayers,
        sameNinePlayersEveryInning()
      )
    ).toBeFalsy()
  })

  it('should fail when a player only ever plays an infield position', () => {
    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(testPlayers, playerAlwaysPitching())
    ).toBeFalsy()
  })
})

describe('lineup validators', () => {
  describe('batting lineups', () => {
    it('should fail validation if players are missing in the batting lineup.', () => {
      expect(
        luValidations.isValidBattingLineup(testPlayers, testIncompleteBattingLineup)
      ).toBeFalsy()
    })

    it('should pass validation if all of the players are included in the batting lineup.', () => {
      expect(
        luValidations.isValidBattingLineup(testPlayers, testCompleteBattingLineup)
      ).toBeTruthy()
    })

    it('should fail validation if the batting lineup does not include the exact number of players.', () => {
      expect(
        luValidations.isValidBattingLineup(testPlayers, testIncompleteBattingLineup)
      ).toBeFalsy()
    })

    it('should pass validation if the batting lineup includes the exact number of players.', () => {
      expect(
        luValidations.isValidBattingLineup(testPlayers, testCompleteBattingLineup)
      ).toBeTruthy()
    })
  })

  describe('fielding lineups', () => {
    it('should pass validation when every position is filled in every inning.', () => {
      expect(luValidations.isValidFieldingLineup(testPlayers, rotatedFieldingLineup())).toBeTruthy()
    })

    it('should fail validation if a position is left empty in any inning.', () => {
      const fieldingLineup = rotatedFieldingLineup()
      fieldingLineup[3][3] = null

      expect(luValidations.isValidFieldingLineup(testPlayers, fieldingLineup)).toBeFalsy()
    })

    it('should fail validation if a player covers two positions in the same inning.', () => {
      const fieldingLineup = rotatedFieldingLineup()
      fieldingLineup[0][1] = fieldingLineup[0][0]

      expect(luValidations.isValidFieldingLineup(testPlayers, fieldingLineup)).toBeFalsy()
    })

    it('should fail validation if a position is held by someone who is not on the roster.', () => {
      const fieldingLineup = rotatedFieldingLineup()
      fieldingLineup[0][0] = new Player('01951f0d-77fd-7000-0000-000000000000', 'Not On Roster')

      expect(luValidations.isValidFieldingLineup(testPlayers, fieldingLineup)).toBeFalsy()
    })

    it('should fail validation if an inning does not have a slot for every position.', () => {
      const fieldingLineup = rotatedFieldingLineup()
      fieldingLineup[2] = fieldingLineup[2].slice(0, NUM_POSITIONS - 1)

      expect(luValidations.isValidFieldingLineup(testPlayers, fieldingLineup)).toBeFalsy()
    })
  })
})

describe('isPrintViewAllowed', () => {
  it('fails when a structural check fails, regardless of which rules are enabled', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testIncompleteBattingLineup,
        rotatedFieldingLineup(),
        { outfieldAssignment: false }
      )
    ).toBeFalsy()
  })

  it('passes when structural checks pass and a disabled participation rule is unmet', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        playerAlwaysPitching(),
        { outfieldAssignment: false }
      )
    ).toBeTruthy()
  })

  it('fails when structural checks pass but an enabled participation rule is unmet', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        playerAlwaysPitching(),
        { outfieldAssignment: true }
      )
    ).toBeFalsy()
  })

  it('passes when structural checks pass and an enabled participation rule is met', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        rotatedFieldingLineup(),
        { outfieldAssignment: true }
      )
    ).toBeTruthy()
  })
})
