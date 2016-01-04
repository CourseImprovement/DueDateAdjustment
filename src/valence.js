 /*
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

    var href = $('script[src*="courses."]').attr('src'); // get this file name
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
        dropbox: {
            getFolder: function(callback){
                get(props.orgUnitId + '/dropbox/folders/', callback, '1.4', 'le');
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
        discussion: {
            getForums: function(callback){
                get(props.orgUnitId + '/discussions/forums/', callback, '1.4', 'le');
            },
            getTopics: function(forumId, callback){
                get(props.orgUnitId + '/discussions/forums/' + forumId + '/topics/', callback, '1.4', 'le');
            }
        },
        survey: {
            getAll: function(callback){
                $.get('/d2l/lms/survey/admin/surveys_manage.d2l?ou=' + props.orgUnitId, function(html){
                    html = $(html);
                    var result = [];
                    $(html).find('[summary*="list of surveys"] tr:not([class]) th').each(function(){
                        var id = $(this).find('a:first-child').attr('href').split('si=')[1].split('&')[0];
                        var name = $(this).find('a:first-child').html();
                        var dates = $(this).find('> div label span').text();
                        var start = null;
                        var end = null;
                        if (dates != 'Always Available'){
                            if (dates.indexOf(' - ') > -1){
                                var ds = dates.split(' - ');
                                start = new Date(ds[0]);
                                end = new Date(ds[1]);
                            }
                            else if (dates.indexOf('Ends ') > -1){
                                var d = dates.split('Ends ')[1];
                                end = new Date(d);
                            }
                            else if (dates.indexOf('Begins ') > -1){
                                var d = dates.split('Begins ')[1];
                                start = new Date(d);
                            }
                        }
                        result.push({id: id, name: name, start: start, end: end});
                    });
                    callback(result);
                })
            }
        },
        checklist: {
            getAll: function(callback){
                $.get('/d2l/lms/checklist/checklists.d2l?ou=' + props.orgUnitId, function(html){
                    html = $(html);
                    var result = [];
                    $(html).find('[summary*="List of checklists"] tr:not([class]) th').each(function(){
                        var id = $(this).find('a:first-child').attr('href').split('checklistId=')[1].split('&')[0];
                        var name = $(this).find('a:first-child').text();
                        result.push({
                            id: id,
                            name: name
                        });
                    });
                    callback(result);
                });
            }
        },
        quiz: {
            getAll: function(callback){
                $.get('/d2l/lms/quizzing/admin/quizzes_manage.d2l?ou=' + props.orgUnitId, function(html){
                    html = $(html);
                    var result = [];
                    $(html).find('[summary*="list of quizzes"] tr:not([class]) th').each(function(){
                        var id = $(this).find('a:first-child').attr('href').split('qi=')[1].split('&')[0];
                        var name = $(this).find('a:first-child').html();
                        var dates = $(this).find('> div label span').text();
                        var start = null;
                        var end = null;
                        if (dates != 'Always Available'){
                            if (dates.indexOf(' - ') > -1){
                                var ds = dates.split(' - ');
                                start = new Date(ds[0]);
                                end = new Date(ds[1]);
                            }
                            else if (dates.indexOf('Ends ') > -1){
                                var d = dates.split('Ends ')[1];
                                end = new Date(d);
                            }
                            else if (dates.indexOf('Begins ') > -1){
                                var d = dates.split('Begins ')[1];
                                start = new Date(d);
                            }
                        }
                        result.push({id: id, name: name, start: start, end: end});
                    });
                    callback(result);
                });
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