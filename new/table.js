function Table(items){
	this.html = $('<button class="ui button green" id="change">Submit</button><button class="ui button" id="OffsetDates">Set Offset</button><button class="ui button" id="toggle">Toggle All</button><button class="ui button" id="toggleAllWithDates">Toggle All With Dates</button><button class="ui button red" id="ClearDates">Clear Dates</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"><input placeholder="Filter..." id="filter"></div><table id="1231231231" class="ui compact celled definition table striped"><thead><tr><th>Change</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Due Date</th><th>Path</th><th>Type</th></tr></thead><tbody></tbody></table>');
	this.items = items;
	this.topics = [];
}

Table.prototype.draw = function(){
	$('body').find('#1231231231').remove();
	$('body').append(this.html);

	for (var i = 0; i < items.items.length; i++){
		this.addRow(items.items[i]);
	}
	var _this = this;
	
	$('table').tablesort().find('th').css({
		cursor: 'pointer',
		textDecoration: 'underline'
	});
	$('body').append('<style>.nyi:after{content:"Not Yet Implemented";color: white;text-align:center;width:100%;background-color:rgba(0, 0, 0, 0.65);display:block;position:absolute;left:0;}#top{top: 48px !important;}.ui.modal{top:1% !important;}th.sorted.ascending:after{content:"  \\2191"}th.sorted.descending:after{content:" \\2193"} .picker-hidden{display:none;}.filter-table .quick{margin-left:.5em;font-size:.8em;text-decoration:none}.fitler-table .quick:hover{text-decoration:underline}td.alt{background-color:#ffc;background-color:rgba(255,255,0,.2)}</style>');

	var _this = this;
	$('.change').on('change', function(){
		var val = $(this).val();
		$(this).parents('tr').prop('topic').change = Boolean(val);
	})

	$('#change').click(function(){
		items.loading.start(true);
		items.changeSelected();
	});

	$('#OffsetDates').click(function(){
		var amount = $('#offset').val();
		items.offsetDates(parseInt(amount));
	});

	$('#ClearDates').click(function(){
		UI.prompt('Password', function(val){
			var input = '';
			for (i=0; i < val.length; i++) {
	     	input +=val[i].charCodeAt(0).toString(2) + " ";
	    }
			if (input == '1000011 1001001 1000100 1100001 1110100 1100101 1110011 '){
				window.items.clearDates();
			}
		})
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

	$('#1231231231').filterTable({
		inputSelector: '#filter',
		callback: function(term, tbl){
			_this.topics = [];
			$(tbl).find('tr:not(:has(>th))').each(function(){
				if ($(this).hasClass('visible') && this.topic) _this.topics.push(this.topic);
			})
		}
	});
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
	$(tmp).append('<td>' + topic.name + '</td>');
	//$(tmp).append('<td>' + (topic.isModule ? 'Module' : 'Topic') + '</td>');
	if (topic.start) $(tmp).append('<td class="changeDate">' + moment(topic.start).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.end) $(tmp).append('<td class="changeDate">' + moment(topic.end).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.due) $(tmp).append('<td class="changeDate">' + moment(topic.due).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	$(tmp).append('<td>' + topic.path + '</td>');
	$(tmp).append('<td>' + topic.itemType + '</td>');
	$(tmp).find('.change').change(function(e){
		var val = $(this).val() == 'on';
		topic.post = val;
		topic.change = val;
	});
	topic.setEditable();
}