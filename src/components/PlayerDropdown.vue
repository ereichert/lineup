<template>
    <select @change="handlePlayerSelected($event)" :id="dropdownId">
        <option value="">Select Player</option>
        <option v-for="player in players" :key="player.id" :value="player.id" :selected="selected == player.id">{{
            player.name }}
        </option>
    </select>
</template>

<script setup lang="ts">
import type Player from '@/models/Player';

defineProps<{
    players: Player[],
    dropdownId: string,
    selected: string | undefined,
}>()

const emit = defineEmits<{
    (event: 'player-selected', dropdownId: string, playerId: string): void
}>()

const handlePlayerSelected = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement
    emit('player-selected', selectElement.id, selectElement.value)
}
</script>