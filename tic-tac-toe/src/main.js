import { EMPTY_BOARD, GAME_STATUS, PLAYER } from './lib/constants.js'
import { cloneBoard, recreateElement } from './lib/utils.js'
import {
    drawBoard,
    makeAIMove,
    makeHumanMove,
    checkGameStatus,
    getBoardBoxes
} from './game.js'


/**
 * MAIN
 */

export const startGame = () => {
    const game = {
        board: cloneBoard(EMPTY_BOARD),
        history: [cloneBoard(EMPTY_BOARD)],
        currentHistoryIndex: 0
    }

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

/**
 * HANDLERS
 */

export const handleNewGame = () => {
    // Remove current event listeners to avoid overlap
    const oldBoard = document.querySelector('.board')
    recreateElement(oldBoard)

    const oldHistoryControls = document.querySelector('.history-controls')
    const historyControls = recreateElement(oldHistoryControls)
    historyControls.classList.add('hide')

    const boxes = getBoardBoxes()
    boxes.flatMap(box => box).forEach(box => { box.classList.remove('blink') })

    drawBoard(cloneBoard(EMPTY_BOARD), { enableBoxes: true })
    startGame()
}

const handleBoxClick = (event, game) => {
    const box = event.target
    let gameState

    if (box.disabled) return

    const [row, col] = makeHumanMove(box)

    game.board[row][col] = PLAYER.Human
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    gameState = checkGameStatus(game.board)
    if (gameState.status !== GAME_STATUS.InProgress) return handleAfterGame(gameState)

    const [rowAI, colAI] = makeAIMove()

    game.board[rowAI][colAI] = PLAYER.AI
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    gameState = checkGameStatus(game.board)
    if (gameState.status !== GAME_STATUS.InProgress) return handleAfterGame(gameState)
}

const handleAfterGame = (gameState) => {
    const historyControls = document.querySelector('.history-controls')
    historyControls.classList.remove('hide')

    const nextButton = document.querySelector('.next')
    nextButton.disabled = true

    const { status, winningCoordinates } = gameState
    const boxes = getBoardBoxes()

    boxes.flatMap(box => box).forEach(box => { box.setAttribute('disabled', true) })

    if (!winningCoordinates) return

    for (const [row, col] of winningCoordinates) {
        const box = boxes[row][col]
        box.classList.add('blink')
    }
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
