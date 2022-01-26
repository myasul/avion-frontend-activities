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

export const startGame = (difficulty) => {
    const game = {
        board: cloneBoard(EMPTY_BOARD),
        history: [cloneBoard(EMPTY_BOARD)],
        currentHistoryIndex: 0,
        difficulty
    }

    drawBoard(game.board, { enableBoxes: true })

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
        .addEventListener('click', () => restartGame(game.difficulty))
    document
        .querySelector('.easy')
        .addEventListener('click', handleEasyGameHandler)
    document
        .querySelector('.hard')
        .addEventListener('click', handleHardGameHandler)
}

const restartGame = (difficulty) => {
    const oldBoard = document.querySelector('.board')
    // Remove current event listeners to avoid overlap.
    // Reference: https://stackoverflow.com/a/9251864
    recreateElement(oldBoard)

    const historyControls = document.querySelector('.history-controls')
    historyControls.classList.add('hide')

    const boxes = getBoardBoxes({ flatten: true })
    boxes.forEach(box => box.classList.remove('blink'))

    startGame(difficulty)
}

/************/
/* HANDLERS */
/************/

const handleBoxClick = (event, game) => {
    const box = event.target

    if (box.disabled) return

    let winner

    const [row, col] = makeHumanMove(box)

    // Update board and history for every move
    game.board[row][col] = PLAYER.X
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    winner = checkWinnerWithCoordinates(game.board)
    if (winner) return handleDeclareWinner(winner)

    const [rowAI, colAI] = makeComputerMove(game)

    // Update board and history for every move
    game.board[rowAI][colAI] = PLAYER.O
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    winner = checkWinnerWithCoordinates(game.board)
    // If computer wins add delay to compensate
    // for the thinking effect before the blink
    // effect kicks in.
    if (winner) return setTimeout(() => { handleDeclareWinner(winner) }, 600)
}

const handleDeclareWinner = (winner) => {
    const historyControls = document.querySelector('.history-controls')
    historyControls.classList.remove('hide')

    const nextButton = document.querySelector('.next')
    nextButton.disabled = true

    const { winningPlayer, winningCoordinates } = winner
    const boxes = getBoardBoxes()

    if (winningCoordinates) {
        for (const [row, col] of winningCoordinates) {
            const box = boxes[row][col]
            box.classList.add('blink')
        }
    } else {
        // If there is no winning coordinates, it is safe
        // to assume that it is a draw.
        boxes.flat().forEach(box => box.classList.add('blink'))
    }

    boxes.flat().forEach(box => { box.setAttribute('disabled', true) })
}

const handlePreviousClick = (game) => {
    const { currentHistoryIndex, history } = game
    const historyMaxArrayLocation = history.length - 1

    const index = currentHistoryIndex === 0 ? 0 : currentHistoryIndex - 1
    const board = history[index]

    const nextButton = document.querySelector('.next')
    const previousButton = document.querySelector('.previous')

    // Disable/enable history control buttons 
    // depending on where the index is.
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

    // Disable/enable history control buttons 
    // depending on where the index is.
    if (index === historyMaxArrayLocation) nextButton.disabled = true
    if (index > 0) previousButton.disabled = false

    drawBoard(board)

    game.currentHistoryIndex = index
}

const handleEasyGameHandler = () => {
    const easyButton = document.querySelector('.easy')
    const hardButton = document.querySelector('.hard')

    easyButton.classList.add('highlight-button', 'slide')
    hardButton.classList.remove('highlight-button')

    restartGame(GAME_DIFFICULTY.Easy)
}

const handleHardGameHandler = () => {
    const easyButton = document.querySelector('.easy')
    const hardButton = document.querySelector('.hard')

    easyButton.classList.remove('highlight-button')
    hardButton.classList.add('highlight-button', 'slide')

    restartGame(GAME_DIFFICULTY.Hard)
}