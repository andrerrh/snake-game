const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const points = document.querySelector('.points')
const gameOverAlert = document.querySelector('.gameover-alert')
const endPoints = document.querySelector('.end-points')
const resetBtn = document.querySelector('.reset-game')
const easyBtn = document.querySelector('.easy-btn')
const normalBtn = document.querySelector('.normal-btn')
const hardBtn = document.querySelector('.hard-btn')
const difficultySelector = document.querySelector('.difficulty-selector')

var squareSpace = 0
var squares = []
var head = {}
var tail = []
var direction = 'down'
var lastTail = {}
var timerId
var difficulty_ms = 0

const setCanvasSize = () => {
    if (window.innerWidth > window.innerHeight) {
        canvas.width = window.innerHeight * 0.9
        canvas.height = window.innerHeight * 0.9
    } else {
        canvas.width = window.innerWidth * 0.9
        canvas.height = window.innerWidth * 0.9
    }
}

const populateSquares = (perimeter) => {
    squareSpace = canvas.width / perimeter
    squares = []
    for (let i = 0; i < perimeter; i++) {
        for (let j = 0; j < perimeter; j++) {
            squares.push({
                index: squares.length,
                x: (squareSpace * j).toFixed(2),
                y: (squareSpace * i).toFixed(2),
                apple: false,
                populated: false
            })
        }
    }
}

const loadGame = () => {
    tail = []
    points.innerText = 0
    gameOverAlert.style.display = 'none'
    direction = 'down'
    setCanvasSize()
    populateSquares(20)
    drawHead(30)
    timerId = setInterval(() => {
        moveHead(20)
    }, difficulty_ms)
    drawApple()
}

const gotApple = (previousHead, appleIndex) => {
    points.innerText++
    drawApple()
    addTail(previousHead)
    appleIndex.apple = false
}

const gameOver = () => {
    clearInterval(timerId)
    gameOverAlert.style.display = 'flex'
    endPoints.innerText = points.innerText
}
const checkWallsColision = (index, previousIndex) => {
    if (index < 0 || index >= 400) gameOver() // Gameover on vertical collision with walls
    if (previousIndex % 20 === 0 && index === previousIndex - 1) gameOver() // Gameover on horizontal collision with left wall
    if ((previousIndex + 1) % 20 === 0 && index % 20 === 0) gameOver() // Gameover on horizontal collision with right wall
}

const checkForSelfCollision = (index) => {
    if (squares[index].populated) gameOver()
}

const drawHead = (index, previousIndex) => {
    let previousHead
    if (head?.x) {
        previousHead = head
        if (tail.length === 0) squares[previousHead.index].populated = false
        ctx.clearRect(head.x, head.y, squareSpace, squareSpace)
        checkWallsColision(index, previousIndex)
        checkForSelfCollision(index)
    }

    head = {
        index: index,
        x: squares[index].x,
        y: squares[index].y
    }
    squares[head.index].populated = true

    if (tail.length > 0) drawTail(previousHead)

    if (squares[head.index].apple) {
        gotApple(previousHead, squares[head.index])
    }

    ctx.fillStyle = 'blue'
    ctx.fillRect(head.x, head.y, squareSpace, squareSpace)
}

const changeDirection = (event) => {
    let newDirection = ''
    switch (event.key) {
        case 'w':
            newDirection = 'up'
            break;
        case 's':
            newDirection = 'down'
            break;
        case 'a':
            newDirection = 'left'
            break;
        case 'd':
            newDirection = 'right'
            break;
    }
    if (direction === 'up' && newDirection === 'down') return false
    if (direction === 'down' && newDirection === 'up') return false
    if (direction === 'left' && newDirection === 'right') return false
    if (direction === 'right' && newDirection === 'left') return false
    direction = newDirection
    window.removeEventListener('keypress', changeDirection)
}

const moveHead = (perimeter) => {
    window.addEventListener('keypress', changeDirection)
    if (direction === 'up') drawHead(head.index - perimeter, head.index)
    if (direction === 'down') drawHead(head.index + perimeter, head.index)
    if (direction === 'left') drawHead(head.index - 1, head.index)
    if (direction === 'right') drawHead(head.index + 1, head.index)
}

const drawApple = () => {
    const nonPopulatedSquares = squares.filter((e) => !e.populated)
    console.log(nonPopulatedSquares)
    const index = Math.floor(Math.random() * nonPopulatedSquares.length)
    nonPopulatedSquares[index].apple = true
    ctx.fillStyle = 'red'
    ctx.fillRect(nonPopulatedSquares[index].x, nonPopulatedSquares[index].y, squareSpace, squareSpace)
}

const drawTail = (previousHead) => {
    ctx.fillStyle = `hsl(${tail.length / 30 * 100}, 50%, 50%)`
    tail.forEach((e) => {
        if (squares[e.index] !== undefined) squares[e.index].populated = false
        ctx.clearRect(e.x, e.y, squareSpace, squareSpace)
    })
    for (let i = tail.length - 1; i >= 0; i--) {
        if (i === 0) {
            tail[i] = { ...previousHead }
            ctx.fillRect(tail[i].x, tail[i].y, squareSpace, squareSpace)
        } else {
            lastTail = tail[i]
            tail[i] = tail[i - 1]
            ctx.fillRect(tail[i].x, tail[i].y, squareSpace, squareSpace)
        }
        if (squares[tail[i].index] !== undefined) squares[tail[i].index].populated = true
    }
}

const addTail = (previousHead) => {
    if (tail.length === 0) {
        tail.push(previousHead)
    } else {
        tail.push(lastTail)
    }
}

window.addEventListener('load', () => {
    resetBtn.addEventListener('click', loadGame)
    easyBtn.addEventListener('click', () => {
        difficulty_ms = 500
        difficultySelector.style.display = 'none'
        loadGame()
    })
    normalBtn.addEventListener('click', () => {
        difficulty_ms = 300
        difficultySelector.style.display = 'none'
        loadGame()
    })
    hardBtn.addEventListener('click', () => {
        difficulty_ms = 100
        difficultySelector.style.display = 'none'
        loadGame()
    })
})

window.addEventListener('resize', () => {
    setCanvasSize()
    populateSquares(20)
})

