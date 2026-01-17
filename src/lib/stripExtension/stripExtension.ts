export const stripExtension = (fileName: string): string => {
  return fileName
    .replace(/\.[a-zA-Z0-9]+$/, "") // only strip known extensions
    .replace(/\s+/g, ""); // remove spaces
};