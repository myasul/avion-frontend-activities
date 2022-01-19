const EMPTY_BOARD = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
]
const DEFAULT_FIRST_PLAYER = 'X'
const PLAYERS = ['X', 'O']

export const startGame = (firstPlayer = DEFAULT_FIRST_PLAYER) => {
    const game = {
        board: EMPTY_BOARD,
        playerIndex: !!PLAYERS.indexOf(firstPlayer)
    }

    // Add event listeners to all boxers
    document
        .querySelectorAll('.box')
        .forEach(box => box.addEventListener('click', (event) => handleBoxClick(event, game)))
}

const handleBoxClick = (event, game) => {
    const box = event.target

    if (box.disabled) return

    const player = PLAYERS[Number(game.playerIndex)]
    const [row, col] = makeMove(player, game.board, box)

    game.board[row][col] = player
    game.playerIndex = !game.playerIndex

    const winner = checkWinner(game.board)

    if (winner) {
        return setTimeout(() => alert(`${winner} wins!`), 0)
    }
}

const makeMove = (player, board, box) => {
    if (!PLAYERS.includes(player)) throw new Error(`Invalid player: ${player}`)

    const paragraph = document.createElement('p')
    paragraph.textContent = player

    box.disabled = true
    box.appendChild(paragraph)

    return getMoveLocation(box)
}

const getMoveLocation = (box) => {
    const rowIndex = Array.from(box.parentElement.classList).find(className => className.startsWith('row'))?.split('-')[1]
    const columnIndex = Array.from(box.classList).find(className => className.startsWith('col'))?.split('-')[1]

    return [Number(rowIndex) - 1, Number(columnIndex) - 1]
}

const checkWinner = (board) => {
    const boardLength = board.length

    for (let row = 0;row < boardLength;row++) {
        const horizontalMatch = []
        const verticalMatch = []
        const diagonalMatch = []
        const diagonalReverseMatch = []

        for (let col = 0;col < boardLength;col++) {
            horizontalMatch.push(board[row][col])
            verticalMatch.push(board[col][row])
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
            const hasMatch = PLAYERS.includes(firstMove) && match.every(player => player === firstMove)
            if (hasMatch) return firstMove
        }
    }

    return undefined
}