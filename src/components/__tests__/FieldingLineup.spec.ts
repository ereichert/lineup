import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import FieldingLineup from '@/components/FieldingLineup.vue'
import Player from '@/models/Player'
import { useGameConfigStore } from '@/stores/game-config'
import { useLineupsStore } from '@/stores/lineups'
import { usePlayersStore } from '@/stores/players'

const testPlayers: Array<Player> = [
  new Player('01951f0d-77fd-70a7-a372-83ca9ea40b85', 'Player A'),
  new Player('01951f0d-77fd-7550-86d0-2e58561ecefc', 'Player B'),
  new Player('01951f0d-77fd-7a5b-ab23-bb9b3bec5014', 'Player C'),
  new Player('01951f0d-77fd-75e8-a296-493dcbcefd41', 'Player D'),
  new Player('01951f0d-77fd-7baf-9343-307713947988', 'Player E'),
  new Player('01951f0d-77fd-7b35-9d3e-32770c204350', 'Player F'),
  new Player('01951f0d-77fd-7398-aab2-16672864c9bf', 'Player G'),
  new Player('01951f0d-77fd-7359-9ae2-8f2302816a8a', 'Player H'),
  new Player('01951f0d-77fd-7858-a3fc-feed01e94f3d', 'Player I'),
  new Player('01951f0d-77fd-7d61-8407-42b9242413e1', 'Player J'),
  new Player('01951f0d-77fd-7535-90ad-7d33746e3ce0', 'Player K')
]

const PITCHER = 0
const CENTER = 7

beforeEach(() => {
  setActivePinia(createPinia())
  usePlayersStore().players = [...testPlayers]
})

const mountComponent = () =>
  mount(FieldingLineup, {
    props: { numInnings: useGameConfigStore().numInnings }
  })

type Wrapper = ReturnType<typeof mountComponent>

const slotAt = (wrapper: Wrapper, inning: number, positionIdx: number) =>
  wrapper.get(`[data-inning="${inning}"][data-position-idx="${positionIdx}"]`)

const benchAt = (wrapper: Wrapper, inning: number) =>
  wrapper.get(`[data-bench-inning="${inning}"]`)

const benchNames = (wrapper: Wrapper, inning: number) =>
  benchAt(wrapper, inning)
    .findAll('.bench-player')
    .map((player) => player.text())

describe('FieldingLineup', () => {
  it('renders an empty slot for every position in every inning', () => {
    const { numInnings, fieldingPositions } = useGameConfigStore()
    const wrapper = mountComponent()

    expect(wrapper.findAll('.slot')).toHaveLength(numInnings * fieldingPositions.length)
    expect(wrapper.findAll('.slot-empty')).toHaveLength(numInnings * fieldingPositions.length)
  })

  it('gives every inning its own bench holding the whole roster', () => {
    const { numInnings } = useGameConfigStore()
    const wrapper = mountComponent()

    expect(wrapper.findAll('[data-bench-inning]')).toHaveLength(numInnings)
    for (let inning = 0; inning < numInnings; inning++) {
      expect(benchNames(wrapper, inning)).toEqual(testPlayers.map((player) => player.name))
    }
  })

  it('assigns a player dragged from an inning bench onto one of its positions', async () => {
    const wrapper = mountComponent()

    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[0].id)
    expect(slotAt(wrapper, 0, PITCHER).text()).toContain(testPlayers[0].name)
  })

  it('takes an assigned player off that inning bench and leaves other innings alone', async () => {
    const wrapper = mountComponent()

    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    expect(benchNames(wrapper, 0)).not.toContain(testPlayers[0].name)
    expect(benchNames(wrapper, 0)).toHaveLength(testPlayers.length - 1)
    expect(benchNames(wrapper, 1)).toHaveLength(testPlayers.length)
  })

  it('replaces the player already in a position and returns them to the bench', async () => {
    const wrapper = mountComponent()

    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')
    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[1].id)
    expect(benchNames(wrapper, 0)).toContain(testPlayers[0].name)
  })

  it('moves a player between positions in the same inning', async () => {
    const wrapper = mountComponent()
    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    await slotAt(wrapper, 0, PITCHER).get('.slot-content').trigger('dragstart')
    await slotAt(wrapper, 0, CENTER).trigger('drop')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]).toBeNull()
    expect(useLineupsStore().fieldingLineup[0][CENTER]?.id).toBe(testPlayers[0].id)
  })

  it('unassigns a player dragged from a position back onto the bench', async () => {
    const wrapper = mountComponent()
    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    await slotAt(wrapper, 0, PITCHER).get('.slot-content').trigger('dragstart')
    await benchAt(wrapper, 0).trigger('drop')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]).toBeNull()
    expect(benchNames(wrapper, 0)).toContain(testPlayers[0].name)
  })

  it('ignores a bench player dropped on a different innings position', async () => {
    const wrapper = mountComponent()

    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 1, PITCHER).trigger('drop')

    expect(useLineupsStore().fieldingLineup[1][PITCHER]).toBeNull()
    expect(benchNames(wrapper, 0)).toHaveLength(testPlayers.length)
  })

  it('ignores an assigned player dropped on a different innings position', async () => {
    const wrapper = mountComponent()
    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    await slotAt(wrapper, 0, PITCHER).get('.slot-content').trigger('dragstart')
    await slotAt(wrapper, 1, CENTER).trigger('drop')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]?.id).toBe(testPlayers[0].id)
    expect(useLineupsStore().fieldingLineup[1][CENTER]).toBeNull()
  })

  it('empties a slot when its remove button is clicked', async () => {
    const wrapper = mountComponent()
    await benchAt(wrapper, 0).findAll('.bench-player')[0].trigger('dragstart')
    await slotAt(wrapper, 0, PITCHER).trigger('drop')

    await slotAt(wrapper, 0, PITCHER).get('.slot-remove').trigger('click')

    expect(useLineupsStore().fieldingLineup[0][PITCHER]).toBeNull()
    expect(slotAt(wrapper, 0, PITCHER).find('.slot-empty').exists()).toBe(true)
  })
})
