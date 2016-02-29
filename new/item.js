function Item(items){
	this.isTopic = false;
	this.isModule = false;
	this.isContentItem = false;
	this.raw = null;
	this.due = null;
	this.start = null;
	this.end = null;	
	this.itemType = "";
	this.name = '';
	this.isEditable = true;
	this.path = '';
	this.ele = null;
	this.post = false;
	this.callType = null;
	this.isTool = false;
	this.items = items;
}

Item.prototype.getType = function(){
	if (this.isModule) return 'Module';

	var type = (function(o){
    if (o.Url && o.Url.indexOf('&type=') > -1){
      var split = o.Url.split('&type=')[1];
      var type = split.split('&')[0];
      return type;
    }
    else{
      switch (o.TopicType){
        case 1: return 'file';
        case 3: return 'link';
      }
    }
  })(this.raw);

  function getInternalType(t){
  	switch (t){
	      case 'survey': return 'Survey';
	      case 'file': return 'ContentFile';
	      case 'dropbox': return 'Dropbox';
	      case 'link': return 'ContentLink';
	      case 'quiz': return 'Quiz';
	      case 'discuss': return 'DiscussionTopic';
	      default: return false;
	  }
  }

  var t = getInternalType(type);
  if (!t) return getInternalType(this.itemType);
  return t;
}

Item.prototype.error = function(){
	$(this.ele).css({backgroundColor: 'rgba(219, 40, 40, 0.35)'});
  if (this.issueWithDates()){
    $(this.ele).find('td:nth-child(3)').css({backgroundColor: 'rgba(219, 40, 40, 0.34)'});
    loading.stop();
  }
}

Item.prototype.issueWithDates = function(){
	return ((this.end && this.start) && this.start > this.end) || ((this.start && this.duedate) && this.start > this.duedate);
}

Item.prototype.clearDates = function(){
	this.start = null;
	this.end = null;
	this.due = null;
	this.render();
}

Item.prototype.setChecked = function(val){
	$(this.ele).find('.change')[0].checked = val;
  this.post = val;
  this.change = val;
}

Item.prototype.setDate = function(type, date){
  switch (type){
    case 'start': this.start = date; break;
    case 'end': this.end = date; break;
    case 'duedate': this.due = date; break;
  }
  this.setChecked(true);
}

Item.prototype.hasDates = function(){
	return this.start || this.end || this.due;
}

Item.prototype.render = function(){
	if (this.start) $(this.ele).find('td:nth-child(3)').html(moment(this.start).local('en').format('MMM DD YYYY hh:mm a'));
	if (this.end) $(this.ele).find('td:nth-child(4)').html(moment(this.end).local('en').format('MMM DD YYYY hh:mm a'));
	if (this.due) $(this.ele).find('td:nth-child(5)').html(moment(this.due).local('en').format('MMM DD YYYY hh:mm a'));
}

Item.prototype.offsetDates = function(amount, type){
	if (!this.hasDates()) return;
  if (!type){
    if (this.start) this.start.setDate(this.start.getDate() + amount);
    if (this.end) this.end.setDate(this.end.getDate() + amount);
    if (this.duedate) this.duedate.setDate(this.duedate.getDate() + amount);
  }
  else{
    this[type] = new Date(this[type].setDate(this[type].getDate() + amount));
  }
  this.post = true;
  this.render();
}

Item.prototype.getId = function(){
	if (this.raw.Id) return this.raw.Id;
	if (this.raw.ModuleId) return this.raw.ModuleId;
	if (this.raw.ForumId) return this.raw.ForumId;
	if (this.raw.TopicId) return this.raw.TopicId;
	if (this.raw.id) return this.raw.id;
	console.log(this.raw);
}

Item.prototype.setEditable = function(val){
	this.isEditable = val;
}

Item.prototype._setObject = function(obj, type, isContentType){
	this.raw = obj;
	this.isContentItem = isContentType;
	this.isTopic = type == 'top';
	this.isModule = type == 'mod';
	this.itemType = type + '';
	this.itemType = this.itemType == 'top' ? 'Content Topic' : this.itemType;
	this.itemType = this.itemType == 'mod' ? 'Content Module' : this.itemType;
	this.name = this.raw.Name ? this.raw.Name : this.raw.Title;
	this._setDates();
}

