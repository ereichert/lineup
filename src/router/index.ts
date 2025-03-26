import EditLineupsView from '@/views/EditLineupsView.vue'
import luValidations from '@/validation/lineup-validators'
import PrintView from '@/views/PrintView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'edit lineups',
      component: EditLineupsView
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
