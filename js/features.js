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
    gElHint.style.visibility = 'hidden'
    var negs = getNegs(board, i, j)
    gIsHint = false
    for (var idx = 0; idx < negs.length; idx++) {
        var currCell = document.querySelector(`.cell.cell-${negs[idx].i}-${negs[idx].j}`)
        if (gBoard[i][j].isShown) continue
        currCell.classList.add('shown')
        renderCell(currCell, { i: negs[idx].i, j: negs[idx].j })
        setTimeout(unRenderCell, 1000, currCell)
    } if (megaHints.length === 2) return
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

function positionMinesManually(elCell, i, j) {
    if (gIsGameStarted) return
    gIsMinesManual = true
    gGame.isOn = false
    var elButton = document.querySelector('.create-mines')
    elButton.classList.add('clicked')
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
    for (var rowIdx = megaHints[0].i; rowIdx <= megaHints[1].i; rowIdx++) {
        for (var colIdx = megaHints[0].j; colIdx <= megaHints[1].j; colIdx++) {
            elCurrCell = document.querySelector(`.cell.cell-${rowIdx}-${colIdx}`)
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
    megaHints = []
}

function placeMines() {
    gIsMinesManual = false
    gGame.isOn = true
    for (var idx = 0; idx < gLevel.MINES; idx++) {
        const currMine = gMinesLoc[idx]
        gBoard[currMine.i][currMine.j].isMine = true
        var currCell = document.querySelector(`.cell.cell-${currMine.i}-${currMine.j}`)
        setTimeout(unRenderCell, 1000, currCell)
        setTimeout(backButtonStyle, 1000)
    }
}

function pushIdx() {
    moves.push(lastMove.splice(0, lastMove.length))
    return moves
}

function getIdx(row, col) {
    lastMove.push({ i: row, j: col })
    return lastMove
}

function undo() {
    var lastMoves = moves.splice(moves.length - 1, 1)
    for (var idx = 0; idx < lastMoves[0].length; idx++) {
        const currMove = lastMoves[0][idx]
        gBoard[currMove.i][currMove.j].isShown = false
        const elCurrCell = document.querySelector(`.cell.cell-${currMove.i}-${currMove.j}`)
        unRenderCell(elCurrCell)
        if (gBoard[currMove.i][currMove.j].isMine) {
            gLevel.LIVES++
            createLife()
        }
    }
}

function mineExt() {
    
}
