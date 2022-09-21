'use strict'

const MINE = '💣'

var gBoard

function initGame() {
    gBoard = buildBoard(4)
    locateMinesRandomly(2)
    renderBoard(gBoard, '.table-container')
}

function buildBoard(num) {
    var board = []
    for (var i = 0; i < num; i++) {
        board[i] = []
        for (var j = 0; j < num; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                // isMarked: false,
                minesAroundCount: null
            }
        }

    }
    return board
}

function cellClicked(elCell, i, j) {
    elCell.classList.add('shown')
    gBoard[i][j].isShown = true
    if (!elCell.innerHTML) {
        expandCell(i, j)
    }

}

function expandCell(i, j) {
    var negs = getNegs(gBoard, i, j)
    for (var idx = 0; idx < negs.length; idx++) {
        const currNeg = negs[idx]
        const elCurrCell = document.querySelector(`.cell.cell-${currNeg.i}-${currNeg.j}`)
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



/*



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