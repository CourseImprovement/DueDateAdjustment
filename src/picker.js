$.fn.picker = function(params){
	var eles = $(this);

	function normalizeMonth(month){
		if (month == 12) return 1;
		return month + 1;
	}

	function backOne(date){
		var month = date.getMonth();
		var year = date.getFullYear();
		var day = date.getDate();

		if (month == 0){
			month = 11;
			year = year - 1;
		}
		else month--;
		return new Date(year, month, day);
	}

	function forwardOne(date){
		var month = date.getMonth();
		var year = date.getFullYear();
		var day = date.getDate();

		if (month == 11){
			month = 0;
			year = year + 1;
		}
		else month++
		return new Date(year, month, day);
	}

	function daysInMonth(month,year) {
		return new Date(year, normalizeMonth(month), 0).getDate();
	}

	function startMonthIdx(month, year){
		return new Date(year, month, 1).getDay();
	}

	function bodyClick(e){
		if ($(this).hasClass('changeDate')) return false;
		$('.picker-table').remove();
	}

	function Calendar(){
		this.ele = null;
		this.table = null;
		this.selectedDay = new Date();
	}

	Calendar.prototype.render = function(x, y){
		$('.picker-table').remove();
		this.raw = '<div class="picker-table"><table class="ui celled striped table"><thead><tr class="picker-dayNames"></tr></thead><tbody></tbody></table></div>';
		this.table = $(this.raw);
		if ($('.picker-table-style').length == 0){
			var style = '*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.picker-table{position:absolute;-webkit-box-shadow:0 0 16px rgba(0,0,14,.77);-moz-box-shadow:0 0 16px rgba(0,0,14,.77);box-shadow:0 0 16px rgba(0,0,14,.77);left:10px;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;background-color:#fff;width:327px}.picker-table .picker-header{padding-top:10px}.picker-table td,.picker-table th{text-align:center!important}.picker-table td:hover{background-color:#3B69A8;cursor:pointer;color:#fff}.picker-table td.selected{background-color:rgba(59,105,168,.46)}';
			$('head').append('<style class="picker-table-style">' + style + '</style>');
		}
		this.x = x;
		this.y = y;
		this.setHeader();
		this.setNames();
		this.setDays();
		$(this.table).css({
			left: (x - 225) + 'px',
			top: y + 'px'
		});

		$('body').unbind('click', bodyClick);
		$('body').append(this.table);
		$(this.table).click(function(e){
		    e.stopPropagation();
		});

		var _this = this;		
		$('.picker-back').click(function(){
			_this.selectedDay = backOne(_this.selectedDay);
			_this.render(_this.x, _this.y);
		});
		$('.picker-forward').click(function(){
			_this.selectedDay = forwardOne(_this.selectedDay);
			_this.render(_this.x, _this.y);
		});
		$('.day').click(function(){
			if ($(this).html() == "&nbsp;") return false;
			var cal = this.cal;
			var topic = $(_this.ele).parents('tr').prop('topic');
			var idx = $(_this.ele).index();
			var type = '';
			switch (idx){
				case 2: {type = 'start'; break;}
				case 3: {type = 'end'; break;}
				case 4: {type = 'duedate'; break;}
			}
			$('.picker-table').remove();
			topic.offsetByCal(cal, type);
			$(_this.ele).html(moment(topic[type]).local('en').format('MMM DD YYYY')); 
		});

		setTimeout(function(){
			$('body').bind('click', bodyClick);
		}, 10);
	}

	Calendar.prototype.setHeader = function(){
		var grid = $(this.table).prepend('<div class="ui center aligned grid picker-header" id="tmp"></div>').find('#tmp').removeAttr('id');
		grid.append('<div class="left floated left aligned four wide column"><a class="ui button picker-back" style="padding: 4px 20px"><</a></div>');
		var html = '<div class="eight wide column">';
		html += '<a href="#" style="padding: 4px 7px">' + moment(this.selectedDay).format('MMMM') + '</a>';
		html += '<a href="#" style="padding: 4px 7px">' + this.selectedDay.getFullYear() + '</a>';
		html += '</div>';
		grid.append(html);
		grid.append('<div class="right floated right aligned four wide column"><a class="ui button picker-forward" style="padding: 4px 20px; margin: 0;">></a></div>');
	}

	Calendar.prototype.setNames = function(){
		var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		for (var i = 0; i < days.length; i++) this.table.find('.picker-dayNames').append('<th>' + days[i] + '</th>');
	}

	Calendar.prototype.setDays = function(){
		var body = $(this.table).find('tbody');
		var selectedDayNumber = this.selectedDay.getDate();
		var totalDays = daysInMonth(this.selectedDay.getMonth(), this.selectedDay.getFullYear());
		var startIdx = startMonthIdx(this.selectedDay.getMonth(), this.selectedDay.getFullYear());

		var days = [];
		var row = 0;
		var col = 0;
		// set first
		if (startIdx > 0){
			for (var i = 0; i < startIdx; i++){
				if (!days[row]) days[row] = [];
				days[row][col++] = -1;
				if (col % 7 == 0){
					row++;
					col = 0;
					days[row] = [];
				}
			}
		}

		for (var i = 1; i <= totalDays; i++){
			if (!days[row]) days[row] = [];
			days[row][col++] = i;
			if (col % 7 == 0){
				row++;
				col = 0;
				days[row] = [];
			}
		}

		// last row
		if (days[row].length > 0 || days[row].length < 7){
			for (var i = days[row].length; i < 7; i++){
				if (!days[row]) days[row] = [];
				days[row][col++] = -1;
				if (col % 7 == 0){
					row++;
					col = 0;
				}
			}
		}

		var _this = this;
		for (var i = 0; i < days.length; i++){
			var row = $(body).append('<tr id="tmp"></tr>').find('#tmp').removeAttr('id');
			var allEmpty = 0;
			for (var j = 0; j < days[i].length; j++){
				var d = days[i][j]
				if (d == -1) {
					d = '&nbsp;';
					allEmpty++;
				}
				$(row).append('<td class="day" id="tmp">' + d + '</td>').find('#tmp').removeAttr('id').prop('cal', {
					day: d,
					month: _this.selectedDay.getMonth(),
					year: _this.selectedDay.getFullYear()
				});
			}
			if (allEmpty == 7) $(row).remove();
		}

	}

	Calendar.prototype.show = function(e){
		if ($(this).html().length > 0) this.cal.selectedDay = new Date($(this).html());
		else this.cal.selectedDay = new Date();
		this.cal.render(e.clientX, e.clientY);
	}

	eles.each(function(){
		$(this).prop('cal', new Calendar());
		$(this).click(this.cal.show);
		this.cal.ele = this;
	});
}