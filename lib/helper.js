var dom = require('component-dom');

var _ = {

	// 模板渲染引擎
	tpl: require('./tpl').tpl,

	/**
	 * 载入模板并与数据合并，生成HTML
	 * @private
	 * @param  {string} name 模板名称
	 * @param  {object} data 数据
	 * @return {string}      合并后的HTML
	 */
	loadTpl: function (name, data){
		var tpl = require('../template/'+name+'.tpl');
		var html = this.tpl(tpl, data);
		// base style
		require('../template/'+name+'.less');
		// animate style
		require('../template/animate.less');
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
