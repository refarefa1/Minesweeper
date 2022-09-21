'use strict'

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j]
            const className = 'cell cell-' + i + '-' + j + ' flipped'
            if (mat[i][j].isMine) cell = MINE
            else if (!mat[i][j].isMine) {
                cell = setMinesNegsCount(mat, i, j)
                gBoard[i][j].minesAroundCount = cell
                if (!gBoard[i][j].minesAroundCount) cell = ''
            }
            strHTML += `<td onclick = "cellClicked(this,${i},${j})"class="${className}" >${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    var cell = 'A'
    var i = value.i
    var j = value.j
    if (gBoard[i][j].isMine) cell = MINE
    else if (!gBoard[i][j].isMine) {
        cell = setMinesNegsCount(gBoard, i, j)
        gBoard[i][j].minesAroundCount = cell
        if (!gBoard[i][j].minesAroundCount) cell = ''
    }
    location.innerHTML = cell
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function findEmptyPos(mat) {
    var emptyPos = []
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            if (!mat[i][j].isMine)
                emptyPos.push({ i: i, j: j })
        }
    } return emptyPos
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getNegs(board, rowIdx, colIdx) {
    var negs = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (gBoard[i][j].isMarked) continue
            if (gBoard[i][j].isShown) continue
            var currCell = board[i][j]
            if (currCell) negs.push({ i, j })
        }
    }
    return negs
}

function getCellCoord(strCellId) {
    var coord = {}
    var parts = strCellId.split('-')

    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord;
}