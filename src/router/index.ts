import EditLineupsView from '@/views/EditLineupsView.vue'
import PrintView from '@/views/PrintView.vue'
import { createRouter, createWebHistory } from 'vue-router'

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
      component: PrintView
    }
  ]
})

export default router
