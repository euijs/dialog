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
		buttons: [ '按钮1' , '按钮2' , '按钮3'],
		callback: function(index, button){
			[function(){
				console.debug('按钮1');
			},function(){
				console.debug('按钮2');
			},function(){
				console.debug('按钮3');
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

	var $btn1_3 = $('#btn1_3');
	$btn1_3.on('click', function (){
		var d3 = $dialog.open({
			modal: false,
			title: '温馨提示111',
			content: 'hello dialog2',
			buttons: [ '111' , '222' ],
			callback: function(index, button){
				if( index === 0 ){
					console.debug('111');
				} else {
					console.debug('222');
					return true;
				}
			}
		});
	});

	var $btn2 = $('#btn2');
	$btn2.on('click', function (){
		d2.setContent('hello eui dialog');
	});

	var $btn3 = $('#btn3');
	$btn3.on('click', function (){
		d1.destroy();
		delete d1;
	});

	var d4 = $dialog.open({
		modal: false,
		title: '温馨提示4',
		content: 'hello dialog2',
		buttons: [ '111' , '222' ],
		callback: function(index, button){
			if( index === 0 ){
				console.debug('111');
			} else {
				console.debug('222');
				return true;
			}
		}
	});

});
