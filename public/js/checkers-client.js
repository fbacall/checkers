var socket;
var id;

function drawBoard (element, size) {
    for (let col = 0; col < size; col++) {
        var html = '<div class="column">';
        for (let row = 0; row < size; row++) {
            html += '<div class="cell"></div>';
        }
        element.append(html + '</div>');
    }
}

function drawGame (board, element) {
    element.find('.cell').removeClass('player-1 player-2 king');
    for (let col = 0; col < board.length; col++) {
        for (let row = 0; row < board[col].length; row++) {
            if (board[col][row]) {
                var el = element.find(`.column:eq(${col}) .cell:eq(${row})`);
                el.addClass(`player-${board[col][row].player}`);
                if (board[col][row].king) {
                    el.addClass(`king`);
                }
            }
        }
    }
}

function playerName (player) {
    return '<span class="player-name'+(player.number ? ` player-${player.number}` : '') +'">' + player.name + '</span>';
}

function scrollChat () {
    var e = $('#chat');
    e.scrollTop(e[0].scrollHeight);
}

function connect () {
    var name = $('#name-input').val();

    socket = io.connect('', {query: 'name=' + name + '&id=' + id});

    socket.on('player-number', function (number) {
        player = number;
        $('#player').text(`You are player ${number}`).addClass(`player-${number}`)
    });

    socket.on('chat-message', function (data) {
        $('<div class="chat-message">' + playerName(data.player) +
            ': <span class="message">' + data.message + '</span></div>').appendTo($('#chat'));
        scrollChat();
    });

    socket.on('chat-status', function (data) {
        $('#chat').append(
            '<div class="chat-status">' + playerName(data.player) + ' ' + data.message + '</div>');
        scrollChat();
    });

    socket.on('state', function (game) {
        console.log(game);
        if (!$('#board').children().length) {
            drawBoard($('#board'), game.size);
            $('#numToWin').text(game.toWin);
        }
        drawGame(game.board, $('#board'));
        if (game.state === 'won') {
            $('#status').html(`${playerName(game.winner)} wins!`);
        } else if (game.state === 'draw') {
            $('#status').html('Draw!');
        } else if (game.state === 'waiting') {
            $('#status').html('Waiting for opponent to join');
        } else if (game.state === 'active') {
            $('#status').html(`${playerName(game.turn)}'s turn`);
        }

        $('#chat-status').text(game.connected + ' users connected');
    });

    $('#name-modal').modal('hide');
}

var player;
var pieceCol;
var pieceRow;

$(document).ready(function () {
    var match = location.href.match(/\/game\/([a-z0-9]+)/);
    if (match) {
        id = match[1];
        $('#name-modal').modal('show');

        $('#connect').click(connect);
        $('#name-input').keyup(function (e) {
            if (e.keyCode == 13) {
                connect();
            }
        });

        $('#board').on('click','.cell', function () {
            var row = $(this).index();
            var col = $(this).parent('.column').index();
            $('.cell.selected').removeClass('selected');

            if ($(this).hasClass('player-' + player)) {
                pieceRow = row;
                pieceCol = col;
                $(this).addClass('selected');
            } else {
                socket.emit('move', pieceCol, pieceRow, col, row);
            }
        });

        $('#chat-input').keyup(function (e) {
            if (e.keyCode == 13) {
                socket.emit('chat-message', $(this).val());
                $(this).val('');
            }
        });
    }
});

