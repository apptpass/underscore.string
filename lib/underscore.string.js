//  Underscore.string
//  (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
//  Underscore.string is freely distributable under the terms of the MIT license.
//  Documentation: https://github.com/epeli/underscore.string
//  Some code is borrowed from MooTools and Alexandru Marasteanu.
//  Version '2.4.0'

'use strict';

var makeString = require('./make_string');
var strRepeat = require('./str_repeat');
var sprintf = require('./sprintf');

// Defining helper functions.

var nativeTrim = String.prototype.trim;
var nativeTrimRight = String.prototype.trimRight;
var nativeTrimLeft = String.prototype.trimLeft;

var parseNumber = function(source) { return source * 1 || 0; };


var slice = [].slice;

var defaultToWhiteSpace = function(characters) {
  if (characters == null)
    return '\\s';
  else if (characters.source)
    return characters.source;
  else
    return '[' + _s.escapeRegExp(characters) + ']';
};

// Helper for toBoolean
function boolMatch(s, matchers) {
  var i, matcher, down = s.toLowerCase();
  matchers = [].concat(matchers);
  for (i = 0; i < matchers.length; i += 1) {
    matcher = matchers[i];
    if (!matcher) continue;
    if (matcher.test && matcher.test(s)) return true;
    if (matcher.toLowerCase() === down) return true;
  }
}

function toPositive(number) {
  return number < 0 ? 0 : (+number || 0);
}

var escapeChars = {
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: "'"
};

var reversedEscapeChars = {};
for(var key in escapeChars) reversedEscapeChars[escapeChars[key]] = key;
reversedEscapeChars["'"] = '#39';

