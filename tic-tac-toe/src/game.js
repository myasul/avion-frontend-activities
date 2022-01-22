import { EMPTY_BOARD, GAME_STATUS, PLAYER } from './constants.js'
import {
    cloneBoard,
    getRandomArbitrary,
    recreateElement
} from './utils.js'

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

/**
 * GAME FUNCTIONS
 */

const drawBoard = (board, options = {}) => {
    const { enableBoxes } = options
    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    for (let row = 0;row < board.length;row++) {
        for (let col = 0;col < board.length;col++) {
            const box = boxes[row][col]
            const boardValue = board[row][col]

            if (enableBoxes) box.setAttribute('disabled', false)

            if (box.firstChild) box.removeChild(box.firstChild)
            if (!boardValue) continue

            const image = new Image()
            image.src = `./assets/${boardValue}.svg`
            image.alt = boardValue

            box.appendChild(image)
        }
    }
}

// TODO: Add difficulty
const makeAIMove = (game) => {
    let move
    do {
        move = [0, 1].map(coord => getRandomArbitrary(0, 2))
    } while (!isMoveValid(move))

    const [row, col] = move

    const box = document.querySelector(`div.row-${row + 1} div.col-${col + 1}`)
    // Recreate element to remove click event
    const newBox = recreateElement(box)

    const image = new Image()
    image.src = `./assets/${PLAYER.AI}.svg`
    image.alt = PLAYER.AI

    // Add delay to have that "thinking" effect
    setTimeout(() => { newBox.appendChild(image) }, 400)
    newBox.setAttribute('disabled', true)

    return move
}

const isMoveValid = (move) => {
    const [row, col] = move
    const boxes = getBoardBoxes()
    const box = boxes[row][col]

    return box.firstChild === null
}

const makeHumanMove = (box) => {
    // Recreate element to remove click event
    const newBox = recreateElement(box)
    newBox.setAttribute('disabled', true)

    const image = new Image()
    image.src = `./assets/${PLAYER.Human}.svg`
    image.alt = PLAYER.Human

    newBox.appendChild(image)
    newBox.setAttribute('disabled', true)

    return getMoveLocation(newBox)
}

const getMoveLocation = (box) => {
    const rowIndex = Array.from(box.parentElement.classList).find(className => className.startsWith('row'))?.split('-')[1]
    const columnIndex = Array.from(box.classList).find(className => className.startsWith('col'))?.split('-')[1]

    return [Number(rowIndex) - 1, Number(columnIndex) - 1]
}

const getBoardBoxes = (coordinates) => {
    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    return boxes
}

const checkGameStatus = (board) => {
    const boardLength = board.length
    const flattenBoard = []
    const players = Object.values(PLAYER)
    const gameState = {
        status: GAME_STATUS.InProgress,
        winningCoordinates: undefined
    }
    let winner, winningCoordinates

    for (let row = 0;row < boardLength;row++) {
        const horizontalMatch = { moves: [], coordinates: [] }
        const verticalMatch = { moves: [], coordinates: [] }
        const diagonalMatch = { moves: [], coordinates: [] }
        const diagonalReverseMatch = { moves: [], coordinates: [] }

        for (let col = 0;col < boardLength;col++) {
            horizontalMatch.moves.push(board[row][col])
            horizontalMatch.coordinates.push([row, col])

            verticalMatch.moves.push(board[col][row])
            verticalMatch.coordinates.push([col, row])

            flattenBoard.push(board[row][col])
        }

        for (let rev = boardLength - 1;rev >= 0;rev--) {
            diagonalMatch.moves.push(board[rev][rev])
            diagonalMatch.coordinates.push([rev, rev])

            diagonalReverseMatch.moves.push(board[(boardLength - 1) - rev][rev])
            diagonalReverseMatch.coordinates.push([(boardLength - 1) - rev, rev])
        }

        const matches = [
            horizontalMatch,
            verticalMatch,
            diagonalMatch,
            diagonalReverseMatch
        ]

        for (const match of matches) {
            const { moves, coordinates } = match

            const firstMove = moves[0]
            const hasWinningPattern = players.includes(firstMove) && moves.every(player => player === firstMove)
            if (hasWinningPattern) {
                winner = firstMove
                winningCoordinates = coordinates
            }
        }
    }

    if (winner && winningCoordinates) {
        gameState.status = winner === PLAYER.Human ? GAME_STATUS.XWin : GAME_STATUS.OWin
        gameState.winningCoordinates = winningCoordinates
    }
    if (flattenBoard.every(move => players.includes(move))) gameState.status = GAME_STATUS.Draw

    return gameState
}
