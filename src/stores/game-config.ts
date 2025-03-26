import { defineStore } from 'pinia'

export const FieldingPositions = Object.freeze({
  PITCHER: 'Pitcher',
  CATCHER: 'Catcher',
  FIRST: 'First',
  SECOND: 'Second',
  SHORT_STOP: 'Shortstop',
  THIRD: 'Third',
  LEFT: 'Left',
  CENTER: 'Center',
  RIGHT: 'Right'
})

export const useGameConfigStore = defineStore('gameConfigStore', {
  state: () => {
    return {
      // TODO: The number of innings needs to be configurable through an interface.
      numInnings: 6,
      fieldingPositions: [
        FieldingPositions.PITCHER,
        FieldingPositions.CATCHER,
        FieldingPositions.FIRST,
        FieldingPositions.SECOND,
        FieldingPositions.SHORT_STOP,
        FieldingPositions.THIRD,
        FieldingPositions.LEFT,
        FieldingPositions.CENTER,
        FieldingPositions.RIGHT
      ]
    }
  }
})
