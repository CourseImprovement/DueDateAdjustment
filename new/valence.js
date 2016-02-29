var valence = (function(){
    var href = parent.document.location.href;    
    var props = {
        orgUnitId: href.split('/content/')[1].split('/')[0]
    };

    function getUrl(path, version, platform){
        platform = platform != null ? platform : 'lp';
        version = !version ? '1.4' : version;        
        return '/d2l/api/' + platform + '/' + version + '/' + path
    }

    return {
        content: {
            getToc: function(){
                return getUrl(props.orgUnitId + '/content/toc', '1.4', 'le');
            },
            getModule: function(moduleId){
                return getUrl(props.orgUnitId + '/content/modules/' + moduleId, '1.4', 'le');
            },
            getTopic: function(topicId){
                return getUrl(props.orgUnitId + '/content/topics/' + topicId, '1.4', 'le');
            }
        },
        courses: {
            getId: function(){
                return window.location.href.split('enforced/')[1].split('-')[0];
            }
        },
        dropbox: {
            getFolder: function(){
                return getUrl(props.orgUnitId + '/dropbox/folders/', '1.4', 'le');
            }
        },
        discussion: {
            getForums: function(){
                return getUrl(props.orgUnitId + '/discussions/forums/', '1.4', 'le');
            },
            getTopics: function(forumId){
                return getUrl(props.orgUnitId + '/discussions/forums/' + forumId + '/topics/', '1.4', 'le');
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
        getHeaders: function(){
            return {
                headers: {
                    'X-Csrf-Token': localStorage['XSRF.Token']
                }
            }
        }
    }

})();
