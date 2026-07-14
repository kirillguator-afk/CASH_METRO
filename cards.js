const SUITS = [
    { name: 'hearts', symbol: '♥', color: 'red' },
    { name: 'diamonds', symbol: '♦', color: 'red' },
    { name: 'clubs', symbol: '♣', color: 'black' },
    { name: 'spades', symbol: '♠', color: 'black' }
];

const RANKS = [
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
    { name: '9', value: 9 },
    { name: '10', value: 10 },
    { name: 'J', value: 11 },
    { name: 'Q', value: 12 },
    { name: 'K', value: 13 },
    { name: 'A', value: 14 }
];

function createDeck() {
    let deck = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push({
                id: `${rank.name}-${suit.name}`,
                rank: rank.name,
                value: rank.value,
                suit: suit.symbol,
                suitName: suit.name,
                color: suit.color
            });
        }
    }
    return shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderCard(card, isHidden = false) {
    if (isHidden) {
        return `<div class="card card-back shadow-lg"></div>`;
    }
    return `
        <div class="card ${card.color} shadow-lg" data-card-id="${card.id}">
            <div class="text-lg font-bold leading-none">${card.rank}<br><small>${card.suit}</small></div>
            <div class="text-3xl self-center">${card.suit}</div>
            <div class="text-lg font-bold leading-none self-end transform rotate-180">${card.rank}<br><small>${card.suit}</small></div>
        </div>
    `;
}