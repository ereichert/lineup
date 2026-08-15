import type Player from '@/models/Player'
import { FieldingPositions } from '@/stores/game-config'
import { useLineupsStore } from '@/stores/lineups'

const isValidBattingLineup = (players: Array<Player>, battingLineup: Array<Player>): boolean => {
  const battingLineupIds = battingLineup.map((player) => player.id)

  if (battingLineupIds.length !== players.length) {
    return false
  }

  const isValid = players.filter((player) => !battingLineupIds.includes(player.id)).length === 0
  if (isValid) {
    console.info('Batting lineup is valid.')
  } else {
    console.error('Batting lineup is invalid.')
  }

  return isValid
}

const isValidFieldingLineup = (
  players: Array<Player>,
  fieldingLineup: Array<Array<Player>>
): boolean => {
  let isValid = true
  for (let inning = 0; inning < fieldingLineup.length; inning++) {
    const nextFieldingLineup = fieldingLineup[inning]
    // This case probably means the correct number of bench players were not added to the initial lineup.
    // If the correct number of bench players were not added to the initial lineup the lineup editing view should
    // not show the correct number of bench positions.
    if (nextFieldingLineup.length !== players.length) {
      isValid = false
      break
    }

    // Since we have validated that the lineup has the same number of available players
    // the only way this case can happen is if one of the players has not been assigned a fielding position during
    // one of the innings. This most likely means a player was selected twice also.
    const fieldingLineupIds = nextFieldingLineup.map((player) => player.id)
    if (players.filter((player) => !fieldingLineupIds.includes(player.id)).length !== 0) {
      isValid = false
      break
    }
  }

  if (isValid) {
    console.info('Fielding lineup is valid.')
  } else {
    console.error('Fielding lineup is invalid.')
  }

  return isValid
}

const hasAllPlayersAssignedToAnOutfieldPosition = (
  fieldingLineup: Array<Array<Player>>
): boolean => {
  const { fieldingAndBenchPositions } = useLineupsStore()
  const positionTracker: Record<string, Set<string>> = {}

  fieldingLineup.forEach((inning) => {
    inning.forEach((player, idx) => {
      if (!positionTracker[player.name]) {
        positionTracker[player.name] = new Set()
      }
      positionTracker[player.name].add(fieldingAndBenchPositions[idx])
    })
  })

  const playersMissingOutfieldAssignments = Object.keys(positionTracker).filter((playerName) => {
    const positions = positionTracker[playerName]
    if (
      !positions.has(FieldingPositions.RIGHT) &&
      !positions.has(FieldingPositions.CENTER) &&
      !positions.has(FieldingPositions.LEFT)
    ) {
      return playerName
    }
  })

  if (playersMissingOutfieldAssignments.length > 0) {
    console.info(`Players missing an outfield assignment: ${playersMissingOutfieldAssignments}`)
    return false
  } else {
    console.info('All players are assigned to right, center, and left at least once.')
    return true
  }
}

export interface ParticipationRule {
  id: string
  label: string
  validate: (fieldingLineup: Array<Array<Player>>) => boolean
}

const participationRules: Array<ParticipationRule> = [
  {
    id: 'outfieldAssignment',
    label: 'Every player must play at least one outfield inning (Left, Center, or Right)',
    validate: hasAllPlayersAssignedToAnOutfieldPosition
  }
]

const isPrintViewAllowed = (
  players: Array<Player>,
  battingLineup: Array<Player>,
  fieldingLineup: Array<Array<Player>>,
  enabledRules: Record<string, boolean>
): boolean => {
  const structuralChecksPass =
    isValidBattingLineup(players, battingLineup) && isValidFieldingLineup(players, fieldingLineup)

  return (
    structuralChecksPass &&
    participationRules
      .filter((rule) => enabledRules[rule.id])
      .every((rule) => rule.validate(fieldingLineup))
  )
}

export default {
  hasAllPlayersAssignedToAnOutfieldPosition,
  isValidBattingLineup,
  isValidFieldingLineup,
  isPrintViewAllowed,
  participationRules
}
