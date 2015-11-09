function Topics(){
	this.items = [];
	this.total = 0;
	this.current = 0;
}

/**
 * Static function which gets all topics and modules from the given course
 * TODO
 * @return {[type]} [description]
 */
Topics.getAll = function(){
	var topics = new Topics();

	return topics;
}

/**
 * Add item to the topic array. This creates a new Topic item
 * @param {[type]} obj [description]
 */
Topics.prototype.addItem = function(obj){
	var topic = new Topic(obj);
	this.items.push(topic);
	this.total++;
	this.current++;
}

/**
 * Change all dates by an offset amount. * 		
 * @return {[type]} [description]
 */
Topics.prototype.offsetAll = function(offset){
	for (var i = 0; i < this.items.length; i++){
		this.items[i].setAllByOffset(offset);
	}	
}

/**
 * Save all items that changed
 * @return {[type]} [description]
 */
Topics.prototype.saveAll = function(){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].changesMade){
			this.items[i].save();
		}
	}
}