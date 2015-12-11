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