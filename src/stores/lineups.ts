import { defineStore } from 'pinia'
import { usePlayersStore } from './players'
import { useGameConfigStore } from './game-config'

const splitFieldingPositionId = (
  fieldPositionId: string
): [fieldPosition: string, inning: number] => {
  const [fieldPosition, rawInning] = fieldPositionId.split('-')
  const inning = parseInt(rawInning)
  return [fieldPosition, inning]
}

const initFieldingLineup = (): Array<Map<string, string>> => {
  const { numInnings, fieldingPositions } = useGameConfigStore()
  const fieldingLineup: Array<Map<string, string>> = new Array(numInnings)
  for (let i = 0; i < fieldingLineup.length; i++) {
    const inningLineup = new Map<string, string>(
      fieldingPositions.map((position) => {
        return [position.toLowerCase(), position]
      })
    )
    fieldingLineup[i] = inningLineup
  }
  return fieldingLineup
}

const initFieldingPositions = (): Array<string> => {
  const { getPlayers: players } = usePlayersStore()
  const { fieldingPositions } = useGameConfigStore()
  const finalPositionsList: Array<string> = [...fieldingPositions]
  for (let i = 0; i < players.length - fieldingPositions.length; i++) {
    finalPositionsList.push(`Bench ${i + 1}`)
  }
  return finalPositionsList
}

export const useLineupsStore = defineStore('lineups', {
  state: () => ({
    battingLineup: {} as Record<string, string>,
    fieldingLineup: initFieldingLineup(),
    fieldingAndBenchPositions: initFieldingPositions()
  }),
  getters: {
    isFielderChosenMultipleTimes() {
      return (fieldingPositionId: string) => {
        const [fieldingPosition, inning] = splitFieldingPositionId(fieldingPositionId)
        // Iterate through the dictionary of fielding positions which have been filled with player selections.
        // Filter the dictionary values leaving an array whose length represents the number of fielding positions occupied
        // by the same player. If the array length is greater than 1 that means the same player has been assigned to
        // more than 1 fielding position and the fielding lineup is incorrect.
        const inningLineupOfInterest = this.fieldingLineup[inning]
        const playerIdOfInterest = inningLineupOfInterest.get(fieldingPosition)
        return (
          Array.from(inningLineupOfInterest.values()).filter((playerId) => {
            return playerId === playerIdOfInterest
          }).length > 1
        )
      }
    },
    isBatterChosenMultipleTimes() {
      // Iterate through the dictionary of batting positions which have been filled with player selections.
      // Filter the dictionary values leaving an array whose length represents the number of batting positions occupied
      // by the same player. If the array length is greater than 1 that means the same player has been assigned to more
      // than 1 batting position and the batting lineup is incorrect.
      return (battingPosition: number) => {
        const playerOfInterestId = this.battingLineup[battingPosition]
        return (
          Object.values(this.battingLineup).filter((playerId) => playerId === playerOfInterestId)
            .length > 1
        )
      }
    }
  },
  actions: {
    updateBattingLineup(battingPosition: string, playerId: string) {
      this.battingLineup[battingPosition] = playerId
    },
    // The fieldPositionId is a combination of the position (e.g., catcher, first base, etc.) and the inning number.
    // The position and the inning number are hyphenated.
    updateFieldingLineup(fieldPositionId: string, playerId: string) {
      const [fieldPosition, inning] = splitFieldingPositionId(fieldPositionId)
      this.fieldingLineup[inning].set(fieldPosition, playerId)
    }
  }
})
