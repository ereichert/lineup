<script setup lang="ts">
import BattingLineup from '@/components/BattingLineup.vue'
import FieldingLineup from '@/components/FieldingLineup.vue'

// TODO: Number of innings should be configurable.
const NUM_INNINGS = 6
</script>

<template>
    <div class="container">
        <div class="column">
            <h2>Batting Lineup</h2>
            <BattingLineup></BattingLineup>
        </div>
        <div class="column">
            <h2>Fielding Lineup</h2>
            <FieldingLineup :num-innings=NUM_INNINGS>
            </FieldingLineup>
        </div>
    </div>
    <!-- TODO Before going to the print view the lineups need to be validated for completeness.
     Are all positions filled. Are all players assigned.  -->
    <RouterLink to="/print">Print View</RouterLink>
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
</style>