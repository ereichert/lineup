import { defineStore } from 'pinia'

export const useGameConfigStore = defineStore('gameConfigStore', {
  state: () => {
    return {
      // TODO: The number of innings needs to be configurable through an interface.
      numInnings: 6,
      fieldingPositions: [
        'Catcher',
        'First',
        'Second',
        'Shortstop',
        'Third',
        'Left',
        'Center',
        'Right'
      ]
    }
  }
})
