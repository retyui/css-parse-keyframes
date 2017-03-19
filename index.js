var Promise = require('bluebird');
var css = require('css');
var fs = require('fs');
var readFile = Promise.promisify(fs.readFile);
var extend = require('util')._extend;

function getAllCssFiles(arr, _async) {
	var _content = [];
	for (var i = arr.length - 1; i >= 0; i--) {
		_content.push((_async ? readFile : fs.readFileSync)(arr[i]));
	}
	return (_async ? Promise.all(_content) : _content);
}

function parseKeyframes(obj, resultObj) {
	if (!obj) {
		return false;
	}

	resultObj = resultObj || {};
	let keyframesRules = obj.stylesheet.rules.filter(function(e) {
		return e.type === 'keyframes' && e.vendor == void 0
	});
	var rex = /-(webkit|o|ms|moz)-/g;
	var len = keyframesRules.length;
	while (len--) {
		obj.stylesheet.rules = [];
		var rule = keyframesRules[len];
		obj.stylesheet.rules[0] = rule;
		rule.keyframes.forEach(function(el) {
			el.declarations = el.declarations.filter(function(el) {
				return !rex.test(el.property);
			});
		});
		!resultObj[rule.name] ? resultObj[rule.name] = css.stringify(obj, {
			compress: true
		}) : console.warn('[css-parse-keyframes]: The key "' + resultObj[rule.name] + '" is duplicated!');
	}
	return resultObj;
}

function parseCss(str, opt) {
	try {
		return css.parse(str, opt);
	} catch (e) {
		console.log(e);
		return false;
	}
};

module.exports = {
	css: function(cssSource) {
		var _result = {}
			, i, len;
		if (Array.isArray(cssSource)) {
			for (i = 0, len = cssSource.length; i < len; i++) {
				parseKeyframes(parseCss(cssSource[i]), _result);
			}
		} else { // is string
			parseKeyframes(parseCss(cssSource), _result);
		}
		return _result;
	}
	, files: function(arrFiles, cb) {
		var i, _cssStrArr, _keyFrames = {};
		arrFiles = Array.isArray(arrFiles) ? arrFiles : [arrFiles];

		if (typeof cb == 'function') {
			getAllCssFiles(arrFiles, true).then(function(cssStrArr) {
				for (i = cssStrArr.length - 1; i >= 0; i--) {
					parseKeyframes(parseCss(cssStrArr[i].toString('utf-8')), _keyFrames);
				}
				return cb(null, _keyFrames);
			}, function(err) {
				console.log('[css-parse-keyframes]: ' + err);
				return cb(err);
			});
		} else {
			try {
				_cssStrArr = getAllCssFiles(arrFiles);
			} catch (e) {
				console.log('[css-parse-keyframes]: ' + e);
				return e;
			}
			for (i = _cssStrArr.length - 1; i >= 0; i--) {
				parseKeyframes(parseCss(_cssStrArr[i].toString('utf-8')), _keyFrames);
			}
			return _keyFrames;
		}
	}
};