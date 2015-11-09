/**
 * Process:
 * 	1. Get Table of Contents
 * 	2. Get Modules and Topics inside of Table of Contents
 * 	3. Simplify the object returned from 1 and 2 to the following:
 * 		{
 * 			start: null,
 * 			end: null,
 * 			due: null,
 * 			type: module | topic,
 * 			id: null,
 * 			title: null
 * 		}
 * 	4. Display the dates for the user to do the following:
 * 		a. Change either start, end, due dates manually
 * 		b. Offset all dates manually (calendar select the end date)
 * 	5. If a date is changed, a boolean field changes from false to true indicating that 
 * 		 the item has changed
 * 	6. Start, when the user clicks the start button, loop through all the adjusted dates
 * 		 and change adjust the ones that need changes.
 *
 *
 * 	Design Questions:
 * 		- Should we include children inside each module or return each item singly?
 *
 */
function Topic(obj){
	this.isModule = (obj.Type == '0' ? true : false);
	this.start = this.isModule ? obj.ModuleStartDate : obj.StartDate;
	this.end = this.isModule ? obj.ModuleEndDate : obj.EndDate;
	this.duedate = this.isModule ? obj.ModuleDueDate : obj.DueDate;
	this.title = obj.Title;

	this.topicType = (function(o){
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
	})(obj);

	this._id = obj.Id;
}

/**
 * Set the start date
 * @return {[type]} [description]
 */
Topic.prototype.setStart = function(){

}

/**
 * Set the end date
 * @return {[type]} [description]
 */
Topic.prototype.setEnd = function(){

}

/**
 * Set the due date
 * @return {[type]} [description]
 */
Topic.prototype.setDueDate = function(){

}

/**
 * Checks if the topic has date
 * @return {Boolean} [description]
 */
Topic.prototype.hasDate = function(){

}

/**
 * Adjust all dates that has a due date by an offset
 * @return {[type]} [description]
 */
Topic.prototype.setAllByOffset = function(){

}

/**
 * Returns if the topic is a module
 * @return {Boolean} [description]
 */
Topic.prototype.isModule = function(){

}

/**
 * Save the topic
 * @return {[type]} [description]
 */
Topic.prototype.save = function(){

    var _this = this;
    function createPostData(){

    }
    var data = createPostData();

}