var homoglyphMap = null;

/**
 * Replaces upper case characters with lower case characters.
 * @param {*} string
 * @returns
 */
function normalizeCase(string) {
  return string.toLowerCase();
}

/**
 * Removes diacritics from a string.
 * @param {*} string
 * @returns
 */
function normalizeMarks(string) {
  return string.normalize("NFKD").replace(/\p{M}/gu, "").normalize("NFC");
}

/**
 *
 * @param {*} string
 * @param {*} dictionary
 * @returns
 */
function normalizeByDictionary(string, dictionary) {
  let result = "";
  let pos = 0;
  while (pos < string.length) {
    let found = false;
    for (let i = 0; i < dictionary.length; i++) {
      let homoglyph = dictionary[i][0];
      if (string.startsWith(homoglyph, pos)) {
        result += dictionary[i][1];
        pos += homoglyph.length;
        found = true;
        break;
      }
    }
    if (!found) {
      result += string[pos];
      pos++;
    }
  }
  return result;
}

/**
 * Replaces homoglyphs in a string with their canonical form.
 * @param {*} string
 * @returns
 */
function normalizeHomoglyphs(string) {
  if (!homoglyphMap) {
    const confusablesString = require("./confusables.js");
    homoglyphMap = [];
    let split1 = confusablesString.split("§");
    for (let i = 0; i < split1.length; i++) {
      let split2 = split1[i].split("#");
      for (let j = 1; j < split2.length; j++) {
        homoglyphMap.push([split2[j], split2[0]]);
      }
    }
  }

  return normalizeByDictionary(string, homoglyphMap);
}

/**
 * Replaces runs of whitespace with a single space.
 * @param {*} string
 * @returns
 */
function normalizeWhitespace(string) {
  return string.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes a string by removing diacritics and replacing homoglyphs.
 * @param {*} string
 * @returns
 */
function supernormalize(string) {
  return normalizeWhitespace(
    normalizeHomoglyphs(normalizeCase(normalizeMarks(string)))
  );
}

module.exports = {
  normalizeCase,
  normalizeMarks,
  normalizeByDictionary,
  normalizeHomoglyphs,
  normalizeWhitespace,
  supernormalize,
};
