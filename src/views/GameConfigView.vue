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
import Player from '@/models/Player'
import { uuidv7 } from 'uuidv7'
import { ref } from 'vue'
import { usePlayersStore } from '@/stores/players';
import { storeToRefs } from 'pinia';
import luValidations from '@/validation/lineup-validators'
import { useValidationSettingsStore } from '@/stores/validation-settings'

const playerInput = ref<string>('')
const { players } = storeToRefs(usePlayersStore());
const participationRules = luValidations.participationRules
const { enabledRules } = storeToRefs(useValidationSettingsStore())

const updatePlayerList = (): void => {
    players.value = playerInput.value
        .split(',')
        .map((name: string): Player => new Player(uuidv7(), name.trim()))
        .filter((player: Player): boolean => player.name.length > 0)
        .sort((a: Player, b: Player): number => a.name.localeCompare(b.name))
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
