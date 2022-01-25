import { startGame } from './src/main.js'
import { GAME_DIFFICULTY } from './src/lib/constants.js'

// Rules of the game
// X is always first to play
// O is always second to play
// O can be human or computer

window.addEventListener('load', () => {
    const easyButton = document.querySelector(`.${GAME_DIFFICULTY.Easy}`)
    easyButton.classList.add('highlight-button', 'slide')

    startGame(GAME_DIFFICULTY.Easy)
})
