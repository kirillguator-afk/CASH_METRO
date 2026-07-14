const AppState = {
    balance: parseInt(localStorage.getItem('metro_cash_balance')) || 1000,
    peer: null,
    conn: null,
    isHost: false,
    bet: 0,
    
    updateBalance(amount) {
        this.balance += amount;
        localStorage.setItem('metro_cash_balance', this.balance);
        document.getElementById('user-balance').innerText = `${this.balance.toLocaleString()} ₽`;
    }
};

// Инициализация UI баланса
document.getElementById('user-balance').innerText = `${AppState.balance.toLocaleString()} ₽`;