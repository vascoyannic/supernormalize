declare function normalizeCase(string: string): string;

declare function normalizeMarks(string: string): string;

declare function normalizeByDictionary(
  string: string,
  dictionary: [string, string][]
): string;

declare function normalizeHomoglyphs(string: string): string;

declare function normalizeWhitespace(string: string): string;

declare function supernormalize(string: string): string;

declare module "supernormalize" {
  export = {
    normalizeCase,
    normalizeMarks,
    normalizeByDictionary,
    normalizeHomoglyphs,
    normalizeWhitespace,
    supernormalize,
  };
}
