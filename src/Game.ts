import { Ctx, Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

type Cell = Array<string>;

export interface State {
    cells: Cell;
}

const configDefault = {
    boardSize: 9
}

export const TicTacToe = ({
    boardSize
} = configDefault):Game => ({

    turn: {
        moveLimit: 1
    },

    setup: () => ({
        cells: Array(boardSize).fill(null)
    }),

    endIf: (G: State, ctx: Ctx) => {
        if (IsVictory(G.cells)) {
            return {
                winner: ctx.currentPlayer
            };
        } else if (IsDraw(G.cells)) {
            return {
                draw: true
            }
        }
    },

    moves: {
        clickCell: (G: State, ctx: Ctx, id: string) => {

            if (G.cells[parseInt(id)] !== null) {
                return INVALID_MOVE;
            }

            G.cells[parseInt(id)] = ctx.currentPlayer;
        }
    },

    ai: {
        enumerate: (G, ctx) => {{
            let moves = [];

            for (let i = 0; i < G.cells.length; i++) {
                if (G.cells[i] === null) {
                    moves.push({
                        move: 'clickCell',
                        args: [i]
                    });
                }
            }

            return moves;
        }}
    }
});

function IsVictory(cells: Cell) {
    
    const positions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
      [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
  
    const isRowComplete = (row: number[]) => {
      const symbols = row.map( (i:number) => cells[i]);
      return symbols.every( (i:string) => i !== null && i === symbols[0]);
    };
  
    return positions.map(isRowComplete).some(i => i === true);
  }
  
  // Return true if all `cells` are occupied.
  function IsDraw(cells: Cell) {
    return cells.filter(c => c === null).length === 0;
  }