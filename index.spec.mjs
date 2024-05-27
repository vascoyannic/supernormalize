import { expect } from "chai";
import * as uut from "./index.js";

describe("String Normalization Functions", () => {
  describe("normalizeCase", () => {
    it("should convert all characters to lowercase", () => {
      const result = uut.normalizeCase("HeLLo");
      expect(result).to.equal("hello");
    });
  });

  describe("normalizeMarks", () => {
    it("should remove diacritics from characters", () => {
      const result = uut.normalizeMarks("éèêëēėęễ");
      expect(result).to.equal("eeeeeeee");
    });

    it("should normalize glitchtext", () => {
      const result = uut.normalizeMarks("ẹ̷̖̮̀͆͂͝x̷̟͓̥͇̜̃͜a̵̪͒͛̑̆̈́̚ͅm̴̡̝̯̰͓̟͆͐p̶͚̯̟̾̃͒l̵̟̬͉̝͋̿ͅȅ̴͉͇");
      expect(result).to.equal("example");
    });

    it("performs compatibility decomposition", () => {
      const result = uut.normalizeMarks("ﬃ");
      expect(result).to.equal("ffi");
    });
  });

  describe("normalizeHomoglyphs", () => {
    it("should replace homoglyphs with their canonical form", () => {
      const result = uut.normalizeHomoglyphs("ꜱ⍴⍺ᴄ℮");
      expect(result).to.equal("space");
    });
  });

  describe("normalizeWhitespace", () => {
    it("should replace runs of whitespace with a single space", () => {
      const result = uut.normalizeWhitespace("   a    b   c  ");
      expect(result).to.equal("a b c");
    });
  });

  describe("supernormalize", () => {
    it("should call all normalization functions", () => {
      const input = "  HeLLo  éèêëēėę ꜱ⍴⍺ᴄ℮ ﬃ ";
      const result = uut.supernormalize(input);
      expect(result).to.equal("he110 eeeeeee space ff1");
    });

    it("should pass regression tests", () => {
      const data = [
        { input: "⋿╳⍺rñ⍴lé", output: "examp1e" },
        { input: "𝕋𝕙𝕚𝕤 𝕚𝕤 𝕒 𝕥𝕖𝕤𝕥!", output: "th1s 1s a test!" },
        { input: "D̴̝̼̅i̴̱̐͊́a̵̢͎͒͝ĉ̵͓̈́̽r̶͂͝ͅi̷͔͜͝ṭ̴͋͆͘i̵͔̅c̷̛͉̪͂͊s̵̞̝̲͊", output: "d1acr1t1cs" },
        { input: "AАΑ", output: "aaa" },
        { input: "rn", output: "m" },
        { input: "ﬃ…", output: "ff1..." },
        { input: " \t   HELLO  WORLD \n  ", output: "he110 w0r1d" },
      ];
      data.forEach(({ input, output }) => {
        const result = uut.supernormalize(input);
        expect(result).to.equal(output);
      });
    });
  });
});
