import type Player from '@/models/Player'

const isValidBattingLineup = (players: Array<Player>, battingLineup: Array<Player>): boolean => {
  const battingLineupIds = battingLineup.map((player) => player.id)

  if (battingLineupIds.length !== players.length) {
    return false
  }

  return players.filter((player) => !battingLineupIds.includes(player.id)).length === 0
}

const isValidFieldingLineup = (
  players: Array<Player>,
  fieldingLineup: Array<Map<string, string>>
): boolean => {
  let isValid = true
  for (let inning = 0; inning < fieldingLineup.length; inning++) {
    const nextFieldingLineup = fieldingLineup[inning]
    // This case probably means the correct number of bench players were not added to the initial lineup.
    // If the correct number of bench players were not added to the initial lineup the lineup editing view should
    // not show the correct number of bench positions.
    if (nextFieldingLineup.size !== players.length) {
      isValid = false
      break
    }

    // Since we have validated that the lineup has the same number of available players
    // the only way this case can happen is if one of the players has not been assigned a fielding position during
    // one of the innings. This most likely means a player was selected twice also.
    const fieldingLineupIds = Array.from(nextFieldingLineup.values())
    if (players.filter((player) => !fieldingLineupIds.includes(player.id)).length !== 0) {
      isValid = false
      break
    }
  }
  return isValid
}

export default { isValidBattingLineup, isValidFieldingLineup }
