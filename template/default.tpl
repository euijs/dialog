<div class='[:=theme:]_wrap [:=instance_id:] hide' id='[:=instance_id:]'>
	<div class='[:=theme:]_mask J_mask'></div>
	<div class='[:=theme:] J_container eui_dialog_animate' id='test' style='position: [:=fixed:];'>
		<div class='[:=theme:]_header'>
			[: if ( title !== false ) { :]
				<span class="[:=theme:]_title">[:=title:]</span>
			[: } :]
		</div>
		<div class="[:=theme:]_ops">
			<a class="[:=theme:]_ops_close J_close" href="javascript:;"></a>
		</div>
		<div class='[:=theme:]_content J_content' style='padding: [:=padding:];'>[:=content:]</div>
		<div class='[:=theme:]_action'>
			[: for( var i = 0 , l = buttons.length; i < l; i++ ){ :]
				<button class='J_action' type='button' name='button' data-index='[:=i:]'>[:= buttons[i] :]</button>
			[: } :]
		</div>
	</div>
</div>
