'use strict'

const MINE = '💣'
const FLAG = '🏴'

var gBoard
var gIsGameStarted
var gTimer
var gIsHint = false
var gElHint

const gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3,
    HINTS: 3,
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
    gGame.secsPassed = 0
    gGame.isWin = false
    gIsGameStarted = false
    createLife()
    resetSafe()
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
    if (!gIsGameStarted) {
        startTimer()
        // while (gBoard[i][j].isMine) {
        //     console.log('mine!')
        //     initGame()
        //     console.log(gBoard)
        //     cellClicked(elCell, i, j)
        // }
    }
    gIsGameStarted = true
    if (gIsHint) {
        actHint(gBoard, i, j)
        return
    }
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    renderCell(elCell, { i, j })
    if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true
        elCell.classList.add('shown')
        gLevel.LIVES--
        createLife()
        if (!gLevel.LIVES) gameOver()
        return
    }
    if (!gBoard[i][j].minesAroundCount) expandCell(i, j)
    else {
        elCell.classList.add('shown')
        gGame.shownCount++
        gBoard[i][j].isShown = true

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
            gBoard[currNeg.i][currNeg.j].isShown = true
            elCurrCell.classList.add('shown')
            if (currNeg && !gBoard[currNeg.i][currNeg.j].minesAroundCount) {
                expandCell(currNeg.i, currNeg.j)
            }
        }

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
                renderCell(elCell, cellCoord)
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

function createLife() {
    var elLife = document.querySelector('.lives-left span')
    var strHTML = ''
    for (var i = 0; i < gLevel.LIVES; i++) {
        strHTML += '<img src="img/life.png" alt="life">'
    }
    elLife.innerHTML = strHTML
}

function createHints() {
    var elHints = document.querySelector('.hints-number')
    var strHTML = ''
    for (var i = 0; i < gLevel.HINTS; i++) {
        strHTML += '<img onclick="onHint(this) "src="/img/hint.svg" alt="hint">'
    }
    elHints.innerHTML = strHTML
}

function onHint(elBtn) {
    elBtn.style.scale = 1.2
    gLevel.HINTS--
    gIsHint = true
    gElHint = elBtn
}

function actHint(board, i, j) {
    gElHint.style.visibility = 'hidden'
    var negs = getNegs(board, i, j)
    gIsHint = false
    for (var idx = 0; idx < negs.length; idx++) {
        var currCell = document.querySelector(`.cell.cell-${negs[idx].i}-${negs[idx].j}`)
        if (gBoard[i][j].isShown) continue
        currCell.classList.add('shown')
        renderCell(currCell, { i: negs[idx].i, j: negs[idx].j })
        setTimeout(unRenderCell, 1000, currCell)
    }
}

function bestScore() {
    var elBestScore = document.querySelector('.best span')
    const currSeconds = gGame.secsPassed
    var lastBest = localStorage.getItem('Best-score')
    if (currSeconds < gGame.bestScore) {
        gGame.bestScore = currSeconds
        localStorage.setItem('Best-Score', currSeconds)
        elBestScore.innerText = currSeconds
    }
}

function safeClick(elBtn) {
    if (!gLevel.SAFE) return
    var emptyPos = findEmptyPos(gBoard)
    const randomEmptyPos = emptyPos[getRandomInt(0, emptyPos.length)]
    const elCell = document.querySelector(`.cell.cell-${randomEmptyPos.i}-${randomEmptyPos.j}`)
    elCell.classList.add('shown')
    renderCell(elCell, randomEmptyPos)
    setTimeout(unRenderCell, 1500, elCell)
    gLevel.SAFE--
    resetSafe()
}

function resetSafe() {
    const elNum = document.querySelector('.safe-number')
    elNum.innerText = gLevel.SAFE
}


/* Bugs:

--- table moves when lives are over

---Right click is not only on td. is on whole table

-- couldnt make first click not mine , something is bugged

*/