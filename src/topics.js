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
	this.dropboxes = [];
	this.checklist = [];
	this.surveys = [];
	this.quizzes = [];
	this.discussions = [];
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
 * @name  Topics.uiOffsetActiveDates
 * @description Offset the active dates
 * @assign Chase
 * @todo
 *  + Update the UI (Chase)
 *  + Offset only the toggled on dates (Chase)
 *  + Update the Topic object (Chase)
 */
Topics.prototype.uiOffsetActiveDates = function(amount){
	var toggled = this.getToggled();
	for (var i = 0; i < toggled.length; i++){
		toggled[i].setOffset(amount);
		toggled[i].draw();
	}
}

/**
 * @name  Topics.getToggled
 * @description returns the toggled dates
 * @todo
 *  - Return the toggled dates (Chase)
 */
Topics.prototype.getToggled = function(){
	var result = [];
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].post) result.push(this.items[i]);
	}
	return result;
}

/**
 * @name  Topics.getDropboxByName
 * @description See the title
 * @todo
 *  + Go through the dropboxes and find the one matching the name
 */
Topics.prototype.getDropboxByName = function(name){	
	for (var i = 0; i < this.dropboxes.length; i++){
		if (this.dropboxes[i].Name == name){
			return this.dropboxes[i];
		}
	}
}

/**
 * @name Topics.getQuizByName
 * @description A quick and dirty way to get the quiz ids
 * @todo
 *  + loop through and find the matching quiz
 */
Topics.prototype.getQuizByName = function(name){
	for (var i = 0; i < this.quizzes.length; i++){
		if (this.quizzes[i].name == name) return this.quizzes[i];
	}
}

/**
 * @name Topics.getSurveyByName
 * @description A quick and dirty way to get the survey ids
 * @todo
 *  + loop through and find the matching survey
 */
Topics.prototype.getSurveyByName = function(name){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].name == name) return this.surveys[i];
	}
}

/**
 * @name Topics.getDiscussionByName
 * @description A quick and dirty way to get the discussion ids
 * @todo
 *  + loop through and find the matching discussion
 */
Topics.prototype.getDiscussionByName = function(name){
	for (var i = 0; i < this.discussions.length; i++){
		if (this.discussions[i].name == name) return this.discussions[i];
	}
}

/**
 * @name Topics.getChecklistByName
 * @description A quick and dirty way to get the discussion ids
 * @todo
 *  + loop through and find the matching discussion
 */
Topics.prototype.getChecklistByName = function(name){
	for (var i = 0; i < this.checklist.length; i++){
		if (this.checklist[i].name == name) return this.checklist[i];
	}
}

Topics.prototype.devStart = function(){
	var d = new Date();
	for (var i = 0; i < this.items.length; i++){
		this.items[i].setStart(d);
		this.items[i].draw();
	}
}

/** 
 * @name  Topics.setToolItems
 */
