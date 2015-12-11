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
	this.noKeep = [];
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
 * @name  Topics.getAll
 * @todo
 *  + Get all topics from the course
 *  + Load them async
 *  + Somehow return the result
 */
Topics.getAll = function(callback){
	valence.content.getToc(function(path, toc){
		var topics = new Topics();
		topics.loading.start();
		topics.done = callback;
		topics.total = toc.Modules.length;
		for (var i = 0; i < topics.total; i++){
			var m = toc.Modules[i];
      var id = m.ModuleId;
      topics._getModule(id);
		}
	});
}

/**
 * @name  Topics._getModule
 * @todo
 *  + Loop through the modules and get the sub topics and modules
 */
Topics.prototype._getModule = function(id){
	var _this = this;
	valence.content.getModule(id, function(path, module){
		_this.total += module.Structure.length;
		_this.setCurrent();
		var m = new Topic(module, _this);
		if (m.keep) _this.items.push(m);
		else _this.noKeep.push(m);

		for (var i = 0; i < module.Structure.length; i++){
			if (module.Structure[i].Type == 0) _this._getModule(module.Structure[i].Id);
			else _this._getTopic(module.Structure[i].Id);
		}
	});
}

/**
 * @name  Topics._getTopic
 * @todo
 *  + Set a new topic
 *  + Store both topics that should be kept and those that shouldn't
 */
Topics.prototype._getTopic = function(id){
	var _this = this;
	valence.content.getTopic(id, function(path, topic){
		var t = new Topic(topic, _this);
		if (t.keep) _this.items.push(t);
		else _this.noKeep.push(t);
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