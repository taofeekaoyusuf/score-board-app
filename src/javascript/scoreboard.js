let scoreH = 0
let scoreG = 0

let plusOne = 1
let plusTwo = 2
let plusThree = 3

// Home
document.getElementById("plusoneH").textContent = "+"+plusOne
document.getElementById("plustwoH").textContent = "+"+plusTwo
document.getElementById("plusthreeH").textContent = "+"+plusThree

// Guest
document.getElementById("plusoneG").textContent = "+"+plusOne
document.getElementById("plustwoG").textContent = "+"+plusTwo
document.getElementById("plusthreeG").textContent = "+"+plusThree

let homescore = document.getElementById("homescoreboard")
let guestscore = document.getElementById("guestscoreboard")

// Home
function addOneH() {
    scoreH += 1
    homescore.textContent = scoreH
}

function addTwoH() {
    scoreH += 2
    homescore.textContent = scoreH
}

function addThreeH() {
    scoreH += 3
    homescore.textContent = scoreH
}

// Guest
function addOneG() {
    scoreG += 1
    guestscore.textContent = scoreG
}

function addTwoG() {
    scoreG += 2
    guestscore.textContent = scoreG
}

function addThreeG() {
    scoreG += 3
    guestscore.textContent = scoreG
}

function resetScoreBoard() {
    scoreG = 0
    scoreH = 0
    homescore.textContent = 0
    guestscore.textContent = 0
}
