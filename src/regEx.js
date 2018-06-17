module.exports = style => regEx = {
  main: new RegExp(`(?:(?<!\\\\){((?:(?:${style.colors.join('|')})\\.?)+)(?<!\\.)\\s((?:(?:[^{](?!{|})|\\\\{|\\\\})+.)?))|((?<!\\\\)})|(.)$`, 'g'),
  check: new RegExp(`^(?:\x1b|\u001b|\u001B)\\[(${style.codes.join('|')})m`),
  countOpen: /(?<!\\){(?!\s)/g,
  countClose: /(?<![\s\\])}/g,
};
