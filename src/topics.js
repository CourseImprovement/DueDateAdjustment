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
			contents = contents.concat(topics.getModuleRecursive(toc.Modules[i]));
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
		// var offset = $('#offset').val();
		// if (offset.length > 0){
		// 	_this.offsetAll(parseInt(offset));
		// }

		var total = 0;
		var spot = 0;
	  for (var i = 0; i < _this.items.length; i++){
	    if (_this.items[i].post){
	    	total++;
	    	_this.items[i].save(function(){
	    		if (++spot == total){
	    			UI.alert("Saved");
	    		}
	    	});
	    }
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