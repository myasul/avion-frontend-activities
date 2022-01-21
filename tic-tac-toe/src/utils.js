export const cloneBoard = (board) => board.map(row => [...row])
export const getRandomArbitrary = (min, max) => Math.round(Math.random() * (max - min) + min)
export const delayedAlert = (message) => setTimeout(() => alert(status), 0)
export const syncWait = (ms) => {
    const end = Date.now() + ms
    while (Date.now() < end) continue
}