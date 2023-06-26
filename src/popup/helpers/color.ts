import chroma from "chroma-js";

function isColorDark(color: string) {
  const contrast = chroma.valid(color) ? chroma.contrast(color, "black") : 0;
  return contrast < 4.5;
}

export { isColorDark };
