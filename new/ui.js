var UI = {
	initButton: function(){
		$('body').append('<div style="text-align:center;margin-top:30px;"><button class="ui button green large" id="start">Start</button></div>');
		$('#start').click(function(){
			$(this).parent().remove();
			window.items.start();
		});
	},
    alert: function(msg){
        var html = $('<div class="ui modal" id="modal"><i class="close icon"></i><div class=header>' + msg + '</div><div class=actions><div class="ui positive right labeled icon button">Ok <i class="checkmark icon"></i></div></div></div>');
        $('body').append(html);
        $('#modal').modal('toggle', function(){
            $('#modal').remove();
        }).modal('show');
    },
    prompt: function(msg, callback){
        var html = $('<div class="ui modal" id="modal"><i class="close icon"></i><div class=header>' + msg + '</div><div class="content"><div class="ui input" style="width:100%;"><input type="password" id="prompt_input" placeholder="Password"></div></div><div class=actions><div class="ui approve button">OK</div><div class="ui cancel button">Cancel</div></div></div>');
        $('body').append(html);
        $('#modal').modal('toggle', function(){
            $('#modal').remove();
        }).modal({
            onApprove: function(){
                var val = $('#prompt_input').val();
                callback(val);
                setTimeout(function(){
                    $('#modal').remove();
                }, 20);
            }
        }).modal('show');
    }
}

setTimeout(function(){
	UI.initButton();
}, 10);

function Loading(){
    this.top = '<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader" id="top">Preparing Files</div></div><p></p></div>';
    this.middle = '<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader">Preparing Files</div></div><p></p></div>';
}

Loading.prototype.start = function(top){
    this.stop();
    $('body').append((top ? this.top : this.middle));
    $('#loader').css({
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 999
    });
}

Loading.prototype.stop = function(){
    $('#loader').remove();
}

Loading.prototype.setText = function(val){
	$('.ui.indeterminate').text(val);
}