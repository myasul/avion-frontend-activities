import { EMPTY_BOARD, GAME_STATUS, PLAYER, COLORS } from './constants.js'
import { delayedAlert, cloneBoard, getRandomArbitrary, recreateElement } from './utils.js'

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
        .addEventListener('click', restartGame)
}

export const restartGame = () => {
    // Remove current event listeners to avoid overlap
    const oldBoard = document.querySelector('.board')
    recreateElement(oldBoard)

    const oldHistoryControls = document.querySelector('.history-controls')
    const historyControls = recreateElement(oldHistoryControls)
    historyControls.style.visibility = 'hidden'

    drawBoard(cloneBoard(EMPTY_BOARD), { enableBoxes: true })
    startGame()
}

/**
 * HANDLERS
 */

const handleBoxClick = (event, game) => {
    const box = event.target
    let status

    if (box.disabled) return

    const [row, col] = makeHumanMove(box)

    game.board[row][col] = PLAYER.Human
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    status = checkGameStatus(game.board)
    if (status !== GAME_STATUS.InProgress) return handleAfterGame(status)

    const [rowAI, colAI] = makeAIMove()

    game.board[rowAI][colAI] = PLAYER.AI
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    status = checkGameStatus(game.board)
    if (status !== GAME_STATUS.InProgress) return handleAfterGame(status)
}

const handleAfterGame = (status) => {
    delayedAlert(status)

    const historyControls = document.querySelector('.history-controls')
    historyControls.style.visibility = 'visible'

    const nextButton = document.querySelector('.next')
    nextButton.disabled = true

    const boxes = Array.from(document.querySelectorAll('.box'))
    boxes.forEach(box => { box.setAttribute('disabled', true) })

    return
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
    setTimeout(() => { newBox.appendChild(image) }, 200)
    newBox.setAttribute('disabled', true)

    return move
}

const isMoveValid = (move) => {
    const [row, col] = move

    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

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

const checkGameStatus = (board) => {
    const boardLength = board.length
    const flattenBoard = []
    const players = Object.values(PLAYER)
    let winner

    for (let row = 0;row < boardLength;row++) {
        const horizontalMatch = []
        const verticalMatch = []
        const diagonalMatch = []
        const diagonalReverseMatch = []

        for (let col = 0;col < boardLength;col++) {
            horizontalMatch.push(board[row][col])
            verticalMatch.push(board[col][row])
            flattenBoard.push(board[row][col])
        }

        for (let rev = boardLength - 1;rev >= 0;rev--) {
            diagonalMatch.push(board[rev][rev])
            diagonalReverseMatch.push(board[(boardLength - 1) - rev][rev])
        }

        const matches = [
            horizontalMatch,
            verticalMatch,
            diagonalMatch,
            diagonalReverseMatch
        ]

        for (const match of matches) {
            const firstMove = match[0]
            const hasMatch = players.includes(firstMove) && match.every(player => player === firstMove)
            if (hasMatch) {
                winner = firstMove
            }
        }
    }

    if (winner) return winner === PLAYER.Human ? GAME_STATUS.XWin : GAME_STATUS.OWin
    if (flattenBoard.every(move => players.includes(move))) return GAME_STATUS.Draw

    return GAME_STATUS.InProgress
}
