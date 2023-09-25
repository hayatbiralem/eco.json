# eco.json

## Encyclopedia of Chess Openings (ECO) data.

This data is a collation of several chess opening databases, identified as follows:
* <span style='color:green'>__eco_tsv__</span>: Source: [eco](https://github.com/niklasf/eco). This is the authoritive database, which [supplants](https://www.google.com/search?q=supplants) conflicts with the databases listed below (such as move order or ECO code).
* <span style='color:green'>__eco_js__</span>: The original eco.json data from several years ago, which contains some openings not in __eco_tsv__
* <span style='color:green'>__scid__</span>: An database that's part of a [sourceforge project](https://scid.sourceforge.net/), pulled via Waterford Chess Club's [website](https://watfordchessclub.org/images/downloads/scid.eco). SCID codes extend ECO, and opening names vary.

### Example JSON
```
  {
    "fen": "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq",
    "src": "eco_tsv",
    "eco": "B03",
    "moves": "1. e4 Nf6 2. e5 Nd5 3. d4",
    "name": "Alekhine Defense",
    "aliases": {
      "eco_js": "Alekhine Defense, 2. e5 Nd5 3. d4",
      "scid": "Alekhine: 3.d4"
    },
    "scid": "B03a"
  }
  ```

<span style="color:red">__fen__</span>
>The Forsythe-Edwards Notation of the position on the board after all opening moves are played. FEN notations __*uniquely identify each opening*__.

<span style="color:red">__src__</span>
> Identifies the source of the opening data; normally this will be __eco_tsv__, but could be __eco_js__ or __scid__ if no __eco_tsv__ opening corresponds to the fen.

<span style="color:red">__eco__</span>
> The ECO code of the opening; multiple openings can share the same ECO (it is a category, not an identifier)

<span style="color:red">__moves__</span>
> The "standard" move sequence of the opening. Some openings can be arrived at by transposition, so opening moves are not identifiers.

<span style="color:red">__name__</span>
> The common English name of an opening. Origin of the name is determined by __src__, but there can be aliases from other sources

<span style="color:red">__aliases__</span>
> These are variations of what the opening is called. For example, the __Ruy Lopez__ opening is sometimes called the __Spanish Opening__, depending on source

<span style="color:red">__scid__</span>
> since SCID codes extend ECO codes, this will be included where applicable

# eco_interpolated
In __eco.json__ there are 1811 "orphan" variations. An orphan variation has no `from` field, indicating that there is no preceding _named_ variation. There are moves that precede the last move of the orphan variation (unless it's a first move, of course). Opening records can be created for these prededing move sequences, which fill in the gaps in the eco.json data structure.

Let's take a look at one case. [One of the opening books](https://github.com/lichess-org/chess-openings/blob/master/b.tsv) at [__eco_tsv__]((https://github.com/niklasf/eco)) contains these four variations of the Alekhine Defense:

![Alekhine](eco_tsv_alekhine.png)

There are two entries for the Brooklyn Variation of the Alekhine Defense on lines 132 and 133. However, there is no named variation for the move sequence __1. e4 Nf6 2. e5 Ng8 3. d4__. This makes the variation on line 133 "orphaned", in that it has no preceding named variation that leads to it.

## the eco_interpolated.json file
Every orphan variation (like the <span style = "color:blue">Alekhine Defense: Brooklyn Variation, Everglades Variation</span>) has a move sequence. By moving backwards from the end of the move sequence, we eventually wind up at a named variation, which is called the __root__ variation. Along the way, a record of each FEN position and remaining moves in the sequence is made. Then, from the root to the orphan, are created __interpolated__ opening objects that bridge the gap between root and orphan.

### naming the interpolated variations
Interpolated opening variations _may_ have a name, but just weren't found in our sources. This can be corrected over time, and freshly named interpolated openings can be inserted into the __eco.json__ file as they are discovered. In the meantime, the names assigned to interpolated openings are the root name plus `" (i)"`. There may be several of these, but openings names are not required to be unique (only FENs are).

For the example above, the interpolated opening object would be:

```js
{
  "rnbqkbnr/pppppppp/8/4P3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3": {
    "src": "interpolated",
    "eco": "B02",
    "moves": "1. e4 Nf6 2. e5 Ng8 3. d4",
    "name": "Alekhine Defense: Brooklyn Variation (i)",
    "scid": "B02l",
    "aliases": {
      "scid": "Alekhine: Brooklyn Defence (Retreat Variation)"
    }
  },
```
Note that __src__ is labeled "interpolated", meaning it wasn't derived directly from either of the originating three sources: __eco_tsv__, __eco_js__, or __scid__.

### additional interpolations
It is often desirable to have every move subsequence that appears within an opening to have an entry in the database as well. For example, the move sequence for the "Queen's Gambit Declined: Exchange Variation" is "1. d4 Nf6 2. c4 e6 3. Nc3 d5 4. cxd5"; however there is no opening book entry for the subsequence "1. d4 Nf6 2. c4 e6 3. Nc3 d5". This leaves a gap between "1. d4 Nf6 2. c4 e6 3. Nc3" ("Queen's Pawn: Neo-Indian") and the current variation. To fix this, an interpolation is created for the missing subsequence, "Queen's Pawn: Neo-Indian (i)".


### using interpolated openings
It's a simple matter to merge eco_interpolated.json with eco.json, once the two files are read into a program as JSON objects. In JavaScript, one way is:
```
const complete_openings = {...ecoJson, ...interpolatedJson}
```
(There are also other ways of doing this.)

# Acknowledgements

Thanks to [@niklasf](https://github.com/niklasf) for [eco](https://github.com/niklasf/eco).

Credit goes to Shane Hudson for the original SCID opening data

Original eco.json data was compiled by Ömür Yanıkoğlu.
