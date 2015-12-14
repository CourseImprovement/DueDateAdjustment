 /*
 * @start object Topic
 * @name  Topic
 */
function Topic(obj, topics){
  this.obj = obj;
  this.topics = topics;
  this.isModule = (this.obj.Type == '0' ? true : false);
  this.start = this.isModule ? this.obj.ModuleStartDate : this.obj.StartDate;
  this.end = this.isModule ? this.obj.ModuleEndDate : this.obj.EndDate;
  this.duedate = this.isModule ? this.obj.ModuleDueDate : this.obj.DueDate;
  this.title = this.obj.Title;
  this.change = false;
  this.notImplementedYet = false;
  this.post = false;
  this.path = this.obj.path;

  this.type = (function(o){
      if (o.Title.indexOf("&type=") > -1){
      var split = o.Title.split('&type=')[1];
      var type = split.split('&')[0];
      return type;
  }
  else{
      switch (o.TopicType){
          case 1: return 'file';
          case 3: return 'link';
      }
  }
  })(this.obj);

  if (this.type == undefined) this.type = 'module';

  this._id = (this.obj.Id ? this.obj.Id : this.obj.TopicId);

  /**
   * Dateify the objects
   */
  this.keep = false;
  if (this.start) this.start = new Date(this.start);
  if (this.end) this.end = new Date(this.end);
  if (this.duedate) this.duedate = new Date(this.duedate);
  if (this.start || this.end || this.duedate) this.keep = true;
}

/**
 * @name  Topic.setOffset
 * @todo
 *  + Change the start date
 *  + Change the duedate
 *  + Change the end date
 *  + Verify the date changes
 */
Topic.prototype.setOffset = function(amount, type){
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
}

/**
 * @name  Topic.setChecked
 * @todo
 *  + Set the checkmark
 */
Topic.prototype.setChecked = function(val){
  $(this.ele).find('.change')[0].checked = val;
  this.change = val;
}

/**
 * @name Topic.offsetByCal
 * @todo
 *  + offset the date by day, month, year
 */
Topic.prototype.offsetByCal = function(cal, type){

  var _this = this;
  function difference(date1, date2){
    var timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  }

  var selectedDate = null;
  var toDate = new Date(cal.year, cal.month, cal.day);

  selectedDate = this[type];

  if (selectedDate == undefined || selectedDate == null){
    switch (type){
      case 'start': this.setStart(toDate); break;
      case 'end': this.setEnd(toDate); break;
      case 'duedate': this.setDueDate(toDate); break;
    }
  }
  else{
    var offset = difference(selectedDate, toDate);
    this.setOffset(offset, type);
  }
  this.setChecked(true);
}

/**
 * @description Set the start date
 * @name  Topic.setStart
 *  + set the start date
 */
Topic.prototype.setStart = function(date){
    this.start = date;
}

/**
 * @description Set the end date
 * @name Topic.setEnd
 *  + set the end date
 */
Topic.prototype.setEnd = function(date){
    this.end = date;
}

/**
 * @description Set the due date
 * @name  Topic.setDueDate
 * @todo
 *  + Set the duedate
 */
Topic.prototype.setDueDate = function(date){
    this.duedate = date;
}

/**
 * @description Checks if the topic has date
 */
Topic.prototype.hasDates = function(){
    return this.start != undefined ||
           this.end != undefined ||
           this.duedate != undefined;
}

/**
 * @name  Topic.save
 * @todo 
 *  + Generate the appropriate post data
 *  + Post the data
 */
Topic.prototype.save = function(afterSaveCallback){

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
      obj.requestId = topic.topics.requestId++;
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
      obj.requestId = topic.topics.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.getUrlType
   * @todo
   *  + Set all the d2l variables
   */
  function getUrlType(obj){
      switch (obj.type){
          case 'survey': return 'Survey';
          case 'file': return 'ContentFile';
          case 'dropbox': return 'Dropbox';
          case 'link': return 'ContentLink';
          case 'quiz': return 'quiz';
          default: return obj.type;
      }
  }

  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   *  + Set the url to the Topic
   */
  function createCallUrl(obj, topic){
    if (topic.isModule || topic.type == 'checklist') topic.notImplementedYet = true;;
    var type = getUrlType(topic);
    var url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._id + '/UpdateRestrictions?topicId=' + topic._id;
    topic.url = url;
  }

  var result = {};
  createDateProperties(result, this.start, 'StartDate');
  createDateProperties(result, this.end, 'EndDate');
  createDateProperties(result, this.duedate, 'DueDate');
  if (this.isModule) createModuleProperties(result, this);
  else createTopicProperties(result, this);
  createCallUrl(result, this);

  if (this.notImplementedYet) return;

  console.log(result);
  $.post(this.url, result, function(data){}).always(function(){
    afterSaveCallback();
  });

}
/**
 * @end
 