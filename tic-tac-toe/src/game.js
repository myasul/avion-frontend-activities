import { EMPTY_BOARD, GAME_DIFFICULTY, GAME_STATUS, PLAYER, PLAYER_VALUE } from './lib/constants.js'
import { getRandomArbitrary, recreateElement, cloneBoard } from './lib/utils.js'

/******************/
/* GAME FUNCTIONS */
/******************/

export const drawBoard = (board, options = {}) => {
    const { enableBoxes } = options
    const boxes = getBoardBoxes()

    for (let row = 0;row < board.length;row++) {
        for (let col = 0;col < board.length;col++) {
            const box = boxes[row][col]
            const boardValue = board[row][col]

            if (enableBoxes) box.setAttribute('disabled', false)
            if (box.firstChild) box.removeChild(box.firstChild)
            if (boardValue === PLAYER.Blank) continue

            const image = new Image()
            image.src = `./assets/${boardValue}.svg`
            image.alt = boardValue

            box.appendChild(image)
        }
    }
}

export const checkWinnerWithCoordinates = (board) => {
    const boardLength = board.length
    const flattenBoard = []
    const win = {
        winner: undefined,
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
            const hasWinningPattern = firstMove !== PLAYER.Blank && moves.every(player => player === firstMove)
            if (hasWinningPattern) {
                win.winner = firstMove
                win.winningCoordinates = coordinates
            }
        }
    }

    if (win.winner !== undefined) return win
    if (flattenBoard.every(move => move !== PLAYER.Blank)) {
        win.winner = PLAYER.Blank
        return win
    }

    return undefined
}


/********************/
/* PLAYER FUNCTIONS */
/********************/

const makeMove = (box, player, options = {}) => {
    const { delayMs } = options

    const image = new Image()
    image.src = `./assets/${player}.svg`
    image.alt = player
    image.classList.add('slide')

    // Recreate element to remove click event
    const newBox = recreateElement(box)
    newBox.setAttribute('disabled', true)
    delayMs
        ? setTimeout(() => { newBox.appendChild(image) }, 400)
        : newBox.appendChild(image)

    return newBox
}

export const makeHumanMove = (box) => {
    // Recreate element to remove click event
    const newBox = makeMove(box, PLAYER.X)

    return getMoveLocation(newBox)
}

export const makeComputerMove = (game) => {
    const { board, difficulty } = game
    const move = difficulty === GAME_DIFFICULTY.Easy
        ? makeRandomMove(board)
        : makeBestMove(board, PLAYER.O)

    const [row, col] = move

    const box = document.querySelector(`div.row-${row + 1} div.col-${col + 1}`)

    // Add delay to have that "thinking" effect
    makeMove(box, PLAYER.O, { delayMs: 400 })

    return move
}

const makeRandomMove = (board) => {
    let move

    do {
        move = [0, 1].map(coord => getRandomArbitrary(0, 2))
    } while (!isMoveValid(move, board))

    return move
}

const makeBestMove = (board, player) => {
    let bestScore = -Infinity
    let bestMove = [-1, -1]

    for (let row = 0;row < board.length;row++) {
        for (let col = 0;col < board.length;col++) {
            const clonedBoard = cloneBoard(board)

            if (clonedBoard[row][col] === PLAYER.Blank) {
                // Make move
                clonedBoard[row][col] = player

                // Get value or "score" for this move
                const score = minimax(clonedBoard, 0, false)

                if (score > bestScore) {
                    bestScore = score
                    bestMove = [row, col]
                }

                // break

                // Undo move
                clonedBoard[row][col] = PLAYER.Blank
            }
        }
    }

    return bestMove
}

const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinner(board)

    if (winner === PLAYER.X || winner === PLAYER.O) {
        return isMaximizing ? PLAYER_VALUE[winner] + depth : PLAYER_VALUE[winner] - depth
    }

    if (hasNoAvailableMoves(board)) {
        return PLAYER_VALUE.Draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity

        for (let row = 0;row < board.length;row++) {
            for (let col = 0;col < board.length;col++) {
                if (board[row][col] === PLAYER.Blank) {

                    // Make move
                    board[row][col] = PLAYER.O

                    const score = minimax(board, depth + 1, false)
                    bestScore = Math.max(score, bestScore)

                    // Undo move
                    board[row][col] = PLAYER.Blank
                }
            }
        }

        return bestScore
    } else {
        let bestScore = Infinity

        for (let row = 0;row < board.length;row++) {
            for (let col = 0;col < board.length;col++) {
                if (board[row][col] === PLAYER.Blank) {
                    // Make move
                    board[row][col] = PLAYER.X

                    const score = minimax(board, depth + 1, true)
                    bestScore = Math.min(score, bestScore)

                    // Undo move
                    board[row][col] = PLAYER.Blank
                }
            }
        }

        return bestScore
    }
}

const checkWinner = (board) => {
    let winner

    for (let row = 0;row < board.length;row++) {
        const horizontalMatch = []
        const verticalMatch = []
        const diagonalMatch = []
        const diagonalReverseMatch = []

        for (let col = 0;col < board.length;col++) {
            horizontalMatch.push(board[row][col])
            verticalMatch.push(board[col][row])
        }

        for (let rev = board.length - 1;rev >= 0;rev--) {
            diagonalMatch.push(board[rev][rev])
            diagonalReverseMatch.push(board[(board.length - 1) - rev][rev])
        }

        const matches = [
            horizontalMatch,
            verticalMatch,
            diagonalMatch,
            diagonalReverseMatch
        ]

        for (const match of matches) {
            const firstMove = match[0]
            const hasWinningPattern = firstMove !== PLAYER.Blank && match.every(move => move === firstMove)
            if (hasWinningPattern) {
                winner = firstMove
            }
        }
    }

    if (winner) return winner

    return undefined
}

export const getBoardBoxes = (options = {}) => {
    const { flatten } = options

    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    return flatten ? boxes.flat() : boxes
}

/**
 * PRIVATE FUNCTIONS
 */

const isMoveValid = (move, board) => {
    const [row, col] = move
    const moveValue = board[row][col]

    return moveValue === PLAYER.Blank
}

const getMoveLocation = (box) => {
    const rowIndex = Array.from(box.parentElement.classList).find(className => className.startsWith('row'))?.split('-')[1]
    const columnIndex = Array.from(box.classList).find(className => className.startsWith('col'))?.split('-')[1]

    return [Number(rowIndex) - 1, Number(columnIndex) - 1]
}

const hasNoAvailableMoves = (board) => {
    return board.flat().every(box => box !== PLAYER.Blank)
}

const getOpponnent = (player) => {
    return player === PLAYER.X ? PLAYER.O : PLAYER.X
}