Topics.prototype.setToolItems = function(){
	for (var i = 0; i < this.discussions.length; i++){
		var d = this.discussions[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'discuss tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}
	for (var i = 0; i < this.quizzes.length; i++){
		var d = this.quizzes[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'quiz tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.surveys.length; i++){
		var d = this.surveys[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'survey tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.checklist.length; i++){
		var d = this.checklist[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'checklist tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.dropboxes.length; i++){
		var d = this.dropboxes[i];
		var t = new Topic({
			Id: d.Id,
			Title: d.Name,
			Type: '3',
			StartDate: d.Availability ? d.Availability.StartDate : undefined,
			EndDate: d.Availability ? d.Availability.EndDate : undefined,
			DueDate: d.DueDate
		}, this);

		t.type = 'dropbox tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
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
	var _this = this;
	var topics = new Topics();
	topics.loading.start();
	topics.loading.setText('Getting Checklists');
	valence.checklist.getAll(function(checklist){
		topics.loading.setText('Getting Dropboxes');
		valence.dropbox.getFolder(function(a, b){
			topics.loading.setText('Getting Quizzes');
			valence.quiz.getAll(function(quizzes){
				topics.loading.setText('Getting Surveys');
				valence.survey.getAll(function(surveys){

					function getTheRest(discussions){
						valence.content.getToc(function(path, toc){
							var contents = [];
							topics.dropboxes = b;
							topics.quizzes = quizzes;
							topics.surveys = surveys;
							topics.discussions = discussions;
							topics.checklist = checklist;
							topics.setToolItems();
							topics.done = callback;
							// Loop through each module
							for (var i = 0; i < toc.Modules.length; i++){
								contents = contents.concat(topics.getModuleRecursive(toc.Modules[i], ''));
							}

							topics.total = contents.length;

							for (var i = 0; i < contents.length; i++){
								// Is it a module or topic
								if (contents[i].type == 0){
									topics._getModule(contents[i]);
								} else {
									topics._getTopic(contents[i]);
								}
							}
						});
					}

					topics.loading.setText('Getting Discussions');
					valence.discussion.getForums(function(p, forums){
						if (forums.length > 0){
							var total = forums.length;
							var spot = 0;
							var result = [];
							for (var i = 0; i < forums.length; i++){
								result.push({
									id: forums[i].ForumId,
									start: forums[i].StartDate,
									end: forums[i].EndDate,
									post: {
										start: forums[i].PostStartDate,
										end: forums[i].PostEndDate
									},
									name: forums[i].Name,
									type: 'forum'
								})
								valence.discussion.getTopics(forums[i].ForumId, function(p, forumTopics){
									if (forumTopics.length > 0){
										var r = [];
										for (var j = 0; j < forumTopics.length; j++){
											r.push({
												id: forumTopics[j].TopicId,
												start: forumTopics[j].StartDate,
												end: forumTopics[j].EndDate,
												unlock: {
													start: forumTopics[j].UnlockStartDate,
													end: forumTopics[j].UnlockEndDate
												},
												name: forumTopics[j].Name,
												type: 'forumTopic'
											})
										}
										result = result.concat(r);
									}
									if (++spot == total){
										getTheRest(result);
									}
								})
							}
						}
						else{
							getTheRest(null);
						}
					});
				})
			})
		})
	})
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
Topics.prototype.getModuleRecursive = function(module, path){
	// Add module
	var contents = [{
		id: module.ModuleId,
		title: module.Title,
		type: 0,
		path: path + '/' + module.Title
	}];
	// Add module topics if any
	for (var j = 0; j < module.Topics.length; j++){
		contents.push({
			id: module.Topics[j].TopicId,
			title: module.Topics[j].Title,
			type: 1,
			path: path + '/' + module.Title
		});
	}
	// Get modules within the module
	for (var j = 0; j < module.Modules.length; j++){
		contents = contents.concat(this.getModuleRecursive(module.Modules[j], path + '/' + module.Title));
	}

	return contents;
}

/**
 * @name Topics._getModule
 * @todo
 *  + Loop through the modules and get the sub topics and modules
 */
Topics.prototype._getModule = function(mod){
	var _this = this;
	valence.content.getModule(mod.id, function(path, module){
		module.Title = mod.title;
		module['path'] = mod.path;
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
Topics.prototype._getTopic = function(top){
	var _this = this;
	valence.content.getTopic(top.id, function(path, topic){
		topic.Title = top.title;
		topic['path'] = top.path;
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
 * @name Topics.clearDate
 * @description Clear the dates for all the selected items
 * @todo
 *  + Clear the dates
 */
Topics.prototype.clearDates = function(){
	var toggled = this.getToggled();
	for (var i = 0; i < toggled.length; i++){
		toggled[i].clearDates();
	}
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
		_this.items[parseInt(idx)].change = Boolean(val); // single
	}, function(topics){ // all
		// var offset = $('#offset').val();
		// if (offset.length > 0){
		// 	_this.offsetAll(parseInt(offset));
		// }

		var spot = 0;

		var toggled = _this.getToggled();
		var total = toggled.length;
		for (var i = 0; i < toggled.length; i++){
			if (toggled[i].post){
				toggled[i].save(function(){
					if (++spot == total){
						_this.loading.stop();
						UI.alert('Saved');
					}
				})
				toggled[i].setChecked(false);
				toggled[i].draw();
			}
		}

	});

	this.table.draw();
	$('.checkbox.disabled').checkbox();
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