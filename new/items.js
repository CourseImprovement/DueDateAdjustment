
function Items(){
	this.items = [];
	this.loading = new Loading();
	this.table = null;
	this.toc = null;
	this.requestId = 0;
}

Items.prototype.clearDates = function(){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change){
			this.items[i].clearDates();
		}
	}
}

Items.prototype.draw = function(){
	this.table = new Table(this);
	this.table.draw();
}

Items.prototype.offsetDates = function(amount){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change) this.items[i].offsetDates(amount);
	}
}

Items.prototype.changeSelected = function(){
	var total = 0;
	var spot = 0;
	this.loading.setText('Saving Changes');
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change){
			total++;
			this.items[i].save(function(){
				if (++spot == total){
					items.loading.stop();
					UI.alert('Saved');
				}
			});
		}
	}
}

Items.prototype.addItem = function(obj, type, isContentType){
	var item = new Item(this);
	item._setObject(obj, type, isContentType);
	this.items.push(item);
}

Items.prototype.getById = function(id){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].getId() == id) return this.items[i];
	}
}

Items.prototype.setPaths = function(){
	var _this = this;
	function setPathsRecursive(mod, path){
		for (var i = 0; i < mod.Topics.length; i++){
			var item = _this.getById(mod.Topics[i].TopicId);
			item.path = path;
		}
		for (var i = 0; i < mod.Modules.length; i++){
			var item = _this.getById(mod.Modules[i].ModuleId);
			item.path = path;
			setPathsRecursive(mod.Modules[i], path + '/' + mod.Modules[i].Title);
		}
	}

	for (var i = 0; i < this.toc.Modules.length; i++){
		var m = this.toc.Modules[i];
		var item = this.getById(m.ModuleId);
		item.path = '/';
		setPathsRecursive(m, '/' + m.Title);
	}
}

Items.prototype.start = function(){
	this.loading.start(true);
	// Collection time
	
	function getDiscussionTopics(ary){
		byui.ajaxPool({
			calls: ary,
			done: function(err, suc){
				for (var key in suc){
					for (var i = 0; i < suc[key].length; i++){
						items.addItem(suc[key][i], 'discussion-topic', false);
					}
				}
				items.setPaths();
				items.loading.setText('Drawing the results');
				items.draw();
				items.loading.stop();
			}
		});	
	}

	function getDiscussions(){
		items.loading.setText('Getting Discussions');
		byui.ajaxPool({
			calls: [
				{
					url: valence.discussion.getForums(),
					headers: valence.getHeaders(),
					name: 'forums'
				}
			],
			done: function(err, suc){
				var calls = [];
				for (var i = 0; i < suc.forums.length; i++){
					items.addItem(suc.forums[i], 'discussion-forum', false);
					calls.push({
						headers: valence.getHeaders(),
						name: i,
						url: valence.discussion.getTopics(suc.forums[i].ForumId)
					});
				}
				getDiscussionTopics(calls);
			}
		})
	}

	function getSurveys(){
		items.loading.setText('Getting Surveys');
		valence.survey.getAll(function(surveys){
			for (var i = 0; i < surveys.length; i++){
				items.addItem(surveys[i], 'survey', false);
			}
			getDiscussions();
		})
	}

	function getQuizzes(){
		items.loading.setText('Getting Quizzes');
		valence.quiz.getAll(function(quizzes){
			for (var i = 0; i < quizzes.length; i++){
				items.addItem(quizzes[i], 'quiz', false);
			}
			getSurveys();
		})
	}

	function getDropboxes(){
		items.loading.setText('Getting Dropboxes');
		byui.ajaxPool({
			calls: [
				{
					url: valence.dropbox.getFolder(),
					headers: valence.getHeaders(),
					name: 'folders'
				}
			],
			done: function(err, suc){
				for (var i = 0; i < suc.folders.length; i++){
					items.addItem(suc.folders[i], 'dropbox', false);
				}
				getQuizzes();
			}
		})
	}

	function getChecklists(){
		items.loading.setText('Getting checklists');
		valence.checklist.getAll(function(checklist){
			for (var i = 0; i < checklist.length; i++){
				items.addItem(checklist[i], 'checklist', false);
			}
			getDropboxes();
		});
	}

	function getModulesAndTopicsRecursive(mod, path){
		var result = [];
		result.push({type: 'mod', url: valence.content.getModule(mod.ModuleId)});
		for (var i = 0; i < mod.Topics.length; i++){
			result.push({type: 'top', url: valence.content.getTopic(mod.Topics[i].TopicId)});
		}
		for (var i = 0; i < mod.Modules.length; i++){
			result = result.concat(getModulesAndTopicsRecursive(mod.Modules[i]));
		}
		return result;
	}

	function collectContentUrls(toc){
		var calls = [];

		for (var i = 0; i < toc.Modules.length; i++){
			calls = calls.concat(getModulesAndTopicsRecursive(toc.Modules[i]));
		}

		for (var i = 0; i < calls.length; i++){
			calls[i] = {
				url: calls[i].url,
				headers: valence.getHeaders(),
				name: i + ':' + calls[i].type
			}
		}

		byui.ajaxPool({
			calls: calls,
			done: function(err, suc){
				items.loading.setText('Creating items');
				for (var key in suc){
					items.addItem(suc[key], key.split(':')[1], true);
				}
				getChecklists();
			}
		});
	}

	// Get the Table of Contents
	this.loading.setText('Getting table of contents');
	byui.ajaxPool({
		calls: [
			{
				url: valence.content.getToc(),
				headers: valence.getHeaders(),
				name: 'toc'
			}
		],
		done: function(err, suc){
			items.loading.setText('Getting content items');
			items.toc = suc.toc;
			collectContentUrls(suc.toc);
		}
	});

}