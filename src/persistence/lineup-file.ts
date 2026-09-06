import Player from '@/models/Player'

export const LINEUP_FILE_VERSION = 1

interface ExportedPlayer {
  id: string
  name: string
}

export interface LineupExport {
  formatVersion: number
  exportedAt: string
  numInnings: number
  fieldingPositions: Array<string>
  battingLineup: Array<ExportedPlayer>
  // One entry per inning, one slot per fielding position, holding a player id or null.
  fieldingLineup: Array<Array<string | null>>
}

export interface ImportedLineup {
  players: Array<Player>
  battingLineup: Array<Player>
  fieldingLineup: Array<Array<Player | null>>
}

const byName = (a: Player, b: Player): number => a.name.localeCompare(b.name)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// The roster is not stored separately; it is exactly the players in the batting lineup, and the
// fielding lineup refers to them by id.
export const buildLineupExport = (
  battingLineup: Array<Player>,
  fieldingLineup: Array<Array<Player | null>>,
  fieldingPositions: Array<string>,
  numInnings: number
): LineupExport => ({
  formatVersion: LINEUP_FILE_VERSION,
  exportedAt: new Date().toISOString(),
  numInnings,
  fieldingPositions: [...fieldingPositions],
  battingLineup: battingLineup.map((player) => ({ id: player.id, name: player.name })),
  fieldingLineup: fieldingLineup.map((inningLineup) =>
    inningLineup.map((slot) => (slot ? slot.id : null))
  )
})

export const parseLineupExport = (raw: string): LineupExport => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!isRecord(parsed)) {
    throw new Error('That file does not contain a saved lineup.')
  }

  const { battingLineup, fieldingLineup, fieldingPositions, numInnings } = parsed

  if (
    !Array.isArray(battingLineup) ||
    battingLineup.length === 0 ||
    !battingLineup.every(
      (player) =>
        isRecord(player) && typeof player.id === 'string' && typeof player.name === 'string'
    )
  ) {
    throw new Error('That file has no players in its batting lineup.')
  }

  if (
    !Array.isArray(fieldingLineup) ||
    !fieldingLineup.every(
      (inningLineup) =>
        Array.isArray(inningLineup) &&
        inningLineup.every((slot) => slot === null || typeof slot === 'string')
    )
  ) {
    throw new Error('That file has an unreadable fielding lineup.')
  }

  if (
    !Array.isArray(fieldingPositions) ||
    !fieldingPositions.every((position) => typeof position === 'string')
  ) {
    throw new Error('That file does not say which positions its fielding lineup uses.')
  }

  return {
    formatVersion: typeof parsed.formatVersion === 'number' ? parsed.formatVersion : 0,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
    numInnings: typeof numInnings === 'number' ? numInnings : fieldingLineup.length,
    fieldingPositions: fieldingPositions as Array<string>,
    battingLineup: battingLineup as Array<ExportedPlayer>,
    fieldingLineup: fieldingLineup as Array<Array<string | null>>
  }
}

export const toLineupState = (
  doc: LineupExport,
  fieldingPositions: Array<string>,
  numInnings: number
): ImportedLineup => {
  const battingLineup = doc.battingLineup.map((player) => new Player(player.id, player.name))
  const playersById = new Map(battingLineup.map((player) => [player.id, player]))

  // Slots are matched by position name rather than index, so a saved file still lands correctly
  // if the position list is ever reordered, and innings are trimmed or padded to fit the game.
  const fieldingLineup = Array.from({ length: numInnings }, (_, inning) => {
    const savedInning = doc.fieldingLineup[inning] ?? []
    return fieldingPositions.map((position) => {
      const savedIdx = doc.fieldingPositions.indexOf(position)
      const playerId = savedIdx === -1 ? null : (savedInning[savedIdx] ?? null)
      return playerId ? (playersById.get(playerId) ?? null) : null
    })
  })

  return {
    players: [...battingLineup].sort(byName),
    battingLineup,
    fieldingLineup
  }
}
