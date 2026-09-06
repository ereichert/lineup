import type Player from '@/models/Player'
import { isOutfieldPosition, useGameConfigStore } from '@/stores/game-config'

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
  fieldingLineup: Array<Array<Player | null>>
): boolean => {
  const { fieldingPositions } = useGameConfigStore()
  const rosterIds = new Set(players.map((player) => player.id))
  let isValid = true

  for (const inningLineup of fieldingLineup) {
    // Every inning holds exactly one slot per fielding position.
    if (inningLineup.length !== fieldingPositions.length) {
      isValid = false
      break
    }

    const assignedIds = new Set<string>()
    for (const slot of inningLineup) {
      // An unfilled position means the lineup is not ready to be printed.
      if (!slot) {
        isValid = false
        break
      }

      // A player cannot cover two positions during the same inning.
      if (assignedIds.has(slot.id)) {
        isValid = false
        break
      }

      // A player left over from an earlier roster is no longer assignable.
      if (!rosterIds.has(slot.id)) {
        isValid = false
        break
      }

      assignedIds.add(slot.id)
    }

    if (!isValid) {
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
  players: Array<Player>,
  fieldingLineup: Array<Array<Player | null>>
): boolean => {
  const { fieldingPositions } = useGameConfigStore()
  const outfieldPlayerIds = new Set<string>()

  fieldingLineup.forEach((inningLineup) => {
    inningLineup.forEach((slot, positionIdx) => {
      if (slot && isOutfieldPosition(fieldingPositions[positionIdx])) {
        outfieldPlayerIds.add(slot.id)
      }
    })
  })

  // Checked against the roster rather than against the players found in the lineup, because a
  // player who was never assigned anywhere has no outfield inning either.
  const playersMissingOutfieldAssignments = players.filter(
    (player) => !outfieldPlayerIds.has(player.id)
  )

  if (playersMissingOutfieldAssignments.length > 0) {
    const missingNames = playersMissingOutfieldAssignments.map((player) => player.name)
    console.info(`Players missing an outfield assignment: ${missingNames}`)
    return false
  }

  console.info('All players are assigned to left, center, or right at least once.')
  return true
}

export interface ParticipationRule {
  id: string
  label: string
  validate: (players: Array<Player>, fieldingLineup: Array<Array<Player | null>>) => boolean
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
  fieldingLineup: Array<Array<Player | null>>,
  enabledRules: Record<string, boolean>
): boolean => {
  const structuralChecksPass =
    isValidBattingLineup(players, battingLineup) && isValidFieldingLineup(players, fieldingLineup)

  return (
    structuralChecksPass &&
    participationRules
      .filter((rule) => enabledRules[rule.id])
      .every((rule) => rule.validate(players, fieldingLineup))
  )
}

export default {
  hasAllPlayersAssignedToAnOutfieldPosition,
  isValidBattingLineup,
  isValidFieldingLineup,
  isPrintViewAllowed,
  participationRules
}
