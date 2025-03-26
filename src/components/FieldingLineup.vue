<template>
    <div class="container">
        <div class="list">
            <h3>Position</h3>
            <ul>
                <li v-for="position in fieldingAndBenchPositions" :key="position.toLowerCase()">{{ position }}</li>
            </ul>
        </div>
        <div v-for="numInning in numInnings" :key="`inning-${numInning}`" class="list">
            <h3>Inning {{ numInning }} </h3>
            <ul>
                <VueDraggable v-model="fieldingLineup[numInning - 1]">
                    <li v-for="player in fieldingLineup[numInning - 1]" :key="player.id">{{ player.name }}
                    </li>
                </VueDraggable>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLineupsStore } from '@/stores/lineups';
import { VueDraggable } from 'vue-draggable-plus';

defineProps<{
    numInnings: number,
}>()
const { fieldingLineup, fieldingAndBenchPositions } = useLineupsStore();

</script>

<style scoped>
.container {
    display: flex;
}

.list {
    flex: 1;
    background-color: #f4f4f4;
}

.list h3 {
    text-align: center;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
    text-align: center;
}
</style>