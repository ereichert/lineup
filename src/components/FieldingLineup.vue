<template>
    <div class="grid">
        <div class="grid-row inning-header">
            <div class="grid-cell">Position</div>
            <div v-for="numInning in numInnings" class="grid-cell" :key="`inning-${numInning}`">Inning {{ numInning }}
            </div>
        </div>
        <div v-for="position in fieldingAndBenchPositions" class="grid-row" :key="position.toLowerCase()">
            <div class="grid-cell position-header">{{ position }}</div>
            <PlayerDropdown v-for="(_, inning) in numInnings" :key="`${position.toLowerCase()}-${inning}`"
                :players="players" @player-selected="updateFieldingLineup"
                :dropdownId="`${position.toLowerCase()}-${inning}`"
                :selected="fieldingLineup[inning].get(position.toLowerCase())" class="grid-cell"
                :class="{ conflict: isFielderChosenMultipleTimes(`${position.toLowerCase()}-${inning}`) }">
            </PlayerDropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import PlayerDropdown from './PlayerDropdown.vue';
import { usePlayersStore } from '@/stores/players';
import { useLineupsStore } from '@/stores/lineups';

const players = usePlayersStore().getPlayers
defineProps<{
    numInnings: number,
}>()
const { fieldingLineup, fieldingAndBenchPositions, updateFieldingLineup, isFielderChosenMultipleTimes } = useLineupsStore();

</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(v-bind(numInnings + 1), 1fr);
    gap: 1px;
    border: 1px solid #ddd;
}

.grid-row {
    display: contents;
}

.grid-cell {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.inning-header .grid-cell,
.print-position-header {
    background-color: #f2f2f2;
    font-weight: bold;
}

.conflict {
    background-color: red;
}
</style>