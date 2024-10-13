<template>
    <div class="grid">
        <div class="grid-row inning-header">
            <div class="grid-cell">Position</div>
            <div class="grid-cell">Inning 1</div>
            <div class="grid-cell">Inning 2</div>
            <div class="grid-cell">Inning 3</div>
            <div class="grid-cell">Inning 4</div>
            <div class="grid-cell">Inning 5</div>
            <div class="grid-cell">Inning 6</div>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Catcher</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`catcher-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`catcher-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`catcher-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">First Base</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`first-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`first-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`first-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Second Base</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`second-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`second-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`second-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Shortstop</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`shortstop-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`shortstop-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`shortstop-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Third Base</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`third-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`third-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`third-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Left Field</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`left-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`left-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`left-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Center Field</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`center-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`center-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`center-${inning}`) }"></PlayerDropdown>
        </div>
        <div class="grid-row">
            <div class="grid-cell position-header">Right Field</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`right-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`right-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`right-${inning}`) }"></PlayerDropdown>
        </div>
        <div v-for="benchPlayerNumber in numBenchPlayers" :key="`bench${benchPlayerNumber}`" class="grid-row">
            <div class="grid-cell position-header">Bench</div>
            <PlayerDropdown v-for="inning in numInnings" :key="`bench${benchPlayerNumber}-${inning}`" :players="players"
                @player-selected="updateFielders" :id="`bench${benchPlayerNumber}-${inning}`" class="grid-cell"
                :class="{ conflict: isPlayerChosenMultipleTimes(`bench${benchPlayerNumber}-${inning}`) }">
            </PlayerDropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import PlayerDropdown from './PlayerDropdown.vue';

//TODO: Get the players from a textarea or upload
const players = [
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
    'Player 5',
    'Player 6',
    'Player 7',
    'Player 8',
    'Player 9',
    'Player 10',
    'Player 11',
]

const props = defineProps<{
    numFieldingPositions: number,
    numInnings: number,
}>()

const numBenchPlayers = players.length - props.numFieldingPositions

// A dropdown will not have an entry for a specific PlayerDropdown unless a player has been chosen for that fielding position.
const dropdownSelections: Ref<{ [dropdownId: string]: number }> = ref({});

const updateFielders = (dropdownId: string, playerId: number) => {
    dropdownSelections.value[dropdownId] = playerId;
}

const getInning = (dropdownId: string) => {
    return dropdownId.split('-')[1]
}

const isPlayerChosenMultipleTimes = (dropdownId: string) => {
    if (dropdownSelections.value[dropdownId] === null) {
        return false
    }

    if (dropdownSelections.value[dropdownId] === undefined) {
        return false
    }

    // Iterate through the dictionary of fielding positions which have been filled with player selections.
    // Filter the dictionary values leaving an array whose length represents the number of fielding positions occupied
    // by the same player. If the array is greater than 1 that means the same player has been assigned to more than 1
    // fielding position and the fielding lineup is incorrect.
    const inningOfInterest = getInning(dropdownId)
    return Object.keys(dropdownSelections.value).filter((nextKey) => {
        if (getInning(nextKey) !== inningOfInterest) {
            return false
        }
        return dropdownSelections.value[nextKey] === dropdownSelections.value[dropdownId]
    }).length > 1;
}
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
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
.position-header {
    background-color: #f2f2f2;
    font-weight: bold;
}

.conflict {
    background-color: red;
}
</style>