'use strict'

const MINE = '💣'
const FLAG = '🏳️'

var gBoard
var gIsGameStarted
var gTimer

const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gGame = {
    isOn: false,
    isWin: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    locateMinesRandomly(gLevel.MINES)
    renderBoard(gBoard, '.table-container')
    gGame.isOn = true
    flagCell()
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                minesAroundCount: null
            }
        }

    }
    return board
}

function cellClicked(elCell, i, j) {
    if (!gIsGameStarted) startTimer()
    gIsGameStarted = true
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    renderCell(elCell, { i, j })
    if (!elCell.innerHTML) expandCell(i, j)
    else if (elCell.innerHTML) {
        elCell.classList.add('shown')
        if (!gBoard[i][j].isShown) gGame.shownCount++
        gBoard[i][j].isShown = true
        if (gBoard[i][j].isMine) gameOver()
    }
    isWin()
}

function expandCell(i, j) {
    var negs = getNegs(gBoard, i, j)
    for (var idx = 0; idx < negs.length; idx++) {
        const currNeg = negs[idx]
        const elCurrCell = document.querySelector(`.cell.cell-${currNeg.i}-${currNeg.j}`)
        if (!gBoard[currNeg.i][currNeg.j].isShown) gGame.shownCount++
        renderCell(elCurrCell, { i: currNeg.i, j: currNeg.j })
        gBoard[currNeg.i][currNeg.j].isShown = true
        elCurrCell.classList.add('shown')
    }
}

function locateMinesRandomly(minesNum) {
    var emptyPos = findEmptyPos(gBoard)
    for (var i = 0; i < minesNum; i++) {
        var locateMine = emptyPos.splice(getRandomInt(0, emptyPos.length), 1)
        gBoard[locateMine[0].i][locateMine[0].j].isMine = true
    }
}

function flagCell(elCell) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    var button = document.querySelector('table');
    button.addEventListener('mouseup', (e) => {
        elCell = e.target
        if (e.button === 2) {
            const cellCoord = getCellCoord(elCell.classList[1])
            if (gBoard[cellCoord.i][cellCoord.j].isShown) return
            if (!gGame.isOn) return
            elCell.classList.toggle('flagged')
            if (!gBoard[cellCoord.i][cellCoord.j].isMarked) {
                elCell.innerText = FLAG
                gGame.markedCount++
                isWin()
            } else {
                elCell.innerText = ''
                gGame.markedCount--
            }
            gBoard[cellCoord.i][cellCoord.j].isMarked = !gBoard[cellCoord.i][cellCoord.j].isMarked
        }
    });
}

function gameOver() {
    showAllCells()
    gGame.isOn = false
    resetGame()
    var elSmiley = document.querySelector('.smiley button')
    elSmiley.innerText = gGame.isWin ? '😎' : '🤯'

}

function isWin() {
    var shownCountNum = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.shownCount === shownCountNum && gGame.markedCount === gLevel.MINES) {
        gGame.isWin = true
        gameOver()
    }
}

function onRestart(elBtn) {
    initGame()
    var elTimer = document.querySelector('.timer span')
    gGame.secsPassed = 0
    elTimer.innerText = gGame.secsPassed
    clearInterval(gTimer)
    gIsGameStarted = false
    elBtn.innerText = '😃'
}

function showAllCells() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const elCurrCell = document.querySelector(`.cell.cell-${i}-${j}`)
            if (!elCurrCell.innerText) {
                renderCell(elCurrCell, { i, j })
                elCurrCell.classList.add('shown')
            }
        }
    }
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    var elTimer = document.querySelector('.timer span')
    resetGame()
    elTimer.innerText = gGame.secsPassed
    document.querySelector('.smiley button').innerText = '😃'
    initGame()
}

function resetGame() {
    clearInterval(gTimer)
    gIsGameStarted = false
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
}

/* Bugs:
---Right click is not only on td. is on whole table
*/