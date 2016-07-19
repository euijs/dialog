/*!
 *  eui-dialog v1.0.0 
 *  一个简单又优雅的弹出层组件 
 *  https://github.com/eeve/eui-dialog
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("$dialog", [], factory);
	else if(typeof exports === 'object')
		exports["$dialog"] = factory();
	else
		root["$dialog"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 创建一个Dialog对象
	 * @constructor
	 * @param {object} options 用户配置
	 * @example
	 * 	var dialog = new Dialog({
	 * 		title: 'hi',
	 * 		content: 'hello eui-dialog'
	 * 	});
	 */
	var Dialog = function (options) {
		// 此属性可知当前dialog对象是否处于打开状态
		this.opening = false;
		// 合并配置项， 最终使用this.options属性
		this._initialize(options);
		// 初始化HTML并挂载到文档树
		this._mount();
		return this;
	};
	
	// 混入自定义事件
	var Events = __webpack_require__(24);
	Events.mixTo(Dialog);
	
	var fn = Dialog.fn = Dialog.prototype;
	
	/**
	 * 对象属性混入
	 * @param  {object} destination 需要混入到此对象中
	 * @param  {object} source      待混入的对象
	 * @return {object}             混入的最终结果，就是改变后的destination
	 * @example
	 * $dialog.mixin({ a:1, b:2 }, { c:3, a:0 })
	 * //-> { a:0, b:2, c:3 }
	 */
	fn.mixin = Dialog.mixin = function(destination, source) {
	  for (var property in source){
			destination[property] = source[property];
		}
	  return destination;
	};
	
	// global config
	var Defaults = __webpack_require__(23);
	/**
	 * 全局配置
	 * @param  {object} defaults 默认配置项
	 * @return {object}          Dialog
	 */
	Dialog.config = function(defaults){
		// 用户配置覆盖全局配置
		this.mixin(Defaults, defaults);
		return this;
	};
	
	// 将helper挂载到dialog的原型链上
	fn._ =  __webpack_require__(25);
	
	/**
	 * 初始化配置信息
	 * @private
	 * @param  {object} options 用户自定义配置
	 * @return {object}         this
	 */
	fn._initialize = function (options){
		// 组件默认参数
		this._default = Defaults;
		// 将默认值全部复制到options
		this.mixin(this.options = {}, this._default);
		// 用户配置覆盖options
		this.mixin(this.options, options);
		return this;
	}
	
	/**
	 *  生成dialog的HTML结构，并且加入页面文档树中
	 * @private
	 * @return {object} this
	 */
	fn._mount = function(){
		var instance_id = this._wrapClass();
		var opt = this.options;
		var html = this._.loadTpl('default',{
			instance_id: instance_id,
			theme: opt.theme,
			title: opt.title,
			content: opt.content,
			buttons: opt.buttons,
			padding: opt.padding + 'px',
			fixed: opt.fixed === true ? 'fixed' : 'absolute'
		});
		this._.appendHTML(html);
		this.__key_ = instance_id;
		this.instance = this._.$(document.getElementById(instance_id));
		this._initPrimaryElements();
		this._bindEvent();
		instance_id = null;
		opt = null;
		html = null;
		instance = null;
		return this;
	}
	
	/**
	 * 初始化dialog上各个关键的DOM节点，便于使用
	 * @private
	 * @return {object} this
	 */
	fn._initPrimaryElements = function(){
		if ( !this.instance ){
			throw new Error('instance is not defined, need call _mount before');
			return;
		}
		var instance = this.instance;
		this.el = {
			container : this._.$('.J_container',instance),
			content : this._.$('.J_content',instance)
		};
		instance = null;
	}
	
	/**
	 * 绑定基本事件，包括但不限于：关闭弹出框，模态框mask点击关闭，各按钮的点击事件
	 * @private
	 * @return {object} this
	 */
	fn._bindEvent = function (){
		var instance = this.instance;
		if(!instance){
			throw new ReferenceError('instance is not defined.');
			return;
		}
	
		var self = this;
	
		//  关闭弹出框
		instance.on('click', '.J_close', function(){
			self.close();
		});
	
		// 是否为模态框
		if( this.options.modal !== true ){
			instance.on('click', '.J_mask', function(){
				self.close();
			});
		}
	
		// Action
		instance.on('click', '.J_action', function(e){
			var target = self._.$(e.target);
			var index = parseInt(target.attr('data-index'));
			var close = self.options.callback && self.options.callback.call(self, index, self.options.buttons[index]);
			if ( close !== false ){
				self.close();
			}
		});
	
		// resize
		this._.addEvent(this._.el.window, 'resize', function(){
			if( !self.opening ){
				return;
			}
			self._resetPosition();
		});
	
		// dialog 生命周期事件
	
		// 清理
		instance = null;
	
		return this;
	}
	
	/**
	 * 页面中包含的弹出框的个数
	 * @private
	 * @return {int} 弹出框的个数
	 */
	fn._nextIdentity = function(){
		var nodes = document.getElementsByClassName(this.options.theme);
		return nodes.length;
	}
	
	/**
	 * 生成一个唯一的dialog wrap css 类名
	 * @private
	 * @return {string} 一个唯一的dialog wrap css 类名
	 */
	fn._wrapClass = function(){
		return this._default.wrapClass + '_' + this._nextIdentity();
	}
	
	/**
	 * 刷新dialog位置
	 * @private
	 * @return {object} this
	 */
	fn._resetPosition = function(){
		if( !this.el || this.el.container === undefined ){
			throw new Error('el.container is not defined, so can not reset position for container.');
			return;
		}
		var container = this._.$(this.el.container);
		var body = this._.el.body;
		this.el.container.css('height', 'auto');
		this.el.container.css('width', 'auto');
		this.el.container.css('max-width', body[0].clientWidth * 0.8 + 'px'); // max-width : 80%
		var frame = container[0].getBoundingClientRect();
		this.el.container.css('height', frame.height + 'px');
		this.el.container.css('width', frame.width + 'px');
		this.el.container.css('left', '50%');
		this.el.container.css('top', '50%');
		this.el.container.css('margin-left', 0 - (frame.width * 0.5) + 'px');
		this.el.container.css('margin-top', 0 - (frame.height * 0.5) + 'px');
		frame = null;
		container = null;
		body = null;
		return this;
	}
	
	/**
	 * 锁定页面滚动条
	 * @private
	 * @param  {boolean} lock 锁定true or 解锁false
	 * @return {object}      this
	 */
	fn._lock = function (lock) {
		if( this.options.lock !== true ){
			return;
		}
		if(lock === false){
			this._.el.html.css('overflow','auto');
		}else{
			this._.el.html.css('overflow','hidden');
		}
	}
	
	/**
	 * 打开弹出框
	 * @return {object} this
	 * @example
	 * dialog.show();
	 */
	fn.show = function (){
		var instance = this.instance;
		// 取消隐藏
		instance.removeClass('hide');
		// 刷新dialog位置
		this._resetPosition();
		// 标记为已经打开
		this.opening = true;
		// 添加动画效果
		this.el.container.addClass(this.options.animate);
		// 锁定滚动条
		this._lock();
		// 触发生命周期事件
		this.trigger('show');
		instance = null;
		return this;
	}
	
	/**
	 * 关闭弹出框
	 * @return {object} this
	 * @example
	 * dialog.close();
	 */
	fn.close = function (){
		var close = this.trigger('beforeClose');
		// close === false
		// 明确指定不关闭，则不关闭
		if(close !== false){
			this.instance.addClass('hide');
			this.el.container.removeClass(this.options.animate);
			// 标记为已经打开
			this.opening = false;
			//  解锁滚动条
			this._lock(false);
			// 触发生命周期事件
			this.trigger('close');
		}
		return this;
	}
	
	/**
	 * 关闭并销毁弹出框
	 * @return {object} this
	 * @example
	 * dialog.destroy();
	 */
	fn.destroy = function (){
		this.trigger('beforeDestroy');
		// this.close();
		console.log('TODO Destroy');
		this.trigger('destroyed');
		return this;
	}
	
	/**
	 * 重新设置dialog中的内容
	 * @param {string} content 内容
	 * @return {object} this
	 * @example
	 * dialog.setContent("hello world!");
	 */
	fn.setContent = function (content){
		if( typeof content !== "string" ){
			throw new TypeError('content is not a string.');
			return;
		}
		if( content === "" ){
			throw new Error('content is a empty string.');
			return;
		}
		var $content = this.el.content;
		// 设置新的内容
		$content.html(content);
		return this;
	}
	
	// 对外暴露Dialog对象
	module.exports = Dialog;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(41);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return args;
	
	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	  return args;
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	try {
	  var type = __webpack_require__(17);
	} catch (err) {
	  var type = __webpack_require__(17);
	}
	
	var toFunction = __webpack_require__(22);
	
	/**
	 * HOP reference.
	 */
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Iterate the given `obj` and invoke `fn(val, i)`
	 * in optional context `ctx`.
	 *
	 * @param {String|Array|Object} obj
	 * @param {Function} fn
	 * @param {Object} [ctx]
	 * @api public
	 */
	
	module.exports = function(obj, fn, ctx){
	  fn = toFunction(fn);
	  ctx = ctx || this;
	  switch (type(obj)) {
	    case 'array':
	      return array(obj, fn, ctx);
	    case 'object':
	      if ('number' == typeof obj.length) return array(obj, fn, ctx);
	      return object(obj, fn, ctx);
	    case 'string':
	      return string(obj, fn, ctx);
	  }
	};
	
	/**
	 * Iterate string chars.
	 *
	 * @param {String} obj
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @api private
	 */
	
	function string(obj, fn, ctx) {
	  for (var i = 0; i < obj.length; ++i) {
	    fn.call(ctx, obj.charAt(i), i);
	  }
	}
	
	/**
	 * Iterate object keys.
	 *
	 * @param {Object} obj
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @api private
	 */
	
	function object(obj, fn, ctx) {
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      fn.call(ctx, key, obj[key]);
	    }
	  }
	}
	
	/**
	 * Iterate array-ish.
	 *
	 * @param {Array|Object} obj
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @api private
	 */
	
	function array(obj, fn, ctx) {
	  for (var i = 0; i < obj.length; ++i) {
	    fn.call(ctx, obj[i], i);
	  }
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
	    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
	    prefix = bind !== 'addEventListener' ? 'on' : '';
	
	/**
	 * Bind `el` event `type` to `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.bind = function(el, type, fn, capture){
	  el[bind](prefix + type, fn, capture || false);
	  return fn;
	};
	
	/**
	 * Unbind `el` event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.unbind = function(el, type, fn, capture){
	  el[unbind](prefix + type, fn, capture || false);
	  return fn;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	function one(selector, el) {
	  return el.querySelector(selector);
	}
	
	exports = module.exports = function(selector, el){
	  el = el || document;
	  return one(selector, el);
	};
	
	exports.all = function(selector, el){
	  el = el || document;
	  return el.querySelectorAll(selector);
	};
	
	exports.engine = function(obj){
	  if (!obj.one) throw new Error('.one callback required');
	  if (!obj.all) throw new Error('.all callback required');
	  one = obj.one;
	  exports.all = obj.all;
	  return exports;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(46);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/.npminstall/raw-loader/0.5.1/raw-loader/index.js!./../node_modules/.npminstall/less-loader/2.2.3/less-loader/index.js!./animate.less", function() {
				var newContent = require("!!./../node_modules/.npminstall/raw-loader/0.5.1/raw-loader/index.js!./../node_modules/.npminstall/less-loader/2.2.3/less-loader/index.js!./animate.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(47);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/.npminstall/raw-loader/0.5.1/raw-loader/index.js!./../node_modules/.npminstall/less-loader/2.2.3/less-loader/index.js!./default.less", function() {
				var newContent = require("!!./../node_modules/.npminstall/raw-loader/0.5.1/raw-loader/index.js!./../node_modules/.npminstall/less-loader/2.2.3/less-loader/index.js!./default.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	var toSpace = __webpack_require__(50);
	
	
	/**
	 * Expose `toCamelCase`.
	 */
	
	module.exports = toCamelCase;
	
	
	/**
	 * Convert a `string` to camel case.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	
	
	function toCamelCase (string) {
	  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
	    return letter.toUpperCase();
	  });
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var debug = __webpack_require__(1)('css:computed');
	var withinDocument = __webpack_require__(52);
	var styles = __webpack_require__(13);
	
	/**
	 * Expose `computed`
	 */
	
	module.exports = computed;
	
	/**
	 * Get the computed style
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {Array} precomputed (optional)
	 * @return {Array}
	 * @api private
	 */
	
	function computed(el, prop, precomputed) {
	  var computed = precomputed || styles(el);
	  var ret;
	  
	  if (!computed) return;
	
	  if (computed.getPropertyValue) {
	    ret = computed.getPropertyValue(prop) || computed[prop];
	  } else {
	    ret = computed[prop];
	  }
	
	  if ('' === ret && !withinDocument(el)) {
	    debug('element not within document, try finding from style attribute');
	    var style = __webpack_require__(12);
	    ret = style(el, prop);
	  }
	
	  debug('computed value of %s: %s', prop, ret);
	
	  // Support: IE
	  // IE returns zIndex value as an integer.
	  return undefined === ret ? ret : ret + '';
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var debug = __webpack_require__(1)('css:css');
	var camelcase = __webpack_require__(7);
	var computed = __webpack_require__(8);
	var property = __webpack_require__(11);
	
	/**
	 * Expose `css`
	 */
	
	module.exports = css;
	
	/**
	 * CSS Normal Transforms
	 */
	
	var cssNormalTransform = {
	  letterSpacing: 0,
	  fontWeight: 400
	};
	
	/**
	 * Get a CSS value
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {Mixed} extra
	 * @param {Array} styles
	 * @return {String}
	 */
	
	function css(el, prop, extra, styles) {
	  var hooks = __webpack_require__(10);
	  var orig = camelcase(prop);
	  var style = el.style;
	  var val;
	
	  prop = property(prop, style);
	  var hook = hooks[prop] || hooks[orig];
	
	  // If a hook was provided get the computed value from there
	  if (hook && hook.get) {
	    debug('get hook provided. use that');
	    val = hook.get(el, true, extra);
	  }
	
	  // Otherwise, if a way to get the computed value exists, use that
	  if (undefined == val) {
	    debug('fetch the computed value of %s', prop);
	    val = computed(el, prop);
	  }
	
	  if ('normal' == val && cssNormalTransform[prop]) {
	    val = cssNormalTransform[prop];
	    debug('normal => %s', val);
	  }
	
	  // Return, converting to number if forced or a qualifier was provided and val looks numeric
	  if ('' == extra || extra) {
	    debug('converting value: %s into a number', val);
	    var num = parseFloat(val);
	    return true === extra || isNumeric(num) ? num || 0 : val;
	  }
	
	  return val;
	}
	
	/**
	 * Is Numeric
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 */
	
	function isNumeric(obj) {
	  return !isNan(parseFloat(obj)) && isFinite(obj);
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var each = __webpack_require__(2);
	var css = __webpack_require__(9);
	var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
	var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
	var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
	var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
	var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
	var styles = __webpack_require__(13);
	var support = __webpack_require__(14);
	var swap = __webpack_require__(30);
	var computed = __webpack_require__(8);
	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
	
	/**
	 * Height & Width
	 */
	
	each(['width', 'height'], function(name) {
	  exports[name] = {};
	
	  exports[name].get = function(el, compute, extra) {
	    if (!compute) return;
	    // certain elements can have dimension info if we invisibly show them
	    // however, it must have a current display style that would benefit from this
	    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
	      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
	      : getWidthOrHeight(el, name, extra);
	  }
	
	  exports[name].set = function(el, val, extra) {
	    var styles = extra && styles(el);
	    return setPositiveNumber(el, val, extra
	      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
	      : 0
	    );
	  };
	
	});
	
	/**
	 * Opacity
	 */
	
	exports.opacity = {};
	exports.opacity.get = function(el, compute) {
	  if (!compute) return;
	  var ret = computed(el, 'opacity');
	  return '' == ret ? '1' : ret;
	}
	
	/**
	 * Utility: Set Positive Number
	 *
	 * @param {Element} el
	 * @param {Mixed} val
	 * @param {Number} subtract
	 * @return {Number}
	 */
	
	function setPositiveNumber(el, val, subtract) {
	  var matches = rnumsplit.exec(val);
	  return matches ?
	    // Guard against undefined 'subtract', e.g., when used as in cssHooks
	    Math.max(0, matches[1]) + (matches[2] || 'px') :
	    val;
	}
	
	/**
	 * Utility: Get the width or height
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {Mixed} extra
	 * @return {String}
	 */
	
	function getWidthOrHeight(el, prop, extra) {
	  // Start with offset property, which is equivalent to the border-box value
	  var valueIsBorderBox = true;
	  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
	  var styles = computed(el);
	  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';
	
	  // some non-html elements return undefined for offsetWidth, so check for null/undefined
	  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	  if (val <= 0 || val == null) {
	    // Fall back to computed then uncomputed css if necessary
	    val = computed(el, prop, styles);
	
	    if (val < 0 || val == null) {
	      val = el.style[prop];
	    }
	
	    // Computed unit is not pixels. Stop here and return.
	    if (rnumnonpx.test(val)) {
	      return val;
	    }
	
	    // we need the check for style in case a browser which returns unreliable values
	    // for getComputedStyle silently falls back to the reliable el.style
	    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);
	
	    // Normalize ', auto, and prepare for extra
	    val = parseFloat(val) || 0;
	  }
	
	  // use the active box-sizing model to add/subtract irrelevant styles
	  extra = extra || (isBorderBox ? 'border' : 'content');
	  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
	  return val + 'px';
	}
	
	/**
	 * Utility: Augment the width or the height
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {Mixed} extra
	 * @param {Boolean} isBorderBox
	 * @param {Array} styles
	 */
	
	function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
	  // If we already have the right measurement, avoid augmentation,
	  // Otherwise initialize for horizontal or vertical properties
	  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
	  var val = 0;
	
	  for (; i < 4; i += 2) {
	    // both box models exclude margin, so add it if we want it
	    if (extra === 'margin') {
	      val += css(el, extra + cssExpand[i], true, styles);
	    }
	
	    if (isBorderBox) {
	      // border-box includes padding, so remove it if we want content
	      if (extra === 'content') {
	        val -= css(el, 'padding' + cssExpand[i], true, styles);
	      }
	
	      // at this point, extra isn't border nor margin, so remove border
	      if (extra !== 'margin') {
	        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
	      }
	    } else {
	      // at this point, extra isn't content, so add padding
	      val += css(el, 'padding' + cssExpand[i], true, styles);
	
	      // at this point, extra isn't content nor padding, so add border
	      if (extra !== 'padding') {
	        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
	      }
	    }
	  }
	
	  return val;
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies
	 */
	
	var debug = __webpack_require__(1)('css:prop');
	var camelcase = __webpack_require__(7);
	var vendor = __webpack_require__(31);
	
	/**
	 * Export `prop`
	 */
	
	module.exports = prop;
	
	/**
	 * Normalize Properties
	 */
	
	var cssProps = {
	  'float': 'cssFloat' in document.documentElement.style ? 'cssFloat' : 'styleFloat'
	};
	
	/**
	 * Get the vendor prefixed property
	 *
	 * @param {String} prop
	 * @param {String} style
	 * @return {String} prop
	 * @api private
	 */
	
	function prop(prop, style) {
	  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
	  debug('transform property: %s => %s', prop, style);
	  return prop;
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var debug = __webpack_require__(1)('css:style');
	var camelcase = __webpack_require__(7);
	var support = __webpack_require__(14);
	var property = __webpack_require__(11);
	var hooks = __webpack_require__(10);
	
	/**
	 * Expose `style`
	 */
	
	module.exports = style;
	
	/**
	 * Possibly-unitless properties
	 *
	 * Don't automatically add 'px' to these properties
	 */
	
	var cssNumber = {
	  "columnCount": true,
	  "fillOpacity": true,
	  "fontWeight": true,
	  "lineHeight": true,
	  "opacity": true,
	  "order": true,
	  "orphans": true,
	  "widows": true,
	  "zIndex": true,
	  "zoom": true
	};
	
	/**
	 * Set a css value
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {Mixed} val
	 * @param {Mixed} extra
	 */
	
	function style(el, prop, val, extra) {
	  // Don't set styles on text and comment nodes
	  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;
	
	  var orig = camelcase(prop);
	  var style = el.style;
	  var type = typeof val;
	
	  if (!val) return get(el, prop, orig, extra);
	
	  prop = property(prop, style);
	
	  var hook = hooks[prop] || hooks[orig];
	
	  // If a number was passed in, add 'px' to the (except for certain CSS properties)
	  if ('number' == type && !cssNumber[orig]) {
	    debug('adding "px" to end of number');
	    val += 'px';
	  }
	
	  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
	  // but it would mean to define eight (for every problematic property) identical functions
	  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
	    debug('set property (%s) value to "inherit"', prop);
	    style[prop] = 'inherit';
	  }
	
	  // If a hook was provided, use that value, otherwise just set the specified value
	  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
	    // Support: Chrome, Safari
	    // Setting style to blank string required to delete "style: x !important;"
	    debug('set hook defined. setting property (%s) to %s', prop, val);
	    style[prop] = '';
	    style[prop] = val;
	  }
	
	}
	
	/**
	 * Get the style
	 *
	 * @param {Element} el
	 * @param {String} prop
	 * @param {String} orig
	 * @param {Mixed} extra
	 * @return {String}
	 */
	
	function get(el, prop, orig, extra) {
	  var style = el.style;
	  var hook = hooks[prop] || hooks[orig];
	  var ret;
	
	  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
	    debug('get hook defined, returning: %s', ret);
	    return ret;
	  }
	
	  ret = style[prop];
	  debug('getting %s', ret);
	  return ret;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Expose `styles`
	 */
	
	module.exports = styles;
	
	/**
	 * Get all the styles
	 *
	 * @param {Element} el
	 * @return {Array}
	 */
	
	function styles(el) {
	  if (window.getComputedStyle) {
	    return el.ownerDocument.defaultView.getComputedStyle(el, null);
	  } else {
	    return el.currentStyle;
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Support values
	 */
	
	var reliableMarginRight;
	var boxSizingReliableVal;
	var pixelPositionVal;
	var clearCloneStyle;
	
	/**
	 * Container setup
	 */
	
	var docElem = document.documentElement;
	var container = document.createElement('div');
	var div = document.createElement('div');
	
	/**
	 * Clear clone style
	 */
	
	div.style.backgroundClip = 'content-box';
	div.cloneNode(true).style.backgroundClip = '';
	exports.clearCloneStyle = div.style.backgroundClip === 'content-box';
	
	container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
	container.appendChild(div);
	
	/**
	 * Pixel position
	 *
	 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	 * getComputedStyle returns percent when specified for top/left/bottom/right
	 * rather than make the css module depend on the offset module, we just check for it here
	 */
	
	exports.pixelPosition = function() {
	  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
	  return pixelPositionVal;
	}
	
	/**
	 * Reliable box sizing
	 */
	
	exports.boxSizingReliable = function() {
	  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
	  return boxSizingReliableVal;
	}
	
	/**
	 * Reliable margin right
	 *
	 * Support: Android 2.3
	 * Check if div with explicit width and no margin-right incorrectly
	 * gets computed margin-right based on width of container. (#3333)
	 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	 * This support function is only executed once so no memoizing is needed.
	 *
	 * @return {Boolean}
	 */
	
	exports.reliableMarginRight = function() {
	  var ret;
	  var marginDiv = div.appendChild(document.createElement("div" ));
	
	  marginDiv.style.cssText = div.style.cssText = divReset;
	  marginDiv.style.marginRight = marginDiv.style.width = "0";
	  div.style.width = "1px";
	  docElem.appendChild(container);
	
	  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
	
	  docElem.removeChild(container);
	
	  // Clean up the div for other support tests.
	  div.innerHTML = "";
	
	  return ret;
	}
	
	/**
	 * Executing both pixelPosition & boxSizingReliable tests require only one layout
	 * so they're executed at the same time to save the second computation.
	 */
	
	function computePixelPositionAndBoxSizingReliable() {
	  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
	  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
	    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
	    "position:absolute;top:1%";
	  docElem.appendChild(container);
	
	  var divStyle = window.getComputedStyle(div, null);
	  pixelPositionVal = divStyle.top !== "1%";
	  boxSizingReliableVal = divStyle.width === "4px";
	
	  docElem.removeChild(container);
	}
	
	


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	try {
	  var query = __webpack_require__(4);
	} catch (err) {
	  var query = __webpack_require__(4);
	}
	
	/**
	 * Element prototype.
	 */
	
	var proto = Element.prototype;
	
	/**
	 * Vendor function.
	 */
	
	var vendor = proto.matches
	  || proto.webkitMatchesSelector
	  || proto.mozMatchesSelector
	  || proto.msMatchesSelector
	  || proto.oMatchesSelector;
	
	/**
	 * Expose `match()`.
	 */
	
	module.exports = match;
	
	/**
	 * Match `el` to `selector`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @return {Boolean}
	 * @api public
	 */
	
	function match(el, selector) {
	  if (!el || el.nodeType !== 1) return false;
	  if (vendor) return vendor.call(el, selector);
	  var nodes = query.all(selector, el.parentNode);
	  for (var i = 0; i < nodes.length; ++i) {
	    if (nodes[i] == el) return true;
	  }
	  return false;
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * Global Names
	 */
	
	var globals = /\b(Array|Date|Object|Math|JSON)\b/g;
	
	/**
	 * Return immediate identifiers parsed from `str`.
	 *
	 * @param {String} str
	 * @param {String|Function} map function or prefix
	 * @return {Array}
	 * @api public
	 */
	
	module.exports = function(str, fn){
	  var p = unique(props(str));
	  if (fn && 'string' == typeof fn) fn = prefixed(fn);
	  if (fn) return map(str, p, fn);
	  return p;
	};
	
	/**
	 * Return immediate identifiers in `str`.
	 *
	 * @param {String} str
	 * @return {Array}
	 * @api private
	 */
	
	function props(str) {
	  return str
	    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
	    .replace(globals, '')
	    .match(/[a-zA-Z_]\w*/g)
	    || [];
	}
	
	/**
	 * Return `str` with `props` mapped with `fn`.
	 *
	 * @param {String} str
	 * @param {Array} props
	 * @param {Function} fn
	 * @return {String}
	 * @api private
	 */
	
	function map(str, props, fn) {
	  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
	  return str.replace(re, function(_){
	    if ('(' == _[_.length - 1]) return fn(_);
	    if (!~props.indexOf(_)) return _;
	    return fn(_);
	  });
	}
	
	/**
	 * Return unique array.
	 *
	 * @param {Array} arr
	 * @return {Array}
	 * @api private
	 */
	
	function unique(arr) {
	  var ret = [];
	
	  for (var i = 0; i < arr.length; i++) {
	    if (~ret.indexOf(arr[i])) continue;
	    ret.push(arr[i]);
	  }
	
	  return ret;
	}
	
	/**
	 * Map with prefix `str`.
	 */
	
	function prefixed(str) {
	  return function(_){
	    return str + _;
	  };
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	
	/**
	 * toString ref.
	 */
	
	var toString = Object.prototype.toString;
	
	/**
	 * Return the type of `val`.
	 *
	 * @param {Mixed} val
	 * @return {String}
	 * @api public
	 */
	
	module.exports = function(val){
	  switch (toString.call(val)) {
	    case '[object Function]': return 'function';
	    case '[object Date]': return 'date';
	    case '[object RegExp]': return 'regexp';
	    case '[object Arguments]': return 'arguments';
	    case '[object Array]': return 'array';
	    case '[object String]': return 'string';
	  }
	
	  if (val === null) return 'null';
	  if (val === undefined) return 'undefined';
	  if (val && val.nodeType === 1) return 'element';
	  if (val === Object(val)) return 'object';
	
	  return typeof val;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var typeOf = __webpack_require__(40);
	
	/**
	 * Set or get `el`'s' value.
	 *
	 * @param {Element} el
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api public
	 */
	
	module.exports = function(el, val){
	  if (2 == arguments.length) return set(el, val);
	  return get(el);
	};
	
	/**
	 * Get `el`'s value.
	 */
	
	function get(el) {
	  switch (type(el)) {
	    case 'checkbox':
	    case 'radio':
	      if (el.checked) {
	        var attr = el.getAttribute('value');
	        return null == attr ? true : attr;
	      } else {
	        return false;
	      }
	    case 'radiogroup':
	      for (var i = 0, radio; radio = el[i]; i++) {
	        if (radio.checked) return radio.value;
	      }
	      break;
	    case 'select':
	      for (var i = 0, option; option = el.options[i]; i++) {
	        if (option.selected) return option.value;
	      }
	      break;
	    default:
	      return el.value;
	  }
	}
	
	/**
	 * Set `el`'s value.
	 */
	
	function set(el, val) {
	  switch (type(el)) {
	    case 'checkbox':
	    case 'radio':
	      if (val) {
	        el.checked = true;
	      } else {
	        el.checked = false;
	      }
	      break;
	    case 'radiogroup':
	      for (var i = 0, radio; radio = el[i]; i++) {
	        radio.checked = radio.value === val;
	      }
	      break;
	    case 'select':
	      for (var i = 0, option; option = el.options[i]; i++) {
	        option.selected = option.value === val;
	      }
	      break;
	    default:
	      el.value = val;
	  }
	}
	
	/**
	 * Element type.
	 */
	
	function type(el) {
	  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
	  if (group) el = el[0];
	  var name = el.nodeName.toLowerCase();
	  var type = el.getAttribute('type');
	
	  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
	  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
	  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
	  if ('select' == name) return 'select';
	  return name;
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	var proto = Element.prototype;
	var vendor = proto.matches
	  || proto.matchesSelector
	  || proto.webkitMatchesSelector
	  || proto.mozMatchesSelector
	  || proto.msMatchesSelector
	  || proto.oMatchesSelector;
	
	module.exports = match;
	
	/**
	 * Match `el` to `selector`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @return {Boolean}
	 * @api public
	 */
	
	function match(el, selector) {
	  if (vendor) return vendor.call(el, selector);
	  var nodes = el.parentNode.querySelectorAll(selector);
	  for (var i = 0; i < nodes.length; i++) {
	    if (nodes[i] == el) return true;
	  }
	  return false;
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "<div class='[:=theme:]_wrap [:=instance_id:] hide' id='[:=instance_id:]'>\n\t<div class='[:=theme:]_mask J_mask'></div>\n\t<div class='[:=theme:] J_container eui_dialog_animate' id='test' style='position: [:=fixed:];'>\n\t\t<div class='[:=theme:]_header'>\n\t\t\t[: if ( title !== false ) { :]\n\t\t\t\t<span class=\"[:=theme:]_title\">[:=title:]</span>\n\t\t\t[: } :]\n\t\t</div>\n\t\t<div class=\"[:=theme:]_ops\">\n\t\t\t<a class=\"[:=theme:]_ops_close J_close\" href=\"javascript:;\">x</a>\n\t\t</div>\n\t\t<div class='[:=theme:]_content J_content' style='padding: [:=padding:];'>[:=content:]</div>\n\t\t<div class='[:=theme:]_action'>\n\t\t\t[: for( var i = 0 , l = buttons.length; i < l; i++ ){ :]\n\t\t\t\t<button class='J_action' type='button' name='button' data-index='[:=i:]'>[:= buttons[i] :]</button>\n\t\t\t[: } :]\n\t\t</div>\n\t</div>\n</div>\n"

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module Dependencies
	 */
	
	var expr;
	try {
	  expr = __webpack_require__(16);
	} catch(e) {
	  expr = __webpack_require__(16);
	}
	
	/**
	 * Expose `toFunction()`.
	 */
	
	module.exports = toFunction;
	
	/**
	 * Convert `obj` to a `Function`.
	 *
	 * @param {Mixed} obj
	 * @return {Function}
	 * @api private
	 */
	
	function toFunction(obj) {
	  switch ({}.toString.call(obj)) {
	    case '[object Object]':
	      return objectToFunction(obj);
	    case '[object Function]':
	      return obj;
	    case '[object String]':
	      return stringToFunction(obj);
	    case '[object RegExp]':
	      return regexpToFunction(obj);
	    default:
	      return defaultToFunction(obj);
	  }
	}
	
	/**
	 * Default to strict equality.
	 *
	 * @param {Mixed} val
	 * @return {Function}
	 * @api private
	 */
	
	function defaultToFunction(val) {
	  return function(obj){
	    return val === obj;
	  };
	}
	
	/**
	 * Convert `re` to a function.
	 *
	 * @param {RegExp} re
	 * @return {Function}
	 * @api private
	 */
	
	function regexpToFunction(re) {
	  return function(obj){
	    return re.test(obj);
	  };
	}
	
	/**
	 * Convert property `str` to a function.
	 *
	 * @param {String} str
	 * @return {Function}
	 * @api private
	 */
	
	function stringToFunction(str) {
	  // immediate such as "> 20"
	  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);
	
	  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
	  return new Function('_', 'return ' + get(str));
	}
	
	/**
	 * Convert `object` to a function.
	 *
	 * @param {Object} object
	 * @return {Function}
	 * @api private
	 */
	
	function objectToFunction(obj) {
	  var match = {};
	  for (var key in obj) {
	    match[key] = typeof obj[key] === 'string'
	      ? defaultToFunction(obj[key])
	      : toFunction(obj[key]);
	  }
	  return function(val){
	    if (typeof val !== 'object') return false;
	    for (var key in match) {
	      if (!(key in val)) return false;
	      if (!match[key](val[key])) return false;
	    }
	    return true;
	  };
	}
	
	/**
	 * Built the getter function. Supports getter style functions
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	function get(str) {
	  var props = expr(str);
	  if (!props.length) return '_.' + str;
	
	  var val, i, prop;
	  for (i = 0; i < props.length; i++) {
	    prop = props[i];
	    val = '_.' + prop;
	    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
	
	    // mimic negative lookbehind to avoid problems with nested properties
	    str = stripNested(prop, str, val);
	  }
	
	  return str;
	}
	
	/**
	 * Mimic negative lookbehind to avoid problems with nested properties.
	 *
	 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
	 *
	 * @param {String} prop
	 * @param {String} str
	 * @param {String} val
	 * @return {String}
	 * @api private
	 */
	
	function stripNested (prop, str, val) {
	  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
	    return $1 ? $0 : val;
	  });
	}


/***/ },
/* 23 */
/***/ function(module, exports) {

	var defaults = {
	
	  // 标题
	  title : false,
	
	  // 是否模态
	  modal: true,
	
	  // 是否固定定位
	  fixed: true,
	
	  // 是否锁定页面滚动条
	  lock: false,
	
	  // 动画效果 zoomIn bounceIn shake
	  animate: 'zoomIn',
	
	  // 消息内容
	  content: "你好，欢迎使用！",
	
	  // 自定义按钮
	  buttons: [ '确定', '取消' ],
	
	  // 按钮点击事件通知
	  callback: null,
	
	  // 外容器class前缀
	  wrapClass: 'eui_dialog_instance',
	
	  // 主题
	  theme: 'eui_dialog_default',
	
	  // 内容与边界填充距离(px)
	  padding: 20
	
	};
	
	module.exports = defaults;


/***/ },
/* 24 */
/***/ function(module, exports) {

	// Events
	// -----------------
	// Thanks to:
	//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
	//  - https://github.com/joyent/node/blob/master/lib/events.js
	
	
	// Regular expression used to split event strings
	var eventSplitter = /\s+/
	
	
	// A module that can be mixed in to *any object* in order to provide it
	// with custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = new Events();
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	function Events() {
	}
	
	
	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	Events.prototype.on = function(events, callback, context) {
	  var cache, event, list
	  if (!callback) return this
	
	  cache = this.__events || (this.__events = {})
	  events = events.split(eventSplitter)
	
	  while (event = events.shift()) {
	    list = cache[event] || (cache[event] = [])
	    list.push(callback, context)
	  }
	
	  return this
	}
	
	Events.prototype.once = function(events, callback, context) {
	  var that = this
	  var cb = function() {
	    that.off(events, cb)
	    callback.apply(context || that, arguments)
	  }
	  return this.on(events, cb, context)
	}
	
	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	Events.prototype.off = function(events, callback, context) {
	  var cache, event, list, i
	
	  // No events, or removing *all* events.
	  if (!(cache = this.__events)) return this
	  if (!(events || callback || context)) {
	    delete this.__events
	    return this
	  }
	
	  events = events ? events.split(eventSplitter) : keys(cache)
	
	  // Loop through the callback list, splicing where appropriate.
	  while (event = events.shift()) {
	    list = cache[event]
	    if (!list) continue
	
	    if (!(callback || context)) {
	      delete cache[event]
	      continue
	    }
	
	    for (i = list.length - 2; i >= 0; i -= 2) {
	      if (!(callback && list[i] !== callback ||
	          context && list[i + 1] !== context)) {
	        list.splice(i, 2)
	      }
	    }
	  }
	
	  return this
	}
	
	
	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.prototype.trigger = function(events) {
	  var cache, event, all, list, i, len, rest = [], args, returned = true;
	  if (!(cache = this.__events)) return this
	
	  events = events.split(eventSplitter)
	
	  // Fill up `rest` with the callback arguments.  Since we're only copying
	  // the tail of `arguments`, a loop is much faster than Array#slice.
	  for (i = 1, len = arguments.length; i < len; i++) {
	    rest[i - 1] = arguments[i]
	  }
	
	  // For each event, walk through the list of callbacks twice, first to
	  // trigger the event, then to trigger any `"all"` callbacks.
	  while (event = events.shift()) {
	    // Copy callback lists to prevent modification.
	    if (all = cache.all) all = all.slice()
	    if (list = cache[event]) list = list.slice()
	
	    // Execute event callbacks except one named "all"
	    if (event !== 'all') {
	      returned = triggerEvents(list, rest, this) && returned
	    }
	
	    // Execute "all" callbacks.
	    returned = triggerEvents(all, [event].concat(rest), this) && returned
	  }
	
	  return returned
	}
	
	Events.prototype.emit = Events.prototype.trigger
	
	
	// Helpers
	// -------
	
	var keys = Object.keys
	
	if (!keys) {
	  Object.keys = function(o) {
	    var result = []
	
	    for (var name in o) {
	      if (o.hasOwnProperty(name)) {
	        result.push(name)
	      }
	    }
	    return result
	  }
	}
	
	// Mix `Events` to object instance or Class function.
	Events.mixTo = function(receiver) {
	  var proto = Events.prototype
	
	  if (isFunction(receiver)) {
	    for (var key in proto) {
	      if (proto.hasOwnProperty(key)) {
	        receiver.prototype[key] = proto[key]
	      }
	    }
	    Object.keys(proto).forEach(function(key) {
	      receiver.prototype[key] = proto[key]
	    })
	  }
	  else {
	    var event = new Events
	    for (var key in proto) {
	      if (proto.hasOwnProperty(key)) {
	        copyProto(key)
	      }
	    }
	  }
	
	  function copyProto(key) {
	    receiver[key] = function() {
	      proto[key].apply(event, Array.prototype.slice.call(arguments))
	      return this
	    }
	  }
	}
	
	// Execute callbacks
	function triggerEvents(list, args, context) {
	  var pass = true
	
	  if (list) {
	    var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
	    // call is faster than apply, optimize less than 3 argu
	    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
	    switch (args.length) {
	      case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
	      case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
	      case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
	      case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
	      default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
	    }
	  }
	  // trigger will return false if one of the callbacks return false
	  return pass;
	}
	
	function isFunction(func) {
	  return Object.prototype.toString.call(func) === '[object Function]'
	}
	
	module.exports = Events;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// minified instance more info : http://minifiedjs.com/
	var dom = __webpack_require__(33);
	
	var _ = {
	
		// 模板渲染引擎
		tpl: __webpack_require__(26).tpl,
	
		/**
		 * 载入模板并与数据合并，生成HTML
		 * @private
		 * @param  {string} name 模板名称
		 * @param  {object} data 数据
		 * @return {string}      合并后的HTML
		 */
		loadTpl: function (name, data){
			var tpl = __webpack_require__(55)("./"+name+'.tpl');
			var html = this.tpl(tpl, data);
			// style
			__webpack_require__(54)("./"+name);
			// animate
			__webpack_require__(5);
			return html;
		},
	
		/**
		 * 将HTML片段拼接到Document文档树上
		 * @private
		 * @param  {string} html HTML片段
		 * @return {object}      this
		 */
		appendHTML: function (html){
			this.el.body.append(html);
			return this;
		},
	
		// a empty function
		fun: function(){},
	
		// bind event
		addEvent: function(object, type, callback) {
		  if (object == null || typeof(object) == 'undefined') return;
		  if (object.addEventListener) {
		      object.addEventListener(type, callback, false);
		  } else if (object.attachEvent) {
		      object.attachEvent("on" + type, callback);
		  } else {
		      object["on"+type] = callback;
		  }
		},
	
		/**
		 * DOM traversal, manipulation and events aggregate library (like jQuery)
		 * https://github.com/component/dom
		 * @private
		 * @type {[type]}
		 */
		$ : dom
	
	};
	
	// 一些常用DOM节点
	_.el = {
		body: dom('body'),
		html: dom('html'),
		window: window
	};
	
	// 暴露 helper
	module.exports = _;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/**
	 * tppl.js 极致性能的 JS 模板引擎
	 * Github：https://github.com/jojoin/tppl
	 * 作者：杨捷
	 * 邮箱：yangjie@jojoin.com
	 * @private
	 * @param tpl {String}    模板字符串
	 * @param data {Object}   模板数据（不传或为null时返回渲染方法）
	 *
	 * @return  {String}    渲染结果
	 * @return  {Function}  渲染方法
	 *
	 */
	exports.tpl = function(tpl, data){
		var fn =  function(d) {
			var i, k = [], v = [];
			for (i in d) {
				k.push(i);
				v.push(d[i]);
			};
			return (new Function(k, fn.$)).apply(d, v);
		};
		if(!fn.$){
			var tpls = tpl.split('[:');
			fn.$ = "var $=''";
			for(var t = 0;t < tpls.length;t++){
				var p = tpls[t].split(':]');
				if(t!=0){
					fn.$ += '='==p[0].charAt(0)
					  ? "+("+p[0].substr(1)+")"
					  : ";"+p[0].replace(/\r\n/g, '')+"$=$"
				}
				// 支持 <pre> 和 [::] 包裹的 js 代码
				fn.$ += "+'"+p[p.length-1].replace(/\'/g,"\\'").replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\r/g, '\\n')+"'";
			}
			fn.$ += ";return $;";
			// log(fn.$);
		}
		return data ? fn(data) : fn;
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var index = __webpack_require__(39);
	
	/**
	 * Whitespace regexp.
	 */
	
	var re = /\s+/;
	
	/**
	 * toString reference.
	 */
	
	var toString = Object.prototype.toString;
	
	/**
	 * Wrap `el` in a `ClassList`.
	 *
	 * @param {Element} el
	 * @return {ClassList}
	 * @api public
	 */
	
	module.exports = function(el){
	  return new ClassList(el);
	};
	
	/**
	 * Initialize a new ClassList for `el`.
	 *
	 * @param {Element} el
	 * @api private
	 */
	
	function ClassList(el) {
	  if (!el || !el.nodeType) {
	    throw new Error('A DOM element reference is required');
	  }
	  this.el = el;
	  this.list = el.classList;
	}
	
	/**
	 * Add class `name` if not already present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.add = function(name){
	  // classList
	  if (this.list) {
	    this.list.add(name);
	    return this;
	  }
	
	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (!~i) arr.push(name);
	  this.el.className = arr.join(' ');
	  return this;
	};
	
	/**
	 * Remove class `name` when present, or
	 * pass a regular expression to remove
	 * any which match.
	 *
	 * @param {String|RegExp} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.remove = function(name){
	  if ('[object RegExp]' == toString.call(name)) {
	    return this.removeMatching(name);
	  }
	
	  // classList
	  if (this.list) {
	    this.list.remove(name);
	    return this;
	  }
	
	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (~i) arr.splice(i, 1);
	  this.el.className = arr.join(' ');
	  return this;
	};
	
	/**
	 * Remove all classes matching `re`.
	 *
	 * @param {RegExp} re
	 * @return {ClassList}
	 * @api private
	 */
	
	ClassList.prototype.removeMatching = function(re){
	  var arr = this.array();
	  for (var i = 0; i < arr.length; i++) {
	    if (re.test(arr[i])) {
	      this.remove(arr[i]);
	    }
	  }
	  return this;
	};
	
	/**
	 * Toggle class `name`, can force state via `force`.
	 *
	 * For browsers that support classList, but do not support `force` yet,
	 * the mistake will be detected and corrected.
	 *
	 * @param {String} name
	 * @param {Boolean} force
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.toggle = function(name, force){
	  // classList
	  if (this.list) {
	    if ("undefined" !== typeof force) {
	      if (force !== this.list.toggle(name, force)) {
	        this.list.toggle(name); // toggle again to correct
	      }
	    } else {
	      this.list.toggle(name);
	    }
	    return this;
	  }
	
	  // fallback
	  if ("undefined" !== typeof force) {
	    if (!force) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  } else {
	    if (this.has(name)) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return an array of classes.
	 *
	 * @return {Array}
	 * @api public
	 */
	
	ClassList.prototype.array = function(){
	  var str = this.el.className.replace(/^\s+|\s+$/g, '');
	  var arr = str.split(re);
	  if ('' === arr[0]) arr.shift();
	  return arr;
	};
	
	/**
	 * Check if class `name` is present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.has =
	ClassList.prototype.contains = function(name){
	  return this.list
	    ? this.list.contains(name)
	    : !! ~index(this.array(), name);
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	try {
	  var matches = __webpack_require__(15)
	} catch (err) {
	  var matches = __webpack_require__(15)
	}
	
	/**
	 * Export `closest`
	 */
	
	module.exports = closest
	
	/**
	 * Closest
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @param {Element} scope (optional)
	 */
	
	function closest (el, selector, scope) {
	  scope = scope || document.documentElement;
	
	  // walk up the dom
	  while (el && el !== scope) {
	    if (matches(el, selector)) return el;
	    el = el.parentNode;
	  }
	
	  // check scope for match
	  return matches(el, selector) ? el : null;
	}


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var debug = __webpack_require__(1)('css');
	var set = __webpack_require__(12);
	var get = __webpack_require__(9);
	
	/**
	 * Expose `css`
	 */
	
	module.exports = css;
	
	/**
	 * Get and set css values
	 *
	 * @param {Element} el
	 * @param {String|Object} prop
	 * @param {Mixed} val
	 * @return {Element} el
	 * @api public
	 */
	
	function css(el, prop, val) {
	  if (!el) return;
	
	  if (undefined !== val) {
	    var obj = {};
	    obj[prop] = val;
	    debug('setting styles %j', obj);
	    return setStyles(el, obj);
	  }
	
	  if ('object' == typeof prop) {
	    debug('setting styles %j', prop);
	    return setStyles(el, prop);
	  }
	
	  debug('getting %s', prop);
	  return get(el, prop);
	}
	
	/**
	 * Set the styles on an element
	 *
	 * @param {Element} el
	 * @param {Object} props
	 * @return {Element} el
	 */
	
	function setStyles(el, props) {
	  for (var prop in props) {
	    set(el, prop, props[prop]);
	  }
	
	  return el;
	}


/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * Export `swap`
	 */
	
	module.exports = swap;
	
	/**
	 * Initialize `swap`
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @param {Function} fn
	 * @param {Array} args
	 * @return {Mixed}
	 */
	
	function swap(el, options, fn, args) {
	  // Remember the old values, and insert the new ones
	  for (var key in options) {
	    old[key] = el.style[key];
	    el.style[key] = options[key];
	  }
	
	  ret = fn.apply(el, args || []);
	
	  // Revert the old values
	  for (key in options) {
	    el.style[key] = old[key];
	  }
	
	  return ret;
	}


/***/ },
/* 31 */
/***/ function(module, exports) {

	/**
	 * Module Dependencies
	 */
	
	var prefixes = ['Webkit', 'O', 'Moz', 'ms'];
	
	/**
	 * Expose `vendor`
	 */
	
	module.exports = vendor;
	
	/**
	 * Get the vendor prefix for a given property
	 *
	 * @param {String} prop
	 * @param {Object} style
	 * @return {String}
	 */
	
	function vendor(prop, style) {
	  // shortcut for names that are not vendor prefixed
	  if (style[prop]) return prop;
	
	  // check for vendor prefixed names
	  var capName = prop[0].toUpperCase() + prop.slice(1);
	  var original = prop;
	  var i = prefixes.length;
	
	  while (i--) {
	    prop = prefixes[i] + capName;
	    if (prop in style) return prop;
	  }
	
	  return original;
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var closest = __webpack_require__(28)
	  , event = __webpack_require__(3);
	
	/**
	 * Delegate event `type` to `selector`
	 * and invoke `fn(e)`. A callback function
	 * is returned which may be passed to `.unbind()`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.bind = function(el, selector, type, fn, capture){
	  return event.bind(el, type, function(e){
	    var target = e.target || e.srcElement;
	    e.delegateTarget = closest(target, selector, true, el);
	    if (e.delegateTarget) fn.call(el, e);
	  }, capture);
	};
	
	/**
	 * Unbind event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @api public
	 */
	
	exports.unbind = function(el, type, fn, capture){
	  event.unbind(el, type, fn, capture);
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var domify = __webpack_require__(42);
	var each = __webpack_require__(2);
	var events = __webpack_require__(3);
	var getKeys = __webpack_require__(44);
	var query = __webpack_require__(4);
	var trim = __webpack_require__(51);
	var slice = [].slice;
	
	var isArray = Array.isArray || function (val) {
	  return !! val && '[object Array]' === Object.prototype.toString.call(val);
	};
	
	/**
	 * Attributes supported.
	 */
	
	var attrs = [
	  'id',
	  'src',
	  'rel',
	  'cols',
	  'rows',
	  'type',
	  'name',
	  'href',
	  'title',
	  'style',
	  'width',
	  'height',
	  'action',
	  'method',
	  'tabindex',
	  'placeholder'
	];
	
	/*
	 * A simple way to check for HTML strings or ID strings
	 */
	
	var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
	
	/**
	 * Expose `dom()`.
	 */
	
	module.exports = dom;
	
	/**
	 * Return a dom `List` for the given
	 * `html`, selector, or element.
	 *
	 * @param {String|Element|List} selector
	 * @param {String|ELement|context} context
	 * @return {List}
	 * @api public
	 */
	
	function dom(selector, context) {
	  // array
	  if (isArray(selector)) {
	    return new List(selector);
	  }
	
	  // List
	  if (selector instanceof List) {
	    return selector;
	  }
	
	  // node
	  if (selector.nodeName) {
	    return new List([selector]);
	  }
	
	  if ('string' != typeof selector) {
	    throw new TypeError('invalid selector');
	  }
	
	  // html
	  var htmlselector = trim.left(selector);
	  if (isHTML(htmlselector)) {
	    return new List([domify(htmlselector)], htmlselector);
	  }
	
	  // selector
	  var ctx = context
	    ? (context instanceof List ? context[0] : context)
	    : document;
	
	  return new List(query.all(selector, ctx), selector);
	}
	
	/**
	 * Static: Expose `List`
	 */
	
	dom.List = List;
	
	/**
	 * Static: Expose supported attrs.
	 */
	
	dom.attrs = attrs;
	
	/**
	 * Static: Mixin a function
	 *
	 * @param {Object|String} name
	 * @param {Object|Function} obj
	 * @return {List} self
	 */
	
	dom.use = function(name, fn) {
	  var keys = [];
	  var tmp;
	
	  if (2 == arguments.length) {
	    keys.push(name);
	    tmp = {};
	    tmp[name] = fn;
	    fn = tmp;
	  } else if (name.name) {
	    // use function name
	    fn = name;
	    name = name.name;
	    keys.push(name);
	    tmp = {};
	    tmp[name] = fn;
	    fn = tmp;
	  } else {
	    keys = getKeys(name);
	    fn = name;
	  }
	
	  for(var i = 0, len = keys.length; i < len; i++) {
	    List.prototype[keys[i]] = fn[keys[i]];
	  }
	
	  return this;
	}
	
	/**
	 * Initialize a new `List` with the
	 * given array-ish of `els` and `selector`
	 * string.
	 *
	 * @param {Mixed} els
	 * @param {String} selector
	 * @api private
	 */
	
	function List(els, selector) {
	  els = els || [];
	  var len = this.length = els.length;
	  for(var i = 0; i < len; i++) this[i] = els[i];
	  this.selector = selector;
	}
	
	/**
	 * Remake the list
	 *
	 * @param {String|ELement|context} context
	 * @return {List}
	 * @api private
	 */
	
	List.prototype.dom = dom;
	
	/**
	 * Make `List` an array-like object
	 */
	
	List.prototype.length = 0;
	List.prototype.splice = Array.prototype.splice;
	
	/**
	 * Array-like object to array
	 *
	 * @return {Array}
	 */
	
	List.prototype.toArray = function() {
	  return slice.call(this);
	}
	
	/**
	 * Attribute accessors.
	 */
	
	each(attrs, function(name){
	  List.prototype[name] = function(val){
	    if (0 == arguments.length) return this.attr(name);
	    return this.attr(name, val);
	  };
	});
	
	/**
	 * Mixin the API
	 */
	
	dom.use(__webpack_require__(34));
	dom.use(__webpack_require__(35));
	dom.use(__webpack_require__(36));
	dom.use(__webpack_require__(37));
	dom.use(__webpack_require__(38));
	
	/**
	 * Check if the string is HTML
	 *
	 * @param {String} str
	 * @return {Boolean}
	 * @api private
	 */
	
	function isHTML(str) {
	  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
	  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;
	
	  // Run the regex
	  var match = quickExpr.exec(str);
	  return !!(match && match[1]);
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var value = __webpack_require__(18);
	
	/**
	 * Set attribute `name` to `val`, or get attr `name`.
	 *
	 * @param {String} name
	 * @param {String} [val]
	 * @return {String|List} self
	 * @api public
	 */
	
	exports.attr = function(name, val){
	  // get
	  if (1 == arguments.length) {
	    return this[0] && this[0].getAttribute(name);
	  }
	
	  // remove
	  if (null == val) {
	    return this.removeAttr(name);
	  }
	
	  // set
	  return this.forEach(function(el){
	    el.setAttribute(name, val);
	  });
	};
	
	/**
	 * Remove attribute `name`.
	 *
	 * @param {String} name
	 * @return {List} self
	 * @api public
	 */
	
	exports.removeAttr = function(name){
	  return this.forEach(function(el){
	    el.removeAttribute(name);
	  });
	};
	
	/**
	 * Set property `name` to `val`, or get property `name`.
	 *
	 * @param {String} name
	 * @param {String} [val]
	 * @return {Object|List} self
	 * @api public
	 */
	
	exports.prop = function(name, val){
	  if (1 == arguments.length) {
	    return this[0] && this[0][name];
	  }
	
	  return this.forEach(function(el){
	    el[name] = val;
	  });
	};
	
	/**
	 * Get the first element's value or set selected
	 * element values to `val`.
	 *
	 * @param {Mixed} [val]
	 * @return {Mixed}
	 * @api public
	 */
	
	exports.val =
	exports.value = function(val){
	  if (0 == arguments.length) {
	    return this[0]
	      ? value(this[0])
	      : undefined;
	  }
	
	  return this.forEach(function(el){
	    value(el, val);
	  });
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var classes = __webpack_require__(27);
	
	/**
	 * Add the given class `name`.
	 *
	 * @param {String} name
	 * @return {List} self
	 * @api public
	 */
	
	exports.addClass = function(name){
	  return this.forEach(function(el) {
	    el._classes = el._classes || classes(el);
	    el._classes.add(name);
	  });
	};
	
	/**
	 * Remove the given class `name`.
	 *
	 * @param {String|RegExp} name
	 * @return {List} self
	 * @api public
	 */
	
	exports.removeClass = function(name){
	  return this.forEach(function(el) {
	    el._classes = el._classes || classes(el);
	    el._classes.remove(name);
	  });
	};
	
	/**
	 * Toggle the given class `name`,
	 * optionally a `bool` may be given
	 * to indicate that the class should
	 * be added when truthy.
	 *
	 * @param {String} name
	 * @param {Boolean} bool
	 * @return {List} self
	 * @api public
	 */
	
	exports.toggleClass = function(name, bool){
	  var fn = 'toggle';
	
	  // toggle with boolean
	  if (2 == arguments.length) {
	    fn = bool ? 'add' : 'remove';
	  }
	
	  return this.forEach(function(el) {
	    el._classes = el._classes || classes(el);
	    el._classes[fn](name);
	  })
	};
	
	/**
	 * Check if the given class `name` is present.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	exports.hasClass = function(name){
	  var el;
	
	  for(var i = 0, len = this.length; i < len; i++) {
	    el = this[i];
	    el._classes = el._classes || classes(el);
	    if (el._classes.has(name)) return true;
	  }
	
	  return false;
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var events = __webpack_require__(3);
	var delegate = __webpack_require__(32);
	
	/**
	 * Bind to `event` and invoke `fn(e)`. When
	 * a `selector` is given then events are delegated.
	 *
	 * @param {String} event
	 * @param {String} [selector]
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {List}
	 * @api public
	 */
	
	exports.on = function(event, selector, fn, capture){
	  if ('string' == typeof selector) {
	    return this.forEach(function (el) {
	      fn._delegate = delegate.bind(el, selector, event, fn, capture);
	    });
	  }
	
	  capture = fn;
	  fn = selector;
	
	  return this.forEach(function (el) {
	    events.bind(el, event, fn, capture);
	  });
	};
	
	/**
	 * Unbind to `event` and invoke `fn(e)`. When
	 * a `selector` is given then delegated event
	 * handlers are unbound.
	 *
	 * @param {String} event
	 * @param {String} [selector]
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {List}
	 * @api public
	 */
	
	exports.off = function(event, selector, fn, capture){
	  if ('string' == typeof selector) {
	    return this.forEach(function (el) {
	      // TODO: add selector support back
	      delegate.unbind(el, event, fn._delegate, capture);
	    });
	  }
	
	  capture = fn;
	  fn = selector;
	
	  return this.forEach(function (el) {
	    events.unbind(el, event, fn, capture);
	  });
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var value = __webpack_require__(18);
	var css = __webpack_require__(29);
	var text = __webpack_require__(48);
	
	/**
	 * Return element text.
	 *
	 * @param {String} str
	 * @return {String|List}
	 * @api public
	 */
	
	exports.text = function(str) {
	  if (1 == arguments.length) {
	    return this.forEach(function(el) {
	      if (11 == el.nodeType) {
	        var node;
	        while (node = el.firstChild) el.removeChild(node);
	        el.appendChild(document.createTextNode(str));
	      } else {
	        text(el, str);
	      }
	    });
	  }
	
	  var out = '';
	  this.forEach(function(el) {
	    if (11 == el.nodeType) {
	      out += getText(el.firstChild);
	    } else {
	      out += text(el);
	    }
	  });
	
	  return out;
	};
	
	/**
	 * Get text helper from Sizzle.
	 *
	 * Source: https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L914-L947
	 *
	 * @param {Element|Array} el
	 * @return {String}
	 */
	
	function getText(el) {
	  var ret = '';
	  var type = el.nodeType;
	  var node;
	
	  switch(type) {
	    case 1:
	    case 9:
	      ret = text(el);
	      break;
	    case 11:
	      ret = el.textContent || el.innerText;
	      break;
	    case 3:
	    case 4:
	      return el.nodeValue;
	    default:
	      while (node = el[i++]) {
	        ret += getText(node);
	      }
	  }
	
	  return ret;
	}
	
	/**
	 * Return element html.
	 *
	 * @return {String} html
	 * @api public
	 */
	
	exports.html = function(html) {
	  if (1 == arguments.length) {
	    return this.forEach(function(el) {
	      el.innerHTML = html;
	    });
	  }
	
	  // TODO: real impl
	  return this[0] && this[0].innerHTML;
	};
	
	/**
	 * Get and set the css value
	 *
	 * @param {String|Object} prop
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api public
	 */
	
	exports.css = function(prop, val) {
	  // getter
	  if (!val && 'object' != typeof prop) {
	    return css(this[0], prop);
	  }
	  // setter
	  this.forEach(function(el) {
	    css(el, prop, val);
	  });
	
	  return this;
	};
	
	/**
	 * Prepend `val`.
	 *
	 * From jQuery: if there is more than one target element
	 * cloned copies of the inserted element will be created
	 * for each target after the first.
	 *
	 * @param {String|Element|List} val
	 * @return {List} self
	 * @api public
	 */
	
	exports.prepend = function(val) {
	  var dom = this.dom;
	
	  this.forEach(function(target, i) {
	    dom(val).forEach(function(selector) {
	      selector = i ? selector.cloneNode(true) : selector;
	      if (target.children.length) {
	        target.insertBefore(selector, target.firstChild);
	      } else {
	        target.appendChild(selector);
	      }
	    });
	  });
	
	  return this;
	};
	
	/**
	 * Append `val`.
	 *
	 * From jQuery: if there is more than one target element
	 * cloned copies of the inserted element will be created
	 * for each target after the first.
	 *
	 * @param {String|Element|List} val
	 * @return {List} self
	 * @api public
	 */
	
	exports.append = function(val) {
	  var dom = this.dom;
	
	  this.forEach(function(target, i) {
	    dom(val).forEach(function(el) {
	      el = i ? el.cloneNode(true) : el;
	      target.appendChild(el);
	    });
	  });
	
	  return this;
	};
	
	/**
	 * Insert self's `els` after `val`
	 *
	 * From jQuery: if there is more than one target element,
	 * cloned copies of the inserted element will be created
	 * for each target after the first, and that new set
	 * (the original element plus clones) is returned.
	 *
	 * @param {String|Element|List} val
	 * @return {List} self
	 * @api public
	 */
	
	exports.insertAfter = function(val) {
	  var dom = this.dom;
	
	  this.forEach(function(el) {
	    dom(val).forEach(function(target, i) {
	      if (!target.parentNode) return;
	      el = i ? el.cloneNode(true) : el;
	      target.parentNode.insertBefore(el, target.nextSibling);
	    });
	  });
	
	  return this;
	};
	
	/**
	 * Append self's `el` to `val`
	 *
	 * @param {String|Element|List} val
	 * @return {List} self
	 * @api public
	 */
	
	exports.appendTo = function(val) {
	  this.dom(val).append(this);
	  return this;
	};
	
	/**
	 * Replace elements in the DOM.
	 *
	 * @param {String|Element|List} val
	 * @return {List} self
	 * @api public
	 */
	
	exports.replace = function(val) {
	  var self = this;
	  var list = this.dom(val);
	
	  list.forEach(function(el, i) {
	    var old = self[i];
	    var parent = old.parentNode;
	    if (!parent) return;
	    el = i ? el.cloneNode(true) : el;
	    parent.replaceChild(el, old);
	  });
	
	  return this;
	};
	
	/**
	 * Empty the dom list
	 *
	 * @return self
	 * @api public
	 */
	
	exports.empty = function() {
	  return this.forEach(function(el) {
	    text(el, "");
	  });
	};
	
	/**
	 * Remove all elements in the dom list
	 *
	 * @return {List} self
	 * @api public
	 */
	
	exports.remove = function() {
	  return this.forEach(function(el) {
	    var parent = el.parentNode;
	    if (parent) parent.removeChild(el);
	  });
	};
	
	/**
	 * Return a cloned dom list with all elements cloned.
	 *
	 * @return {List}
	 * @api public
	 */
	
	exports.clone = function() {
	  var out = this.map(function(el) {
	    return el.cloneNode(true);
	  });
	
	  return this.dom(out);
	};
	
	/**
	 * Focus the first dom element in our list.
	 * 
	 * @return {List} self
	 * @api public
	 */
	
	exports.focus = function(){
	  this[0].focus();
	  return this;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */
	
	var proto = Array.prototype;
	var each = __webpack_require__(2);
	var traverse = __webpack_require__(53);
	var toFunction = __webpack_require__(22);
	var matches = __webpack_require__(19);
	
	/**
	 * Find children matching the given `selector`.
	 *
	 * @param {String} selector
	 * @return {List}
	 * @api public
	 */
	
	exports.find = function(selector){
	  return this.dom(selector, this);
	};
	
	/**
	 * Check if the any element in the selection
	 * matches `selector`.
	 *
	 * @param {String} selector
	 * @return {Boolean}
	 * @api public
	 */
	
	exports.is = function(selector){
	  for(var i = 0, el; el = this[i]; i++) {
	    if (matches(el, selector)) return true;
	  }
	
	  return false;
	};
	
	/**
	 * Get parent(s) with optional `selector` and `limit`
	 *
	 * @param {String} selector
	 * @param {Number} limit
	 * @return {List}
	 * @api public
	 */
	
	exports.parent = function(selector, limit){
	  return this.dom(traverse('parentNode',
	    this[0],
	    selector,
	    limit
	    || 1));
	};
	
	/**
	 * Get next element(s) with optional `selector` and `limit`.
	 *
	 * @param {String} selector
	 * @param {Number} limit
	 * @retrun {List}
	 * @api public
	 */
	
	exports.next = function(selector, limit){
	  return this.dom(traverse('nextSibling',
	    this[0],
	    selector,
	    limit
	    || 1));
	};
	
	/**
	 * Get previous element(s) with optional `selector` and `limit`.
	 *
	 * @param {String} selector
	 * @param {Number} limit
	 * @return {List}
	 * @api public
	 */
	
	exports.prev =
	exports.previous = function(selector, limit){
	  return this.dom(traverse('previousSibling',
	    this[0],
	    selector,
	    limit
	    || 1));
	};
	
	/**
	 * Iterate over each element creating a new list with
	 * one item and invoking `fn(list, i)`.
	 *
	 * @param {Function} fn
	 * @return {List} self
	 * @api public
	 */
	
	exports.each = function(fn){
	  var dom = this.dom;
	
	  for (var i = 0, list, len = this.length; i < len; i++) {
	    list = dom(this[i]);
	    fn.call(list, list, i);
	  }
	
	  return this;
	};
	
	/**
	 * Iterate over each element and invoke `fn(el, i)`
	 *
	 * @param {Function} fn
	 * @return {List} self
	 * @api public
	 */
	
	exports.forEach = function(fn) {
	  for (var i = 0, len = this.length; i < len; i++) {
	    fn.call(this[i], this[i], i);
	  }
	
	  return this;
	};
	
	/**
	 * Map each return value from `fn(val, i)`.
	 *
	 * Passing a callback function:
	 *
	 *    inputs.map(function(input){
	 *      return input.type
	 *    })
	 *
	 * Passing a property string:
	 *
	 *    inputs.map('type')
	 *
	 * @param {Function} fn
	 * @return {List} self
	 * @api public
	 */
	
	exports.map = function(fn){
	  fn = toFunction(fn);
	  var dom = this.dom;
	  var out = [];
	
	  for (var i = 0, len = this.length; i < len; i++) {
	    out.push(fn.call(dom(this[i]), this[i], i));
	  }
	
	  return this.dom(out);
	};
	
	/**
	 * Select all values that return a truthy value of `fn(val, i)`.
	 *
	 *    inputs.select(function(input){
	 *      return input.type == 'password'
	 *    })
	 *
	 *  With a property:
	 *
	 *    inputs.select('type == password')
	 *
	 * @param {Function|String} fn
	 * @return {List} self
	 * @api public
	 */
	
	exports.filter =
	exports.select = function(fn){
	  fn = toFunction(fn);
	  var dom = this.dom;
	  var out = [];
	  var val;
	
	  for (var i = 0, len = this.length; i < len; i++) {
	    val = fn.call(dom(this[i]), this[i], i);
	    if (val) out.push(this[i]);
	  }
	
	  return this.dom(out);
	};
	
	/**
	 * Reject all values that return a truthy value of `fn(val, i)`.
	 *
	 * Rejecting using a callback:
	 *
	 *    input.reject(function(user){
	 *      return input.length < 20
	 *    })
	 *
	 * Rejecting with a property:
	 *
	 *    items.reject('password')
	 *
	 * Rejecting values via `==`:
	 *
	 *    data.reject(null)
	 *    input.reject(file)
	 *
	 * @param {Function|String|Mixed} fn
	 * @return {List}
	 * @api public
	 */
	
	exports.reject = function(fn){
	  var dom = this.dom;
	  var out = [];
	  var len = this.length;
	  var val, i;
	
	  if ('string' == typeof fn) fn = toFunction(fn);
	
	  if (fn) {
	    for (i = 0; i < len; i++) {
	      val = fn.call(dom(this[i]), this[i], i);
	      if (!val) out.push(this[i]);
	    }
	  } else {
	    for (i = 0; i < len; i++) {
	      if (this[i] != fn) out.push(this[i]);
	    }
	  }
	
	  return this.dom(out);
	};
	
	/**
	 * Return a `List` containing the element at `i`.
	 *
	 * @param {Number} i
	 * @return {List}
	 * @api public
	 */
	
	exports.at = function(i){
	  return this.dom(this[i]);
	};
	
	/**
	 * Return a `List` containing the first element.
	 *
	 * @param {Number} i
	 * @return {List}
	 * @api public
	 */
	
	exports.first = function(){
	  return this.dom(this[0]);
	};
	
	/**
	 * Return a `List` containing the last element.
	 *
	 * @param {Number} i
	 * @return {List}
	 * @api public
	 */
	
	exports.last = function(){
	  return this.dom(this[this.length - 1]);
	};
	
	/**
	 * Mixin the array functions
	 */
	
	each([
	  'push',
	  'pop',
	  'shift',
	  'splice',
	  'unshift',
	  'reverse',
	  'sort',
	  'toString',
	  'concat',
	  'join',
	  'slice'
	], function(method) {
	  exports[method] = function() {
	    return proto[method].apply(this.toArray(), arguments);
	  };
	});


/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = function(arr, obj){
	  if (arr.indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	/**
	 * toString ref.
	 */
	
	var toString = Object.prototype.toString;
	
	/**
	 * Return the type of `val`.
	 *
	 * @param {Mixed} val
	 * @return {String}
	 * @api public
	 */
	
	module.exports = function(val){
	  switch (toString.call(val)) {
	    case '[object Date]': return 'date';
	    case '[object RegExp]': return 'regexp';
	    case '[object Arguments]': return 'arguments';
	    case '[object Array]': return 'array';
	    case '[object Error]': return 'error';
	  }
	
	  if (val === null) return 'null';
	  if (val === undefined) return 'undefined';
	  if (val !== val) return 'nan';
	  if (val && val.nodeType === 1) return 'element';
	
	  if (isBuffer(val)) return 'buffer';
	
	  val = val.valueOf
	    ? val.valueOf()
	    : Object.prototype.valueOf.apply(val);
	
	  return typeof val;
	};
	
	// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
	function isBuffer(obj) {
	  return !!(obj != null &&
	    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
	      (obj.constructor &&
	      typeof obj.constructor.isBuffer === 'function' &&
	      obj.constructor.isBuffer(obj))
	    ))
	}


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(43);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previously assigned color.
	 */
	
	var prevColor = 0;
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function debug(namespace) {
	
	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;
	
	  // define the `enabled` version
	  function enabled() {
	
	    var self = enabled;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();
	
	    var args = Array.prototype.slice.call(arguments);
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;
	
	  var fn = exports.enabled(namespace) ? enabled : disabled;
	
	  fn.namespace = namespace;
	
	  return fn;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 42 */
/***/ function(module, exports) {

	
	/**
	 * Expose `parse`.
	 */
	
	module.exports = parse;
	
	/**
	 * Tests for browser support.
	 */
	
	var div = document.createElement('div');
	// Setup
	div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	var innerHTMLBug = !div.getElementsByTagName('link').length;
	div = undefined;
	
	/**
	 * Wrap map from jquery.
	 */
	
	var map = {
	  legend: [1, '<fieldset>', '</fieldset>'],
	  tr: [2, '<table><tbody>', '</tbody></table>'],
	  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
	  // for script/link/style tags to work in IE6-8, you have to wrap
	  // in a div with a non-whitespace character in front, ha!
	  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
	};
	
	map.td =
	map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
	
	map.option =
	map.optgroup = [1, '<select multiple="multiple">', '</select>'];
	
	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>'];
	
	map.polyline =
	map.ellipse =
	map.polygon =
	map.circle =
	map.text =
	map.line =
	map.path =
	map.rect =
	map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];
	
	/**
	 * Parse `html` and return a DOM Node instance, which could be a TextNode,
	 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
	 * instance, depending on the contents of the `html` string.
	 *
	 * @param {String} html - HTML string to "domify"
	 * @param {Document} doc - The `document` instance to create the Node for
	 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
	 * @api private
	 */
	
	function parse(html, doc) {
	  if ('string' != typeof html) throw new TypeError('String expected');
	
	  // default to the global `document` object
	  if (!doc) doc = document;
	
	  // tag name
	  var m = /<([\w:]+)/.exec(html);
	  if (!m) return doc.createTextNode(html);
	
	  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace
	
	  var tag = m[1];
	
	  // body support
	  if (tag == 'body') {
	    var el = doc.createElement('html');
	    el.innerHTML = html;
	    return el.removeChild(el.lastChild);
	  }
	
	  // wrap map
	  var wrap = map[tag] || map._default;
	  var depth = wrap[0];
	  var prefix = wrap[1];
	  var suffix = wrap[2];
	  var el = doc.createElement('div');
	  el.innerHTML = prefix + html + suffix;
	  while (depth--) el = el.lastChild;
	
	  // one element
	  if (el.firstChild == el.lastChild) {
	    return el.removeChild(el.firstChild);
	  }
	
	  // several elements
	  var fragment = doc.createDocumentFragment();
	  while (el.firstChild) {
	    fragment.appendChild(el.removeChild(el.firstChild));
	  }
	
	  return fragment;
	}


/***/ },
/* 43 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = __webpack_require__(45);
	var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
	var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	
	var keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];
	
		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}
	
		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}
	
		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}
	
		if (hasDontEnumBug) {
			var ctor = object.constructor;
			var skipConstructor = ctor && ctor.prototype === object;
	
			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
	
	keysShim.shim = function shimObjectKeys() {
		if (!Object.keys) {
			Object.keys = keysShim;
		}
		return Object.keys || keysShim;
	};
	
	module.exports = keysShim;


/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';
	
	var toStr = Object.prototype.toString;
	
	module.exports = function isArguments(value) {
		var str = toStr.call(value);
		var isArgs = str === '[object Arguments]';
		if (!isArgs) {
			isArgs = str !== '[object Array]'
				&& value !== null
				&& typeof value === 'object'
				&& typeof value.length === 'number'
				&& value.length >= 0
				&& toStr.call(value.callee) === '[object Function]';
		}
		return isArgs;
	};


/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = "@-webkit-keyframes zoomIn {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(0.3, 0.3, 0.3);\n    transform: scale3d(0.3, 0.3, 0.3);\n  }\n  50% {\n    opacity: 1;\n  }\n}\n@keyframes zoomIn {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(0.3, 0.3, 0.3);\n    transform: scale3d(0.3, 0.3, 0.3);\n  }\n  50% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes bounceIn {\n  from,\n  20%,\n  40%,\n  60%,\n  80%,\n  to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);\n    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);\n  }\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(0.3, 0.3, 0.3);\n    transform: scale3d(0.3, 0.3, 0.3);\n  }\n  20% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n  40% {\n    -webkit-transform: scale3d(0.9, 0.9, 0.9);\n    transform: scale3d(0.9, 0.9, 0.9);\n  }\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03, 1.03, 1.03);\n    transform: scale3d(1.03, 1.03, 1.03);\n  }\n  80% {\n    -webkit-transform: scale3d(0.97, 0.97, 0.97);\n    transform: scale3d(0.97, 0.97, 0.97);\n  }\n  to {\n    opacity: 1;\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n@keyframes bounceIn {\n  from,\n  20%,\n  40%,\n  60%,\n  80%,\n  to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);\n    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);\n  }\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(0.3, 0.3, 0.3);\n    transform: scale3d(0.3, 0.3, 0.3);\n  }\n  20% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n  40% {\n    -webkit-transform: scale3d(0.9, 0.9, 0.9);\n    transform: scale3d(0.9, 0.9, 0.9);\n  }\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03, 1.03, 1.03);\n    transform: scale3d(1.03, 1.03, 1.03);\n  }\n  80% {\n    -webkit-transform: scale3d(0.97, 0.97, 0.97);\n    transform: scale3d(0.97, 0.97, 0.97);\n  }\n  to {\n    opacity: 1;\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n@-webkit-keyframes shake {\n  0%,\n  100% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n  10%,\n  30%,\n  50%,\n  70%,\n  90% {\n    -webkit-transform: translateX(-10px);\n    transform: translateX(-10px);\n  }\n  20%,\n  40%,\n  60%,\n  80% {\n    -webkit-transform: translateX(10px);\n    transform: translateX(10px);\n  }\n}\n@keyframes shake {\n  0%,\n  100% {\n    -webkit-transform: translateX(0);\n    -ms-transform: translateX(0);\n    transform: translateX(0);\n  }\n  10%,\n  30%,\n  50%,\n  70%,\n  90% {\n    -webkit-transform: translateX(-10px);\n    -ms-transform: translateX(-10px);\n    transform: translateX(-10px);\n  }\n  20%,\n  40%,\n  60%,\n  80% {\n    -webkit-transform: translateX(10px);\n    -ms-transform: translateX(10px);\n    transform: translateX(10px);\n  }\n}\n.eui_dialog_animate {\n  -webkit-animation-duration: 0.25s;\n  animation-duration: 0.25s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n}\n.eui_dialog_animate.zoomIn {\n  -webkit-animation-name: zoomIn;\n  animation-name: zoomIn;\n}\n.eui_dialog_animate.bounceIn {\n  -webkit-animation-name: bounceIn;\n  animation-name: bounceIn;\n}\n.eui_dialog_animate.shake {\n  -webkit-animation-duration: 0.3s;\n  animation-duration: 0.3s;\n  -webkit-animation-name: shake;\n  animation-name: shake;\n}\n"

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = ".eui_dialog_default_wrap {\n  visibility: visible;\n}\n.eui_dialog_default_wrap * {\n  outline: none;\n  box-sizing: border-box;\n}\n.eui_dialog_default_wrap.hide {\n  display: none;\n}\n.eui_dialog_default_wrap .left {\n  float: left;\n}\n.eui_dialog_default_wrap .right {\n  float: right;\n}\n.eui_dialog_default_wrap .cl {\n  clear: both;\n  overflow: hidden;\n  *zoom: 1;\n}\n.eui_dialog_default_wrap .cl:after {\n  content: \" \";\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.eui_dialog_default_wrap .eui_dialog_default {\n  position: fixed;\n  min-width: 200px;\n  background: #ffffff;\n  margin-left: -100px;\n  left: 50%;\n  top: 50%;\n  box-shadow: 2px 2px 10px #bbb;\n}\n.eui_dialog_default_wrap .eui_dialog_default_header {\n  height: 35px;\n  padding: 2px 10px;\n  background: #F1F1F1;\n  color: #666666;\n}\n.eui_dialog_default_wrap .eui_dialog_default_header > span {\n  display: inline-block;\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  width: 90%;\n}\n.eui_dialog_default_wrap .eui_dialog_default_header .eui_dialog_default_title {\n  line-height: 31px;\n  overflow: hidden;\n}\n.eui_dialog_default_wrap .eui_dialog_default_ops {\n  height: 35px;\n  position: absolute;\n  right: 10px;\n  top: 0;\n}\n.eui_dialog_default_wrap .eui_dialog_default_ops > a {\n  color: #2d2c3b;\n  display: inline-block;\n  text-decoration: none;\n  text-align: center;\n  margin: 5px 0 5px 5px;\n  height: 25px;\n  line-height: 25px;\n}\n.eui_dialog_default_wrap .eui_dialog_default_ops .eui_dialog_default_ops_close {\n  width: 20px;\n}\n.eui_dialog_default_wrap .eui_dialog_default_ops .eui_dialog_default_ops_close:hover {\n  color: #999;\n}\n.eui_dialog_default_wrap .eui_dialog_default_content {\n  padding: 20px;\n  word-break: break-all;\n  overflow: hidden;\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.eui_dialog_default_wrap .eui_dialog_default_action {\n  height: 40px;\n  padding: 0 10px 10px 10px;\n  text-align: right;\n}\n.eui_dialog_default_wrap .eui_dialog_default_action > button {\n  font-size: 14px;\n  color: #888;\n  min-width: 60px;\n  height: 30px;\n  border: none;\n  background: #F1F1F1;\n  margin-left: 5px;\n  cursor: pointer;\n  transition: background 0.2s;\n  border: 1px solid #DDDDDD;\n}\n.eui_dialog_default_wrap .eui_dialog_default_action > button:hover {\n  opacity: 0.9;\n  box-shadow: 2px 2px 4px #F1F1F1;\n}\n.eui_dialog_default_wrap .eui_dialog_default_action > button:first-child {\n  background: #118DF0;\n  color: #fff;\n  border: none;\n}\n.eui_dialog_default_wrap .eui_dialog_default_mask {\n  position: fixed;\n  background: rgba(0, 0, 0, 0.2);\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n"

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = function(node, value) {
	  var text = (node.textContent !== undefined ?
	    'textContent' : 'innerText'
	  )
	
	  if (typeof value != 'undefined') {
	    node[text] = value
	  }
	
	  return node[text]
	}


/***/ },
/* 49 */
/***/ function(module, exports) {

	
	/**
	 * Expose `toNoCase`.
	 */
	
	module.exports = toNoCase;
	
	
	/**
	 * Test whether a string is camel-case.
	 */
	
	var hasSpace = /\s/;
	var hasCamel = /[a-z][A-Z]/;
	var hasSeparator = /[\W_]/;
	
	
	/**
	 * Remove any starting case from a `string`, like camel or snake, but keep
	 * spaces and punctuation that may be important otherwise.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	
	function toNoCase (string) {
	  if (hasSpace.test(string)) return string.toLowerCase();
	
	  if (hasSeparator.test(string)) string = unseparate(string);
	  if (hasCamel.test(string)) string = uncamelize(string);
	  return string.toLowerCase();
	}
	
	
	/**
	 * Separator splitter.
	 */
	
	var separatorSplitter = /[\W_]+(.|$)/g;
	
	
	/**
	 * Un-separate a `string`.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	
	function unseparate (string) {
	  return string.replace(separatorSplitter, function (m, next) {
	    return next ? ' ' + next : '';
	  });
	}
	
	
	/**
	 * Camelcase splitter.
	 */
	
	var camelSplitter = /(.)([A-Z]+)/g;
	
	
	/**
	 * Un-camelcase a `string`.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	
	function uncamelize (string) {
	  return string.replace(camelSplitter, function (m, previous, uppers) {
	    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
	  });
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	
	var clean = __webpack_require__(49);
	
	
	/**
	 * Expose `toSpaceCase`.
	 */
	
	module.exports = toSpaceCase;
	
	
	/**
	 * Convert a `string` to space case.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	
	
	function toSpaceCase (string) {
	  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
	    return match ? ' ' + match : '';
	  });
	}

/***/ },
/* 51 */
/***/ function(module, exports) {

	
	exports = module.exports = trim;
	
	function trim(str){
	  return str.replace(/^\s*|\s*$/g, '');
	}
	
	exports.left = function(str){
	  return str.replace(/^\s*/, '');
	};
	
	exports.right = function(str){
	  return str.replace(/\s*$/, '');
	};


/***/ },
/* 52 */
/***/ function(module, exports) {

	
	/**
	 * Check if `el` is within the document.
	 *
	 * @param {Element} el
	 * @return {Boolean}
	 * @api private
	 */
	
	module.exports = function(el) {
	  var node = el;
	  while (node = node.parentNode) {
	    if (node == document) return true;
	  }
	  return false;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * dependencies
	 */
	
	var matches = __webpack_require__(19);
	
	/**
	 * Traverse with the given `el`, `selector` and `len`.
	 *
	 * @param {String} type
	 * @param {Element} el
	 * @param {String} selector
	 * @param {Number} len
	 * @return {Array}
	 * @api public
	 */
	
	module.exports = function(type, el, selector, len){
	  var el = el[type]
	    , n = len || 1
	    , ret = [];
	
	  if (!el) return ret;
	
	  do {
	    if (n == ret.length) break;
	    if (1 != el.nodeType) continue;
	    if (matches(el, selector)) ret.push(el);
	    if (!selector) ret.push(el);
	  } while (el = el[type]);
	
	  return ret;
	}


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./animate": 5,
		"./animate.less": 5,
		"./default": 6,
		"./default.less": 6,
		"./default.tpl": 20
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 54;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./default.tpl": 20
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 55;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map