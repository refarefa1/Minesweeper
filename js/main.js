'use strict'

const MINE = '💣'
const FLAG = '🚩'

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

var gBoard

function initGame() {
    gBoard = buildBoard(4)
    locateMinesRandomly(2)
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
    if (!gGame.isOn) return
    renderCell(elCell, { i, j })
    if (gBoard[i][j].isMarked) return
    else if (!elCell.innerHTML) expandCell(i, j)
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

function flagCell() {
    const noRightClick = document.querySelector('.table-container');
    noRightClick.addEventListener("contextmenu", e => e.preventDefault());
    window.addEventListener('contextmenu', (event) => {
        const cellClicked = event.target
        const cellClass = cellClicked.classList[1]
        const cellCoord = getCellCoord(cellClass)
        if (gBoard[cellCoord.i][cellCoord.j].isShown) return
        if (!gGame.isOn) return
        if (event.button === 2) {
            cellClicked.classList.toggle('flagged')
            if (!gBoard[cellCoord.i][cellCoord.j].isMarked) {
                cellClicked.innerText = FLAG
                gGame.markedCount++
                isWin()
            } else {
                cellClicked.innerText = ''
                gGame.markedCount--
            }
            gBoard[cellCoord.i][cellCoord.j].isMarked = !gBoard[cellCoord.i][cellCoord.j].isMarked
        }
    })
}

function gameOver() {
    showAllCells()
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    var elSmiley = document.querySelector('.modal button')
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


/*

BUGS :

--- After restart flag wont work , only next time active

--- Can see whats in the box from devtools

*/





// 3 levels of game
//Beginner (4 * 4 with 2 MINES)
// Medium (8 * 8 with 14 MINES)
// Expert (12 * 12 with 32 MINES)

// win when all mines are flagged and numbers are shown

// lose at mine click

// right click toggle flag

// left click reveals
// MINE – reveal the mine clicked
// Cell with neighbors – reveal the cell alone
// Cell without neighbors – expand it and its 1st degree neighbors


// timer