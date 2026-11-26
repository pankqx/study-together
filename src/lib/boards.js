import { useEffect } from 'react'
import { useStore } from '../store.jsx'
import { nickOf } from './logic.js'

export const personalBoardId = (uid) => 'p_' + uid

// each of us gets one board, created the first time anyone opens Boards or Today
export function useEnsurePersonalBoards() {
  const { be, crew } = useStore()
  useEffect(() => {
    const offs = crew.map((u) => be.watchDoc('boards/' + personalBoardId(u.id), (d) => {
      if (!d) be.setDoc('boards/' + personalBoardId(u.id), { name: `${nickOf(u)}'s board`, owner: u.id, personal: true, elements: '[]', updatedAt: Date.now() - 1, updatedBy: u.id })
    }))
    return () => offs.forEach((f) => f())
  }, [be, crew.length])
}
