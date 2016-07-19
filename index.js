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
var Events = require('./lib/events');
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
var Defaults = require('./lib/default');
/**
 * 全局配置
 * @function config
 * @static
 * @param  {object} defaults 默认配置项
 * @return {object}          Dialog
 */
Dialog.config = function(defaults){
	// 用户配置覆盖全局配置
	this.mixin(Defaults, defaults);
	return this;
};

// 将helper挂载到dialog的原型链上
fn._ =  require('./lib/helper');

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
