/* Автор - Пряхин Игорь  ::  BART96  ::  Author - Prjakhin Igor */
/* Уважайте чужой труд.  ::  Respect other peoples work. */

'use strict';

const style = require('bart96-style');
const regEx = require('./regEx.js')(style);


function styleCli(strings, ...values) {
  // >>> Сборка строки, полученной через styleCli(...) или styleCli`...` <<<
  let str = typeof strings == 'string' ? strings
    : (strings.raw ? strings.raw : strings).reduce((output, item, index) => output += item + (values[index] || ''), '');


  // >>> Проверка на наличие фигурных скобок без экранизаци <<<
  let countOpen = str.match(regEx.countOpen).length;
  let countClose = str.match(regEx.countClose).length;

  if (countOpen != countClose) throw new Error(`Ошибка в \x1b[1mрасстановке\x1b[21m фигурных скобок: { (${countOpen}) ${countOpen > countClose ? '>' : '<'} (${countClose}) }. Используйте \\{ и \\} для экранизации лишних скобок.`);


  // >>> Обертка при использовании цветных функций <<<
  for(let key in style) {
    Object.defineProperty(styleCli, key, {
      value: str => `\x1b[${style[key][0]}m${str}\x1b[${style[key][1]}m`
    });
  }


  // >>> Обертка при использовании главной функции или шаблонных строк <<<
  let collector = [];

  str = str.replace(regEx.main, (match, color, text, finish, end) => {
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



// >>> Проверка получившейся строки <<<
const lastCheck = str => {
  let newstr = '';
  let colors = [];

  function checkChar(i=0, add=false) {
    if (i >= str.length) return;

    let cMatch = str.slice(i).match(regEx.check);
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
