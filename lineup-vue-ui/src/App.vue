<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>

  <body>
    <RouterView />
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

/* The following is for the printable version. */
.print-batting-grid {
  display: inline-grid;
  grid-template-columns: 1fr;
}

.print-batting-grid-row {
  display: contents;
}

.print-batting-grid-cell {
  border: 1px solid #000;
  padding: 8px;
}

.print-fielding-grid {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  border: 1px solid #ddd;
}

.print-fielding-grid-row {
  display: contents;
}

.print-fielding-grid-cell {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.inning-header .print-fielding-grid-cell,
.position-header {
  background-color: #f2f2f2;
  font-weight: bold;
}

@media print {
  .page-break {
    page-break-after: always;
  }
}
</style>
