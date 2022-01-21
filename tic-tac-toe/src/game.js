import { EMPTY_BOARD, GAME_STATUS, PLAYER } from './constants.js'
import { delayedAlert, cloneBoard, getRandomArbitrary, syncWait } from './utils.js'

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
        .addEventListener('click', (event) => handlePreviousClick(event, game))
    document
        .querySelector('.next')
        .addEventListener('click', (event) => handleNextClick(event, game))
    document
        .querySelector('.new-game')
        .addEventListener('click', restartGame)
}

export const restartGame = () => {
    // Remove current event listeners to avoid overlap
    const oldBoard = document.querySelector('.board')
    const oldHistoryControls = document.querySelector('.history-controls')

    const newBoard = oldBoard.cloneNode(true)
    const newHistoryControls = oldHistoryControls.cloneNode(true)

    const parent = oldBoard.parentNode
    parent.replaceChild(newBoard, oldBoard)
    parent.replaceChild(newHistoryControls, oldHistoryControls)

    drawBoard(cloneBoard(EMPTY_BOARD))
    startGame()
}

const handleBoxClick = (event, game) => {
    const box = event.target
    let status

    if (box.disabled) return

    const [row, col] = makeHumanMove(box)

    game.board[row][col] = PLAYER.Human
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    status = checkGameStatus(game.board)
    if (status !== GAME_STATUS.InProgress) return delayedAlert(status)

    // syncWait(1000)

    const [rowAI, colAI] = makeAIMove(game)

    game.board[rowAI][colAI] = PLAYER.AI
    game.currentHistoryIndex += 1
    game.history.push(cloneBoard(game.board))

    status = checkGameStatus(game.board)
    if (status !== GAME_STATUS.InProgress) return delayedAlert(status)
}

const handlePreviousClick = (event, game) => {
    const { currentHistoryIndex } = game
    const index = currentHistoryIndex === 0 ? 0 : currentHistoryIndex - 1
    const board = game.history[index]

    drawBoard(board)

    game.currentHistoryIndex = index
}

const handleNextClick = (event, game) => {
    const { currentHistoryIndex, history } = game
    const historyMaxArrayLocation = history.length - 1

    const index = currentHistoryIndex >= historyMaxArrayLocation ? historyMaxArrayLocation : currentHistoryIndex + 1
    const board = game.history[index]

    drawBoard(board)

    game.currentHistoryIndex = index
}

const drawBoard = (board) => {
    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    for (let row = 0;row < board.length;row++) {
        for (let col = 0;col < board.length;col++) {
            const box = boxes[row][col]
            const boardValue = board[row][col]

            box.innerText = boardValue
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
    box.innerText = PLAYER.AI
    box.disabled = true

    return move
}

const isMoveValid = (move) => {
    const [row, col] = move

    const rows = Array.from(document.querySelectorAll('div[class*="row"]'))
    const boxes = rows.map(row => Array.from(row.querySelectorAll('div[class*="col"]')))

    const box = boxes[row][col]

    return box.innerText === ''
}

const makeHumanMove = (box) => {
    box.disabled = true
    box.textContent = PLAYER.Human

    return getMoveLocation(box)
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
