<template>
    <div class="fielding-lineup">
        <section class="available-players">
            <h3>Available Players</h3>
            <ul class="players-pool">
                <li v-for="player in players" :key="player.id" class="player-card" draggable="true"
                    @dragstart="(event) => onPoolDragStart(event, player)" @dragend="onDragEnd">
                    {{ player.name }}
                </li>
            </ul>
        </section>

        <div class="lineup-grid" :style="gridStyle">
            <div class="grid-header">Position</div>
            <div v-for="inningIdx in inningIndexes" :key="`header-${inningIdx}`" class="grid-header">
                <span>Inning {{ inningIdx + 1 }}</span>
                <div class="inning-actions">
                    <button @click="copyInning(inningIdx)" class="inning-action-button" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button @click="pasteInning(inningIdx)" class="inning-action-button" :disabled="!copiedInning"
                        title="Paste">
                        <i class="fas fa-paste"></i>
                    </button>
                </div>
            </div>

            <template v-for="(position, positionIdx) in fieldingPositions" :key="position">
                <div class="position-label">{{ position }}</div>
                <div v-for="inningIdx in inningIndexes" :key="`${position}-${inningIdx}`" class="slot" :class="{
                    'slot--filled': !!fieldingLineup[inningIdx][positionIdx],
                    'slot--drag-over': isDragOver(inningIdx, positionIdx)
                }" :data-inning="inningIdx" :data-position-idx="positionIdx"
                    @dragenter.prevent="onDragEnter(inningIdx, positionIdx)" @dragover.prevent="onDragOver"
                    @dragleave="onDragLeave(inningIdx, positionIdx)" @drop.prevent="onDrop(inningIdx, positionIdx)">
                    <div v-if="fieldingLineup[inningIdx][positionIdx]" class="slot-content" draggable="true"
                        @dragstart="(event) => onSlotDragStart(event, inningIdx, positionIdx)" @dragend="onDragEnd">
                        <span class="slot-name">{{ fieldingLineup[inningIdx][positionIdx]?.name }}</span>
                        <button type="button" class="slot-remove" @click.stop="clearSlot(inningIdx, positionIdx)"
                            aria-label="Remove player from position">
                            &times;
                        </button>
                    </div>
                    <div v-else class="slot-empty">Empty</div>
                </div>
            </template>

            <div class="position-label">Bench</div>
            <div v-for="inningIdx in inningIndexes" :key="`bench-${inningIdx}`" class="bench-cell">
                <span v-if="benchedPlayersByInning[inningIdx].length === 0" class="bench-empty">&mdash;</span>
                <span v-for="benched in benchedPlayersByInning[inningIdx]" :key="benched.id" class="bench-name">
                    {{ benched.name }}
                </span>
            </div>
        </div>

        <div>
            <h3>Aggregated Player Assignments</h3>
            <div class="assignments-grid">
                <div class="header">Player</div>
                <div class="header">Outfield Assignments (L/C/R)</div>
                <div class="header">Bench Assignments</div>

                <template v-for="assignment in aggregatedAssignments" :key="assignment.player.id">
                    <div class="cell">{{ assignment.player.name }}</div>
                    <div class="cell">{{ assignment.outfieldAssignments }}</div>
                    <div class="cell">{{ assignment.benchAssignments }}</div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLineupsStore, type FieldingSlotRef } from '@/stores/lineups';
import { computed, ref, watch } from 'vue';
import type Player from '@/models/Player';
import '@fortawesome/fontawesome-free/css/all.css';
import { usePlayersStore } from '@/stores/players';
import { isOutfieldPosition, useGameConfigStore } from '@/stores/game-config';
import { storeToRefs } from 'pinia';

type DragSource =
    | { source: 'pool'; player: Player }
    | { source: 'slot'; player: Player; from: FieldingSlotRef }

const props = defineProps<{
    numInnings: number,
}>()

const lineupsStore = useLineupsStore();
const { fieldingLineup, benchedPlayersByInning } = storeToRefs(lineupsStore);
const { players } = storeToRefs(usePlayersStore());
const { fieldingPositions } = storeToRefs(useGameConfigStore());

const copiedInning = ref<Array<Player | null> | null>(null);
const dragState = ref<DragSource | null>(null);
const dragOverSlot = ref<FieldingSlotRef | null>(null);

const inningIndexes = computed(() => Array.from({ length: props.numInnings }, (_, idx) => idx));

const gridStyle = computed(() => ({
    gridTemplateColumns: `minmax(90px, 0.7fr) repeat(${props.numInnings}, minmax(110px, 1fr))`
}));

