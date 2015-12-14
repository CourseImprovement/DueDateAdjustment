/**
 * @start object valence
 * @name  Valence
 * @description A lightweight api collection for Valence
 */
/**
 * @name valence
 * @start test
 *  assert(!!valence, "Invalid valence object");
 * @end
 */
var valence = (function(){

    var href = $('script[src*="courses.byui.edu"]').attr('src'); // get this file name
    var props = {};
    var success = false;

    if (href && href.indexOf('?') > 0){
        success = true;
        var split = href.split('?')[1];
        if (split.indexOf('&') > 0){
            var and = split.split('&');
            for (var i = 0; i < and.length; i++){
                if (and[i].indexOf('=') > 0){
                    var prop = and[i].split('=');
                    props[prop[0]] = prop[1];
                }
                else{
                    throw 'Invalid url parameter';
                }
            }
        }
    }

    function call(version, path, callback, platform){
        $.ajax('/d2l/api/' + platform + '/' + version + '/' + path, {
            method: 'GET',
            headers: {
                'X-Csrf-Token': localStorage['XSRF.Token']
            },
            success: function(a){
                callback(path, a);
            },
            /**
             * @name valence.call.error
             * @assign Chase
             * @todo
             *  - Provide better error handling
             */
            error: function(a){
                callback(path, -1);
            }
        });
    }

    /**
     * @name valence.get
     * @todo
     *  - What if the apis upgrade from 1.4 to 1.5? (Chase)
     */
    function get(path, callback, version, platform){
        platform = platform != null ? platform : 'lp';
        if (!version){
            call('1.4', path, callback, platform);
        }
        else{
            call(version, path, callback, platform);
        }
    }

    /**
     * @name  valence.post
     * @todo
     *  - Verify if this is needed
     *  - Complete the function
     *  - Remove if not needed
     */
    function post(path, callback, version, platform, data){

    }

    return {
        users: {
            whoami: function(callback){
                get('users/whoami', callback);
            },
            profile: {
                myprofile: function(callback){
                    get('profile/myProfile', callback);
                },
                image: function(callback){
                    get('profile/myProfile/image', callback);
                }
            },
            roles: {
                all: function(callback){
                    get('roles/', callback, '1.4', 'lp');
                }
            },
            get: function(userId, callback){
                get('users/' + userId, callback);
            }
        },
        courses: {
            schema: function(callback){
                get('courses/schema/', callback);
            },
            getId: function(){
                return window.location.href.split('enforced/')[1].split('-')[0];
            }
        },
        content: {
            root: function(callback){
                get(props.orgUnitId + '/content/root/', callback, '1.4', 'le');
            },
            getObject: function(id, callback){
                get(props.orgUnitId + '/content/topics/' + id + '/file', callback);
            },
            getRoot: function(callback){
                get(props.orgUnitId + '/content/root/', callback, '1.4', 'le');
            },
            getToc: function(callback){
                get(props.orgUnitId + '/content/toc', callback, '1.4', 'le');
            },
            getModule: function(moduleId, callback){
                get(props.orgUnitId + '/content/modules/' + moduleId, callback, '1.4', 'le');
            },
            getTopic: function(topicId, callback){
                get(props.orgUnitId + '/content/topics/' + topicId, callback, '1.4', 'le');
            }
        },
        org: {
            structure: function(callback){
                get('orgstructure/', callback);
            },
            info: function(callback){
                get('organization/info/', callback);
            }
        },
        tools: {
            org: function(callback){
                get('tools/org/', callback, '1.5');
            }
        },
        success: success
    }

})();
/**
 * @end
 */
/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-tablesort
	Version 0.0.6
