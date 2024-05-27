/**
 * This script reads the confusablesSummaryRev03.txt file and creates a confusables.js file that contains the confusables in a format that can be used by the confusables.js module.
 */

const path = require("path");
const fs = require("fs");
const https = require("https");
const {
  normalizeMarks,
  normalizeCase,
  normalizeWhitespace,
  normalizeByDictionary,
} = require("../index");

/**
 * Escape any non-printable character, marks, backslashes and double quotes, as preparation for js output
 * @param {*} string
 * @returns
 */
function escape(string) {
  return string
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\p{Zl}|\p{Zp}|\p{C}|\p{M}/gu, (c) => {
      return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
}

/**
 * Download the confusablesSummary.txt file from the unicode.org website
 */
function downloadConfusablesSummary() {
  const url = new URL(
    "https://www.unicode.org/Public/security/latest/confusablesSummary.txt"
  );
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += typeof chunk === "string" ? chunk : chunk.toString("utf8");
      });
      res.on("end", () => {
        resolve(data);
      });
      res.on("error", (err) => {
        reject(err);
      });
    });
  });
}

/**
 * Read the confusablesSummary.txt file and return a map of confusables
 * @param {*} data
 * @returns
 */
function readLines(data) {
  const lines = data.split("\n");
  const confusables = {};

  let to = "";
  lines.forEach((line) => {
    line = line.replace(/\s*#.*$/, "");
    let [sign, , unicode] = line.split(/(?![^(]*\))\t/);
    if (!unicode) return;
    if (sign === "#") return;
    // Replace hex numbers with actual characters
    unicodeList = unicode.split(" ");
    unicode = unicodeList
      .map((hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      })
      .join("");
    let prenormalized = normalizeWhitespace(normalizeMarks(unicode));

    if (sign === "") {
      to = normalizeCase(prenormalized);
    } else if (sign === "←") {
      // If the prenormalized string is different from the unicode string, it means that other parts supernormalize will already have taken care of this
      if (unicode !== prenormalized) return;
      // Don't map anything to itself or to / from empty strings (they can become empty during prenormalization)
      if (to === prenormalized) return;
      if (prenormalized === "") return;
      if (to === "") return;
      // We don't have to treat case separately, as it will be done by other parts of supernormalize
      confusables[normalizeCase(prenormalized)] = to;
    }
  });
  return confusables;
}

/**
 * Compare function for sorting by length, then by length of the buffer, then by localeCompare.
 * Returns results from longest to shortest.
 * @param {*} a
 * @param {*} b
 * @returns
 */
function compareLengthFn(a, b) {
  let c = b[0].length - a[0].length;
  if (c !== 0) return c;
  c = Buffer.from(b[0]).length - Buffer.from(a[0]).length;
  if (c !== 0) return c;
  return a[1].localeCompare(b[1]);
}

(async () => {
  const data = await downloadConfusablesSummary();
  const confusables = readLines(data);

  let pairs = Object.entries(confusables);
  let hadChanges = true;
  while (hadChanges) {
    hadChanges = false;

    // Create sorted pairs in order of replacements
    pairs = pairs.sort(compareLengthFn);

    // Replace homoglyphs in "to" - "chains" baked into the generated map
    let homoglyphMap = pairs.reduce((acc, [key, value]) => {
      acc.push([key, value]);
      return acc;
    }, []);
    for (let i = 0; i < pairs.length; i++) {
      let homoglyph = normalizeByDictionary(pairs[i][1], homoglyphMap);
      if (homoglyph !== pairs[i][1]) {
        pairs[i][1] = homoglyph;
        confusables[pairs[i][0]] = homoglyph;
        hadChanges = true;
      }
    }
  }

  // Remove pairs that can be created from other pairs
  for (let i = 0; i < pairs.length; i++) {
    let homoglyph = normalizeByDictionary(pairs[i][0], [
      ...pairs.slice(0, i),
      ...pairs.slice(i + 1),
    ]);
    if (homoglyph === pairs[i][1]) {
      delete confusables[pairs[i][0]];
      pairs = pairs.filter((pair) => pair[0] !== pairs[i][0]);
    }
  }

  // Create runs
  let runs = [];
  let run = [];
  for (let i = 0; i < pairs.length; i++) {
    if (run.length === 0) {
      run.push(pairs[i][1], pairs[i][0]);
    } else if (run[0] === pairs[i][1]) {
      run.push(pairs[i][0]);
    } else {
      runs.push(run);
      run = [pairs[i][1], pairs[i][0]];
    }
  }
  runs.push(run);

  // Write out the confusables.js file
  const string = runs.map((run) => run.join("#")).join("§");

  fs.writeFileSync(
    path.join(__dirname, "../confusables.js"),
    `module.exports = "${escape(string)}";`
  );

  // Test the generated file
  const confusablesTestString = require("../confusables.js");
  let confusablesTest = [];
  let split1 = confusablesTestString.split("§");
  for (let i = 0; i < split1.length; i++) {
    let split2 = split1[i].split("#");
    for (let j = 1; j < split2.length; j += 2) {
      confusablesTest.push([split2[j], split2[0]]);
    }
  }
  for (const [key, value] of confusablesTest) {
    if (typeof confusables[key] === "undefined") {
      console.error(`Error: ${key} is not in confusables`);
      continue;
    }
    if (confusables[key] !== value) {
      console.error(
        `Error: ${value} !== ${escape(confusables[key])} for ${key}`
      );
      continue;
    }
  }
})();
