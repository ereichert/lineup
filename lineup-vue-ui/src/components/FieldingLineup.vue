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
                <VueDraggable v-model="fieldingLineup[numInning - 1]" @update="updateAggregatedAssignments">
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
    <div>
        <h3>Aggregated Player Assignments</h3>
        <div class="assignments-grid">
            <div class="header">Player</div>
            <div class="header">Outfield Assignments (L/C/R)</div>
            <div class="header">Bench Assignments</div>

            <template v-for="assignments in aggregatedAssignments" :key="assignments.player.id">
                <div class="cell">{{ assignments.player.name }}</div>
                <div class="cell">{{ assignments.getOutfieldAssignments() }}</div>
                <div class="cell">{{ assignments.getBenchAssignments() }}</div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLineupsStore } from '@/stores/lineups';
import { VueDraggable } from 'vue-draggable-plus';
import { ref } from 'vue';
import type Player from '@/models/Player';
import '@fortawesome/fontawesome-free/css/all.css';
import { usePlayersStore } from '@/stores/players';
import { BENCH_PREFIX, FieldingPositions } from '@/stores/game-config';

defineProps<{
    numInnings: number,
}>()
const { fieldingLineup, fieldingAndBenchPositions } = useLineupsStore();
const copiedInning = ref<Array<Player> | null>(null);
const aggregatedAssignments = ref<AggregatedFieldingAssignments[]>([]);

class AggregatedFieldingAssignments {
    player: Player;
    private outfieldAssignments: number;
    private benchAssignments: number;

    constructor(player: Player) {
        this.player = player;
        this.outfieldAssignments = 0;
        this.benchAssignments = 0;
    }

    addOutfieldAssignment() {
        this.outfieldAssignments++;
    }

    addBenchAssignment() {
        this.benchAssignments++;
    }

    getOutfieldAssignments(): number {
        return this.outfieldAssignments;
    }

    getBenchAssignments(): number {
        return this.benchAssignments;
    }

    resetAssignments() {
        this.outfieldAssignments = 0;
        this.benchAssignments = 0;
    }
}

const initializeAggregatedAssignments = () => {
    const { players } = usePlayersStore();
    aggregatedAssignments.value = players.map(player => {
        return new AggregatedFieldingAssignments(player);
    });
};

// This method could take a SortableEvent argument but it is not necessary for our use case.
const updateAggregatedAssignments = () => {
    console.info("Updating aggregated assignments...");
    aggregatedAssignments.value.forEach(assignment => {
        assignment.resetAssignments();
    });

    fieldingLineup.forEach((inningLineup) => {
        inningLineup.forEach((assignedPlayer, positionIndex) => {
            if (fieldingAndBenchPositions[positionIndex] === FieldingPositions.RIGHT ||
                fieldingAndBenchPositions[positionIndex] === FieldingPositions.CENTER ||
                fieldingAndBenchPositions[positionIndex] === FieldingPositions.LEFT) {
                const playerAggregate = aggregatedAssignments.value
                    .find(aggregate => aggregate.player.id === assignedPlayer.id);
                if (playerAggregate) {
                    playerAggregate.addOutfieldAssignment();
                }
            } else if (fieldingAndBenchPositions[positionIndex].startsWith(BENCH_PREFIX)) {
                const playerAggregate = aggregatedAssignments.value
                    .find(aggregate => aggregate.player.id === assignedPlayer.id);
                if (playerAggregate) {
                    playerAggregate.addBenchAssignment();
                }
            }
        });
    });
};

initializeAggregatedAssignments();
updateAggregatedAssignments();

const copyInning = (inningNum: number) => {
    copiedInning.value = [...fieldingLineup[inningNum]];
};

const pasteInning = (inningIndex: number) => {
    if (copiedInning.value) {
        fieldingLineup[inningIndex] = [...copiedInning.value];
        updateAggregatedAssignments();
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

.assignments-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 16px 0;
}

.header {
    font-weight: bold;
    background-color: #f4f4f4;
    padding: 8px;
}

.cell {
    padding: 8px;
    border-bottom: 1px solid #ddd;
}
</style>