*/
$(function(){var t=window.Zepto||window.jQuery;t.tablesort=function(e,s){var i=this;this.$table=e,this.$thead=this.$table.find("thead"),this.settings=t.extend({},t.tablesort.defaults,s),this.$sortCells=this.$thead.length>0?this.$thead.find("th:not(.no-sort)"):this.$table.find("th:not(.no-sort)"),this.$sortCells.bind("click.tablesort",function(){i.sort(t(this))}),this.index=null,this.$th=null,this.direction=null},t.tablesort.prototype={sort:function(e,s){var i=new Date,n=this,o=this.$table,a=this.$thead.length>0?o.find("tbody tr"):o.find("tr").has("td"),l=o.find("tr td:nth-of-type("+(e.index()+1)+")"),r=e.data().sortBy,d=[],h=l.map(function(s,i){return r?"function"==typeof r?r(t(e),t(i),n):r:null!=t(this).data().sortValue?t(this).data().sortValue:t(this).text()});0!==h.length&&("asc"!==s&&"desc"!==s?this.direction="asc"===this.direction?"desc":"asc":this.direction=s,s="asc"==this.direction?1:-1,n.$table.trigger("tablesort:start",[n]),n.log("Sorting by "+this.index+" "+this.direction),n.$table.css("display"),setTimeout(function(){n.$sortCells.removeClass(n.settings.asc+" "+n.settings.desc);for(var r=0,c=h.length;c>r;r++)d.push({index:r,cell:l[r],row:a[r],value:h[r]});d.sort(function(t,e){return t.value>e.value?1*s:t.value<e.value?-1*s:0}),t.each(d,function(t,e){o.append(e.row)}),e.addClass(n.settings[n.direction]),n.log("Sort finished in "+((new Date).getTime()-i.getTime())+"ms"),n.$table.trigger("tablesort:complete",[n]),n.$table.css("display")},h.length>2e3?200:10))},log:function(e){(t.tablesort.DEBUG||this.settings.debug)&&console&&console.log&&console.log("[tablesort] "+e)},destroy:function(){return this.$sortCells.unbind("click.tablesort"),this.$table.data("tablesort",null),null}},t.tablesort.DEBUG=!1,t.tablesort.defaults={debug:t.tablesort.DEBUG,asc:"sorted ascending",desc:"sorted descending"},t.fn.tablesort=function(e){var s,i;return this.each(function(){s=t(this),i=s.data("tablesort"),i&&i.destroy(),s.data("tablesort",new t.tablesort(s,e))})}});

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
/**
 * @start object Topics
 * @name  Topics
 */
/**
 * @name  Topics
 * @todo
 *  + Add a tick for async callback
 */
function Topics(){
	this.items = [];
	this.done = null;
	this.current = 0;
	this.total = 0;
	this.table = new Table();
	this.requestId = 1;
	this.loading = new Loading();
}

/**
 * @name  Topics.setCurrent
 * @todo
 *  + Set the check the current calls with the total then call callback
 */
Topics.prototype.setCurrent = function(){
	this.current++;
	if (this.current == this.total){
		this.loading.stop();
		this.done(this);
	}
}

/**
 * @name Topics.getAll 
 * @description Takes an array of modules to be parsed and returns an array with all the modules (no modules within modules) and the topics
 * @assign Chase and Grant
 * @todo 
 *  + Create a new array for all the modules and topics
 *  + Loop through each module
 *   + Get the module, topics, and other modules within that module via getModuleRecursive()
 *  + Set the total number of topics and modules that will be collected
 *  + Get each module and topic
 */
Topics.getAll = function(callback){
	valence.content.getToc(function(path, toc){
		var contents = [];
		var topics = new Topics();
		topics.loading.start();
		topics.done = callback;
		// Loop through each module
		for (var i = 0; i < toc.Modules.length; i++){
			contents = contents.concat(topics.getModuleRecursive(modules[i]));
		}

		topics.total = contents.length;

		for (var i = 0; i < contents.length; i++){
			// Is it a module or topic
			if (contents[i].type == 0){
				topics._getModule(contents[i].id, contents[i].title);
			} else {
				topics._getTopic(contents[i].id, contents[i].title);
			}
		}
	});
}

/**
 * @name Topics.getModuleRecursive 
 * @description Go through a module and pull out other modules, along with the topics
 * @assign Chase and Grant
 * @todo 
 *  + Create a new array that contains the current module and topics
 *  + Check if there are any topics
 *   + Add the topics to the new array
 *  + Check if there are more modules
 *   + Get the other modules by calling getModuleRecursive 
 *   + Add the module to the new array
 *  + Return an array with the modules and topics
 */
