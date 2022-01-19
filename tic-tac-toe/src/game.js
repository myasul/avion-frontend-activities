const EMPTY_BOARD = [
    ['','',''],
    ['','',''],
    ['','',''],
]

export const startGame = () => {
    // Add event listeners to all boxers
    const boxes = document.querySelectorAll('.box')
    for (const box of boxes) {
        box.addEventListener('click', () => {
            console.log("CLICKED!")
        })
    }
}
