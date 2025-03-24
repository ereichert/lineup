import { defineStore } from 'pinia'
import { usePlayersStore } from './players'
import { useGameConfigStore } from './game-config'
import type Player from '@/models/Player'

const initFieldingLineup = (): Array<Array<Player>> => {
  const { numInnings } = useGameConfigStore()
  const { players } = usePlayersStore()
  const fieldingLineup: Array<Array<Player>> = new Array(numInnings)
  for (let i = 0; i < fieldingLineup.length; i++) {
    fieldingLineup[i] = [...players]
  }
  return fieldingLineup
}

const initFieldingPositions = (): Array<string> => {
  const { players } = usePlayersStore()
  const { fieldingPositions } = useGameConfigStore()
  const finalPositionsList: Array<string> = [...fieldingPositions]
  for (let i = 0; i < players.length - fieldingPositions.length; i++) {
    finalPositionsList.push(`Bench ${i + 1}`)
  }
  return finalPositionsList
}

const initBattingLineup = (): Array<Player> => {
  const { players } = usePlayersStore()
  return [...players]
}

export const useLineupsStore = defineStore('lineups', {
  state: () => ({
    battingLineup: initBattingLineup(),
    fieldingLineup: initFieldingLineup(),
    fieldingAndBenchPositions: initFieldingPositions()
  })
})