Topics.prototype.getModuleRecursive = function(module){
	// Add module
	var contents = [{
		id: module.ModuleId,
		title: module.Title,
		type: 0
	}];
	// Add module topics if any
	for (var j = 0; j < module.Topics.length; j++){
		contents.push({
			id: module.Topics[j].TopicId,
			title: module.Topics[j].Title,
			type: 1
		});
	}
	// Get modules within the module
	for (var j = 0; j < module.Modules.length; j++){
		contents = contents.concat(this.getModuleRecursive(module.Modules[j]));
	}

	return contents;
}

/**
 * @name Topics._getModule
 * @todo
 *  + Loop through the modules and get the sub topics and modules
 */
Topics.prototype._getModule = function(id, title){
	var _this = this;
	valence.content.getModule(id, function(path, module){
		module.Title = title;
		var m = new Topic(module, _this);
		_this.items.push(m);
		_this.setCurrent();
	});
}

/**
 * @name Topics._getTopic
 * @todo
 *  + Set a new topic
 *  + Store both topics that should be kept and those that shouldn't
 */
Topics.prototype._getTopic = function(id, title){
	var _this = this;
	valence.content.getTopic(id, function(path, topic){
		topic.Title = title;
		var t = new Topic(topic, _this);
		_this.items.push(t);
		_this.setCurrent();
	});
}

/**
 * @name  Topics.offsetAll
 * @todo
 *  + Copy the old code from the _hidden file
 *  - Verify the offset
 *  + Change only the ones that need change
 */
Topics.prototype.offsetAll = function(offset){
	var total = 0;
	var spot = 0;
  for (var i = 0; i < this.items.length; i++){
    if (this.items[i].change){
    	total++;
    	this.items[i].setOffset(offset);
    	this.items[i].save(function(){
    		if (++spot == total){
    			UI.alert("Saved");
    		}
    	});
    }
  } 
}

/** 
 * @name Topics.getModules
 * @todo
 *  + Search through the items or noKeep items to find modules
 */
Topics.prototype.getModules = function(noKeep){
  var result = [];
  for (var i = 0; i < this.items.length; i++){
    if (!noKeep && this.items[i].isModule) result.push(this.items[i]);
    else if (noKeep && this.noKeep[i].isModule) result.push(this.noKeep[i])
  }
  return result;
}

/**
 * @name  Topics.render
 * @todo
 *  + Render the html table
 *  + Set the single change callback
 *  + Set the completion callback
 */
Topics.prototype.render = function(){
	for (var i = 0; i < this.items.length; i++){
		this.table.addRow(this.items[i], i);
	}
	var _this = this;

	this.table.change(function(idx, val){
		_this.items[parseInt(idx)].change = Boolean(val);
	}, function(topics){
		var offset = $('#offset').val();
		if (offset.length > 0){
			_this.offsetAll(parseInt(offset));
		}
	});

	this.table.draw();
}
/**
 * @end
 */

if (valence.success){
	Topics.getAll(function(topics){
	  window.topics = topics;
	  topics.render();
	})
}
/**
 * @start UI
 */
function Table(){
	this.html = $('<button class="ui button" id="change">Change</button><button class="ui button" id="toggle">Toggle All</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"></div><table id="1231231231" class="ui compact celled definition table"><thead><tr><th>Change</th><th>Name</th><th>Type</th></tr></thead><tbody></tbody></table>');
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
	$(tmp).append('<td class=collapsing><div class="ui fitted slider checkbox"><input type="checkbox" class="change" idx="' + idx + '" ' + (topic.change ? 'checked' : '') + '><label></label></div></td>');
	$(tmp).append('<td>' + topic.title + '</td>');
	//$(tmp).append('<td>' + (topic.isModule ? 'Module' : 'Topic') + '</td>');
	$(tmp).append('<td>' + topic.type + '</td>');
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