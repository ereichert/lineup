import { defineStore } from 'pinia'
import { usePlayersStore } from './players'
import { useGameConfigStore } from './game-config'
import type Player from '@/models/Player'

export interface FieldingSlotRef {
  inning: number
  positionIdx: number
}

// Every inning starts as a full set of empty position slots. Players are dragged in from the
// roster pool, so unlike the old model the lineup does not snapshot the roster up front.
const initFieldingLineup = (): Array<Array<Player | null>> => {
  const { numInnings, fieldingPositions } = useGameConfigStore()
  return Array.from(
    { length: numInnings },
    () => new Array<Player | null>(fieldingPositions.length).fill(null)
  )
}

const initBattingLineup = (): Array<Player> => {
  const { players } = usePlayersStore()
  return [...players]
}

export const useLineupsStore = defineStore('lineups', {
  state: () => ({
    battingLineup: initBattingLineup(),
    fieldingLineup: initFieldingLineup() as Array<Array<Player | null>>
  }),
  getters: {
    // A player not holding a position in an inning is on the bench for it. The bench is derived
    // rather than stored so it can never disagree with the position assignments.
    benchedPlayersByInning(state): Array<Array<Player>> {
      const { players } = usePlayersStore()
      return state.fieldingLineup.map((inningLineup) =>
        players.filter((player) => !inningLineup.some((slot) => slot?.id === player.id))
      )
    }
  },
  actions: {
    isSlotInBounds(inning: number, positionIdx: number): boolean {
      const inningLineup = this.fieldingLineup[inning]
      return !!inningLineup && positionIdx >= 0 && positionIdx < inningLineup.length
    },

    assignPlayerToSlot(inning: number, positionIdx: number, player: Player) {
      if (!this.isSlotInBounds(inning, positionIdx)) {
        return
      }

      const inningLineup = this.fieldingLineup[inning]
      // A player holds at most one position per inning, so vacate wherever they already are.
      const currentIdx = inningLineup.findIndex((slot) => slot?.id === player.id)
      if (currentIdx !== -1) {
        inningLineup[currentIdx] = null
      }

      // Whoever held the target slot is simply replaced.
      inningLineup[positionIdx] = player
    },

    clearFieldingSlot(inning: number, positionIdx: number) {
      if (!this.isSlotInBounds(inning, positionIdx)) {
        return
      }
      this.fieldingLineup[inning][positionIdx] = null
    },

    moveFieldingSlot(from: FieldingSlotRef, to: FieldingSlotRef) {
      if (!this.isSlotInBounds(from.inning, from.positionIdx)) {
        return
      }
      if (!this.isSlotInBounds(to.inning, to.positionIdx)) {
        return
      }
      if (from.inning === to.inning && from.positionIdx === to.positionIdx) {
        return
      }

      const player = this.fieldingLineup[from.inning][from.positionIdx]
      if (!player) {
        return
      }

      this.fieldingLineup[from.inning][from.positionIdx] = null
      this.assignPlayerToSlot(to.inning, to.positionIdx, player)
    },

    setInningLineup(inning: number, inningLineup: Array<Player | null>) {
      if (!this.fieldingLineup[inning]) {
        return
      }
      this.fieldingLineup[inning] = [...inningLineup]
    },

    resetFieldingLineup() {
      this.fieldingLineup = initFieldingLineup()
    },

    // The roster can be re-entered after slots are filled, which would otherwise strand players
    // who are no longer on the team in the lineup.
    sanitizeFieldingLineup() {
      const { players } = usePlayersStore()
      const rosterIds = new Set(players.map((player) => player.id))
      this.fieldingLineup.forEach((inningLineup) => {
        inningLineup.forEach((slot, positionIdx) => {
          if (slot && !rosterIds.has(slot.id)) {
            inningLineup[positionIdx] = null
          }
        })
      })
    }
  }
})
