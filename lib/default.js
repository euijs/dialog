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
