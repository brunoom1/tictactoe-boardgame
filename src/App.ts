import { Client } from "boardgame.io/client";
import { State } from "boardgame.io";

import { SocketIO } from "boardgame.io/multiplayer";

import { _ClientImpl } from "boardgame.io/dist/types/src/client/client";
import { TicTacToe, State as DefaultState } from "./Game";

interface TicTacToeClientConfigInterface {
    boardSize?: number;
}

const defaultConfig: TicTacToeClientConfigInterface = {
    boardSize: 9
};

class TicTacToeClient {
    
    client: _ClientImpl;
    rootElement: HTMLElement;
    boardSize: number;

    constructor (rootElement: HTMLElement, config: TicTacToeClientConfigInterface = defaultConfig, { playerID } = {}) {
        this.rootElement = rootElement;        
        
        if (!boardSizeIsValid(config.boardSize)) {
            throw new Error("Invalid board size, define square number");
        }
        this.boardSize = config.boardSize;

        this.client = Client({ 
            game: TicTacToe({ boardSize: this.boardSize }),
            playerID,
            multiplayer: SocketIO({
                server: "localhost:4142"
            })
        });
        this.client.subscribe(state => this.update(state));

        this.createBoard();
        this.attachListeners();

        this.client.start();
    }

    createBoard () {
        const raiz = Math.sqrt(this.boardSize);

        const rows = [];
        for(let i = 0; i < raiz; i++) {
            const cells = [];
            for(let j = 0; j < raiz; j++) {
                const cell_id = raiz * i + j;
                cells.push(`<div data-id="${cell_id}" class="cell"></div>`);
            }
            rows.push(`<div class="row">${cells.join('')}</div>`);
        }

        this.rootElement.innerHTML = `
            <div id="board">
                ${rows.join('')}
            </div>
            <p class="winner"><p>
        `;
    }

    attachListeners () {

        const handleClick = (event) => {
            const id = parseInt(event.target.dataset.id);
            this.client.moves.clickCell(id);
        };

        const cells = this.rootElement.querySelectorAll('.cell');

        cells.forEach(cell => {
            cell.addEventListener('click', handleClick);
        });
    }

    update(s: State<DefaultState>) {

        if (s === null) {
            return;
        }

        const cells = this.rootElement.querySelectorAll('.cell');

        cells.forEach(cell => {
          const cellId = parseInt(cell.dataset.id);

          const cellValue = s.G.cells[cellId];
          cell.textContent = cellValue !== null ? (cellValue == '0'? 'X': "0") : '';
        });

        console.log(this.client.playerID);

        const messageEl = this.rootElement.querySelector('.winner');

        if (s.ctx.gameover) {
          messageEl.textContent =
            s.ctx.gameover.winner !== undefined
              ? 'Winner: ' + s.ctx.gameover.winner
              : 'Draw!';
        } else {
          messageEl.textContent = '';
        }
      }    
}

const getCellsHtmlElements = () => {}

const boardSizeIsValid = (size: number) => {
    return size > 0 && Math.sqrt(size) % 1 === 0;
}

let ids = 0;

const app = new TicTacToeClient(document.getElementById("app"), defaultConfig, {
    playerID: (parseInt(Math.random() * 3)).toString()
});

