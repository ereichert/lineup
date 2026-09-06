<script setup lang="ts">
import BattingLineup from '@/components/BattingLineup.vue'
import FieldingLineup from '@/components/FieldingLineup.vue'
import { useGameConfigStore } from '@/stores/game-config';
import { useLineupsStore } from '@/stores/lineups';
import { buildLineupExport } from '@/persistence/lineup-file';

const gameConfigStore = useGameConfigStore()
const lineupsStore = useLineupsStore()
const { numInnings } = gameConfigStore

const exportLineup = (): void => {
    const lineupExport = buildLineupExport(
        lineupsStore.battingLineup,
        lineupsStore.fieldingLineup,
        gameConfigStore.fieldingPositions,
        gameConfigStore.numInnings
    )

    const blob = new Blob([JSON.stringify(lineupExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `lineup-${new Date().toISOString().slice(0, 10)}.json`
    downloadLink.click()
    URL.revokeObjectURL(url)
}
</script>

<template>
    <div class="container">
        <div class="column">
            <h2>Batting Lineup</h2>
            <BattingLineup></BattingLineup>
        </div>
        <div class="column">
            <h2>Fielding Lineup</h2>
            <FieldingLineup :num-innings=numInnings>
            </FieldingLineup>
        </div>
    </div>
    <div class="page-links">
        <RouterLink to="/print">Print View</RouterLink>
        <button type="button" class="link-button" @click="exportLineup">Export Lineup</button>
    </div>
</template>

<style scoped>
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

.container {
    display: flex;
    gap: 20px;
}

.column {
    flex: 1;
}

.page-links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 12px;
}

.link-button {
    padding: 0;
    border: none;
    background: none;
    color: #0000ee;
    font-size: inherit;
    font-family: inherit;
    text-decoration: underline;
    cursor: pointer;
}
</style>
