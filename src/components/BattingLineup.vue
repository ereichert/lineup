<template>
    <div v-for="battingPosition in batters.length" :key="battingPosition">
        <PlayerDropdown :players="batters" @player-selected="updateBattingLineup"
            :dropdownId="battingPosition.toString()" :selected="battingLineup[battingPosition]"
            :class="{ conflict: isBatterChosenMultipleTimes(battingPosition) }"></PlayerDropdown>
    </div>
</template>

<script setup lang="ts">
import { usePlayersStore } from '@/stores/players';
import PlayerDropdown from './PlayerDropdown.vue';
import { useLineupsStore } from '@/stores/lineups';

const batters = usePlayersStore().players;
const { battingLineup, isBatterChosenMultipleTimes, updateBattingLineup } = useLineupsStore();

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