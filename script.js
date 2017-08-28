var currentRoom = "start";
var commands = ["go - Пойти в указанное управление", "talk - Поговорить с кем-либо или чем-либо", "take - Взять что-либо",
    "punch - Пиздануть что-либо", "look - Осмотреть что-либо", "inv - Открыть инвентарь"];
var inventory = ["sword", "cum"];

function changeRoom(dir) {
    if (rooms[currentRoom].directions[dir] !== undefined) {
        currentRoom = rooms[currentRoom].directions[dir];
        $('#game-text').append("<p>" + rooms[currentRoom].description + "</p>");
    } else {
        $('#game-text').append("<p>Ты не можешь туда пойти</p>");
    }
}

function showHelp() {
    $('#game-text').append("<p>Список команд:</p>");
    $('#game-text').append("<p><ul>");
    for(var i=0; i< commands.length; i++) {
        $('#game-text').append("<li>" + commands[i] + "</li>");
    }
    $('#game-text').append("</ul></p>");
}

function showInventory() {
    if(inventory.length !== 0) {
    $('#game-text').append("<p>Это твои вещи:</p>");
    $('#game-text').append("<p><ul>");
    for(var i=0; i< inventory.length; i++) {
        $('#game-text').append("<li>" + inventory[i] + "</li>");
    }
    $('#game-text').append("</ul></p>");
    } else {
        $('#game-text').append("<p>Твой инвентарь пуст...</p>");
        return;
    }
}

function playerInput(input) {
    var command = input.split(" ")[0];
    switch (command) {
        case "go":
            var dir = input.split(" ")[1];
            changeRoom(dir);
            break;
        case "help":
            showHelp();
            break;
        case "inv":
            showInventory();
            break;
        default:
            alert("Invalid move!");
            break;
    }
}

$(document).ready(function() {
    $('#game-text').append("<p>" + rooms.start.description + "</p>");
    $(document).keypress(function(key) {
        if(key.which === 13 && $('#user-input').is(':focus')) {
            var value = $('#user-input').val().toLowerCase();
            playerInput(value);
            $('#user-input').val("");
        }
    })
})