function Checkers (size, rows) {
    this.size = 8;
    this.rows = 3;

    this.winner = null;
    this.state = 'waiting';

    this.pieces = { 1: [], 2: [] };

    this.board = new Array(this.size);
    for (var i = 0; i < this.size; i++) {
        this.board[i] = [];
    }
}

Checkers.prototype.addPlayer = function (player) {
    if (this.player1 && this.player2) {
        return false;
    }

    if (!this.player1) {
        player.number = 1;
        this.player1 = player;
    } else if (!this.player2) {
        player.number = 2;
        this.player2 = player;
    }

    if (this.player1 && this.player2 && this.state === 'waiting') {
        this.start();
    }

    return true;
};

Checkers.prototype.removePlayer = function (player) {
    if (this.player1 === player) {
        this.player1 = null;
        return true;
    } else if (this.player2 === player) {
        this.player2 = null;
        return true;
    } else {
        return false;
    }
};

Checkers.prototype.start = function () {
    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.rows; j++) {
            var evenCol = i % 2 == 0;
            var evenRow = j % 2 == 0;

            if (evenCol && evenRow || !evenCol && !evenRow) {
                this.addPiece(new Piece(i, j, 1, this));
            } else {
                this.addPiece(new Piece(i, this.size - (j + 1), 2, this));
            }
        }
    }

    this.turn = this.player1;
    this.state = 'active';
    console.log('Checkers started');
};

Checkers.prototype.move = function (pieceCol, pieceRow, destCol, destRow) {
    console.log('a');
    if (this.player1 && this.player2) {
        console.log('b');
        var piece = this.board[pieceCol][pieceRow];
        if (piece && piece.player === this.turn.number) {
            console.log('c');
            var validMoves = piece.validMoves();
            console.log('valid moves', validMoves);
            console.log('attempting to jump to', this.board[destCol][destRow]);
            // Must jump if available!
            if (this.checkCanJump()) {
                console.log('d');
                if (this.validJump(piece, destCol, destRow)) {
                    console.log('g');
                    this.jumpPiece(piece, destCol, destRow);
                    if (!piece.validMoves().jumps.length) {
                        this.switchPlayer();
                    }
                }
            } else if (validMoves.moves.length) {
                console.log('e');
                if (this.validMove(piece, destCol, destRow)) {
                    console.log('f');
                    this.movePiece(piece, destCol, destRow);
                    this.switchPlayer();
                }
            }

            if (this.checkLose()) {
                this.state = 'won';
                this.winner = this.player1 === this.turn ? this.player2 : this.player1;
                this.loser = this.turn;
            }
        }
    }
};

// If the player can't make any moves, they lose
Checkers.prototype.checkLose = function () {
    var pieces = this.pieces[this.turn.number];

    for (var i = 0; i < pieces.length; i++) {
        var moves = pieces[i].validMoves();
        if (moves.moves.length || moves.jumps.length) {
            return false;
        }
    }

    return true;
};

Checkers.prototype.switchPlayer = function () {
    this.turn = this.turn === this.player1 ? this.player2 : this.player1;
};

Checkers.prototype.getState = function () {
  return {
      state: this.state,
      winner: this.winner,
      turn: this.turn,
      board: this.board.map(function (col) {
          return col.map(function (piece) { return piece ? { player: piece.player, king: piece.king } : {} });
      }),
      size: this.size,
      rows: this.rows
  };
};

Checkers.prototype.addPiece = function (piece) {
    this.board[piece.column][piece.row] = piece;
    this.pieces[piece.player].push(piece);
};

Checkers.prototype.removePiece = function (piece) {
    this.board[piece.column][piece.row] = null;
    var index = this.pieces[piece.player].indexOf(piece);

    if (index !== -1) {
        this.pieces[piece.player].splice(index, 1);
    }
};

Checkers.prototype.checkCanJump = function () {
    var pieces = this.pieces[this.turn.number];
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].validMoves().jumps.length) {
            console.log('jumps available:',pieces[i].validMoves().jumps);
            return true;
        }
    }

    return false;
};

Checkers.prototype.validMove = function (piece, destCol, destRow) {
    var moves = piece.validMoves().moves;
    console.log('valid moves', moves);
    console.log('attempt:', destCol, destRow);

    for (var i = 0; i < moves.length; i++) {
        if (moves[i][0] === destCol &&
            moves[i][1] === destRow)
            return true;
    }

    return false;
};

Checkers.prototype.validJump = function (piece, destCol, destRow) {
    var jumps = piece.validMoves().jumps;

    console.log('valid jumps', jumps);
    console.log('attempt:', destCol, destRow);


    for (var i = 0; i < jumps.length; i++) {
        if (jumps[i][0] === destCol &&
            jumps[i][1] === destRow)
            return true;
    }

    return false;
};

Checkers.prototype.movePiece = function (piece, destCol, destRow) {
    this.board[piece.column][piece.row] = null;
    piece.column = destCol;
    piece.row = destRow;
    this.board[piece.column][piece.row] = piece;

    if (destRow === 0 || destRow === (this.size - 1))
        piece.king = true;
};

Checkers.prototype.jumpPiece = function (piece, destCol, destRow) {
    var jumpedCol = (piece.column + destCol) / 2;
    var jumpedRow = (piece.row + destRow) / 2;
    console.log('jumped', jumpedCol, jumpedRow);
    this.removePiece(this.board[jumpedCol][jumpedRow]);

    this.movePiece(piece, destCol, destRow);
};

function Piece (column, row, player, game) {
    this.column = column;
    this.row = row;
    this.player = player;
    this.game = game;
    this.king = false;
}

Piece.prototype.validMoves = function () {
    var piece = this;
    var moves = [];
    var jumps = [];

    [1, -1].forEach(function (northSouth) {
        if (piece.player === 1 && northSouth === 1 ||
            piece.player === 2 && northSouth === -1 ||
            piece.king) {
            [1, -1].forEach(function (eastWest) {
                var destCol = piece.column + eastWest;
                var destRow = piece.row + northSouth;

                if (destCol < piece.game.size && destCol >= 0 &&
                    destRow < piece.game.size && destRow >= 0) {
                    if (!piece.game.board[destCol][destRow]) {

                        moves.push([destCol, destRow])

                    } else if (piece.game.board[destCol][destRow] &&
                        piece.game.board[destCol][destRow].player !== piece.player) {

                        var newDestCol = piece.column + (eastWest * 2);
                        var newDestRow = piece.row + (northSouth * 2);

                        if (newDestCol < piece.game.size && newDestCol >= 0 &&
                            newDestRow < piece.game.size && newDestRow >= 0 &&
                            !piece.game.board[newDestCol][newDestRow]) {

                            jumps.push([newDestCol, newDestRow])
                        }
                    }
                }
            });
        }
    });

    return { jumps: jumps, moves: moves };
};

module.exports = Checkers;
