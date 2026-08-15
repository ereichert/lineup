import Player from '@/models/Player'
import luValidations from '@/validation/lineup-validators'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeAll } from 'vitest'

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

const testCompleteBattingLineup: Array<Player> = [
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

const testIncompleteBattingLineup: Array<Player> = [
  new Player('01951f0d-77fd-70a7-a372-83ca9ea40b85', 'Player A'),
  new Player('01951f0d-77fd-7a5b-ab23-bb9b3bec5014', 'Player C'),
  new Player('01951f0d-77fd-75e8-a296-493dcbcefd41', 'Player D'),
  new Player('01951f0d-77fd-7b35-9d3e-32770c204350', 'Player F'),
  new Player('01951f0d-77fd-7398-aab2-16672864c9bf', 'Player G'),
  new Player('01951f0d-77fd-7359-9ae2-8f2302816a8a', 'Player H'),
  new Player('01951f0d-77fd-7d61-8407-42b9242413e1', 'Player J'),
  new Player('01951f0d-77fd-7535-90ad-7d33746e3ce0', 'Player K')
]

const NUM_INNINGS = 6
let testCompleteFieldingLineup = new Array<Array<Player>>(NUM_INNINGS)

const initTestFieldingLineup = (fieldingLineup: Array<Array<Player>>): Array<Array<Player>> => {
  for (let i = 0; i < fieldingLineup.length; i++) {
    fieldingLineup[i] = [...testPlayers]
  }
  return fieldingLineup
}

beforeAll(() => {
  testCompleteFieldingLineup = initTestFieldingLineup(testCompleteFieldingLineup)
  setActivePinia(createPinia())
})

describe('outfield position assignments', () => {
  it('should pass when all players have at least one outfield position', () => {
    const testFieldingLineupWithRotatedOutfielders = initTestFieldingLineup(
      new Array<Array<Player>>(NUM_INNINGS)
    )

    // Rotate the lineup by 3 positions each inning after the first inning.
    // Make sure all players have at least one outfield position.
    for (let i = 1; i < NUM_INNINGS; i++) {
      const inningFieldingLineup = testFieldingLineupWithRotatedOutfielders[i - 1]
      const shiftAmount = 3
      const newHead = inningFieldingLineup.slice(-shiftAmount)
      testFieldingLineupWithRotatedOutfielders[i] = [
        ...newHead,
        ...inningFieldingLineup.slice(0, -shiftAmount)
      ]
    }

    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(
        testFieldingLineupWithRotatedOutfielders
      )
    ).toBeTruthy()
  })

  it('should fail when at least one player is not assigned to an outfield position', () => {
    const testFieldingLineupWithRotatedOutfielders = initTestFieldingLineup(
      new Array<Array<Player>>(NUM_INNINGS)
    )

    // Rotate the lineup by 3 positions each inning after the first inning.
    // Make sure Player A is only assigned as a pitcher.
    for (let i = 1; i < NUM_INNINGS; i++) {
      const inningFieldingLineup = testFieldingLineupWithRotatedOutfielders[i - 1]
      const shiftAmount = 3
      const newHead = inningFieldingLineup.slice(-shiftAmount)
      testFieldingLineupWithRotatedOutfielders[i] = [
        inningFieldingLineup[0],
        ...newHead,
        ...inningFieldingLineup.slice(1, -shiftAmount)
      ]
    }

    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(
        testFieldingLineupWithRotatedOutfielders
      )
    ).toBeFalsy()
  })

  it('should fail when player only has infield and bench positions', () => {
    const testFieldingLineupWithRotatedOutfielders = initTestFieldingLineup(
      new Array<Array<Player>>(NUM_INNINGS)
    )

    // Make sure Player A is only assigned to infield and bench positions.
    for (let i = 1; i < NUM_INNINGS; i++) {
      const inningFieldingLineup = testFieldingLineupWithRotatedOutfielders[i - 1]
      const shiftAmount = 3
      if (i % 2 === 0) {
        // assign player A as the pitcher
        testFieldingLineupWithRotatedOutfielders[i] = [
          ...inningFieldingLineup.slice(-1),
          ...inningFieldingLineup.slice(7, 10),
          ...inningFieldingLineup.slice(0, 7)
        ]
      } else {
        // assign Player A to a bench position
        testFieldingLineupWithRotatedOutfielders[i] = [
          ...inningFieldingLineup.slice(-shiftAmount),
          ...inningFieldingLineup.slice(1, 8),
          inningFieldingLineup[0]
        ]
      }
    }

    expect(
      luValidations.hasAllPlayersAssignedToAnOutfieldPosition(
        testFieldingLineupWithRotatedOutfielders
      )
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
    it('should fail validation if players are missing in the fielding lineup in any inning.', () => {
      const testIncompleteFieldingLineup = initTestFieldingLineup(
        new Array<Array<Player>>(NUM_INNINGS)
      )
      // This will pass the length check but will fail the missing player check.
      testIncompleteFieldingLineup[3][3] = new Player('', 'Player ID missing')
      expect(
        luValidations.isValidFieldingLineup(testPlayers, testIncompleteFieldingLineup)
      ).toBeFalsy()
    })

    it('should pass validation if all of the players are included in the fielding lineup each inning.', () => {
      expect(
        luValidations.isValidFieldingLineup(testPlayers, testCompleteFieldingLineup)
      ).toBeTruthy()
    })

    it('should fail validation if the fielding lineup does not include the exact number of players each inning.', () => {
      const testIncompleteFieldingLineup = initTestFieldingLineup(
        new Array<Array<Player>>(NUM_INNINGS)
      )
      delete testIncompleteFieldingLineup[3][3]
      expect(
        luValidations.isValidFieldingLineup(testPlayers, testIncompleteFieldingLineup)
      ).toBeFalsy()
    })

    it('should pass validation if the fielding lineup includes the exact number of players each inning.', () => {
      expect(
        luValidations.isValidFieldingLineup(testPlayers, testCompleteFieldingLineup)
      ).toBeTruthy()
    })
  })
})

describe('isPrintViewAllowed', () => {
  const rotatedFieldingLineupWithAllPlayersInOutfield = (): Array<Array<Player>> => {
    const fieldingLineup = initTestFieldingLineup(new Array<Array<Player>>(NUM_INNINGS))
    for (let i = 1; i < NUM_INNINGS; i++) {
      const inningFieldingLineup = fieldingLineup[i - 1]
      const shiftAmount = 3
      const newHead = inningFieldingLineup.slice(-shiftAmount)
      fieldingLineup[i] = [...newHead, ...inningFieldingLineup.slice(0, -shiftAmount)]
    }
    return fieldingLineup
  }

  it('fails when a structural check fails, regardless of which rules are enabled', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testIncompleteBattingLineup,
        testCompleteFieldingLineup,
        { outfieldAssignment: false }
      )
    ).toBeFalsy()
  })

  it('passes when structural checks pass and a disabled participation rule is unmet', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        testCompleteFieldingLineup,
        { outfieldAssignment: false }
      )
    ).toBeTruthy()
  })

  it('fails when structural checks pass but an enabled participation rule is unmet', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        testCompleteFieldingLineup,
        { outfieldAssignment: true }
      )
    ).toBeFalsy()
  })

  it('passes when structural checks pass and an enabled participation rule is met', () => {
    expect(
      luValidations.isPrintViewAllowed(
        testPlayers,
        testCompleteBattingLineup,
        rotatedFieldingLineupWithAllPlayersInOutfield(),
        { outfieldAssignment: true }
      )
    ).toBeTruthy()
  })
})
