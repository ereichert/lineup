import Player from '@/models/Player'
import luValidations from '@/validation/lineup-validators'
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
let testCompleteFieldingLineup = new Array<Map<string, string>>(NUM_INNINGS)

const testFieldingPositions = [
  'Catcher',
  'First',
  'Second',
  'Shortstop',
  'Third',
  'Left',
  'Center',
  'Right',
  'Bench 1',
  'Bench 2',
  'Bench 3'
]

const initTestFieldingLineup = (
  fieldingLineup: Array<Map<string, string>>
): Array<Map<string, string>> => {
  for (let i = 0; i < fieldingLineup.length; i++) {
    const inningLineup = new Map<string, string>(
      testFieldingPositions.map((position) => {
        return [position.toLowerCase(), position]
      })
    )
    const randomPlayers = testPlayers.sort(() => Math.random() - 0.5)
    Array.from(inningLineup.keys()).forEach((position, idx) =>
      inningLineup.set(position, randomPlayers[idx].id)
    )
    fieldingLineup[i] = inningLineup
  }
  return fieldingLineup
}

beforeAll(() => {
  testCompleteFieldingLineup = initTestFieldingLineup(testCompleteFieldingLineup)
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
      const testIncompleteFieldingLineup = initTestFieldingLineup(new Array<Map<string, string>>(6))
      // This will pass the length check but will fail the missing player check.
      testIncompleteFieldingLineup[3].set('bench 1', '')
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
      const testIncompleteFieldingLineup = initTestFieldingLineup(new Array<Map<string, string>>(6))
      testIncompleteFieldingLineup[3].delete('bench 1')
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
