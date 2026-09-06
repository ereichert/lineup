<template>
    <div class="game-config">
        <h2>Game Configuration</h2>
        <div class="player-input">
            <label for="players">Enter Player Names (comma separated):</label>
            <textarea id="players" v-model="playerInput"
                placeholder="Enter player names, separated by commas (e.g., John, Jane, Mike)" rows="4">
            </textarea>
        </div>
        <div class="button-container">
            <button @click="updatePlayerList" :disabled="!playerInput">Parse Players</button>
        </div>
        <div class="import-lineup">
            <button type="button" class="link-button" @click="openFilePicker">Import Saved Lineup</button>
            <input ref="fileInput" type="file" accept="application/json,.json" class="file-input"
                @change="importLineupFile" />
            <p v-if="importError" class="import-error">{{ importError }}</p>
        </div>
        <div class="player-list" v-if="players.length > 0">
            <h3>Players:</h3>
            <ol>
                <li v-for="player in players" :key="player.id">
                    {{ player.name }}
                </li>
            </ol>
        </div>
        <div class="validation-rules">
            <h3>Validation Rules (Print View)</h3>
            <div class="rule-item" v-for="rule in participationRules" :key="rule.id">
                <label>
                    <input type="checkbox" v-model="enabledRules[rule.id]" />
                    {{ rule.label }}
                </label>
            </div>
        </div>
    </div>
    <RouterLink to="/editlineups">Edit Lineups</RouterLink>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayersStore } from '@/stores/players';
import { useLineupsStore } from '@/stores/lineups';
import { useGameConfigStore } from '@/stores/game-config';
import { storeToRefs } from 'pinia';
import luValidations from '@/validation/lineup-validators'
import { useValidationSettingsStore } from '@/stores/validation-settings'
import { parseLineupExport, toLineupState } from '@/persistence/lineup-file'

const playerInput = ref<string>('')
const importError = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const { players } = storeToRefs(usePlayersStore());
const lineupsStore = useLineupsStore()
const gameConfigStore = useGameConfigStore()
const participationRules = luValidations.participationRules
const { enabledRules } = storeToRefs(useValidationSettingsStore())

const parseNames = (input: string): Array<string> =>
    input
        .split(',')
        .map((name: string): string => name.trim())
        .filter((name: string): boolean => name.length > 0)

// Reconciles rather than replaces, so an imported lineup survives adding or dropping a name.
const updatePlayerList = (): void => {
    importError.value = ''
    lineupsStore.applyRoster(parseNames(playerInput.value))
}

const openFilePicker = (): void => {
    fileInput.value?.click()
}

const importLineupFile = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) {
        return
    }

    importError.value = ''
    try {
        const lineupExport = parseLineupExport(await file.text())
        lineupsStore.importLineup(
            toLineupState(lineupExport, gameConfigStore.fieldingPositions, gameConfigStore.numInnings)
        )
        playerInput.value = players.value.map((player) => player.name).join(', ')
    } catch (error) {
        importError.value = error instanceof Error ? error.message : 'Could not import that file.'
    } finally {
        // Clearing the input allows the same file to be picked again after a failed import.
        input.value = ''
    }
}
</script>

<style scoped>
.game-config {
    max-width: 500px;
    margin: 20px auto;
    padding: 20px;
}

.player-input {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
}

textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
}

.import-lineup {
    margin-top: 12px;
}

.file-input {
    display: none;
}

.link-button {
    padding: 0;
    border: none;
    background: none;
    color: #0000ee;
    font-size: inherit;
    font-family: inherit;
    text-decoration: underline;
    cursor: pointer;
}

.import-error {
    margin: 8px 0 0;
    color: #b00020;
}

.player-list ul {
    list-style-type: none;
    padding: 0;
}

.player-list li {
    padding: 5px 0;
}

.validation-rules {
    margin-top: 20px;
}

.rule-item {
    padding: 5px 0;
}
</style>
