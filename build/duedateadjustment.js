var valence = (function(){

    var href = $('script[src*="&d2lddc=true"]').attr('src'); // get this file name
    var props = {};

    if (href.indexOf('?') > 0){
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
            error: function(a){
                callback(path, -1);
            }
        });
    }

    function get(path, callback, version, platform){
        platform = platform != null ? platform : 'lp';
        if (!version){
            call('1.4', path, callback, platform);
        }
        else{
            call(version, path, callback, platform);
        }
    }

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
        }
    }

})();
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
    this.changesMade = false;

    /**
     * Dateify the objects
     */
    if (this.start) this.start = new Date(this.start);
    if (this.end) this.end = new Date(this.end);
    if (this.duedate) this.duedate = new Date(this.duedate);
}

/**
 * Validate if the date is valid or not
 * @return {Boolean} [description]
 */
Topic.prototype.isValidDate = function(d){
    return Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.getTime());
}

/**
 * Set the start date
 * @return {[type]} [description]
 */
Topic.prototype.setStart = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.start = date;
    this.changesMade = true;
}

/**
 * Set the end date
 * @return {[type]} [description]
 */
Topic.prototype.setEnd = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.end = date;
    this.changesMade = true;
}

/**
 * Set the due date
 * @return {[type]} [description]
 */
Topic.prototype.setDueDate = function(date){
    if (!this.isValidDate(date)) throw 'Invalid Date on Topic ' + this._id;
    this.duedate = date;
    this.changesMade = true;
}

/**
 * Checks if the topic has date
 * @return {Boolean} [description]
 */
Topic.prototype.hasDates = function(){
    return !!(this.start || this.end || this.duedate);
}

/**
 * Adjust all dates that has a due date by an offset
 * @return {[type]} [description]
 */
Topic.prototype.setAllByOffset = function(offset){
    if (!this.changesMade || !this.hasDates) return;
    if (this.start) this.start.setDate(this.start.getDate() + offset);
    if (this.end) this.end.setDate(this.end.getDate() + offset);
    if (this.duedate) this.duedate.setDate(this.duedate.getDate() + offset);
}

/**
 * Returns if the topic is a module
 * @return {Boolean} [description]
 */
Topic.prototype.isModule = function(){
    return this.isModule;
}

/**
 * Returns if the topic is a topic
 * @return {Boolean} [description]
 */
Topic.prototype.isTopic = function(){
    return !this.isModule;
}

/**
 * Save the topic
 * TODO
 * @return {[type]} [description]
 */
Topic.prototype.save = function(){
    if (!this.hasDates()) return true;
    var _this = this;
    function createPostData(){

    }
    var data = createPostData();

}
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