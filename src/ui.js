/**
 * @start UI
 */
function Table(){
	this.html = $('<button class="ui button" id="change">Change</button><button class="ui button" id="toggle">Toggle All</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"></div><table id="1231231231" class="ui compact celled definition table"><thead><tr><th>Change</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Due Date</th><th>Path</th></tr></thead><tbody></tbody></table>');
	this.topics = [];
}

/**
 * @name  Table.draw
 * @todo
 *  - Toggle on / off
 */
Table.prototype.draw = function(){
	$('body').find('#1231231231').remove();
	$('body').append(this.html);
	$('table').tablesort().find('th').css({
		cursor: 'pointer',
		textDecoration: 'underline'
	});
	$('body').append('<style>th.sorted.ascending:after{content:"  \\2191"}th.sorted.descending:after{content:" \\2193"}</style>');

	var _this = this;
	$('.change').on('change', function(){
		var val = $(this).val();
		_this.single($(this).attr('idx'), val);
	})

	$('#change').click(function(){
		_this.all(_this.topics);
	});

	$('#toggle').click(function(){
		var total = 0;
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].change){
				total++;
			}
		}
		var on = (total / _this.topics.length < 1 || total == 0);
		for (var i = 0; i < _this.topics.length; i++){
			_this.topics[i].change = on;
			$('[idx=' + _this.topics[i].idx + ']')[0].checked = on;
		}
	});

	$('.changeDate').picker();
}

/**
 * @Table.change
 * @todo
 *  + Set the callbacks to a local public variable
 */
Table.prototype.change = function(single, all){
	this.single = single;
	this.all = all;
}

Table.prototype.addRow = function(topic, idx){
	this.topics.push(topic);
	topic.idx = idx;
	var tmp = this.html.find('tbody').append('<tr id="tmp"></tr>').find('#tmp').removeAttr('id');
	$(tmp).prop('topic', topic);
	topic.ele = tmp[0];
	$(tmp).append('<td class=collapsing><div class="ui fitted slider checkbox"><input type="checkbox" class="change" idx="' + idx + '" ' + (topic.change ? 'checked' : '') + '><label></label></div></td>');
	$(tmp).append('<td>' + topic.title + '</td>');
	//$(tmp).append('<td>' + (topic.isModule ? 'Module' : 'Topic') + '</td>');
	if (topic.start) $(tmp).append('<td class="changeDate">' + moment(topic.start).local('en').format('MMM DD YYYY') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.end) $(tmp).append('<td class="changeDate">' + moment(topic.end).local('en').format('MMM DD YYYY') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.duedate) $(tmp).append('<td class="changeDate">' + moment(topic.duedate).local('en').format('MMM DD YYYY') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	$(tmp).append('<td class="changeDate">' + topic.path + '</td>');
}

function Loading(){
	this.html = $('<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader">Preparing Files</div></div><p></p></div>');
}

Loading.prototype.start = function(){
	this.stop();
	$('body').append(this.html);
	$('#loader').css({
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	})
}

Loading.prototype.stop = function(){
	$('#loader').remove();
}

var UI = {
	alert: function(msg){
		var html = $('<div class="ui modal" id="modal"><i class="close icon"></i><div class=header>' + msg + '</div><div class=actions><div class="ui positive right labeled icon button">Ok <i class="checkmark icon"></i></div></div></div>');
		$('body').append(html);
		$('#modal').modal('toggle', function(){
			$('#modal').remove();
		}).modal('show');
	}
}

/**
 * @end
 */