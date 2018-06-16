/* Автор - Пряхин Игорь  ::  BART96  ::  Author - Prjakhin Igor */
/* Уважайте чужой труд.  ::  Respect other peoples work. */

'use strict';

class Style {
	constructor() {
		this.colorsObj = this._createObjColors();
		this.codesObj = this._createObjCodes();

		this.colors = Object.keys(this.colorsObj);
		this.codes = Object.keys(this.codesObj);

		this.codeType = code => this.codesObj[code].type;
		this.code2color = code => this.codesObj[code].color;
		this.code2style = code => `\x1b[${code}m`;
		this.codeOpen2Close = code => this.codesObj[code].close;

		this._setColor();
	}


	_createObjColors() {
		return Object.assign({
			reset:      [0, 22],
			bold:       [1, 21],
			italic:     [3, 23],
			underline:  [4, 24],
			blink:      [5, 25],
			inverse:    [7, 27],
			invisible:  [8, 21],
			strike:     [9, 29],

		}, ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'].reduce((obj, color, index) => {
				obj[color] = [30 + index, 39];
				obj[color + 'Bright'] = [90 + index, 39];

				obj['bg' + color[0].toUpperCase() + color.slice(1)] = [40 + index, 49];
				obj['bg' + color[0].toUpperCase() + color.slice(1) + 'Bright'] = [100 + index, 49];

				return obj;
			}, Object.create(null))
		);
	}


	_createObjCodes() {
		let codesObj = {};

		for(let color in this.colorsObj) {
			let [open, close] = this.colorsObj[color];

			codesObj[open] = {'type':'open', 'color':color, 'close':close.toString()};
			codesObj[close] = {'type':'close', 'color':color};
		}

		return codesObj;
	}


	_setColor() {
		for(let color in this.colorsObj) this[color] = this.colorsObj[color];
	}

}



let style = new Style();
module.exports = style;
