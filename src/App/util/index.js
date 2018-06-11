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

export const pascalCase = (input) => {
  const name = input.replace(/-/g, '')
  return name[0].toLocaleUpperCase() + name.substr(1,name.length)
}