import Player from '@/models/Player'
import { defineStore } from 'pinia'

export const usePlayersStore = defineStore('playersStore', {
  state: () => {
    // TODO: Does this get called multiple times or is it a one time build on init?
    return {
      //TODO: Get the players from a textarea or upload
      // TODO: This probably needs to be a map from ID to player for easy lookups.
      roster: [
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
    }
  },
  getters: {
    players: (state) => state.roster,
    lookupPlayer: (state) => {
      return (playerId: string): Player | undefined => {
        return state.roster.find((player) => player.id === playerId)
      }
    }
  }
})
