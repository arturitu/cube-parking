import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(
  subscribeWithSelector((set, get) => ({
    currentLevelIndex: 0,
    moves: 0,
    stars: [0, 0, 0, 0, 0],
    completedLevels: [],
    gameStarted: false,
    gameWon: false,
    resetToken: 0,

    setCurrentLevel: (index) => {
      set({
        currentLevelIndex: index,
        moves: 0,
        gameWon: false,
        gameStarted: true,
      })
    },

    clearProgress: () => {
      set({
        currentLevelIndex: 0,
        moves: 0,
        stars: [0, 0, 0, 0, 0],
        completedLevels: [],
        gameWon: false,
        gameStarted: false,
        resetToken: get().resetToken + 1,
      })
    },

    incrementMoves: () => {
      set((state) => ({ moves: state.moves + 1 }))
    },

    resetLevel: () => {
      set((state) => ({
        moves: 0,
        gameWon: false,
        resetToken: state.resetToken + 1,
      }))
    },

    completeLevel: (moves, idealMoves) => {
      const { currentLevelIndex, stars, completedLevels } = get()

      let earnedStars = 1
      if (moves <= idealMoves) {
        earnedStars = 5
      } else if (moves <= idealMoves + 2) {
        earnedStars = 4
      } else if (moves <= idealMoves + 4) {
        earnedStars = 3
      } else if (moves <= idealMoves + 6) {
        earnedStars = 2
      }

      const newStars = [...stars]
      newStars[currentLevelIndex] = earnedStars

      const newCompletedLevels = [...completedLevels]
      if (!newCompletedLevels.includes(currentLevelIndex)) {
        newCompletedLevels.push(currentLevelIndex)
      }

      set({
        gameWon: true,
        stars: newStars,
        completedLevels: newCompletedLevels,
      })
    },
  }))
)

export default useStore
