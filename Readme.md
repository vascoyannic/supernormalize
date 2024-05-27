# supernormalize

`supernormalize` is a JavaScript library that agressively normalizes text to a standard form. Use cases include:

- Mitigating homoglyph attacks
- Normalizing text for comparison
- Preparation for indexing text in a search engine
- Preparation for blacklisting text

## Steps

The library performs the following steps:

1. Remove all marks (i.e. diacritics) and perform compatibility normalization
2. Convert the text to lowercase
3. Normalize homoglyphs using a mapping based on [this list](https://www.unicode.org/Public/security/latest/confusablesSummary.txt) from the Unicode Consortium in version 15.1.0 (the used list does not include homoglyphs that are already normalized in steps 1 and 2)
4. Replace all whitespace characters with a single space and trim the text

## Installation

```bash
npm install supernormalize
```

## Usage

```javascript
import { supernormalize } from "supernormalize";

const text = "⋿╳⍺rñ⍴lé";
const normalizedText = supernormalize(text);
console.log(normalizedText); // 'examp1e'
```

## Examples

| Input               | Output            | Note                                                                  |
| ------------------- | ----------------- | --------------------------------------------------------------------- |
| `⋿╳⍺rñ⍴lé`          | `examp1e`         | Below rules can be combined                                           |
| `𝕋𝕙𝕚𝕤 𝕚𝕤 𝕒 𝕥𝕖𝕤𝕥!`   | `th1s 1s a test!` | Homoglyphs are normalized to a common form                            |
| `D̴̝̼̅i̴̱̐͊́a̵̢͎͒͝ĉ̵͓̈́̽r̶͂͝ͅi̷͔͜͝ṭ̴͋͆͘i̵͔̅c̷̛͉̪͂͊s̵̞̝̲͊`        | `d1acr1t1cs`      | Diacritics are removed                                                |
| `AАΑ`               | `aaa`             | Latin, Cyrillic, and Greek characters are normalized to the same form |
| `rn`                | `m`               | Multiletter homoglyphs are normalized                                 |
| `ﬃ…`                | `ff1...`          | Ligatures are normalized to letters                                   |
| `\tHELLO  WORLD \n` | `he110 w0r1d`     | Whitespace and casing is normalized                                   |

## Functions

### `supernormalize(text: string): string`

Normalizes the given text performing the steps described above.

### `supernormalize.normalizeCase(text: string): string`

Converts the given text to lowercase.

### `supernormalize.normalizeMarks(text: string): string`

Removes all marks (i.e. diacritics) and performs compatibility normalization on the given text.

### `supernormalize.normalizeHomoglyphs(text: string): string`

Normalizes homoglyphs using a mapping based on [this list](https://www.unicode.org/Public/security/revision-03/confusablesSummary.txt) from the Unicode Consortium.

### `supernormalize.normalizeWhitespace(text: string): string`

Replaces all whitespace characters with a single space. Trim the text.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
