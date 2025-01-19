<script setup lang="ts">
import BattingLineup from './components/BattingLineup.vue'
import FieldingLineup from './components/FieldingLineup.vue';

// TODO: Number of innings should be configurable.
const NUM_INNINGS = 6
// TODO: Fielding positions should be configurable.
const NUM_FIELDING_POSITIONS = 9
</script>

<template>

  <body>
    <div class="container">
      <div class="column">
        <h2>Batting Lineup</h2>
        <BattingLineup></BattingLineup>
      </div>
      <div class="column">
        <h2>Fielding Lineup</h2>
        <FieldingLineup :num-fielding-positions=NUM_FIELDING_POSITIONS :num-innings=NUM_INNINGS>
        </FieldingLineup>
      </div>
    </div>
  </body>
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
