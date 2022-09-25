'use strict'

const MINE = '💣'
const FLAG = '🏴'

var gBoard
var gIsGameStarted
var gTimer
var gIsHint
var gElHint
var gIsMinesManual
var gMines = 0
var gMinesLoc = []
var input
var oldState = []
var gIsWhiteMode
var gIsMegaHint
var megaHints = []
var moves = []
var lastMove = []
var expandMoves = []


const gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3,
    HINTS: 3,
    MEGAHINT: 1,
    SAFE: 3
}

const gGame = {
    isOn: false,
    isWin: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    bestScore: Infinity
}

function initGame() {
    gLevel.LIVES = 3
    gLevel.HINTS = 3
    gLevel.SAFE = 3
    gLevel.MEGAHINT = 1
    gGame.secsPassed = 0
    expandMoves = []
    gMinesLoc = []
    moves = []
    gMines = 0
    gGame.isWin = false
    gIsGameStarted = false
    createLife()
    resetSafe()
    resetMegaHint()
    createHints()
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
    if (gIsMinesManual) {
        gBoard = buildBoard(gLevel.SIZE)
        positionMinesManually(elCell, i, j)
        if (gMines <= gLevel.MINES) {
            gMinesLoc.push({ i, j })
            elCell.innerHTML = MINE
            gMines++
            if (gMines === gLevel.MINES) {
                placeMines()
                return
            }
        }
    }
    if (gIsMegaHint && gLevel.MEGAHINT) {
        megaHints.push({ i, j })
        if (megaHints.length === 2) actMegaHint()
    }
    if (!gGame.isOn) return
    if (!gIsGameStarted) {
        startTimer()
        while (gBoard[i][j].isMine) initGame()
    }
    gIsGameStarted = true
    if (gIsHint) {
        actHint(gBoard, i, j)
        return
    }
    if (gBoard[i][j].isMarked) return
    renderCell(elCell, { i, j })
    if (gBoard[i][j].isMine) {
        getIdx(i, j)
        pushIdx()
        gBoard[i][j].isShown = true
        elCell.classList.add('shown')
        gLevel.LIVES--
        createLife()
        if (!gLevel.LIVES) gameOver()
        return
    }
    if (!gBoard[i][j].minesAroundCount) {
        expandCell(i, j)
        moves.push(expandMoves.splice(0, expandMoves.length - 1))
        expandMoves = []
        lastMove = []
    }
    else {
        const elCurrCell = document.querySelector(`.cell.cell-${i}-${j}`)
        renderCell(elCurrCell, { i, j })
        getIdx(i, j)
        pushIdx()
        gBoard[i][j].isShown = true
        elCurrCell.classList.add('shown')
        gGame.shownCount++
    }
    isWin()
}

function expandCell(i, j) {
    var negs = getNegs(gBoard, i, j)
    for (var idx = 0; idx < negs.length; idx++) {
        const currNeg = negs[idx]
        const elCurrCell = document.querySelector(`.cell.cell-${currNeg.i}-${currNeg.j}`)
        if (!gBoard[currNeg.i][currNeg.j].isShown) gGame.shownCount++
        if (!gBoard[currNeg.i][currNeg.j].isMine) {
            renderCell(elCurrCell, { i: currNeg.i, j: currNeg.j })
            expandMoves.push({ i: currNeg.i, j: currNeg.j })
            gBoard[currNeg.i][currNeg.j].isShown = true
            elCurrCell.classList.add('shown')
            if (currNeg && !gBoard[currNeg.i][currNeg.j].minesAroundCount) {
                expandCell(currNeg.i, currNeg.j)

            }
        }
        getIdx(i, j)
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
            if (gBoard[cellCoord.i][cellCoord.j].isShown && !gBoard[cellCoord.i][cellCoord.j].isMine) return
            if (!gGame.isOn) return
            elCell.classList.toggle('flagged')
            if (!gBoard[cellCoord.i][cellCoord.j].isMarked) {
                elCell.innerText = FLAG
                gGame.markedCount++
                isWin()
            } else {
                if (gBoard[cellCoord.i][cellCoord.j].isShown) {
                    renderCell(elCell, cellCoord)
                } else {
                    elCell.innerHTML = ''
                }
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
    if (gGame.shownCount >= shownCountNum && gGame.markedCount === gLevel.MINES) {
        gGame.isWin = true
        bestScore()
        gameOver()
    }
}

function onRestart(elBtn) {
    initGame()
    var elTimer = document.querySelector('.timer span')
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
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
    gGame.shownCount = 0
    gGame.markedCount = 0
}

/* Left to do:

-- 7BOOM

-- MINE EXTERMINATOR

*/