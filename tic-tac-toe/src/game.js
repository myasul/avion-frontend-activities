import { EMPTY_BOARD, GAME_STATUS, PLAYER } from './lib/constants.js'
import { getRandomArbitrary, recreateElement } from './lib/utils.js'

/**
 * GAME FUNCTIONS
 */

export const drawBoard = (board, options = {}) => {
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
export const makeAIMove = (game) => {
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
    image.classList.add('slide')

    // Add delay to have that "thinking" effect
    setTimeout(() => { newBox.appendChild(image) }, 400)
    newBox.setAttribute('disabled', true)

    return move
}

export const makeHumanMove = (box) => {
    // Recreate element to remove click event
    const newBox = recreateElement(box)
    newBox.setAttribute('disabled', true)

    const image = new Image()
    image.src = `./assets/${PLAYER.Human}.svg`
    image.alt = PLAYER.Human
    image.classList.add('slide')

    newBox.appendChild(image)
    newBox.setAttribute('disabled', true)

    return getMoveLocation(newBox)
}

export const getBoardBoxes = (coordinates) => {
    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    return boxes
}

export const checkGameStatus = (board) => {
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

/**
 * PRIVATE FUNCTIONS
 */

const isMoveValid = (move) => {
    const [row, col] = move
    const boxes = getBoardBoxes()
    const box = boxes[row][col]

    return box.firstChild === null
}

const getMoveLocation = (box) => {
    const rowIndex = Array.from(box.parentElement.classList).find(className => className.startsWith('row'))?.split('-')[1]
    const columnIndex = Array.from(box.classList).find(className => className.startsWith('col'))?.split('-')[1]

    return [Number(rowIndex) - 1, Number(columnIndex) - 1]
}