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

function positionMinesManually(elCell, i, j) {
    if (gIsGameStarted) return
    gIsMinesManual = true
    gGame.isOn = false
    var elButton = document.querySelector('.create-mines')
    elButton.style.border = '3px #60DC40 dotted'
    elButton.style.backgroundColor = 'black'
    elButton.style.color = '#60DC40'
}

function backButtonStyle() {
    var elButton = document.querySelector('.create-mines')
    elButton.style.border = 'none'
    elButton.style.backgroundColor = '#60DC40'
    elButton.style.color = 'black'
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