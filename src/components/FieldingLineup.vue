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
                    <li v-for="player in fieldingLineup[numInning - 1]" :key="player.id">{{ player.name }}</li>
                </VueDraggable>
            </ul>
            <div class="inning-actions">
                <button @click="copyInning(numInning - 1)" class="inning-action-button" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button @click="pasteInning(numInning - 1)" class="inning-action-button" :disabled="!copiedInning"
                    title="Paste">
                    <i class="fas fa-paste"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLineupsStore } from '@/stores/lineups';
import { VueDraggable } from 'vue-draggable-plus';
import { ref } from 'vue';
import type Player from '@/models/Player';
import '@fortawesome/fontawesome-free/css/all.css';

defineProps<{
    numInnings: number,
}>()
const { fieldingLineup, fieldingAndBenchPositions } = useLineupsStore();
const copiedInning = ref<Array<Player> | null>(null);

const copyInning = (inningNum: number) => {
    copiedInning.value = [...fieldingLineup[inningNum]];
};

const pasteInning = (inningIndex: number) => {
    if (copiedInning.value) {
        fieldingLineup[inningIndex] = [...copiedInning.value];
    }
};
</script>

<style scoped>
.container {
    display: flex;
}

.list {
    flex: 1;
    background-color: #f4f4f4;
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
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

.inning-actions {
    display: flex;
    gap: 5px;
    justify-content: center;
    margin-top: auto;
}

.inning-action-button {
    padding: 8px;
    width: 32px;
    height: 32px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.inning-action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.inning-action-button:hover:not(:disabled) {
    background-color: #eee;
}
</style>