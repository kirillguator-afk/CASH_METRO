const Game = {
    deck: [],
    trump: null,
    playerHand: [],
    opponentHandCount: 0,
    table: [], // [{attack: card, defense: card|null}]
    myTurn: false,
    attacker: true,
    deckCount: 0,

    initAsHost() {
        this.deck = createDeck();
        this.trump = this.deck[0]; // Нижняя карта - козырь
        
        // Раздача
        const hostHand = this.deck.splice(-6);
        const clientHand = this.deck.splice(-6);
        
        this.playerHand = hostHand;
        this.opponentHandCount = 6;
        this.deckCount = this.deck.length;
        this.myTurn = true; // Хозяин ходит первым для простоты
        this.attacker = true;

        sendData('GAME_INIT', {
            deckCount: this.deckCount,
            trump: this.trump,
            hand: clientHand,
            isYourTurn: false,
            bet: AppState.bet
        });

        UI.updateAll();
        AppState.updateBalance(-AppState.bet);
    },

    initFromHost(data) {
        this.trump = data.trump;
        this.playerHand = data.hand;
        this.opponentHandCount = 6;
        this.deckCount = data.deckCount;
        this.myTurn = data.isYourTurn;
        this.attacker = !data.isYourTurn;
        AppState.bet = data.bet;
        
        UI.updateAll();
        AppState.updateBalance(-AppState.bet);
    },

    canAttack(card) {
        if (!this.myTurn || !this.attacker) return false;
        if (this.table.length === 0) return true;
        
        const cardsOnTable = this.table.flatMap(p => [p.attack, p.defense].filter(Boolean));
        return cardsOnTable.some(c => c.rank === card.rank);
    },

    canDefend(attackCard, defenseCard) {
        if (!this.myTurn || this.attacker) return false;
        
        // Обычный бой
        if (defenseCard.suitName === attackCard.suitName) {
            return defenseCard.value > attackCard.value;
        }
        
        // Бой козырем
        if (defenseCard.suitName === this.trump.suitName) {
            return attackCard.suitName !== this.trump.suitName || defenseCard.value > attackCard.value;
        }
        
        return false;
    },

    playCard(cardId) {
        const cardIndex = this.playerHand.findIndex(c => c.id === cardId);
        const card = this.playerHand[cardIndex];

        if (this.attacker) {
            if (this.canAttack(card)) {
                this.playerHand.splice(cardIndex, 1);
                this.table.push({ attack: card, defense: null });
                this.myTurn = false;
                sendData('MOVE_ATTACK', { card });
                UI.updateAll();
            }
        } else {
            // Защита
            const undefended = this.table.find(p => !p.defense);
            if (undefended && this.canDefend(undefended.attack, card)) {
                this.playerHand.splice(cardIndex, 1);
                undefended.defense = card;
                this.myTurn = false;
                sendData('MOVE_DEFEND', { card, onCardId: undefended.attack.id });
                UI.updateAll();
            }
        }
        this.checkWinCondition();
    },

    receiveAttack(card) {
        this.table.push({ attack: card, defense: null });
        this.opponentHandCount--;
        this.myTurn = true;
        UI.updateAll();
    },

    receiveDefense(card, onCardId) {
        const pair = this.table.find(p => p.attack.id === onCardId);
        if (pair) pair.defense = card;
        this.opponentHandCount--;
        this.myTurn = true;
        UI.updateAll();
    },

    takeCards() {
        const cardsToTake = this.table.flatMap(p => [p.attack, p.defense].filter(Boolean));
        this.playerHand.push(...cardsToTake);
        this.table = [];
        this.myTurn = false;
        sendData('MOVE_TAKE');
        this.drawPhase();
    },

    receiveTake() {
        this.opponentHandCount += this.table.flatMap(p => [p.attack, p.defense].filter(Boolean)).length;
        this.table = [];
        this.myTurn = true;
        this.drawPhase();
    },

    passTurn() {
        this.table = [];
        this.attacker = !this.attacker;
        this.myTurn = !this.attacker;
        sendData('MOVE_PASS');
        this.drawPhase();
    },

    receivePass() {
        this.table = [];
        this.attacker = !this.attacker;
        this.myTurn = this.attacker;
        this.drawPhase();
    },

    drawPhase() {
        // Упрощенная доборка (только если хост управляет колодой в реальной игре, 
        // тут для примера каждый может брать из своей "копии", но в идеале хост шлет остатки)
        // В рамках P2P демо ограничимся 1 раундом или имитацией
        UI.updateAll();
    },

    checkWinCondition() {
        if (this.playerHand.length === 0 && this.deckCount === 0) {
            UI.showGameOver(true);
        }
    }
};

function startGameAsHost() {
    Game.initAsHost();
}