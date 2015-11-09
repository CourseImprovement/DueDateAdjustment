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