const aggregatedAssignments = computed(() => {
    return players.value.map((player) => {
        let outfieldAssignments = 0;
        fieldingLineup.value.forEach((inningLineup) => {
            inningLineup.forEach((slot, positionIdx) => {
                if (slot?.id === player.id && isOutfieldPosition(fieldingPositions.value[positionIdx])) {
                    outfieldAssignments++;
                }
            });
        });

        const benchAssignments = benchedPlayersByInning.value.filter((benched) =>
            benched.some((benchedPlayer) => benchedPlayer.id === player.id)
        ).length;

        return { player, outfieldAssignments, benchAssignments };
    });
});

// Re-entering the roster can leave players who are no longer on the team sitting in slots.
watch(players, () => lineupsStore.sanitizeFieldingLineup(), { immediate: true });

const isDragOver = (inning: number, positionIdx: number): boolean =>
    dragOverSlot.value?.inning === inning && dragOverSlot.value?.positionIdx === positionIdx;

const onPoolDragStart = (event: DragEvent, player: Player) => {
    dragState.value = { source: 'pool', player };
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', player.id);
    }
};

const onSlotDragStart = (event: DragEvent, inning: number, positionIdx: number) => {
    const player = fieldingLineup.value[inning][positionIdx];
    if (!player) {
        return;
    }

    dragState.value = { source: 'slot', player, from: { inning, positionIdx } };
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', player.id);
    }
};

const onDragEnter = (inning: number, positionIdx: number) => {
    dragOverSlot.value = { inning, positionIdx };
};

const onDragOver = (event: DragEvent) => {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = dragState.value?.source === 'pool' ? 'copy' : 'move';
    }
};

const onDragLeave = (inning: number, positionIdx: number) => {
    if (isDragOver(inning, positionIdx)) {
        dragOverSlot.value = null;
    }
};

const onDrop = (inning: number, positionIdx: number) => {
    const currentDrag = dragState.value;
    dragState.value = null;
    dragOverSlot.value = null;

    if (!currentDrag) {
        return;
    }

    // Dragging from the pool copies the player; dragging a filled slot moves them.
    if (currentDrag.source === 'pool') {
        lineupsStore.assignPlayerToSlot(inning, positionIdx, currentDrag.player);
    } else {
        lineupsStore.moveFieldingSlot(currentDrag.from, { inning, positionIdx });
    }
};

const onDragEnd = () => {
    dragState.value = null;
    dragOverSlot.value = null;
};

const clearSlot = (inning: number, positionIdx: number) => {
    lineupsStore.clearFieldingSlot(inning, positionIdx);
};

const copyInning = (inning: number) => {
    copiedInning.value = [...fieldingLineup.value[inning]];
};

const pasteInning = (inning: number) => {
    if (copiedInning.value) {
        lineupsStore.setInningLineup(inning, copiedInning.value);
    }
};
</script>

<style scoped>
.available-players {
    background-color: #f4f4f4;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.available-players h3 {
    margin-top: 0;
    text-align: center;
}

.players-pool {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.player-card {
    padding: 8px 12px;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
}

.player-card:active {
    cursor: grabbing;
}

.lineup-grid {
    display: grid;
    gap: 4px;
    align-items: stretch;
}

.grid-header {
    background-color: #f4f4f4;
    font-weight: bold;
    text-align: center;
    padding: 8px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.position-label {
    display: flex;
    align-items: center;
    font-weight: bold;
    padding: 4px 8px;
    background-color: #f4f4f4;
}

.slot {
    display: flex;
    align-items: stretch;
    padding: 4px;
    border: 1px dashed #bbb;
    border-radius: 4px;
    background-color: #ffffff;
    min-height: 44px;
}

.slot--filled {
    border-style: solid;
    border-color: #0077ff;
}

.slot--drag-over {
    box-shadow: 0 0 0 2px rgba(0, 119, 255, 0.2);
    border-color: #0077ff;
}

.slot-content {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 4px 8px;
    background-color: #e8f0ff;
    border: 1px solid #0077ff;
    border-radius: 4px;
    cursor: grab;
}

.slot-content:active {
    cursor: grabbing;
}

.slot-name {
    flex: 1;
    text-align: center;
}

.slot-remove {
    padding: 0 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #0077ff;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
}

.slot-remove:hover {
    background-color: rgba(0, 119, 255, 0.1);
}

.slot-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: #888;
    font-style: italic;
}

.bench-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-content: flex-start;
    padding: 8px 4px;
    border-top: 2px solid #ddd;
}

.bench-name {
    padding: 2px 6px;
    background-color: #f4f4f4;
    border-radius: 4px;
    font-size: 0.9em;
}

.bench-empty {
    color: #888;
}

.inning-actions {
    display: flex;
    gap: 5px;
    justify-content: center;
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
