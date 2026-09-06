<template>
    <RouterLink to="/" class="hidden-print">Go to edit view.</RouterLink>
    <div v-for="inningLineup in fieldingLineupPrintView" :key="inningLineup.inning">
        <h1>Inning {{ inningLineup.inning }}</h1>
        <h2>Fielding Lineup</h2>
        <div class="print-grid">
            <div class="print-grid-row">
                <div class="print-grid-cell print-position-header">Position</div>
                <div class="print-grid-cell print-position-header">Player</div>
            </div>
            <div v-for="nextPosition in inningLineup.positionAssignments"
                :key="`${nextPosition.position}-${inningLineup.inning}`" class="print-grid-row">
                <div class="print-grid-cell print-position-header">{{ nextPosition.position }}</div>
                <div class="print-grid-cell">{{ nextPosition.player }}</div>
            </div>
        </div>
        <h2>Batting Lineup</h2>
        <div class="print-grid">
            <div class="print-grid-row">
                <div class="print-grid-cell print-position-header">Batting Position</div>
                <div class="print-grid-cell print-position-header">Player</div>
            </div>
            <div v-for="battingAssignment in battingLineupPrintView" :key="battingAssignment.battingPosition"
                class="print-grid-row">
                <div class="print-grid-cell print-position-header">{{ battingAssignment.battingPosition }}</div>
                <div class="print-grid-cell">{{ battingAssignment.playerName }}</div>
            </div>
        </div>
        <div class="page-break"> </div>
    </div>
    <RouterLink to="/" class="hidden-print">Go to edit view.</RouterLink>
</template>

<script setup lang="ts">
import { useLineupsStore } from '@/stores/lineups';
import { useGameConfigStore } from '@/stores/game-config';
import PositionAssignmentPrintView from '@/models/PositionAssignmentPrintView';
import InningFieldingLineupPrintView from '@/models/InningFieldingLineupPrintView';
import BattingAssignmentPrintView from '@/models/BattingAssignmentPrintView';

const lineupsStore = useLineupsStore();
const { battingLineup } = lineupsStore;
const { fieldingPositions } = useGameConfigStore();

const getFieldingLineupPrintView = (): InningFieldingLineupPrintView[] => {
    return lineupsStore.fieldingLineup.map((inningLineup, inning) => {
        const positionAssignments = inningLineup.map((slot, positionIdx) => {
            return new PositionAssignmentPrintView(fieldingPositions[positionIdx], slot ? slot.name : '')
        });

        // The bench is derived from whoever holds no position, so it is appended rather than stored.
        const benchedPlayers = lineupsStore.benchedPlayersByInning[inning];
        if (benchedPlayers.length > 0) {
            const benchedNames = benchedPlayers.map((player) => player.name).join(', ');
            positionAssignments.push(new PositionAssignmentPrintView('Bench', benchedNames));
        }

        return new InningFieldingLineupPrintView((inning + 1).toString(), positionAssignments)
    })
}

const getBattingLineupPrintView = (): BattingAssignmentPrintView[] => {
    return battingLineup.map((player, battingPosition) => {
        return new BattingAssignmentPrintView(String(battingPosition + 1), player.name)
    })
}

const fieldingLineupPrintView = getFieldingLineupPrintView();
const battingLineupPrintView = getBattingLineupPrintView();
</script>

<style scoped>
.print-grid {
    display: inline-grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    border: 1px solid #ddd;
}

.print-grid-row {
    display: contents;
}

.print-grid-cell {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.inning-header .print-grid-cell,
.print-position-header {
    background-color: #f2f2f2;
    font-weight: bold;
}

@media print {
    .page-break {
        page-break-after: always;
    }

    .hidden-print {
        display: none !important;
    }
}
</style>