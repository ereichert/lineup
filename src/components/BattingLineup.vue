<template>
    <div v-for="n in batters.length" :key="n">
        <PlayerDropdown :players="batters" @player-selected="updateBatters" :id="n.toString()"
            :class="{ conflict: isBatterChosenMultipleTimes(n) }"></PlayerDropdown>
    </div>
</template>

<script setup lang="ts">
import PlayerDropdown from './PlayerDropdown.vue';
import { ref, type Ref } from 'vue';

//TODO: Get the batters from a textarea or upload
const batters = [
    'Batter 1',
    'Batter 2',
    'Batter 3',
    'Batter 4',
    'Batter 5',
    'Batter 6',
    'Batter 7',
    'Batter 8',
    'Batter 9',
    'Batter 10',
    'Batter 11'
]

// A dropdown will not have an entry unless a player has been chosen for that position in the batting order.
const dropdownSelections: Ref<{ [dropdownId: string]: number }> = ref({});

const updateBatters = (dropdownId: string, batterId: number) => {
    dropdownSelections.value[dropdownId] = batterId;
}

const isBatterChosenMultipleTimes = (dropdownId: number) => {
    // Iterate through the dictionary of batting positions which have been filled with player selections.
    // Filter the dictionary values leaving an array whose length represents the number of batting positions occupied by
    // the same player. If the array is greater than 1 that means the same player has been assigned to more than 1
    // batting position and the batting lineup is incorrect.
    return Object.values(dropdownSelections.value).filter((val) => val === dropdownSelections.value[dropdownId]).length > 1;
}

</script>

<style scoped>
.conflict {
    background-color: red;
}

select {
    width: 100%;
    margin-bottom: 10px;
    padding: 5px;
}
</style>