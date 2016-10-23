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
                this.addPiece(new Piece(i, col.length - (j + 1), 2, this));
            }
        }
    }

    this.turn = this.player1;
    this.state = 'active';
    console.log('Checkers started');
};

Checkers.prototype.move = function (pieceCol, pieceRow, destCol, destRow) {
    if (this.player1 && this.player2) {
        var piece = this.board[pieceCol][pieceRow];
        if (piece && piece.player === this.turn) {
            var validMoves = piece.validMoves();
            // Must jump if available!
            if (validMoves.jumps.length) {
                if (this.validJump(piece, destCol, destRow)) {
                    this.jumpPiece(piece, destCol, destRow);
                    if (!piece.validMoves().jumps.length) {
                        this.switchPlayer();
                    }
                }
            } else if (validMoves.moves.length) {
                if (this.validMove(piece, destCol, destRow)) {
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
      board: this.board,
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

Checkers.prototype.validMove = function (piece, destCol, destRow) {
    var moves = piece.validMoves().moves;

    for (var i = 0; i < moves.length; i++) {
        if (moves[0] === destCol &&
            moves[1] === destRow)
            return true;
    }

    return false;
};

Checkers.prototype.validJump = function (piece, destCol, destRow) {
    var jumps = piece.validMoves().jumps;

    for (var i = 0; i < moves.length; i++) {
        if (jumps[0] === destCol &&
            jumps[1] === destRow)
            return true;
    }

    return false;
};

Checkers.prototype.movePiece = function (piece, destCol, destRow) {
    this.board[piece.column][piece.row] = null;
    piece.column = destCol;
    piece.row = destRow;
    this.board[piece.column][piece.row] = piece;
    piece.validMovesCache = null;
};

Checkers.prototype.jumpPiece = function (piece, destCol, destRow) {
    this.board[piece.column][piece.row] = null;
    var jumpedCol = piece.column + destCol / 2;
    var jumpedRow = piece.row + destRow / 2;
    piece.column = destCol;
    piece.row = destRow;
    this.board[piece.column][piece.row] = piece;
    piece.validMovesCache = null;

    this.removePiece(this.board[jumpedCol][jumpedRow]);
};

function Piece (column, row, player, game) {
    this.column = column;
    this.row = row;
    this.player = player;
    this.game = game;
    this.king = false;
}

Piece.prototype.validMoves = function () {
    if (this.validMovesCache) {
        return this.validMovesCache;
    }

    var piece = this;
    var moves = [];
    var jumps = [];

    [1, -1].forEach(function (northSouth) {
        if (piece.player == 1 && northSouth == 1 ||
            piece.player == 2 && northSouth == -1 ||
            piece.king) {
            [1, -1].forEach(function (eastWest) {
                var destCol = piece.column + eastWest;
                var destRow = piece.row + northSouth;

                if (destCol < piece.game.size && destCol >= 0 &&
                    destRow < piece.game.size && destRow >= 0 &&
                    !piece.game.board[destCol][destRow]) {

                    moves.push([destCol, destRow])

                } else if (piece.game.board[destCol][destRow].player !== piece.player) {
                    destCol = piece.column + (eastWest * 2);
                    destRow = piece.row + (northSouth * 2);

                    if (destCol < piece.game.size && destCol >= 0 &&
                        destRow < piece.game.size && destRow >= 0 &&
                        !piece.game.board[destCol][destRow]) {

                        jumps.push([destCol, destRow])
                    }
                }
            });
        }
    });

    this.validMovesCache = { jumps: jumps, moves: moves };

    return this.validMovesCache;
};

module.exports = Checkers;
