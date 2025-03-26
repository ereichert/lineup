<template>
    <ul class="list">
        <VueDraggable v-model="battingLineup">
            <li v-for="batter in battingLineup" :key="batter.id">{{ batter.name }}
            </li>
        </VueDraggable>
    </ul>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { useLineupsStore } from '@/stores/lineups';
import { storeToRefs } from 'pinia';

const { battingLineup } = storeToRefs(useLineupsStore());

</script>

<style scoped>
.list {
    flex: 1;
    background-color: #f4f4f4;
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