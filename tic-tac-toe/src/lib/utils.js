import { EMPTY_BOARD } from './constants.js'

export const cloneBoard = (board) => board.map(row => [...row])
export const getRandomArbitrary = (min, max) => Math.round(Math.random() * (max - min) + min)
export const recreateElement = (element) => {
    const clonedNode = element.cloneNode(true)
    const parent = element.parentNode
    parent.replaceChild(clonedNode, element)

    return Array.from(parent.children).find(child => child.isEqualNode(clonedNode))
}
