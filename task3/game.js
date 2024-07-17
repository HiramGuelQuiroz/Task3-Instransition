const crypto = require('crypto');
const readline = require('readline-sync');

// Class for HMAC and Keys
class Security {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex'); // 256 bits = 32 bytes
    }

    static generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

// class for rules
class Rules {
    constructor(moves) {
        this.moves = moves;
    }

    getResult(userMove, computerMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const half = Math.floor(this.moves.length / 2);

        if (userIndex === computerIndex) {
            return 'draw';
        } else if ((userIndex > computerIndex && userIndex - computerIndex <= half) ||
                   (computerIndex > userIndex && computerIndex - userIndex > half)) {
            return 'win';
        } else {
            return 'lose';
        }
    }
}

// Clase para generar y mostrar la tabla de ayuda
class HelpTable {
    constructor(moves) {
        this.moves = moves;
    }

    printTable() {
        const N = this.moves.length;
        const table = [];

        // Create header row
        const headerRow = ['v PC/User >'].concat(this.moves);
        table.push(headerRow);

        // Create each row
        for (let i = 0; i < N; i++) {
            const row = [this.moves[i]];
            for (let j = 0; j < N; j++) {
                if (i === j) {
                    row.push('Draw');
                } else {
                    const result = this.getResult(this.moves[i], this.moves[j]);
                    row.push(result.charAt(0).toUpperCase() + result.slice(1)); // Capitalize first letter
                }
            }
            table.push(row);
        }

        // Calculate column widths
        const colWidths = headerRow.map((col, i) => Math.max(...table.map(row => row[i].length), col.length));
        const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length * 3 + 1;

        // Print the top border
        console.log('+'.padEnd(totalWidth, '-') + '+');

        // Print the header row
        console.log('|' + headerRow.map((cell, i) => ' ' + cell.padEnd(colWidths[i], ' ') + ' ').join('|') + '|');
        console.log('+' + colWidths.map(width => ''.padEnd(width + 2, '-')).join('+') + '+');

        // Print each row
        for (let i = 1; i < table.length; i++) {
            console.log('|' + table[i].map((cell, j) => ' ' + cell.padEnd(colWidths[j], ' ') + ' ').join('|') + '|');
            console.log('+' + colWidths.map(width => ''.padEnd(width + 2, '-')).join('+') + '+');
        }
    }

    getResult(move1, move2) {
        const index1 = this.moves.indexOf(move1);
        const index2 = this.moves.indexOf(move2);
        const half = Math.floor(this.moves.length / 2);

        if (index1 === index2) {
            return 'draw';
        } else if ((index1 > index2 && index1 - index2 <= half) ||
                   (index2 > index1 && index2 - index1 > half)) {
            return 'win';
        } else {
            return 'lose';
        }
    }
}

// Clase principal del juego
class Game {
    constructor(moves) {
        if (moves.length < 3 || moves.length % 2 === 0) {
            throw new Error('Please enter an odd number of non-repeating moves (at least 3).');
        }

        if (new Set(moves).size !== moves.length) {
            throw new Error('All moves must be distinct. :(');
        }

        this.moves = moves;
        this.rules = new Rules(moves);
        this.key = Security.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        this.hmac = Security.generateHMAC(this.key, this.computerMove);
    }

    start() {
        console.log(`HMAC: ${this.hmac}`);
        while (true) {
            this.showMenu();

            const input = readline.question('Enter the number of your move: ');
            if (input === '0') {
                console.log('Exiting...');
                return;
            } else if (input === '?') {
                const helpTable = new HelpTable(this.moves);
                helpTable.printTable();
            } else if (this.isValidMove(input)) {
                const userMove = this.moves[parseInt(input) - 1];
                console.log(`Your move: ${userMove}`);
                console.log(`Computer move: ${this.computerMove}`);
                const result = this.rules.getResult(userMove, this.computerMove);
                console.log(`You ${result}!`);
                console.log(`HMAC key: ${this.key}`);
            } else {
                console.log('Invalid input. Please try again.');
            }
        }
    }

    isValidMove(input) {
        const num = parseInt(input);
        return !isNaN(num) && num >= 1 && num <= this.moves.length;
    }

    showMenu() {
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');
    }
}


const moves = process.argv.slice(2);

try {
    const game = new Game(moves);
    game.start();
} catch (error) {
    console.error(error.message);
    console.log('Example: node game.js rock paper scissors');
}

