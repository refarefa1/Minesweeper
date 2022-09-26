'use strict'

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
        strHTML += '<img onclick="onHint(this) "src="img/hint.svg" alt="hint">'
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
    var negs = getNegs(board, i, j)
    gIsHint = false
    for (var idx = 0; idx < negs.length; idx++) {
        var currCell = selectCell(negs[idx].i, negs[idx].j)
        if (gBoard[i][j].isShown) continue
        currCell.classList.add('shown')
        renderCell(currCell, { i: negs[idx].i, j: negs[idx].j })
        setTimeout(unRenderCell, 1000, currCell)
        setTimeout(() => {
            gElHint.style.visibility = 'hidden';
        }, "500")
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

function safeClick() {
    if (!gLevel.SAFE) return
    var emptyPos = findEmptyPos(gBoard)
    const randomEmptyPos = emptyPos[getRandomInt(0, emptyPos.length)]
    const elCell = selectCell(randomEmptyPos.i, randomEmptyPos.j)
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

function positionMinesManually(elCell, i, j) {
    if (gIsGameStarted) return
    gIsMinesManual = true
    gGame.isOn = false
    var elButton = document.querySelector('.create-mines')
    elButton.classList.add('clicked')
}

function placeMinesManually(cell, row, col) {
    gMinesLoc.push({ i: row, j: col })
    cell.innerHTML = MINE
    gMines++
    if (gMines === gLevel.MINES) {
        placeMines()
        return
    }
}

function backButtonStyle() {
    var elButton = document.querySelector('.create-mines')
    elButton.classList.remove('clicked')
}

function whiteMode(elBtn) {
    gIsWhiteMode = !gIsWhiteMode
    elBtn.innerText = gIsWhiteMode ? 'Play \n black \n mode' : 'Play \n white \n mode'
    var elBody = document.querySelector('body')
    elBody.style.backgroundColor = gIsWhiteMode ? '#e8ffd1' : 'black'
    var elSmiley = document.querySelector('.smiley button')
    elSmiley.style.backgroundColor = gIsWhiteMode ? '#e8ffd1' : 'black'
    var elScore = document.querySelector('.best-score')
    elScore.style.color = gIsWhiteMode ? 'black' : 'white'
}

function megaHint() {
    if (!gLevel.MEGAHINT) return
    var elButton = document.querySelector('.mega-hint')
    elButton.classList.add('clicked')
    gIsMegaHint = true
    gGame.isOn = false
}

function actMegaHint(elCurrCell) {
    for (var rowIdx = gMegaHints[0].i; rowIdx <= gMegaHints[1].i; rowIdx++) {
        for (var colIdx = gMegaHints[0].j; colIdx <= gMegaHints[1].j; colIdx++) {
            elCurrCell = selectCell(rowIdx, colIdx)
            if (gBoard[rowIdx][colIdx].isShown) continue
            elCurrCell.classList.add('shown')
            renderCell(elCurrCell, { i: rowIdx, j: colIdx })
            setTimeout(unRenderCell, 1500, elCurrCell)
            setTimeout(resetMegaHint, 1500)
        }
    } gLevel.MEGAHINT--
}

function resetMegaHint() {
    var elButton = document.querySelector('.mega-hint')
    elButton.classList.remove('clicked')
    var elButtonSpan = document.querySelector('.mega-hint span')
    elButtonSpan.innerText = gLevel.MEGAHINT
    gIsMegaHint = false
    gGame.isOn = true
    gMegaHints = []
}

function placeMines() {
    for (var idx = 0; idx < gLevel.MINES; idx++) {
        const currMine = gMinesLoc[idx]
        gBoard[currMine.i][currMine.j].isMine = true
        var currCell = selectCell(currMine.i,currMine.j)
        setTimeout(unRenderCell, 1000, currCell)
        setTimeout(backButtonStyle, 1000)
        setTimeout(() => {
            gGame.isOn = true;
        }, "1000")
    }
    gIsMinesManual = false
}

function pushIdx() {
    gMoves.push(gLastMove.splice(0, gLastMove.length))
    return gMoves
}

function getIdx(row, col) {
    gLastMove.push({ i: row, j: col })
    return gLastMove
}

function undo() {
    if (!gIsGameStarted) return
    var lastMoves = gMoves.splice(gMoves.length - 1, 1)
    for (var idx = 0; idx < lastMoves[0].length; idx++) {
        const currMove = lastMoves[0][idx]
        const elCurrCell = selectCell(currMove.i,currMove.j)
        gBoard[currMove.i][currMove.j].isShown = false
        unRenderCell(elCurrCell)
        if (gBoard[currMove.i][currMove.j].isMine) {
            gLevel.LIVES++
            createLife()
        }
    }
}

function mineExt() {
    gMinesExt = []
    for (var rowIdx = 0; rowIdx < gBoard.length; rowIdx++) {
        for (var colIdx = 0; colIdx < gBoard[0].length; colIdx++) {
            var currCell = gBoard[rowIdx][colIdx]
            if (currCell.isMine && !currCell.isShown) {
                gMinesExt.push({ i: rowIdx, j: colIdx })
            }
        }
    }
    getRandomMines()
    fixNegs()
    gMinesExt = []
}

function getRandomMines() {
    var randomMines
    for (var idx = 0; idx < 3; idx++) {
        randomMines = (gMinesExt.splice(gMinesExt[getRandomInt(0, gMinesExt.length - 1)], 1))
        gBoard[randomMines[0].i][randomMines[0].j].isMine = false
    }
}

function fixNegs() {
    for (var rowIdx = 0; rowIdx < gBoard.length; rowIdx++) {
        for (var colIdx = 0; colIdx < gBoard[0].length; colIdx++) {
            var currCell = gBoard[rowIdx][colIdx]
            const elCurrCell = selectCell(rowIdx,colIdx)
            if (currCell.isShown) {
                renderCell(elCurrCell, { i: rowIdx, j: colIdx })
            }
        }
    }
}

function sevenBoom() {
    if (gIsGameStarted) return
    gBoard = buildBoard()
    for (var rowIdx = 0; rowIdx < gBoard.length; rowIdx++) {
        for (var colIdx = 0; colIdx < gBoard[0].length; colIdx++) {
            if (gSevenBoomCount % 7 === 0) gBoard[rowIdx][colIdx].isMine = true
            gSevenBoomCount++
        }
    }
    renderBoard(gBoard, '.table-container')
}