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
  this.post = false;
  this.path = this.obj.path;
  this.type = (function(o){
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
  })(this.obj);

  this.isContentPage = true;

  if (this.type == undefined) this.type = 'module';

  this._id = (this.obj.Id ? this.obj.Id : this.obj.TopicId);

  // if (this.type == 'dropbox'){
  //   var dropbox = topics.getDropboxByName(this.title);
  //   if (dropbox.Availability && dropbox.Availability.StartDate) this.start = dropbox.Availability.StartDate;
  //   if (dropbox.Availability && dropbox.Availability.EndDate) this.end = dropbox.Availability.EndDate;
  //   this._dropboxId = dropbox.Id;
  // }
  // else if (this.type == 'quiz'){
  //   var quiz = topics.getQuizByName(this.title);
  //   this._quizId = quiz.id;
  //   this.start = quiz.start;
  //   this.end = quiz.end;
  // }
  // else if (this.type == 'survey'){
  //   var survey = topics.getSurveyByName(this.title);
  //   this._surveyId = survey.id;
  //   this.start = survey.start;
  //   this.end = survey.end;
  // }
  // else if (this.type == 'discuss'){
  //   var discuss = topics.getDiscussionByName(this.title);
  //   this._discussId = discuss.id;
  //   this.start = discuss.start;
  //   this.end = discuss.end;
  // }
  // else if (this.type == 'checklist'){
  //   var check = topics.getChecklistByName(this.title);
  //   this._checklistId = check.id;
  // }

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

Topic.prototype.isEditable = function(){
  return this.type.indexOf(' tool') == -1;
}

Topic.prototype.setEditable = function(){
  var isEditable = this.isEditable();
  if (!isEditable) {
    $(this.ele).find('.checkbox').addClass('disabled');
    $(this.ele).css('background-color', 'rgba(12, 15, 41, 0.59)');
    $(this.ele).addClass('nyi');
  }
}

/**
 * @name  Topic.draw
 * @description UPdate the dates
 * @todo
 *  + Update the dates (Chase)
 */
Topic.prototype.draw = function(){
  if (this.start) $(this.ele).find('td:nth-child(3)').text(moment(this.start).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(3)').text('');
  if (this.end) $(this.ele).find('td:nth-child(4)').text(moment(this.end).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(4)').text('');
  if (this.duedate) $(this.ele).find('td:nth-child(5)').text(moment(this.duedate).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(5)').text('');
}

/**
 * @name  Topic.setChecked
 * @todo
 *  + Set the checkmark
 */
Topic.prototype.setChecked = function(val){
  $(this.ele).find('.change')[0].checked = val;
  this.post = val;
  this.change = val;
}

/**
 * @name  Topic.clearDates
 * @description Clear the dates
 * @todo
 *  + Clear all 3 dates
 *  + update the UI
 */
Topic.prototype.clearDates = function(){
  this.start = null;
  this.end = null;
  this.duedate = null;
  this.draw();
  this.post = true;
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
  var toDate = new Date(cal.year, cal.month, cal.day, cal.hour, cal.minutes, 0);

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
    this[type].setHours(cal.hour);
    this[type].setMinutes(cal.minutes);
  }
  this.setChecked(true);
}

Topic.prototype.setDate = function(type, date){
  switch (type){
    case 'start': this.setStart(date); break;
    case 'end': this.setEnd(date); break;
    case 'duedate': this.setDueDate(date); break;
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
 * @name Topic.issueWithDates
 * @description Check if the dates conflict
 * @todo
 *  + Check if the start date comes after the end or due date
 *  + check if the due date comes after the end date
 */
Topic.prototype.issueWithDates = function(){
  return ((this.end && this.start) && this.start > this.end) || ((this.start && this.duedate) && this.start > this.duedate);
}

/**
 * @name  Topic.error
 * @description Throw an error
 * @todo
 *  + color the row and the cells
 */
Topic.prototype.error = function(msg){
  $(this.ele).css({backgroundColor: 'rgba(219, 40, 40, 0.35)'});
  if (this.issueWithDates()){
    $(this.ele).find('td:nth-child(3)').css({backgroundColor: 'rgba(219, 40, 40, 0.34)'});
    loading.stop();
  }
}

/**
 * @name  Topic.save
 * @todo 
 *  + Generate the appropriate post data
 *  + Post the data
 */
Topic.prototype.save = function(afterSaveCallback){

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
          case 'discuss': return 'DiscussionTopic';
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
    var type = getUrlType(topic);
    if (type.indexOf(' tool')) type = type.replace(' tool', '');
    var url = '';
    if (topic.isModule){
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/module/' + topic._id + '/EditModuleRestrictions'
    } 
    // else if (topic.type == 'dropbox tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._dropboxId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'quiz tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._quizId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'survey tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._surveyId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'discuss tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._discussId + '/UpdateRestrictions?topicId=' + topic._id; 
    // }
    // else if (topic.type == 'checklist tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._checklistId + '/UpdateRestrictions?topicId=' + topic._id; 
    // }
    else {
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._id + '/UpdateRestrictions?topicId=' + topic._id;
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

  if (this.type == 'dropbox'){

  }

  var _this = this;
  $.post(this.url, result, function(data){}).always(function(){
    $(_this.ele).css({backgroundColor: ''});
    $(_this.ele).find('td:nth-child(3)').css({backgroundColor: ''});
    afterSaveCallback();
  });
}
/**
 * @end
 