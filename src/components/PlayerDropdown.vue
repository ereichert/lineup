<template>
    <select @change="handlePlayerSelected($event)" :id="id">
        <option selected>Select Player</option>
        <option v-for="player in players" :key="player">{{ player }}</option>
    </select>
</template>

<script setup lang="ts">
defineProps<{
    players: string[],
    id: string
}>()

const emit = defineEmits<{
    (event: 'player-selected', dropdownId: string, playerId: number,): void
}>()

const handlePlayerSelected = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement
    const selectedIndex = selectElement.selectedIndex
    emit('player-selected', selectElement.id, selectedIndex)
}
</script>