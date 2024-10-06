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

// Each dropdown has a value of 0 if no batter is chosen, otherwise it is the batter id.
const dropdownSelections: Ref<number[]> = ref(Array(batters.length).fill(0));

const updateBatters = (dropdownId: number, batterId: number,) => {
    dropdownSelections.value[dropdownId] = batterId;
}

const isBatterChosenMultipleTimes = (dropdownId: number) => {
    // If no batter is chosen, there is no conflict
    if (dropdownSelections.value[dropdownId] === 0) {
        return false;
    }

    // Check if the same batter is chosen more than once
    return dropdownSelections.value.filter((val) => val === dropdownSelections.value[dropdownId]).length > 1;
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