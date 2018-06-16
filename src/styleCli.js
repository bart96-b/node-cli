/* Автор - Пряхин Игорь  ::  BART96  ::  Author - Prjakhin Igor */
/* Уважайте чужой труд.  ::  Respect other peoples work. */

'use strict';

const style = require('bart96-style');


const regCheck = new RegExp(`(?:(?<!\\\\){((?:(?:${style.colors.join('|')})\\.?)+)(?<!\\.)\\s((?:(?:[^{](?!{|})|\\\\{|\\\\})+.)?))|((?<!\\\\)})|(.)$`, 'g');
const regLastCheck = new RegExp(`^(?:\x1b|\u001b|\u001B)\\[(${style.codes.join('|')})m`);


const styleCli = (strings, ...values) => {
  // if (!strings) return '';

  let str = '';

  switch (typeof strings) {
    case 'string': str = strings; break;
    case 'object_':
      for(let i = 0; i < strings.length; i++) {
        // str += (strings.raw ? strings.raw[i] : strings[i]) + (values[i] || '');
        str += strings[i] + (values[i] || '');
      }
    break;

    default:
      console.log(`В CommandLineInterface (CLI) передан тип "${typeof strings}", который не поддерживается.`);
      return strings;
  }


  /**
   *  @description Проверка на наличие фигурных скобок без экранизаци
  **/

  let countStart = str.match(/(?<!\\){(?!\s)/g).length;
  let CountEnd = str.match(/(?<![\s\\])}/g).length;

  if (countStart != CountEnd) throw new Error(`Ошибка в \x1b[1mрасстановке\x1b[21m фигурных скобок: { (${countStart}) ${countStart > CountEnd ? '>' : '<'} (${CountEnd}) }. Используйте \\{ и \\} для экранизации лишних скобок.`);


  /**
   *  @description Обертка при использовании главной функции или шаблонных строк
  **/

  let collector = [];

  str = str.replace(regCheck, (match, color, text, finish, end) => {
    let open = '';
    let close = '';

    if (color) {
      let keys = color.split('.');

      collector.push(keys);

      for(let i = 0; i < keys.length; i++) {
        open += `\x1b[${style[keys[i]][0]}m`;
      }
    }
    else if (finish) {
      if (collector.length > 0) {
        let keys = collector.pop().reverse();

        for(let i = 0; i < (keys || '').length; i++) {
          close += `\x1b[${style[keys[i]][1]}m`;
        }
      }


      if (collector.length > 0) {
        let keys = collector[collector.length - 1];

        for(let i = 0; i < (keys || '').length; i++) {
          close += `\x1b[${style[keys[i]][0]}m`;
        }
      }
    }
    else if (end) {
      for(let i = 0; i < collector.length; i++) {
        let keys = collector.pop().reverse();

        for(let j = 0; j < keys.length; j++) {
          close += `\x1b[${style[keys[j]][1]}m`;
        }
      }
    }

    return open + (text || '') + close;
  });

  return lastCheck(str);
}


/**
 *  @description Обертка при использовании цветных функций
**/

for(let key in style) {
  Object.defineProperty(styleCli, key, {
    value: str => `\x1b[${style[key][0]}m${str}\x1b[${style[key][1]}m`
  });
}


/**
 *  @description Проверка получившейся строки
**/

const lastCheck = str => {
  let newstr = '';
  let colors = [];

  function checkChar(i=0, add=false) {
    if (i >= str.length) return;

    let cMatch = str.slice(i).match(regLastCheck);
    if (cMatch) {
      i += cMatch[0].length;
      newstr += cMatch[0];

      let code = cMatch[1];

      switch (style.codeType(code)) {
        case 'open':
          colors.push(code);
          newstr += str.charAt(i);
          return checkChar(++i);
        break;

        case 'close':
          colors.pop();
          // newstr += str.charAt(i);
          return checkChar(i, true);
        break;
      }
    }
    else {
      if (add && colors.length > 0) newstr += style.code2style(colors.pop());
      newstr += str.charAt(i);
      return checkChar(++i);
    }
  };

  checkChar();

  return newstr + '\x1b[0m';
};



module.exports = styleCli;
