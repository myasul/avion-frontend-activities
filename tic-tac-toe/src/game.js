const EMPTY_BOARD = [
    ['','',''],
    ['','',''],
    ['','',''],
]
const DEFAULT_FIRST_PLAYER = 'X'
const PLAYERS = ['X', 'O']

export const startGame = (firstPlayer = DEFAULT_FIRST_PLAYER) => {
    let currentPlayer = !!PLAYERS.indexOf(firstPlayer)

    // Add event listeners to all boxers
    const boxes = document.querySelectorAll('.box')
    for (const box of boxes) {
        box.addEventListener('click', (event) => {
            makeMove(PLAYERS[Number(currentPlayer)], box)

            currentPlayer = !currentPlayer
        })
    }
}

const makeMove = (player, box) => {
    if (!PLAYERS.includes(player)) throw new Error(`Invalid player: ${player}`)

    const paragraph = document.createElement('p')
    paragraph.textContent = player

    box.appendChild(paragraph)
}