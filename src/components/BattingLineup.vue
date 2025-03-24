<template>
    <VueDraggable v-model="battingLineup">
        <div v-for="batter in battingLineup" :key="batter.id" class="draggable-player">
            {{ batter.name }}
        </div>
    </VueDraggable>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { useLineupsStore } from '@/stores/lineups';
import { storeToRefs } from 'pinia';

const { battingLineup } = storeToRefs(useLineupsStore());

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

.draggable-player {
    margin-bottom: 10px;
    padding: 1px;
    border: 1px solid black;
}
</style>