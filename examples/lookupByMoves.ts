/**
 * Example usage of lookupByMoves with @chess-pgn/chess-pgn
 * 
 * This demonstrates how to find chess openings from move sequences
 * using the backward search algorithm.
 */

import { ChessPGN } from '@chess-pgn/chess-pgn';
import { openingBook, lookupByMoves, getPositionBook } from '@chess-openings/eco.json';

async function main() {
  // Load opening data
  const openings = await openingBook();
  const posBook = getPositionBook(openings);

  // Example 1: Exact opening match
  const chess1 = new ChessPGN();
  chess1.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5');
  
  const result1 = lookupByMoves(chess1, openings, { positionBook: posBook });
  console.log('Example 1 - Ruy Lopez:');
  console.log(`  Opening: ${result1.opening?.name}`);
  console.log(`  ECO: ${result1.opening?.eco}`);
  console.log(`  Moves back: ${result1.movesBack}`);
  console.log();

  // Example 2: Position beyond opening theory
  const chess2 = new ChessPGN();
  chess2.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5');
  
  const result2 = lookupByMoves(chess2, openings, { positionBook: posBook, maxMovesBack: 10 });
  console.log('Example 2 - Deep in Ruy Lopez:');
  console.log(`  Opening: ${result2.opening?.name}`);
  console.log(`  ECO: ${result2.opening?.eco}`);
  console.log(`  Moves back: ${result2.movesBack}`);
  console.log();

  // Example 3: Uncommon opening
  const chess3 = new ChessPGN();
  chess3.loadPgn('1. f4 e5 2. fxe5 d6 3. exd6 Bxd6');
  
  const result3 = lookupByMoves(chess3, openings, { positionBook: posBook });
  console.log('Example 3 - From Gambit:');
  console.log(`  Opening: ${result3.opening?.name}`);
  console.log(`  ECO: ${result3.opening?.eco}`);
  console.log(`  Moves back: ${result3.movesBack}`);
  console.log();

  // Example 4: Non-opening position
  const chess4 = new ChessPGN();
  chess4.loadPgn('1. a3 b6 2. b4 c5 3. c3 d5');
  
  const result4 = lookupByMoves(chess4, openings, { positionBook: posBook });
  console.log('Example 4 - Rare line:');
  console.log(`  Opening: ${result4.opening?.name || 'Not found'}`);
  console.log(`  Moves back: ${result4.movesBack}`);
}

main().catch(console.error);
