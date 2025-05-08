const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let cards = [...emojis, ...emojis];
let flippedCards = [];
let matchedPairs = 0;

function initializeGame() {
    cards = shuffleArray([...emojis, ...emojis]);
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = '';
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.value = emoji;
        card.addEventListener('click', flipCard);
        gameContainer.appendChild(card);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        this.textContent = this.dataset.value;
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.value === card2.dataset.value) {
        matchedPairs++;
        flippedCards = [];
        
        if (matchedPairs === emojis.length) {
            setTimeout(() => alert('تبریک! شما برنده شدید!'), 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
        }, 1000);
    }
}

function resetGame() {
    flippedCards = [];
    matchedPairs = 0;
    initializeGame();
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

initializeGame();