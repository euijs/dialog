$(function(){

	$dialog.config({
		title: 'hi',
		modal: true
	});

	var d1 = new $dialog({
		lock: true,
		modal: false,
		title: '温馨提示',
		content: '<span class="ui-dialog-loading">Loading..</span>',
		buttons: [ '确定支付' , '取消支付' , '放弃付款'],
		callback: function(index, button){
			[function(){
				console.debug('确定支付');
			},function(){
				console.debug('取消支付');
			},function(){
				console.debug('放弃付款');
			}][index]();
		}
	});

	var d2 = new $dialog({
		modal: false,
		title: '温馨提示',
		content: 'hello dialog2',
		buttons: [ '确定2' , '取消' ],
		callback: function(index, button){
			if( index === 0 ){
				console.debug('确定2');
			} else {
				console.debug('取消')
				return true;
			}
		}
	});

	var d3 = new $dialog({
		modal: false,
		title: '温馨提示',
		content: 'hello dialog3',
		buttons: [ '确定3' , '取消' ],
		callback: function(index, button){
			console.debug('你点击了下标为:'+index+'的按钮,	此按钮文字为：'+button);
		}
	});

	var $btn1 = $('#btn1');
	$btn1.on('click', function (){
		d1.show();
	});

	var $btn1_1 = $('#btn1_1');
	$btn1_1.on('click', function (){
		d2.show();
	});

	var $btn1_2 = $('#btn1_2');
	$btn1_2.on('click', function (){
		d3.show();
	});

	var $btn2 = $('#btn2');
	$btn2.on('click', function (){
		d2.setContent('hello eui dialog');
	});

});
