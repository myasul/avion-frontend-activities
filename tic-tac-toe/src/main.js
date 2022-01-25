import {
    EMPTY_BOARD,
    GAME_STATUS,
    PLAYER,
    GAME_DIFFICULTY
} from './lib/constants.js'
import { cloneBoard, recreateElement } from './lib/utils.js'
import {
    drawBoard,
    makeComputerMove,
    makeHumanMove,
    checkWinnerWithCoordinates,
    getBoardBoxes
} from './game.js'

/********/
/* MAIN */
/********/

export const startGame = (options = {}) => {
    const { difficulty } = options
    const gameDifficulty = difficulty ?? GAME_DIFFICULTY.Hard

    const game = {
        board: cloneBoard(EMPTY_BOARD),
        history: [cloneBoard(EMPTY_BOARD)],
        currentHistoryIndex: 0,
        difficulty: gameDifficulty
    }

    drawBoard(game.board)

    // Add event listeners
    document
        .querySelectorAll('.box')
        .forEach(box => box.addEventListener('click', (event) => handleBoxClick(event, game)))
    document
        .querySelector('.previous')
        .addEventListener('click', () => handlePreviousClick(game))
    document
        .querySelector('.next')
        .addEventListener('click', () => handleNextClick(game))
    document
        .querySelector('.new-game')
        .addEventListener('click', handleNewGame)
}

/************/
/* HANDLERS */
/************/

const handleNewGame = () => {
    // Remove current event listeners to avoid overlap
    const oldBoard = document.querySelector('.board')
    recreateElement(oldBoard)

    const oldHistoryControls = document.querySelector('.history-controls')
    const historyControls = recreateElement(oldHistoryControls)
    historyControls.classList.add('hide')

    const boxes = getBoardBoxes({ flatten: true })
    boxes.forEach(box => box.classList.remove('blink'))

    drawBoard(cloneBoard(EMPTY_BOARD), { enableBoxes: true })
    startGame()
}

const handleBoxClick = (event, game) => {
    const box = event.target
    let winner

    if (box.disabled) return

    const [row, col] = makeHumanMove(box)

    game.board[row][col] = PLAYER.X
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    winner = checkWinnerWithCoordinates(game.board)
    if (winner) return handleAfterGame(winner)

    const [rowAI, colAI] = makeComputerMove(game)

    game.board[rowAI][colAI] = PLAYER.O
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    winner = checkWinnerWithCoordinates(game.board)
    if (winner) return handleAfterGame(winner)
}

const handleAfterGame = (gameState) => {
    const historyControls = document.querySelector('.history-controls')
    historyControls.classList.remove('hide')

    const nextButton = document.querySelector('.next')
    nextButton.disabled = true

    const { status, winningCoordinates } = gameState
    const boxes = getBoardBoxes()

    if (winningCoordinates) {
        for (const [row, col] of winningCoordinates) {
            const box = boxes[row][col]
            box.classList.add('blink')
        }
    } else {
        boxes.flat().forEach(box => box.classList.add('blink'))
    }

    boxes.flat().forEach(box => { box.setAttribute('disabled', true) })
}

const handlePreviousClick = (game) => {
    const { currentHistoryIndex, history } = game
    const index = currentHistoryIndex === 0 ? 0 : currentHistoryIndex - 1
    const historyMaxArrayLocation = history.length - 1
    const board = history[index]

    const nextButton = document.querySelector('.next')
    const previousButton = document.querySelector('.previous')

    if (index === 0) previousButton.disabled = true
    if (index < historyMaxArrayLocation) nextButton.disabled = false

    drawBoard(board)

    game.currentHistoryIndex = index
}

const handleNextClick = (game) => {
    const { currentHistoryIndex, history } = game
    const historyMaxArrayLocation = history.length - 1

    const index = currentHistoryIndex >= historyMaxArrayLocation ? historyMaxArrayLocation : currentHistoryIndex + 1
    const board = game.history[index]

    const nextButton = document.querySelector('.next')
    const previousButton = document.querySelector('.previous')

    if (index === historyMaxArrayLocation) nextButton.disabled = true
    if (index > 0) previousButton.disabled = false

    drawBoard(board)

    game.currentHistoryIndex = index
}
