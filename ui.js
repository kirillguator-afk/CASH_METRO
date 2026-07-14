const UI = {
    updateAll() {
        this.renderPlayerHand();
        this.renderOpponentHand();
        this.renderTable();
        this.renderDeck();
        this.updateStatus();
        
        document.getElementById('game-pot').innerText = `${(AppState.bet * 2).toLocaleString()} ₽`;
    },

    renderPlayerHand() {
        const container = document.getElementById('player-hand');
        container.innerHTML = Game.playerHand
            .map(card => renderCard(card))
            .join('');
        
        container.querySelectorAll('.card').forEach(cardEl => {
            cardEl.onclick = () => Game.playCard(cardEl.dataset.cardId);
        });
    },

    renderOpponentHand() {
        const container = document.getElementById('opponent-hand');
        container.innerHTML = '';
        for (let i = 0; i < Game.opponentHandCount; i++) {
            container.innerHTML += renderCard(null, true);
        }
        document.getElementById('opponent-cards-count').innerText = `Карт: ${Game.opponentHandCount}`;
    },

    renderTable() {
        const container = document.getElementById('table-surface');
        container.innerHTML = Game.table.map(pair => `
            <div class="table-pair">
                <div class="table-card-attack">${renderCard(pair.attack)}</div>
                ${pair.defense ? `<div class="table-card-defense">${renderCard(pair.defense)}</div>` : ''}
            </div>
        `).join('');
    },

    renderDeck() {
        const trumpContainer = document.getElementById('trump-card');
        if (Game.trump) {
            trumpContainer.innerHTML = renderCard(Game.trump);
        }
        document.getElementById('cards-left').innerText = Game.deckCount;
    },

    updateStatus() {
        const statusEl = document.getElementById('game-status');
        const takeBtn = document.getElementById('take-cards');
        const passBtn = document.getElementById('pass-turn');

        statusEl.classList.toggle('hidden', !Game.myTurn);
        
        if (Game.myTurn) {
            statusEl.innerText = Game.attacker ? "ВАШ ХОД" : "ЗАЩИЩАЙТЕСЬ";
            statusEl.className = "absolute top-0 px-6 py-2 bg-yellow-500 text-slate-950 rounded-full font-bold text-sm shadow-xl animate-bounce";
        }

        // Кнопки действий
        if (Game.myTurn && !Game.attacker) {
            takeBtn.classList.remove('hidden');
            passBtn.classList.add('hidden');
        } else if (Game.myTurn && Game.attacker && Game.table.length > 0 && Game.table.every(p => p.defense)) {
            passBtn.classList.remove('hidden');
            takeBtn.classList.add('hidden');
        } else {
            takeBtn.classList.add('hidden');
            passBtn.classList.add('hidden');
        }
    },

    showGameOver(isWin) {
        const modal = document.getElementById('game-over-modal');
        const status = document.getElementById('win-status');
        const amount = document.getElementById('win-amount');
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        if (isWin) {
            status.innerText = "ПОБЕДА!";
            status.className = "text-6xl font-black text-green-500 mb-4";
            amount.innerText = `+${AppState.bet * 2} ₽`;
            AppState.updateBalance(AppState.bet * 2);
        } else {
            status.innerText = "ПРОИГРЫШ";
            status.className = "text-6xl font-black text-red-500 mb-4";
            amount.innerText = `-${AppState.bet} ₽`;
        }
    }
};

document.getElementById('take-cards').onclick = () => Game.takeCards();
document.getElementById('pass-turn').onclick = () => Game.passTurn();