Item.prototype._setDates = function(){
	if (this.isModule){
		this.due = this.raw.ModuleDueDate ? new Date(this.raw.ModuleDueDate) : null;
		this.start = this.raw.ModuleStartDate ? new Date(this.raw.ModuleStartDate) : null;
		this.end = this.raw.ModuleEndDate ? new Date(this.raw.ModuleEndDate) : null;
	}
	if (this.isTopic){
		this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
		this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
		this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
	}
	if (!this.isContentItem){
		switch (this.itemType){
			case 'dropbox': {
				this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
				if (!this.raw.Availability){
					this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
					this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				}
				else{
					this.start = this.raw.Availability.StartDate ? new Date(this.raw.Availability.StartDate) : null;
					this.end = this.raw.Availability.EndDate ? new Date(this.raw.Availability.EndDate) : null;
				}
				break;
			}
			case 'quiz': case 'survey': {
				this.start = this.raw.start;
				this.end = this.raw.end;
				this.name = this.raw.name;
				break;
			}
			case 'checklist': {

				break;
			}
			case 'discussion-forum': {
				this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
				this.postStartDate = this.raw.PostStartDate ? new Date(this.raw.PostStartDate) : null;
				this.postEndDate = this.raw.PostEndDate ? new Date(this.raw.PostEndDate) : null;
				break;
			}
			case 'discussion-topic': {
				this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
				this.unlockStartDate = this.raw.UnlockStartDate ? new Date(this.raw.UnlockStartDate) : null;
				this.unlockEndDate = this.raw.UnlockEndDate ? new Date(this.raw.UnlockEndDate) : null;
				break;
			}
		}
	}
}

Item.prototype.setOffset = function(amount, type){
	if (!this.hasDates()) return;
  if (!type){
    if (this.start) this.start.setDate(this.start.getDate() + amount);
    if (this.end) this.end.setDate(this.end.getDate() + amount);
    if (this.due) this.due.setDate(this.due.getDate() + amount);
  }
  else{
    this[type] = new Date(this[type].setDate(this[type].getDate() + amount));
  }
}

Item.prototype.offsetByCal = function(cal, type){
	var _this = this;
  function difference(date1, date2){
    var timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  }

  var selectedDate = null;
  var toDate = new Date(cal.year, cal.month, cal.day, cal.hour, cal.minutes, 0);

  selectedDate = this[type];

  if (selectedDate == undefined || selectedDate == null){
    this[type] = toDate;
  }
  else{
    var offset = difference(selectedDate, toDate);
    this.setOffset(offset, type);
    this[type].setHours(cal.hour);
    this[type].setMinutes(cal.minutes);
  }
  this.setChecked(true);
}

Item.prototype.save = function(callback){
	if (this.issueWithDates()) {
    this.error('Invalid Date Sequence');
    return;
  }
  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createDateProperties(obj, date, name){
    var hasDate = date != null;
    if (date == null) date = new Date();
    obj['Has' + name] = hasDate ? 'TRUE' : 'FALSE';
    var selector = name + 'Selector$';
    obj[selector + 'year'] = date.getFullYear();
    obj[selector + 'month'] = date.getMonth() == 12 ? 1 : date.getMonth() + 1;
    obj[selector + 'day'] = date.getDate();
    obj[selector + 'isEnabled'] = hasDate ? 1 : 0;
    obj[selector + 'hasTime'] = 1;
    obj[selector + 'time$hour'] = date.getHours();
    obj[selector + 'time$minute'] = date.getMinutes();
    obj[selector + 'time$isEnabled'] = hasDate ? 1 : 0;
  }

  /**
   * @name  Topic.save.createModuleProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createModuleProperties(obj, topic){
    obj.ShowEditControls = 'True';
    if (topic.change){
      obj.ConditionSetId = null;
      obj.ConditionSetId = null;
      obj.HasConditionSet = 'False';
      obj.ConditionSetOperatorId = 1;
      obj.isXhr = 'True';
      obj.requestId = topic.items.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.createTopicProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createTopicProperties(obj, topic){
    obj._d2l_prc$headingLevel =  2;
    obj._d2l_prc$scope = 'restrictions';
    obj._d2l_prc$hasActiveForm = 'FALSE';
    obj.ShowEditControls = 'TRUE';
    if (topic.change){
      obj.ConditionSetId = null;
      obj.HasConditionSet = 'FALSE';
      obj.ConditionSetOperatorId = 1;
      obj.isXhr = 'TRUE';
      obj.requestId = topic.items.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   *  + Set the url to the Topic
   */
  function createCallUrl(obj, topic){
    var url = '';
    if (topic.isModule){
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/module/' + topic.getId() + '/EditModuleRestrictions'
    } 
    else {
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + topic.getType() + '/' + topic.getId() + '/UpdateRestrictions?topicId=' + topic.getId();
    }
    topic.url = url;
  }

  var result = {};
  createDateProperties(result, this.start, 'StartDate');
  createDateProperties(result, this.end, 'EndDate');
  createDateProperties(result, this.duedate, 'DueDate');
  if (this.isModule) createModuleProperties(result, this);
  else createTopicProperties(result, this);
  createCallUrl(result, this);

  var _this = this;
  $.ajax({
    method: 'POST',
    url: this.url,
    data: result,
    success: function(data){},
    error: function(error){
      if (error.status >= 400) $(_this.ele).addClass('nyi');
    }
  }).always(function(){
    $(_this.ele).css({backgroundColor: ''});
    $(_this.ele).find('td:nth-child(3)').css({backgroundColor: ''});
    _this.setChecked(false);
    callback();
  });
}