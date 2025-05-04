import type Player from '@/models/Player'
import { defineStore } from 'pinia'

export const usePlayersStore = defineStore('playersStore', {
  state: () => ({
    players: [] as Array<Player>
  })
})
