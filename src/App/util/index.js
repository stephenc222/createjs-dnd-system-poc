// util file. Relies on global createjs
const {
  Text
} = window.createjs

export const createText = (x, y, textVal) => {
  const text = new Text(textVal, "20px Arial", "#000");
  text.x = x;
  text.y = y
  text.textBaseline = "alphabetic";
  return text
}