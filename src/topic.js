/**
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

  this.type = (function(o){
    console.log(o);
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
  this.changesMade = false;
}

/**
 * @name  Topic.setOffset
 * @todo
 *  + Change the start date
 *  + Change the duedate
 *  + Change the end date
 *  - Verify the date changes
 */
Topic.prototype.setOffset = function(amount){
  if (this.changesMade || !this.hasDates()) return;
  if (this.start) this.start.setDate(this.start.getDate() + amount);
  if (this.end) this.end.setDate(this.end.getDate() + amount);
  if (this.duedate) this.duedate.setDate(this.duedate.getDate() + amount);
}

/**
 * @description Set the start date
 * @name  Topic.setStart
 *  + set the start date
 */
Topic.prototype.setStart = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.start = date;
    this.changesMade = true;
}

/**
 * @description Set the end date
 * @name Topic.setEnd
 *  + set the end date
 */
Topic.prototype.setEnd = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.end = date;
    this.changesMade = true;
}

/**
 * @description Set the due date
 * @name  Topic.setDueDate
 * @todo
 *  + Set the duedate
 */
Topic.prototype.setDueDate = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.duedate = date;
    this.changesMade = true;
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
 *  - Generate the appropriate post data
 *  - Post the data
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

  $.post(this.url, result, function(data){}).always(function(){
    afterSaveCallback();
  });

}
/**
 * @end
 */