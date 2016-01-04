/**
 * @start UI
 */
function Table(){
	this.html = $('<button class="ui button green" id="change">Submit</button><button class="ui button" id="OffsetDates">Set Offset</button><button class="ui button" id="toggle">Toggle All</button><button class="ui button" id="toggleAllWithDates">Toggle All With Dates</button><button class="ui button red" id="ClearDates">Clear Dates</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"><input placeholder="Filter..." id="filter"></div><table id="1231231231" class="ui compact celled definition table striped"><thead><tr><th>Change</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Due Date</th><th>Path</th><th>Type</th></tr></thead><tbody></tbody></table>');
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
	$('body').append('<style>.ui.modal{top:4% !important;}th.sorted.ascending:after{content:"  \\2191"}th.sorted.descending:after{content:" \\2193"} .picker-hidden{display:none;}.filter-table .quick{margin-left:.5em;font-size:.8em;text-decoration:none}.fitler-table .quick:hover{text-decoration:underline}td.alt{background-color:#ffc;background-color:rgba(255,255,0,.2)}</style>');

	var _this = this;
	$('.change').on('change', function(){
		var val = $(this).val();
		_this.single($(this).attr('idx'), val);
	})

	$('#change').click(function(){
		topics.loading.start();
		_this.all(_this.topics);
	});

	$('#OffsetDates').click(function(){
		var amount = $('#offset').val();
		_this.offsetDates(parseInt(amount));
	});

	$('#ClearDates').click(function(){
		window.topics.clearDates();
	})

	$('#toggle').click(function(){
		var total = 0;
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].change){
				total++;
			}
		}
		var on = (total / _this.topics.length < 1 || total == 0);
		for (var i = 0; i < _this.topics.length; i++){
			_this.topics[i].setChecked(on);
		}
	});

	$('#toggleAllWithDates').click(function(){
		var total = 0;
		var len = 0;
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].hasDates()) len++;
			if (_this.topics[i].hasDates() && _this.topics[i].change){
				total++;
			}
		}
		var on = (total / len < 1 || total == 0);
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].hasDates()) _this.topics[i].setChecked(on);
		}
	})

	$('#1231231231').filterTable({inputSelector: '#filter'});
	$('.changeDate').picker();
}

/**
 * @name Table.offsetDates
 * @assign Chase
 * @todo
 *  + API call to the topics prototype function
 */
Table.prototype.offsetDates = function(amount){
	window.topics.uiOffsetActiveDates(amount);
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
	$(tmp).append('<td>' + topic.path + '</td>');
	$(tmp).append('<td>' + topic.type + '</td>');
	$(tmp).find('.change').change(function(e){
		var val = $(this).val() == 'on';
		topic.post = val;
		topic.change = val;
	})
}

function Loading(){
	this.html = '<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader">Preparing Files</div></div><p></p></div>';
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