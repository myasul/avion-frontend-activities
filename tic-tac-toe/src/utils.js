export const cloneBoard = (board) => board.map(row => [...row])
export const getRandomArbitrary = (min, max) => Math.round(Math.random() * (max - min) + min)
export const delayedAlert = (message) => setTimeout(() => alert(message), 200)
export const recreateElement = (element) => {
    const clonedElement = element.cloneNode(true)
    const parent = element.parentNode
    parent.replaceChild(clonedElement, element)

    return clonedElement
}