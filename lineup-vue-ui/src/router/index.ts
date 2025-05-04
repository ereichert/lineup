import EditLineupsView from '@/views/EditLineupsView.vue'
import luValidations from '@/validation/lineup-validators'
import PrintView from '@/views/PrintView.vue'
import GameConfigView from '@/views/GameConfigView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/editlineups',
      name: 'edit lineups',
      component: EditLineupsView,
      beforeEnter: (to, from) => {
        console.info(
          `Validating players list. Coming from ${from.fullPath}. Going to ${to.fullPath}.`
        )
        const { players } = usePlayersStore()
        if (players.length === 0) {
          console.error('Players list is empty.')
        }

        if (players.length < 9) {
          console.error('Players list is too short.')
        }

        return players.length >= 9
      }
    },
    {
      path: '/',
      name: 'game config',
      component: GameConfigView
    },
    {
      path: '/print',
      name: 'print',
      component: PrintView,
      // TODO: When the validation fails errors should be shown on the edit lineup screen.
      beforeEnter: (to, from) => {
        console.info(`Validating lineup. Coming from ${from.fullPath}. Going to ${to.fullPath}.`)
        const { battingLineup, fieldingLineup } = useLineupsStore()
        const { players } = usePlayersStore()
        return (
          luValidations.isValidBattingLineup(players, battingLineup) &&
          luValidations.isValidFieldingLineup(players, fieldingLineup) &&
          luValidations.hasAllPlayersAssignedToAnOutfieldPosition(fieldingLineup)
        )
      }
    }
  ]
})

export default router
