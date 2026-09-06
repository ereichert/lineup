<template>
    <RouterLink to="/editlineups" class="hidden-print">Go to edit view.</RouterLink>
    <h1>Lineup</h1>
    <h2>Fielding Lineup</h2>
    <div class="print-grid fielding-grid" :style="fieldingGridStyle">
        <div class="print-grid-row">
            <div class="print-grid-cell print-position-header">Position</div>
            <div v-for="inning in inningNumbers" :key="`header-${inning}`"
                class="print-grid-cell print-position-header print-inning-header">
                {{ inning }}
            </div>
        </div>
        <div v-for="row in fieldingRows" :key="row.position" class="print-grid-row" :data-position="row.position">
            <div class="print-grid-cell print-position-header">{{ row.label }}</div>
            <div v-for="(player, inningIdx) in row.playersByInning" :key="`${row.position}-${inningIdx}`"
                class="print-grid-cell">
                {{ player }}
            </div>
        </div>
    </div>
    <h2>Batting Lineup</h2>
    <div class="print-grid batting-grid">
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
    <RouterLink to="/editlineups" class="hidden-print">Go to edit view.</RouterLink>
</template>

<script setup lang="ts">
import { useLineupsStore } from '@/stores/lineups';
import { useGameConfigStore } from '@/stores/game-config';
import FieldingRowPrintView from '@/models/FieldingRowPrintView';
import BattingAssignmentPrintView from '@/models/BattingAssignmentPrintView';

const lineupsStore = useLineupsStore();
const { battingLineup, fieldingLineup, benchedPlayersByInning } = lineupsStore;
const { fieldingPositions } = useGameConfigStore();

const inningNumbers = fieldingLineup.map((_, inning) => inning + 1);

// The whole game reads across a single row per position, so a coach can follow one spot through
// all six innings instead of flipping between a page per inning.
const getFieldingRows = (): FieldingRowPrintView[] => {
    const positionRows = fieldingPositions.map((position, positionIdx) => {
        const playersByInning = fieldingLineup.map((inningLineup) => inningLineup[positionIdx]?.name ?? '');
        return new FieldingRowPrintView(position, position, playersByInning);
    });

    // The bench is derived from whoever holds no position, so it is appended rather than stored.
    // Each bench spot gets its own row, numbered to keep the rows distinct but printed as a plain
    // "Bench" since the number means nothing to whoever reads the sheet. A complete lineup benches
    // the same count every inning; an unfinished one can bench more, so the tallest inning decides
    // how many rows there are.
    const benchDepth = Math.max(0, ...benchedPlayersByInning.map((benched) => benched.length));
    const benchRows = Array.from({ length: benchDepth }, (_, benchIdx) => {
        const playersByInning = benchedPlayersByInning.map((benched) => benched[benchIdx]?.name ?? '');
        return new FieldingRowPrintView(`Bench ${benchIdx + 1}`, 'Bench', playersByInning);
    });

    return [...positionRows, ...benchRows];
}

const getBattingLineupPrintView = (): BattingAssignmentPrintView[] => {
    return battingLineup.map((player, battingPosition) => {
        return new BattingAssignmentPrintView(String(battingPosition + 1), player.name)
    })
}

const fieldingRows = getFieldingRows();
const battingLineupPrintView = getBattingLineupPrintView();
const fieldingGridStyle = {
    gridTemplateColumns: `minmax(90px, 0.8fr) repeat(${inningNumbers.length}, minmax(80px, 1fr))`
};
</script>

<style scoped>
.print-grid {
    display: grid;
    gap: 1px;
    border: 1px solid #ddd;
}

.fielding-grid {
    width: 100%;
}

.batting-grid {
    /* Only as wide as the two columns need, without letting the next element sit beside it. */
    width: max-content;
    grid-template-columns: repeat(2, auto);
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

.print-position-header {
    background-color: #f2f2f2;
    font-weight: bold;
}

.print-inning-header {
    text-align: center;
}

@media print {
    .hidden-print {
        display: none !important;
    }

    /* One sheet is the point of this layout, so keep a table from splitting across a break. */
    .print-grid {
        break-inside: avoid;
    }
}
</style>
