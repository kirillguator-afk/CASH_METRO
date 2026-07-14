function initNetwork() {
    const peer = new Peer('METRO-' + Math.random().toString(36).substr(2, 5), {
        debug: 2
    });

    peer.on('open', (id) => {
        AppState.peer = peer;
        document.getElementById('my-peer-id').innerText = id;
    });

    peer.on('connection', (conn) => {
        if (AppState.conn) return; // Один игрок за раз
        AppState.conn = conn;
        AppState.isHost = true;
        setupConnection();
    });

    return peer;
}

function setupConnection() {
    AppState.conn.on('open', () => {
        document.getElementById('lobby-overlay').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        if (AppState.isHost) {
            startGameAsHost();
        }
    });

    AppState.conn.on('data', (data) => {
        handleIncomingData(data);
    });
    
    AppState.conn.on('close', () => {
        alert("Противник покинул игру");
        location.reload();
    });
}

function handleIncomingData(data) {
    console.log("Received:", data.type, data);
    switch(data.type) {
        case 'GAME_INIT':
            Game.initFromHost(data);
            break;
        case 'MOVE_ATTACK':
            Game.receiveAttack(data.card);
            break;
        case 'MOVE_DEFEND':
            Game.receiveDefense(data.card, data.onCardId);
            break;
        case 'MOVE_TAKE':
            Game.receiveTake();
            break;
        case 'MOVE_PASS':
            Game.receivePass();
            break;
    }
}

function sendData(type, payload = {}) {
    if (AppState.conn && AppState.conn.open) {
        AppState.conn.send({ type, ...payload });
    }
}

initNetwork();

document.getElementById('create-game').onclick = () => {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (AppState.balance < bet) return alert("Недостаточно средств");
    AppState.bet = bet;
    alert("Ожидание игрока... Сообщите ваш ID другу");
};

document.getElementById('join-game').onclick = () => {
    const targetId = document.getElementById('join-room-id').value;
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (AppState.balance < bet) return alert("Недостаточно средств");
    
    if (!targetId) return alert("Введите ID");
    
    AppState.bet = bet;
    AppState.conn = AppState.peer.connect(targetId);
    AppState.isHost = false;
    setupConnection();
};