// Defining underscore.string
var _s = {

  VERSION: '2.4.0',

  isBlank: function(str){
    return (/^\s*$/).test(makeString(str));
  },

  stripTags: function(str){
    return makeString(str).replace(/<\/?[^>]+>/g, '');
  },

  capitalize : function(str){
    str = makeString(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  decapitalize : function(str){
    str = makeString(str);
    return str.charAt(0).toLowerCase() + str.slice(1);
  },

  chop: function(str, step){
    if (str == null) return [];
    str = String(str);
    step = ~~step;
    return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
  },

  clean: function(str){
    return _s.strip(str).replace(/\s+/g, ' ');
  },

  count: function(str, substr){
    str = makeString(str);
    substr = makeString(substr);

    var count = 0,
      pos = 0,
      length = substr.length;

    while (true) {
      pos = str.indexOf(substr, pos);
      if (pos === -1) break;
      count++;
      pos += length;
    }

    return count;
  },

  chars: function(str) {
    return makeString(str).split('');
  },

  swapCase: function(str) {
    return makeString(str).replace(/\S/g, function(c){
      return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    });
  },

  escapeHTML: function(str) {
    return makeString(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
  },

  unescapeHTML: function(str) {
    return makeString(str).replace(/\&([^;]+);/g, function(entity, entityCode){
      var match;

      if (entityCode in escapeChars) {
        return escapeChars[entityCode];
      } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
        return String.fromCharCode(parseInt(match[1], 16));
      } else if (match = entityCode.match(/^#(\d+)$/)) {
        return String.fromCharCode(~~match[1]);
      } else {
        return entity;
      }
    });
  },

  escapeRegExp: function(str){
    return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  },

  splice: function(str, i, howmany, substr){
    var arr = _s.chars(str);
    arr.splice(~~i, ~~howmany, substr);
    return arr.join('');
  },

  insert: function(str, i, substr){
    return _s.splice(str, i, 0, substr);
  },

  include: function(str, needle){
    if (needle === '') return true;
    return makeString(str).indexOf(needle) !== -1;
  },

  join: function() {
    var args = slice.call(arguments),
      separator = args.shift();

    return args.join(makeString(separator));
  },

  lines: function(str) {
    if (str == null) return [];
    return String(str).split('\n');
  },

  reverse: function(str){
    return _s.chars(str).reverse().join('');
  },

  startsWith: function(str, starts, position){
    str = makeString(str);
    starts = '' + starts;
    position = position == null ? 0 : Math.min(toPositive(position), str.length);
    return str.lastIndexOf(starts) == position;
  },

  endsWith: function(str, ends, position){
    str = makeString(str);
    ends = '' + ends;
    if (typeof position == 'undefined') {
      position = str.length - ends.length;
    } else {
      position = Math.min(toPositive(position), str.length) - ends.length;
    }
    return position >= 0 && str.indexOf(ends, position) === position;
  },

  succ: function(str){
    str = makeString(str);
    return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length-1) + 1);
  },

  titleize: function(str){
    return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
  },

  camelize: function(str){
    return _s.trim(str).replace(/[-_\s]+(.)?/g, function(match, c){ return c ? c.toUpperCase() : ""; });
  },

  underscored: function(str){
    return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  },

  dasherize: function(str){
    return _s.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
  },

  classify: function(str){
    return _s.capitalize(_s.camelize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
  },

  humanize: function(str){
    return _s.capitalize(_s.underscored(str).replace(/_id$/,'').replace(/_/g, ' '));
  },

  trim: function(str, characters){
    str = makeString(str);
    if (!characters && nativeTrim) return nativeTrim.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
  },

  ltrim: function(str, characters){
    str = makeString(str);
    if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp('^' + characters + '+'), '');
  },

  rtrim: function(str, characters){
    str = makeString(str);
    if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp(characters + '+$'), '');
  },

  truncate: function(str, length, truncateStr){
    str = makeString(str); truncateStr = truncateStr || '...';
    length = ~~length;
    return str.length > length ? str.slice(0, length) + truncateStr : str;
  },

  /**
   * _s.prune: a more elegant version of truncate
   * prune extra chars, never leaving a half-chopped word.
   * @author github.com/rwz
   */
  prune: function(str, length, pruneStr){
    str = makeString(str); length = ~~length;
    pruneStr = pruneStr != null ? String(pruneStr) : '...';

    if (str.length <= length) return str;

    var tmpl = function(c){ return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' '; },
      template = str.slice(0, length+1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

    if (template.slice(template.length-2).match(/\w\w/))
      template = template.replace(/\s*\S+$/, '');
    else
      template = _s.rtrim(template.slice(0, template.length-1));

    return (template+pruneStr).length > str.length ? str : str.slice(0, template.length)+pruneStr;
  },

  words: function(str, delimiter) {
    if (_s.isBlank(str)) return [];
    return _s.trim(str, delimiter).split(delimiter || /\s+/);
  },

  pad: function(str, length, padStr, type) {
    str = makeString(str);
    length = ~~length;

    var padlen  = 0;

    if (!padStr)
      padStr = ' ';
    else if (padStr.length > 1)
      padStr = padStr.charAt(0);

    switch(type) {
      case 'right':
        padlen = length - str.length;
        return str + strRepeat(padStr, padlen);
      case 'both':
        padlen = length - str.length;
        return strRepeat(padStr, Math.ceil(padlen/2)) + str
                + strRepeat(padStr, Math.floor(padlen/2));
      default: // 'left'
        padlen = length - str.length;
        return strRepeat(padStr, padlen) + str;
      }
  },

  lpad: function(str, length, padStr) {
    return _s.pad(str, length, padStr);
  },

  rpad: function(str, length, padStr) {
    return _s.pad(str, length, padStr, 'right');
  },

  lrpad: function(str, length, padStr) {
    return _s.pad(str, length, padStr, 'both');
  },

  sprintf: sprintf,

  vsprintf: function(fmt, argv){
    argv.unshift(fmt);
    return sprintf.apply(null, argv);
  },

  toNumber: function(str, decimals) {
    if (!str) return 0;
    str = _s.trim(str);
    if (!str.match(/^-?\d+(?:\.\d+)?$/)) return NaN;
    return parseNumber(parseNumber(str).toFixed(~~decimals));
  },

  numberFormat : function(number, dec, dsep, tsep) {
    if (isNaN(number) || number == null) return '';

    number = number.toFixed(~~dec);
    tsep = typeof tsep == 'string' ? tsep : ',';

    var parts = number.split('.'), fnums = parts[0],
      decimals = parts[1] ? (dsep || '.') + parts[1] : '';

    return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
  },

  strRight: function(str, sep){
    str = makeString(str); sep = makeString(sep);
    var pos = !sep ? -1 : str.indexOf(sep);
    return ~pos ? str.slice(pos+sep.length, str.length) : str;
  },

  strRightBack: function(str, sep){
    str = makeString(str); sep = makeString(sep);
    var pos = !sep ? -1 : str.lastIndexOf(sep);
    return ~pos ? str.slice(pos+sep.length, str.length) : str;
  },

  strLeft: function(str, sep){
    str = makeString(str); sep = makeString(sep);
    var pos = !sep ? -1 : str.indexOf(sep);
    return ~pos ? str.slice(0, pos) : str;
  },

  strLeftBack: function(str, sep){
    str = makeString(str); sep = makeString(sep);
    var pos = str.lastIndexOf(sep);
    return ~pos ? str.slice(0, pos) : str;
  },

  toSentence: function(array, separator, lastSeparator, serial) {
    separator = separator || ', ';
    lastSeparator = lastSeparator || ' and ';
    var a = array.slice(), lastMember = a.pop();

    if (array.length > 2 && serial) lastSeparator = _s.rtrim(separator) + lastSeparator;

    return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
  },

  toSentenceSerial: function(array, sep, lastSep) {
    return _s.toSentence(array, sep, lastSep, true);
  },

  slugify: function(str) {
    var from  = "ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșšŝťțŭùúüűûñÿýçżźž",
        to    = "aaaaaaaaaccceeeeeghiiiijllnnoooooooossssttuuuuuunyyczzz",
        regex = new RegExp(defaultToWhiteSpace(from), 'g');

    str = makeString(str).toLowerCase().replace(regex, function(c){
      var index = from.indexOf(c);
      return to.charAt(index) || '-';
    });

    return _s.trim(_s.dasherize(str.replace(/[^\w\s-]/g, '-')), '-');
  },

  surround: function(str, wrapper) {
    return [wrapper, str, wrapper].join('');
  },

  quote: function(str, quoteChar) {
    return _s.surround(str, quoteChar || '"');
  },

  unquote: function(str, quoteChar) {
    quoteChar = quoteChar || '"';
    if (str[0] === quoteChar && str[str.length-1] === quoteChar)
      return str.slice(1,str.length-1);
    else return str;
  },

  exports: function() {
    var result = {};

    for (var prop in this) {
      if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse)$/)) continue;
      result[prop] = this[prop];
    }

    return result;
  },

  repeat: function(str, qty, separator){
    str = makeString(str);

    qty = ~~qty;

    // using faster implementation if separator is not needed;
    if (separator == null) return strRepeat(str, qty);

    // this one is about 300x slower in Google Chrome
    for (var repeat = []; qty > 0; repeat[--qty] = str) {}
    return repeat.join(separator);
  },

  naturalCmp: function(str1, str2){
    if (str1 == str2) return 0;
    if (!str1) return -1;
    if (!str2) return 1;

    var cmpRegex = /(\.\d+)|(\d+)|(\D+)/g,
      tokens1 = String(str1).match(cmpRegex),
      tokens2 = String(str2).match(cmpRegex),
      count = Math.min(tokens1.length, tokens2.length);

    for(var i = 0; i < count; i++) {
      var a = tokens1[i], b = tokens2[i];

      if (a !== b){
        var num1 = +a;
        var num2 = +b;
        if (num1 === num1 && num2 === num2){
          return num1 > num2 ? 1 : -1;
        }
        return a < b ? -1 : 1;
      }
    }

    if (tokens1.length != tokens2.length)
      return tokens1.length - tokens2.length;

    return str1 < str2 ? -1 : 1;
  },

  levenshtein: function(str1, str2) {
    str1 = makeString(str1); str2 = makeString(str2);

    var current = [], prev, value;

    for (var i = 0; i <= str2.length; i++)
      for (var j = 0; j <= str1.length; j++) {
        if (i && j)
          if (str1.charAt(j - 1) === str2.charAt(i - 1))
            value = prev;
          else
            value = Math.min(current[j], current[j - 1], prev) + 1;
        else
          value = i + j;

        prev = current[j];
        current[j] = value;
      }

    return current.pop();
  },

  toBoolean: function(str, trueValues, falseValues) {
    if (typeof str === "number") str = "" + str;
    if (typeof str !== "string") return !!str;
    str = _s.trim(str);
    if (boolMatch(str, trueValues || ["true", "1"])) return true;
    if (boolMatch(str, falseValues || ["false", "0"])) return false;
  }
};

// Aliases

_s.strip    = _s.trim;
_s.lstrip   = _s.ltrim;
_s.rstrip   = _s.rtrim;
_s.center   = _s.lrpad;
_s.rjust    = _s.lpad;
_s.ljust    = _s.rpad;
_s.contains = _s.include;
_s.q        = _s.quote;
_s.toBool   = _s.toBoolean;

// Exporting
// Integrate with Underscore.js if defined
// or create our own underscore object.
global._ = global._ || {};
global._.string = global._.str = _s;
this._ = this._ || {};
this._.string = this._.str = _s;

// CommonJS module is defined
module.exports = _s;
exports._s = _s;
