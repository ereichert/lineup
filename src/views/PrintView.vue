<template>
    <RouterLink to="/" class="hidden-print">Go to edit view.</RouterLink>
    <!-- TODO getFieldingLineupPrintView is probably called every loop we need to find a way to call it once. -->
    <div v-for="inningLineup in getFieldingLineupPrintView()" :key="inningLineup.inning">
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
            <!-- TODO getBattingLineupPrintView is called every loop we need to find a way to call it once. -->
            <!-- TODO This should print out all of the batting positions even if there are no assignments. -->
            <div v-for="battingAssignment in getBattingLineupPrintView()" :key="battingAssignment.battingPosition"
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
import { usePlayersStore } from '@/stores/players';
import PositionAssignmentPrintView from '@/models/PositionAssignmentPrintView';
import InningFieldingLineupPrintView from '@/models/InningFieldingLineupPrintView';
import BattingAssignmentPrintView from '@/models/BattingAssignmentPrintView';

const { battingLineup, fieldingLineup } = useLineupsStore();
const { lookupPlayer } = usePlayersStore();

const getFieldingLineupPrintView = (): InningFieldingLineupPrintView[] => {
    return fieldingLineup.map((fieldingSelections, inning) => {
        const positionAssignments = Array.from(fieldingSelections).map(([position, playerId]) => {
            return new PositionAssignmentPrintView(position, lookupPlayer(playerId)?.name ?? 'UNASSIGNED')
        });
        return new InningFieldingLineupPrintView((inning + 1).toString(), positionAssignments)
    })
}

const getBattingLineupPrintView = (): BattingAssignmentPrintView[] => {
    return Object.entries(battingLineup).map(([battingPosition, playerId]) => {
        const playerName = lookupPlayer(playerId)?.name ?? 'UNASSIGNED'
        return new BattingAssignmentPrintView(battingPosition, playerName)
    })
}
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