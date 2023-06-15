# eco.json

## Encyplopedia of Chess Openings (ECO) data.

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


### Acknowledgements

Thanks to [@niklasf](https://github.com/niklasf) for [eco](https://github.com/niklasf/eco).

Credit goes to Shane Hudson for the original SCID opening data

Original eco.json data was compiled by Ömür Yanıkoğlu.