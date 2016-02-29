function Loading(){
    this.top = '<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader" id="top">Preparing Files</div></div><p></p></div>';
    this.middle = '<div class="ui segment" id="loader"><div class="ui active dimmer"><div class="ui indeterminate text loader">Preparing Files</div></div><p></p></div>';
}

Loading.prototype.start = function(top){
    this.stop();
    $('body').append((top ? this.top : this.middle));
    $('#loader').css({
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 999
    });
}

Loading.prototype.stop = function(){
    $('#loader').remove();
}

Loading.prototype.setText = function(txt){
    $('.ui.indeterminate').text(txt);
}

var loading = new Loading();
setTimeout(function(){
    loading.start(true);
}, 4);

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

    //var href = $('script[src*="courses."]').attr('src'); // get this file name
    //var href = window.location.href;
    var href = $('script[src*="duedateadjustment.js"]').attr('src');    
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
/**
 * jquery.filterTable
 *
 * This plugin will add a search filter to tables. When typing in the filter,
 * any rows that do not contain the filter will be hidden.
 *
 * Utilizes bindWithDelay() if available. https://github.com/bgrins/bindWithDelay
 *
 * @version v1.5.5
 * @author Sunny Walker, swalker@hawaii.edu
 * @license MIT
 */
!function($){var e=$.fn.jquery.split("."),t=parseFloat(e[0]),n=parseFloat(e[1]);2>t&&8>n?($.expr[":"].filterTableFind=function(e,t,n){return $(e).text().toUpperCase().indexOf(n[3].toUpperCase())>=0},$.expr[":"].filterTableFindAny=function(e,t,n){var i=n[3].split(/[\s,]/),r=[];return $.each(i,function(e,t){var n=t.replace(/^\s+|\s$/g,"");n&&r.push(n)}),r.length?function(e){var t=!1;return $.each(r,function(n,i){return $(e).text().toUpperCase().indexOf(i.toUpperCase())>=0?(t=!0,!1):void 0}),t}:!1},$.expr[":"].filterTableFindAll=function(e,t,n){var i=n[3].split(/[\s,]/),r=[];return $.each(i,function(e,t){var n=t.replace(/^\s+|\s$/g,"");n&&r.push(n)}),r.length?function(e){var t=0;return $.each(r,function(n,i){$(e).text().toUpperCase().indexOf(i.toUpperCase())>=0&&t++}),t===r.length}:!1}):($.expr[":"].filterTableFind=jQuery.expr.createPseudo(function(e){return function(t){return $(t).text().toUpperCase().indexOf(e.toUpperCase())>=0}}),$.expr[":"].filterTableFindAny=jQuery.expr.createPseudo(function(e){var t=e.split(/[\s,]/),n=[];return $.each(t,function(e,t){var i=t.replace(/^\s+|\s$/g,"");i&&n.push(i)}),n.length?function(e){var t=!1;return $.each(n,function(n,i){return $(e).text().toUpperCase().indexOf(i.toUpperCase())>=0?(t=!0,!1):void 0}),t}:!1}),$.expr[":"].filterTableFindAll=jQuery.expr.createPseudo(function(e){var t=e.split(/[\s,]/),n=[];return $.each(t,function(e,t){var i=t.replace(/^\s+|\s$/g,"");i&&n.push(i)}),n.length?function(e){var t=0;return $.each(n,function(n,i){$(e).text().toUpperCase().indexOf(i.toUpperCase())>=0&&t++}),t===n.length}:!1})),$.fn.filterTable=function(e){var t={autofocus:!1,callback:null,containerClass:"filter-table",containerTag:"p",filterExpression:"filterTableFind",hideTFootOnFilter:!1,highlightClass:"alt",ignoreClass:"",ignoreColumns:[],inputSelector:null,inputName:"",inputType:"search",label:"Filter:",minChars:1,minRows:8,placeholder:"search this table",preventReturnKey:!0,quickList:[],quickListClass:"quick",quickListGroupTag:"",quickListTag:"a",visibleClass:"visible"},n=function(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},i=$.extend({},t,e),r=function(e,t){var n=e.find("tbody");if(""===t||t.length<i.minChars)n.find("tr").show().addClass(i.visibleClass),n.find("td").removeClass(i.highlightClass),i.hideTFootOnFilter&&e.find("tfoot").show();else{var r=n.find("td");if(n.find("tr").hide().removeClass(i.visibleClass),r.removeClass(i.highlightClass),i.hideTFootOnFilter&&e.find("tfoot").hide(),i.ignoreColumns.length){var a=[];i.ignoreClass&&(r=r.not("."+i.ignoreClass)),a=r.filter(":"+i.filterExpression+'("'+t.replace(/(['"])/g,"\\$1")+'")'),a.each(function(){var e=$(this),t=e.parent().children().index(e);-1===$.inArray(t,i.ignoreColumns)&&e.addClass(i.highlightClass).closest("tr").show().addClass(i.visibleClass)})}else i.ignoreClass&&(r=r.not("."+i.ignoreClass)),r.filter(":"+i.filterExpression+'("'+t.replace(/(['"])/g,"\\$1")+'")').addClass(i.highlightClass).closest("tr").show().addClass(i.visibleClass)}i.callback&&i.callback(t,e)};return this.each(function(){var e=$(this),t=e.find("tbody"),a=null,s=null,l=null,o=!0;"TABLE"===e[0].nodeName&&t.length>0&&(0===i.minRows||i.minRows>0&&t.find("tr").length>=i.minRows)&&!e.prev().hasClass(i.containerClass)&&(i.inputSelector&&1===$(i.inputSelector).length?(l=$(i.inputSelector),a=l.parent(),o=!1):(a=$("<"+i.containerTag+" />"),""!==i.containerClass&&a.addClass(i.containerClass),a.prepend(i.label+" "),l=$('<input type="'+i.inputType+'" placeholder="'+i.placeholder+'" name="'+i.inputName+'" />'),i.preventReturnKey&&l.on("keydown",function(e){return 13===(e.keyCode||e.which)?(e.preventDefault(),!1):void 0})),i.autofocus&&l.attr("autofocus",!0),$.fn.bindWithDelay?l.bindWithDelay("keyup",function(){r(e,$(this).val())},200):l.bind("keyup",function(){r(e,$(this).val())}),l.bind("click search input paste blur",function(){r(e,$(this).val())}),o&&a.append(l),i.quickList.length>0&&(s=i.quickListGroupTag?$("<"+i.quickListGroupTag+" />"):a,$.each(i.quickList,function(e,t){var r=$("<"+i.quickListTag+' class="'+i.quickListClass+'" />');r.text(n(t)),"A"===r[0].nodeName&&r.attr("href","#"),r.bind("click",function(e){e.preventDefault(),l.val(t).focus().trigger("click")}),s.append(r)}),s!==a&&a.append(s)),o&&e.before(a))})}}(jQuery);
(function(g,F){"object"===typeof exports&&"undefined"!==typeof module?module.exports=F():"function"===typeof define&&define.amd?define(F):g.moment=F()})(this,function(){function g(){return Na.apply(null,arguments)}function F(a){return"[object Array]"===Object.prototype.toString.call(a)}function ea(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function Bb(a,b){var c=[],d;for(d=0;d<a.length;++d)c.push(b(a[d],d));return c}function K(a,b){return Object.prototype.hasOwnProperty.call(a,
b)}function fa(a,b){for(var c in b)K(b,c)&&(a[c]=b[c]);K(b,"toString")&&(a.toString=b.toString);K(b,"valueOf")&&(a.valueOf=b.valueOf);return a}function X(a,b,c,d){return Oa(a,b,c,d,!0).utc()}function n(a){null==a._pf&&(a._pf={empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1});return a._pf}function Pa(a){if(null==a._isValid){var b=n(a);a._isValid=!isNaN(a._d.getTime())&&0>b.overflow&&!b.empty&&!b.invalidMonth&&
!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated;a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function Qa(a){var b=X(NaN);null!=a?fa(n(b),a):n(b).userInvalidated=!0;return b}function ra(a,b){var c,d,m;"undefined"!==typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject);"undefined"!==typeof b._i&&(a._i=b._i);"undefined"!==typeof b._f&&(a._f=b._f);"undefined"!==typeof b._l&&(a._l=b._l);"undefined"!==
typeof b._strict&&(a._strict=b._strict);"undefined"!==typeof b._tzm&&(a._tzm=b._tzm);"undefined"!==typeof b._isUTC&&(a._isUTC=b._isUTC);"undefined"!==typeof b._offset&&(a._offset=b._offset);"undefined"!==typeof b._pf&&(a._pf=n(b));"undefined"!==typeof b._locale&&(a._locale=b._locale);if(0<sa.length)for(c in sa)d=sa[c],m=b[d],"undefined"!==typeof m&&(a[d]=m);return a}function Y(a){ra(this,a);this._d=new Date(null!=a._d?a._d.getTime():NaN);!1===ta&&(ta=!0,g.updateOffset(this),ta=!1)}function G(a){return a instanceof
Y||null!=a&&null!=a._isAMomentObject}function w(a){return 0>a?Math.ceil(a):Math.floor(a)}function q(a){a=+a;var b=0;0!==a&&isFinite(a)&&(b=w(a));return b}function Ra(a,b,c){var d=Math.min(a.length,b.length),m=Math.abs(a.length-b.length),Sa=0,e;for(e=0;e<d;e++)(c&&a[e]!==b[e]||!c&&q(a[e])!==q(b[e]))&&Sa++;return Sa+m}function Ta(){}function Ua(a){return a?a.toLowerCase().replace("_","-"):a}function Va(a){var b=null;if(!L[a]&&"undefined"!==typeof module&&module&&module.exports)try{b=ga._abbr,require("./locale/"+
a),Z(b)}catch(c){}return L[a]}function Z(a,b){var c;a&&(c="undefined"===typeof b?M(a):Wa(a,b))&&(ga=c);return ga._abbr}function Wa(a,b){if(null!==b)return b.abbr=a,L[a]=L[a]||new Ta,L[a].set(b),Z(a),L[a];delete L[a];return null}function M(a){var b;a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr);if(!a)return ga;if(!F(a)){if(b=Va(a))return b;a=[a]}a:{b=0;for(var c,d,m,e;b<a.length;){e=Ua(a[b]).split("-");c=e.length;for(d=(d=Ua(a[b+1]))?d.split("-"):null;0<c;){if(m=Va(e.slice(0,c).join("-"))){a=m;
break a}if(d&&d.length>=c&&Ra(e,d,!0)>=c-1)break;c--}b++}a=null}return a}function u(a,b){var c=a.toLowerCase();aa[c]=aa[c+"s"]=aa[b]=a}function y(a){return"string"===typeof a?aa[a]||aa[a.toLowerCase()]:void 0}function Xa(a){var b={},c,d;for(d in a)K(a,d)&&(c=y(d))&&(b[c]=a[d]);return b}function T(a,b){return function(c){return null!=c?(this._d["set"+(this._isUTC?"UTC":"")+a](c),g.updateOffset(this,b),this):ha(this,a)}}function ha(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function Ya(a,b){var c;
if("object"===typeof a)for(c in a)this.set(c,a[c]);else if(a=y(a),"function"===typeof this[a])return this[a](b);return this}function ua(a,b,c){var d=""+Math.abs(a);return(0<=a?c?"+":"":"-")+Math.pow(10,Math.max(0,b-d.length)).toString().substr(1)+d}function h(a,b,c,d){var m=d;"string"===typeof d&&(m=function(){return this[d]()});a&&(U[a]=m);b&&(U[b[0]]=function(){return ua(m.apply(this,arguments),b[1],b[2])});c&&(U[c]=function(){return this.localeData().ordinal(m.apply(this,arguments),a)})}function Cb(a){return a.match(/\[[\s\S]/)?
a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function Db(a){var b=a.match(Za),c,d;c=0;for(d=b.length;c<d;c++)b[c]=U[b[c]]?U[b[c]]:Cb(b[c]);return function(m){var e="";for(c=0;c<d;c++)e+=b[c]instanceof Function?b[c].call(m,a):b[c];return e}}function va(a,b){if(!a.isValid())return a.localeData().invalidDate();b=$a(b,a.localeData());wa[b]=wa[b]||Db(b);return wa[b](a)}function $a(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(ia.lastIndex=0;0<=d&&ia.test(a);)a=a.replace(ia,c),ia.lastIndex=
0,--d;return a}function f(a,b,c){xa[a]="function"===typeof b&&"[object Function]"===Object.prototype.toString.call(b)?b:function(a){return a&&c?c:b}}function Eb(a,b){return K(xa,a)?xa[a](b._strict,b._locale):new RegExp(Fb(a))}function Fb(a){return a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,c,d,m,e){return c||d||m||e}).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function t(a,b){var c,d=b;"string"===typeof a&&(a=[a]);"number"===typeof b&&(d=function(a,c){c[b]=q(a)});for(c=
0;c<a.length;c++)ya[a[c]]=d}function ba(a,b){t(a,function(a,d,m,e){m._w=m._w||{};b(a,m._w,m,e)})}function za(a,b){return(new Date(Date.UTC(a,b+1,0))).getUTCDate()}function ab(a,b){var c;if("string"===typeof b&&(b=a.localeData().monthsParse(b),"number"!==typeof b))return a;c=Math.min(a.date(),za(a.year(),b));a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c);return a}function bb(a){return null!=a?(ab(this,a),g.updateOffset(this,!0),this):ha(this,"Month")}function Aa(a){var b;(b=a._a)&&-2===n(a).overflow&&
(b=0>b[D]||11<b[D]?D:1>b[A]||b[A]>za(b[B],b[D])?A:0>b[v]||24<b[v]||24===b[v]&&(0!==b[N]||0!==b[O]||0!==b[P])?v:0>b[N]||59<b[N]?N:0>b[O]||59<b[O]?O:0>b[P]||999<b[P]?P:-1,n(a)._overflowDayOfYear&&(b<B||b>A)&&(b=A),n(a).overflow=b);return a}function cb(a){!1===g.suppressDeprecationWarnings&&"undefined"!==typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}function z(a,b){var c=!0;return fa(function(){c&&(cb(a+"\n"+Error().stack),c=!1);return b.apply(this,arguments)},b)}function db(a){var b,
c,d=a._i,m=Gb.exec(d);if(m){n(a).iso=!0;b=0;for(c=Ba.length;b<c;b++)if(Ba[b][1].exec(d)){a._f=Ba[b][0];break}b=0;for(c=Ca.length;b<c;b++)if(Ca[b][1].exec(d)){a._f+=(m[6]||" ")+Ca[b][0];break}d.match(ja)&&(a._f+="Z");Da(a)}else a._isValid=!1}function Hb(a){var b=Ib.exec(a._i);null!==b?a._d=new Date(+b[1]):(db(a),!1===a._isValid&&(delete a._isValid,g.createFromInputFallback(a)))}function Jb(a,b,c,d,m,e,f){b=new Date(a,b,c,d,m,e,f);1970>a&&b.setFullYear(a);return b}function Ea(a){var b=new Date(Date.UTC.apply(null,
arguments));1970>a&&b.setUTCFullYear(a);return b}function Fa(a){return 0===a%4&&0!==a%100||0===a%400}function Q(a,b,c){b=c-b;c-=a.day();c>b&&(c-=7);c<b-7&&(c+=7);a=p(a).add(c,"d");return{week:Math.ceil(a.dayOfYear()/7),year:a.year()}}function V(a,b,c){return null!=a?a:null!=b?b:c}function Ga(a){var b,c,d=[],m;if(!a._d){m=new Date;m=a._useUTC?[m.getUTCFullYear(),m.getUTCMonth(),m.getUTCDate()]:[m.getFullYear(),m.getMonth(),m.getDate()];if(a._w&&null==a._a[A]&&null==a._a[D]){var e,f,g;e=a._w;null!=
e.GG||null!=e.W||null!=e.E?(g=1,b=4,c=V(e.GG,a._a[B],Q(p(),1,4).year),f=V(e.W,1),e=V(e.E,1)):(g=a._locale._week.dow,b=a._locale._week.doy,c=V(e.gg,a._a[B],Q(p(),g,b).year),f=V(e.w,1),null!=e.d?(e=e.d,e<g&&++f):e=null!=e.e?e.e+g:g);b=6+g-b;var h=Ea(c,0,1+b).getUTCDay();h<g&&(h+=7);g=1+b+7*(f-1)-h+(null!=e?1*e:g);b=0<g?c:c-1;c=0<g?g:(Fa(c-1)?366:365)+g;a._a[B]=b;a._dayOfYear=c}a._dayOfYear&&(c=V(a._a[B],m[B]),a._dayOfYear>(Fa(c)?366:365)&&(n(a)._overflowDayOfYear=!0),c=Ea(c,0,a._dayOfYear),a._a[D]=
c.getUTCMonth(),a._a[A]=c.getUTCDate());for(c=0;3>c&&null==a._a[c];++c)a._a[c]=d[c]=m[c];for(;7>c;c++)a._a[c]=d[c]=null==a._a[c]?2===c?1:0:a._a[c];24===a._a[v]&&0===a._a[N]&&0===a._a[O]&&0===a._a[P]&&(a._nextDay=!0,a._a[v]=0);a._d=(a._useUTC?Ea:Jb).apply(null,d);null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm);a._nextDay&&(a._a[v]=24)}}function Da(a){if(a._f===g.ISO_8601)db(a);else{a._a=[];n(a).empty=!0;var b=""+a._i,c,d,e,f,h,k=b.length,l=0;e=$a(a._f,a._locale).match(Za)||[];for(c=0;c<
e.length;c++){f=e[c];if(d=(b.match(Eb(f,a))||[])[0])h=b.substr(0,b.indexOf(d)),0<h.length&&n(a).unusedInput.push(h),b=b.slice(b.indexOf(d)+d.length),l+=d.length;if(U[f]){if(d?n(a).empty=!1:n(a).unusedTokens.push(f),h=a,null!=d&&K(ya,f))ya[f](d,h._a,h,f)}else a._strict&&!d&&n(a).unusedTokens.push(f)}n(a).charsLeftOver=k-l;0<b.length&&n(a).unusedInput.push(b);!0===n(a).bigHour&&12>=a._a[v]&&0<a._a[v]&&(n(a).bigHour=void 0);b=a._a;c=v;k=a._locale;e=a._a[v];l=a._meridiem;null!=l&&(null!=k.meridiemHour?
e=k.meridiemHour(e,l):null!=k.isPM&&((k=k.isPM(l))&&12>e&&(e+=12),k||12!==e||(e=0)));b[c]=e;Ga(a);Aa(a)}}function Kb(a){if(!a._d){var b=Xa(a._i);a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond];Ga(a)}}function eb(a){var b=a._i,c=a._f;a._locale=a._locale||M(a._l);if(null===b||void 0===c&&""===b)return Qa({nullInput:!0});"string"===typeof b&&(a._i=b=a._locale.preparse(b));if(G(b))return new Y(Aa(b));if(F(c)){var d,e,f;if(0===a._f.length)n(a).invalidFormat=!0,a._d=new Date(NaN);
else{for(b=0;b<a._f.length;b++)if(c=0,d=ra({},a),null!=a._useUTC&&(d._useUTC=a._useUTC),d._f=a._f[b],Da(d),Pa(d)&&(c+=n(d).charsLeftOver,c+=10*n(d).unusedTokens.length,n(d).score=c,null==f||c<f))f=c,e=d;fa(a,e||d)}}else c?Da(a):ea(b)?a._d=b:Lb(a);return a}function Lb(a){var b=a._i;void 0===b?a._d=new Date:ea(b)?a._d=new Date(+b):"string"===typeof b?Hb(a):F(b)?(a._a=Bb(b.slice(0),function(a){return parseInt(a,10)}),Ga(a)):"object"===typeof b?Kb(a):"number"===typeof b?a._d=new Date(b):g.createFromInputFallback(a)}
function Oa(a,b,c,d,e){var f={};"boolean"===typeof c&&(d=c,c=void 0);f._isAMomentObject=!0;f._useUTC=f._isUTC=e;f._l=c;f._i=a;f._f=b;f._strict=d;a=new Y(Aa(eb(f)));a._nextDay&&(a.add(1,"d"),a._nextDay=void 0);return a}function p(a,b,c,d){return Oa(a,b,c,d,!1)}function fb(a,b){var c,d;1===b.length&&F(b[0])&&(b=b[0]);if(!b.length)return p();c=b[0];for(d=1;d<b.length;++d)if(!b[d].isValid()||b[d][a](c))c=b[d];return c}function ka(a){a=Xa(a);var b=a.year||0,c=a.quarter||0,d=a.month||0,e=a.week||0,f=a.day||
0;this._milliseconds=+(a.millisecond||0)+1E3*(a.second||0)+6E4*(a.minute||0)+36E5*(a.hour||0);this._days=+f+7*e;this._months=+d+3*c+12*b;this._data={};this._locale=M();this._bubble()}function Ha(a){return a instanceof ka}function gb(a,b){h(a,0,0,function(){var a=this.utcOffset(),d="+";0>a&&(a=-a,d="-");return d+ua(~~(a/60),2)+b+ua(~~a%60,2)})}function Ia(a){a=(a||"").match(ja)||[];a=((a[a.length-1]||[])+"").match(Mb)||["-",0,0];var b=+(60*a[1])+q(a[2]);return"+"===a[0]?b:-b}function Ja(a,b){var c,
d;return b._isUTC?(c=b.clone(),d=(G(a)||ea(a)?+a:+p(a))-+c,c._d.setTime(+c._d+d),g.updateOffset(c,!1),c):p(a).local()}function hb(){return this._isUTC&&0===this._offset}function H(a,b){var c=a,d=null;Ha(a)?c={ms:a._milliseconds,d:a._days,M:a._months}:"number"===typeof a?(c={},b?c[b]=a:c.milliseconds=a):(d=Nb.exec(a))?(c="-"===d[1]?-1:1,c={y:0,d:q(d[A])*c,h:q(d[v])*c,m:q(d[N])*c,s:q(d[O])*c,ms:q(d[P])*c}):(d=Ob.exec(a))?(c="-"===d[1]?-1:1,c={y:R(d[2],c),M:R(d[3],c),d:R(d[4],c),h:R(d[5],c),m:R(d[6],
c),s:R(d[7],c),w:R(d[8],c)}):null==c?c={}:"object"===typeof c&&("from"in c||"to"in c)&&(d=p(c.from),c=p(c.to),c=Ja(c,d),d.isBefore(c)?c=ib(d,c):(c=ib(c,d),c.milliseconds=-c.milliseconds,c.months=-c.months),d=c,c={},c.ms=d.milliseconds,c.M=d.months);c=new ka(c);Ha(a)&&K(a,"_locale")&&(c._locale=a._locale);return c}function R(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function ib(a,b){var c={milliseconds:0,months:0};c.months=b.month()-a.month()+12*(b.year()-a.year());a.clone().add(c.months,
"M").isAfter(b)&&--c.months;c.milliseconds=+b-+a.clone().add(c.months,"M");return c}function jb(a,b){return function(c,d){var e;null===d||isNaN(+d)||(kb[b]||(cb("moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),kb[b]=!0),e=c,c=d,d=e);e=H("string"===typeof c?+c:c,d);lb(this,e,a);return this}}function lb(a,b,c,d){var e=b._milliseconds,f=b._days;b=b._months;d=null==d?!0:d;e&&a._d.setTime(+a._d+e*c);f&&(e=ha(a,"Date")+f*c,a._d["set"+(a._isUTC?"UTC":"")+"Date"](e));
b&&ab(a,ha(a,"Month")+b*c);d&&g.updateOffset(a,f||b)}function mb(){var a=this.clone().utc();return 0<a.year()&&9999>=a.year()?"function"===typeof Date.prototype.toISOString?this.toDate().toISOString():va(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):va(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function nb(a){if(void 0===a)return this._locale._abbr;a=M(a);null!=a&&(this._locale=a);return this}function ob(){return this._locale}function la(a,b){h(0,[a,a.length],0,b)}function pb(a,b,c){return Q(p([a,11,31+b-c]),b,c).week}
function qb(a,b){h(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function rb(a,b){return b._meridiemParse}function Pb(a,b){b[P]=q(1E3*("0."+a))}function sb(a){return a}function tb(a,b,c,d){var e=M();b=X().set(d,b);return e[c](b,a)}function ca(a,b,c,d,e){"number"===typeof a&&(b=a,a=void 0);a=a||"";if(null!=b)return tb(a,b,c,e);var f=[];for(b=0;b<d;b++)f[b]=tb(a,b,c,e);return f}function ub(a,b,c,d){b=H(b,c);a._milliseconds+=d*b._milliseconds;a._days+=d*b._days;
a._months+=d*b._months;return a._bubble()}function vb(a){return 0>a?Math.floor(a):Math.ceil(a)}function I(a){return function(){return this.as(a)}}function S(a){return function(){return this._data[a]}}function Qb(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function ma(){var a=Ka(this._milliseconds)/1E3,b=Ka(this._days),c=Ka(this._months),d,e,f;d=w(a/60);e=w(d/60);a%=60;d%=60;f=w(c/12);var c=c%12,g=this.asSeconds();return g?(0>g?"-":"")+"P"+(f?f+"Y":"")+(c?c+"M":"")+(b?b+"D":"")+(e||d||a?"T":"")+
(e?e+"H":"")+(d?d+"M":"")+(a?a+"S":""):"P0D"}var Na,sa=g.momentProperties=[],ta=!1,L={},ga,aa={},Za=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,ia=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,wa={},U={},wb=/\d/,x=/\d\d/,xb=/\d{3}/,La=/\d{4}/,na=/[+-]?\d{6}/,r=/\d\d?/,oa=/\d{1,3}/,Ma=/\d{1,4}/,pa=/[+-]?\d{1,6}/,Rb=/\d+/,qa=/[+-]?\d+/,ja=/Z|[+-]\d\d:?\d\d/gi,da=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
xa={},ya={},B=0,D=1,A=2,v=3,N=4,O=5,P=6;h("M",["MM",2],"Mo",function(){return this.month()+1});h("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)});h("MMMM",0,0,function(a){return this.localeData().months(this,a)});u("month","M");f("M",r);f("MM",r,x);f("MMM",da);f("MMMM",da);t(["M","MM"],function(a,b){b[D]=q(a)-1});t(["MMM","MMMM"],function(a,b,c,d){d=c._locale.monthsParse(a,d,c._strict);null!=d?b[D]=d:n(c).invalidMonth=a});var kb={};g.suppressDeprecationWarnings=!1;var Gb=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
Ba=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],Ca=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],Ib=/^\/?Date\((\-?\d+)/i;g.createFromInputFallback=z("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",
function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))});h(0,["YY",2],0,function(){return this.year()%100});h(0,["YYYY",4],0,"year");h(0,["YYYYY",5],0,"year");h(0,["YYYYYY",6,!0],0,"year");u("year","y");f("Y",qa);f("YY",r,x);f("YYYY",Ma,La);f("YYYYY",pa,na);f("YYYYYY",pa,na);t(["YYYYY","YYYYYY"],B);t("YYYY",function(a,b){b[B]=2===a.length?g.parseTwoDigitYear(a):q(a)});t("YY",function(a,b){b[B]=g.parseTwoDigitYear(a)});g.parseTwoDigitYear=function(a){return q(a)+(68<q(a)?1900:2E3)};var yb=T("FullYear",
!1);h("w",["ww",2],"wo","week");h("W",["WW",2],"Wo","isoWeek");u("week","w");u("isoWeek","W");f("w",r);f("ww",r,x);f("W",r);f("WW",r,x);ba(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=q(a)});h("DDD",["DDDD",3],"DDDo","dayOfYear");u("dayOfYear","DDD");f("DDD",oa);f("DDDD",xb);t(["DDD","DDDD"],function(a,b,c){c._dayOfYear=q(a)});g.ISO_8601=function(){};var Sb=z("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var a=p.apply(null,
arguments);return a<this?this:a}),Tb=z("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var a=p.apply(null,arguments);return a>this?this:a});gb("Z",":");gb("ZZ","");f("Z",ja);f("ZZ",ja);t(["Z","ZZ"],function(a,b,c){c._useUTC=!0;c._tzm=Ia(a)});var Mb=/([\+\-]|\d\d)/gi;g.updateOffset=function(){};var Nb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Ob=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
H.fn=ka.prototype;var Ub=jb(1,"add"),Vb=jb(-1,"subtract");g.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var zb=z("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});h(0,["gg",2],0,function(){return this.weekYear()%100});h(0,["GG",2],0,function(){return this.isoWeekYear()%100});la("gggg","weekYear");la("ggggg","weekYear");la("GGGG","isoWeekYear");la("GGGGG",
"isoWeekYear");u("weekYear","gg");u("isoWeekYear","GG");f("G",qa);f("g",qa);f("GG",r,x);f("gg",r,x);f("GGGG",Ma,La);f("gggg",Ma,La);f("GGGGG",pa,na);f("ggggg",pa,na);ba(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=q(a)});ba(["gg","GG"],function(a,b,c,d){b[d]=g.parseTwoDigitYear(a)});h("Q",0,0,"quarter");u("quarter","Q");f("Q",wb);t("Q",function(a,b){b[D]=3*(q(a)-1)});h("D",["DD",2],"Do","date");u("date","D");f("D",r);f("DD",r,x);f("Do",function(a,b){return a?b._ordinalParse:
b._ordinalParseLenient});t(["D","DD"],A);t("Do",function(a,b){b[A]=q(a.match(r)[0],10)});var Ab=T("Date",!0);h("d",0,"do","day");h("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)});h("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)});h("dddd",0,0,function(a){return this.localeData().weekdays(this,a)});h("e",0,0,"weekday");h("E",0,0,"isoWeekday");u("day","d");u("weekday","e");u("isoWeekday","E");f("d",r);f("e",r);f("E",r);f("dd",da);f("ddd",da);f("dddd",da);ba(["dd",
"ddd","dddd"],function(a,b,c){var d=c._locale.weekdaysParse(a);null!=d?b.d=d:n(c).invalidWeekday=a});ba(["d","e","E"],function(a,b,c,d){b[d]=q(a)});h("H",["HH",2],0,"hour");h("h",["hh",2],0,function(){return this.hours()%12||12});qb("a",!0);qb("A",!1);u("hour","h");f("a",rb);f("A",rb);f("H",r);f("h",r);f("HH",r,x);f("hh",r,x);t(["H","HH"],v);t(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a);c._meridiem=a});t(["h","hh"],function(a,b,c){b[v]=q(a);n(c).bigHour=!0});var Wb=T("Hours",!0);h("m",["mm",
2],0,"minute");u("minute","m");f("m",r);f("mm",r,x);t(["m","mm"],N);var Xb=T("Minutes",!1);h("s",["ss",2],0,"second");u("second","s");f("s",r);f("ss",r,x);t(["s","ss"],O);var Yb=T("Seconds",!1);h("S",0,0,function(){return~~(this.millisecond()/100)});h(0,["SS",2],0,function(){return~~(this.millisecond()/10)});h(0,["SSS",3],0,"millisecond");h(0,["SSSS",4],0,function(){return 10*this.millisecond()});h(0,["SSSSS",5],0,function(){return 100*this.millisecond()});h(0,["SSSSSS",6],0,function(){return 1E3*
this.millisecond()});h(0,["SSSSSSS",7],0,function(){return 1E4*this.millisecond()});h(0,["SSSSSSSS",8],0,function(){return 1E5*this.millisecond()});h(0,["SSSSSSSSS",9],0,function(){return 1E6*this.millisecond()});u("millisecond","ms");f("S",oa,wb);f("SS",oa,x);f("SSS",oa,xb);var C;for(C="SSSS";9>=C.length;C+="S")f(C,Rb);for(C="S";9>=C.length;C+="S")t(C,Pb);var Zb=T("Milliseconds",!1);h("z",0,0,"zoneAbbr");h("zz",0,0,"zoneName");var e=Y.prototype;e.add=Ub;e.calendar=function(a,b){var c=a||p(),d=Ja(c,
this).startOf("day"),d=this.diff(d,"days",!0),d=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(b&&b[d]||this.localeData().calendar(d,this,p(c)))};e.clone=function(){return new Y(this)};e.diff=function(a,b,c){a=Ja(a,this);var d=6E4*(a.utcOffset()-this.utcOffset());b=y(b);if("year"===b||"month"===b||"quarter"===b){var d=12*(a.year()-this.year())+(a.month()-this.month()),e=this.clone().add(d,"months"),f;0>a-e?(f=this.clone().add(d-
1,"months"),a=(a-e)/(e-f)):(f=this.clone().add(d+1,"months"),a=(a-e)/(f-e));a=-(d+a);"quarter"===b?a/=3:"year"===b&&(a/=12)}else a=this-a,a="second"===b?a/1E3:"minute"===b?a/6E4:"hour"===b?a/36E5:"day"===b?(a-d)/864E5:"week"===b?(a-d)/6048E5:a;return c?a:w(a)};e.endOf=function(a){a=y(a);return void 0===a||"millisecond"===a?this:this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")};e.format=function(a){a=va(this,a||g.defaultFormat);return this.localeData().postformat(a)};e.from=function(a,
b){return this.isValid()?H({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()};e.fromNow=function(a){return this.from(p(),a)};e.to=function(a,b){return this.isValid()?H({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()};e.toNow=function(a){return this.to(p(),a)};e.get=Ya;e.invalidAt=function(){return n(this).overflow};e.isAfter=function(a,b){b=y("undefined"!==typeof b?b:"millisecond");return"millisecond"===b?(a=G(a)?a:p(a),+this>
+a):(G(a)?+a:+p(a))<+this.clone().startOf(b)};e.isBefore=function(a,b){var c;b=y("undefined"!==typeof b?b:"millisecond");if("millisecond"===b)return a=G(a)?a:p(a),+this<+a;c=G(a)?+a:+p(a);return+this.clone().endOf(b)<c};e.isBetween=function(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)};e.isSame=function(a,b){var c;b=y(b||"millisecond");if("millisecond"===b)return a=G(a)?a:p(a),+this===+a;c=+p(a);return+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b)};e.isValid=function(){return Pa(this)};
e.lang=zb;e.locale=nb;e.localeData=ob;e.max=Tb;e.min=Sb;e.parsingFlags=function(){return fa({},n(this))};e.set=Ya;e.startOf=function(a){a=y(a);switch(a){case "year":this.month(0);case "quarter":case "month":this.date(1);case "week":case "isoWeek":case "day":this.hours(0);case "hour":this.minutes(0);case "minute":this.seconds(0);case "second":this.milliseconds(0)}"week"===a&&this.weekday(0);"isoWeek"===a&&this.isoWeekday(1);"quarter"===a&&this.month(3*Math.floor(this.month()/3));return this};e.subtract=
Vb;e.toArray=function(){return[this.year(),this.month(),this.date(),this.hour(),this.minute(),this.second(),this.millisecond()]};e.toObject=function(){return{years:this.year(),months:this.month(),date:this.date(),hours:this.hours(),minutes:this.minutes(),seconds:this.seconds(),milliseconds:this.milliseconds()}};e.toDate=function(){return this._offset?new Date(+this):this._d};e.toISOString=mb;e.toJSON=mb;e.toString=function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")};
e.unix=function(){return Math.floor(+this/1E3)};e.valueOf=function(){return+this._d-6E4*(this._offset||0)};e.year=yb;e.isLeapYear=function(){return Fa(this.year())};e.weekYear=function(a){var b=Q(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")};e.isoWeekYear=function(a){var b=Q(this,1,4).year;return null==a?b:this.add(a-b,"y")};e.quarter=e.quarters=function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)};e.month=
bb;e.daysInMonth=function(){return za(this.year(),this.month())};e.week=e.weeks=function(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")};e.isoWeek=e.isoWeeks=function(a){var b=Q(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")};e.weeksInYear=function(){var a=this.localeData()._week;return pb(this.year(),a.dow,a.doy)};e.isoWeeksInYear=function(){return pb(this.year(),1,4)};e.date=Ab;e.day=e.days=function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();if(null!=
a){var c=this.localeData();"string"===typeof a&&(isNaN(a)?(a=c.weekdaysParse(a),a="number"===typeof a?a:null):a=parseInt(a,10));return this.add(a-b,"d")}return b};e.weekday=function(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")};e.isoWeekday=function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)};e.dayOfYear=function(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864E5)+1;return null==a?b:this.add(a-b,"d")};
e.hour=e.hours=Wb;e.minute=e.minutes=Xb;e.second=e.seconds=Yb;e.millisecond=e.milliseconds=Zb;e.utcOffset=function(a,b){var c=this._offset||0,d;return null!=a?("string"===typeof a&&(a=Ia(a)),16>Math.abs(a)&&(a*=60),!this._isUTC&&b&&(d=15*-Math.round(this._d.getTimezoneOffset()/15)),this._offset=a,this._isUTC=!0,null!=d&&this.add(d,"m"),c!==a&&(!b||this._changeInProgress?lb(this,H(a-c,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,g.updateOffset(this,!0),this._changeInProgress=null)),
this):this._isUTC?c:15*-Math.round(this._d.getTimezoneOffset()/15)};e.utc=function(a){return this.utcOffset(0,a)};e.local=function(a){this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(15*-Math.round(this._d.getTimezoneOffset()/15),"m"));return this};e.parseZone=function(){this._tzm?this.utcOffset(this._tzm):"string"===typeof this._i&&this.utcOffset(Ia(this._i));return this};e.hasAlignedHourOffset=function(a){a=a?p(a).utcOffset():0;return 0===(this.utcOffset()-a)%60};e.isDST=function(){return this.utcOffset()>
this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()};e.isDSTShifted=function(){if("undefined"!==typeof this._isDSTShifted)return this._isDSTShifted;var a={};ra(a,this);a=eb(a);if(a._a){var b=a._isUTC?X(a._a):p(a._a);this._isDSTShifted=this.isValid()&&0<Ra(a._a,b.toArray())}else this._isDSTShifted=!1;return this._isDSTShifted};e.isLocal=function(){return!this._isUTC};e.isUtcOffset=function(){return this._isUTC};e.isUtc=hb;e.isUTC=hb;e.zoneAbbr=function(){return this._isUTC?
"UTC":""};e.zoneName=function(){return this._isUTC?"Coordinated Universal Time":""};e.dates=z("dates accessor is deprecated. Use date instead.",Ab);e.months=z("months accessor is deprecated. Use month instead",bb);e.years=z("years accessor is deprecated. Use year instead",yb);e.zone=z("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",function(a,b){return null!=a?("string"!==typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()});var k=
Ta.prototype;k._calendar={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};k.calendar=function(a,b,c){a=this._calendar[a];return"function"===typeof a?a.call(b,c):a};k._longDateFormat={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};k.longDateFormat=function(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];
if(b||!c)return b;this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)});return this._longDateFormat[a]};k._invalidDate="Invalid date";k.invalidDate=function(){return this._invalidDate};k._ordinal="%d";k.ordinal=function(a){return this._ordinal.replace("%d",a)};k._ordinalParse=/\d{1,2}/;k.preparse=sb;k.postformat=sb;k._relativeTime={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",
MM:"%d months",y:"a year",yy:"%d years"};k.relativeTime=function(a,b,c,d){var e=this._relativeTime[c];return"function"===typeof e?e(a,b,c,d):e.replace(/%d/i,a)};k.pastFuture=function(a,b){var c=this._relativeTime[0<a?"future":"past"];return"function"===typeof c?c(b):c.replace(/%s/i,b)};k.set=function(a){var b,c;for(c in a)b=a[c],"function"===typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)};k.months=function(a){return this._months[a.month()]};
k._months="January February March April May June July August September October November December".split(" ");k.monthsShort=function(a){return this._monthsShort[a.month()]};k._monthsShort="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");k.monthsParse=function(a,b,c){var d,e;this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]);for(d=0;12>d;d++)if(e=X([2E3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".",
"")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(e="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(e.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a)||c&&"MMM"===b&&this._shortMonthsParse[d].test(a)||!c&&this._monthsParse[d].test(a))return d};k.week=function(a){return Q(a,this._week.dow,this._week.doy).week};k._week={dow:0,doy:6};k.firstDayOfYear=function(){return this._week.doy};
k.firstDayOfWeek=function(){return this._week.dow};k.weekdays=function(a){return this._weekdays[a.day()]};k._weekdays="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");k.weekdaysMin=function(a){return this._weekdaysMin[a.day()]};k._weekdaysMin="Su Mo Tu We Th Fr Sa".split(" ");k.weekdaysShort=function(a){return this._weekdaysShort[a.day()]};k._weekdaysShort="Sun Mon Tue Wed Thu Fri Sat".split(" ");k.weekdaysParse=function(a){var b,c;this._weekdaysParse=this._weekdaysParse||[];
for(b=0;7>b;b++)if(this._weekdaysParse[b]||(c=p([2E3,1]).day(b),c="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(c.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b};k.isPM=function(a){return"p"===(a+"").toLowerCase().charAt(0)};k._meridiemParse=/[ap]\.?m?\.?/i;k.meridiem=function(a,b,c){return 11<a?c?"pm":"PM":c?"am":"AM"};Z("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,b=1===q(a%100/10)?"th":
1===b?"st":2===b?"nd":3===b?"rd":"th";return a+b}});g.lang=z("moment.lang is deprecated. Use moment.locale instead.",Z);g.langData=z("moment.langData is deprecated. Use moment.localeData instead.",M);var E=Math.abs,$b=I("ms"),ac=I("s"),bc=I("m"),cc=I("h"),dc=I("d"),ec=I("w"),fc=I("M"),gc=I("y"),hc=S("milliseconds"),ic=S("seconds"),jc=S("minutes"),kc=S("hours"),lc=S("days"),mc=S("months"),nc=S("years"),W=Math.round,J={s:45,m:45,h:22,d:26,M:11},Ka=Math.abs,l=ka.prototype;l.abs=function(){var a=this._data;
this._milliseconds=E(this._milliseconds);this._days=E(this._days);this._months=E(this._months);a.milliseconds=E(a.milliseconds);a.seconds=E(a.seconds);a.minutes=E(a.minutes);a.hours=E(a.hours);a.months=E(a.months);a.years=E(a.years);return this};l.add=function(a,b){return ub(this,a,b,1)};l.subtract=function(a,b){return ub(this,a,b,-1)};l.as=function(a){var b,c=this._milliseconds;a=y(a);if("month"===a||"year"===a)return b=this._days+c/864E5,b=this._months+4800*b/146097,"month"===a?b:b/12;b=this._days+
Math.round(146097*this._months/4800);switch(a){case "week":return b/7+c/6048E5;case "day":return b+c/864E5;case "hour":return 24*b+c/36E5;case "minute":return 1440*b+c/6E4;case "second":return 86400*b+c/1E3;case "millisecond":return Math.floor(864E5*b)+c;default:throw Error("Unknown unit "+a);}};l.asMilliseconds=$b;l.asSeconds=ac;l.asMinutes=bc;l.asHours=cc;l.asDays=dc;l.asWeeks=ec;l.asMonths=fc;l.asYears=gc;l.valueOf=function(){return this._milliseconds+864E5*this._days+this._months%12*2592E6+31536E6*
q(this._months/12)};l._bubble=function(){var a=this._milliseconds,b=this._days,c=this._months,d=this._data;0<=a&&0<=b&&0<=c||0>=a&&0>=b&&0>=c||(a+=864E5*vb(146097*c/4800+b),c=b=0);d.milliseconds=a%1E3;a=w(a/1E3);d.seconds=a%60;a=w(a/60);d.minutes=a%60;a=w(a/60);d.hours=a%24;b+=w(a/24);a=w(4800*b/146097);c+=a;b-=vb(146097*a/4800);a=w(c/12);d.days=b;d.months=c%12;d.years=a;return this};l.get=function(a){a=y(a);return this[a+"s"]()};l.milliseconds=hc;l.seconds=ic;l.minutes=jc;l.hours=kc;l.days=lc;l.weeks=
function(){return w(this.days()/7)};l.months=mc;l.years=nc;l.humanize=function(a){var b=this.localeData(),c;c=!a;var d=H(this).abs(),e=W(d.as("s")),f=W(d.as("m")),g=W(d.as("h")),h=W(d.as("d")),k=W(d.as("M")),d=W(d.as("y")),e=e<J.s&&["s",e]||1===f&&["m"]||f<J.m&&["mm",f]||1===g&&["h"]||g<J.h&&["hh",g]||1===h&&["d"]||h<J.d&&["dd",h]||1===k&&["M"]||k<J.M&&["MM",k]||1===d&&["y"]||["yy",d];e[2]=c;e[3]=0<+this;e[4]=b;c=Qb.apply(null,e);a&&(c=b.pastFuture(+this,c));return b.postformat(c)};l.toISOString=
ma;l.toString=ma;l.toJSON=ma;l.locale=nb;l.localeData=ob;l.toIsoString=z("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",ma);l.lang=zb;h("X",0,0,"unix");h("x",0,0,"valueOf");f("x",qa);f("X",/[+-]?\d+(\.\d{1,3})?/);t("X",function(a,b,c){c._d=new Date(1E3*parseFloat(a,10))});t("x",function(a,b,c){c._d=new Date(q(a))});g.version="2.10.6";Na=p;g.fn=e;g.min=function(){var a=[].slice.call(arguments,0);return fb("isBefore",a)};g.max=function(){var a=[].slice.call(arguments,
0);return fb("isAfter",a)};g.utc=X;g.unix=function(a){return p(1E3*a)};g.months=function(a,b){return ca(a,b,"months",12,"month")};g.isDate=ea;g.locale=Z;g.invalid=Qa;g.duration=H;g.isMoment=G;g.weekdays=function(a,b){return ca(a,b,"weekdays",7,"day")};g.parseZone=function(){return p.apply(null,arguments).parseZone()};g.localeData=M;g.isDuration=Ha;g.monthsShort=function(a,b){return ca(a,b,"monthsShort",12,"month")};g.weekdaysMin=function(a,b){return ca(a,b,"weekdaysMin",7,"day")};g.defineLocale=Wa;
g.weekdaysShort=function(a,b){return ca(a,b,"weekdaysShort",7,"day")};g.normalizeUnits=y;g.relativeTimeThreshold=function(a,b){if(void 0===J[a])return!1;if(void 0===b)return J[a];J[a]=b;return!0};return g});
/**
 * We created a custom date picker becuase I couldn't find one for semantic
 */
$.fn.picker = function(params){
	var eles = $(this);

	function normalizeMonth(month){
		if (month == 12) return 1;
		return month + 1;
	}

	function backOne(date){
		var month = date.getMonth();
		var year = date.getFullYear();
		var day = date.getDate();

		if (month == 0){
			month = 11;
			year = year - 1;
		}
		else month--;
		return new Date(year, month, day);
	}

	function forwardOne(date){
		var month = date.getMonth();
		var year = date.getFullYear();
		var day = date.getDate();

		if (month == 11){
			month = 0;
			year = year + 1;
		}
		else month++
		return new Date(year, month, day);
	}

	function daysInMonth(month,year) {
		return new Date(year, normalizeMonth(month), 0).getDate();
	}

	function startMonthIdx(month, year){
		return new Date(year, month, 1).getDay();
	}

	function bodyClick(e){
		if ($(this).hasClass('changeDate')) return false;
		$('.picker-table').remove();
	}

	function Calendar(){
		this.ele = null;
		this.table = null;
		this.selectedDay = new Date();
	}

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	function createMonthDropDown(html){
		var filter = '<input type="hidden" name="filters">';
		var menu = $('<div class="menu"><div class="ui icon search input"><i class="search icon"></i><input type="text" placeholder="Search months..."></div><div class="divider"></div><div class="scrolling menu"></div></div>');
		var m = $(menu).find('.scrolling');
		for (var i = 0; i < months.length; i++){
			$(m).append('<div class="item" data-value="' + months[i] + '">' + months[i] + '</div>');
		}
		$(html).find('#monthDropDown').addClass('ui').addClass('dropdown').append(filter).append(menu);
		return html;
	}

	function createYearDropDown(html, date){
		var filter = '<input type="hidden" name="filters">';
		var menu = $('<div class="menu"><div class="ui icon search input"><i class="search icon"></i><input type="text" placeholder="Search years..."></div><div class="divider"></div><div class="scrolling menu"></div></div>');
		var m = $(menu).find('.scrolling');
		for (var i = -2; i < 7; i++){
			$(m).append('<div class="item" data-value="' + (date.getFullYear() + i) + '">' + (date.getFullYear() + i) + '</div>');
		}
		$(html).find('#yearDropDown').addClass('ui').addClass('dropdown').append(filter).append(menu);
		return html;
	}

	function formatTime(date){
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		if (hours > 12) hours = hours % 12;
		if (hours == 0) hours = 12;
		if (minutes != 0 && minutes != 30) minutes = '00';
		if (minutes == 0) minutes = '00';
		return hours + ':' + minutes + ' ' + ampm;
	}

	Calendar.prototype.setActiveDay = function(){
		var day = this.selectedDay.getDate() + '';
		$(this.table).find('.day.active').removeClass('active');
		$(this.table).find('table .day').each(function(){
			if ($(this).text() == day) $(this).addClass('active');
		});
	}

	Calendar.prototype.initTime = function(){
		var hours = this.selectedDay.getHours();
		var minutes = this.selectedDay.getMinutes();
		var ampm = hours >= 12 ? 'pm' : 'am';
		if (hours > 12) hours = hours % 12;
		if (hours == 0) hours = 12;
		return hours + ':' + minutes + ampm;
	}

	Calendar.prototype.render = function(x, y){
		$('.picker-table').remove();
		this.raw = '<div class="picker-table"><div id="time"><h2>Time</h2><div class="ui input"><input type="text" value="' + this.initTime() + '" id="datePickerTime"></div></div><table class="ui celled striped table"><thead><tr class="picker-dayNames"></tr></thead><tbody></tbody></table></div>';
		this.table = $(this.raw);
		$(this.table).find('#timeDropdown').dropdown({
			action: 'hide',
			onChange: function(value){
				var split = value.split(':');
				var hrs = parseInt(split[0]);
				var pm = value.indexOf('PM') > -1;
				hrs = pm ? hrs + 12 : hrs;
				var mins = parseInt(split[1].split(' ')[0]);
				_this.selectedDay = new Date(_this.selectedDay.getFullYear(), _this.selectedDay.getMonth(), 1, hrs, mins, 0);
				_this.render(_this.x, _this.y);	
				
				var topic = $(_this.ele).parent().prop('topic');
				var idx = $(_this.ele).index();
				var type = '';
				switch (idx){
					case 2: {type = 'start'; break;}
					case 3: {type = 'end'; break;}
					case 4: {type = 'duedate'; break;}
				}
				$('.picker-table').remove();
				topic.setDate(type, _this.selectedDay);
				$(_this.ele).html(moment(topic[type]).local('en').format('MMM DD YYYY hh:mm a'));
			}
		});
		if ($('.picker-table-style').length == 0){
			var style = '#time{text-align:center;position:absolute;top:0;right:-160px;width:157px;background-color:white;-webkit-box-shadow:0 0 16px rgba(0,0,14,.77);-moz-box-shadow:0 0 16px rgba(0,0,14,.77);box-shadow:0 0 16px rgba(0,0,14,.77);}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.picker-table{position:absolute;-webkit-box-shadow:0 0 16px rgba(0,0,14,.77);-moz-box-shadow:0 0 16px rgba(0,0,14,.77);box-shadow:0 0 16px rgba(0,0,14,.77);left:10px;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;background-color:#fff;width:327px}.picker-table .picker-header{padding-top:10px}.picker-table td,.picker-table th{text-align:center!important}.picker-table td:hover{background-color:#3B69A8;cursor:pointer;color:#fff}.picker-table td.selected{background-color:rgba(59,105,168,.46)}';
			$('head').append('<style class="picker-table-style">' + style + '</style>');
		}
		this.x = x;
		this.y = y;
		this.setHeader();
		this.setNames();
		this.setDays();
		this.setActiveDay();
		$(this.table).css({
			left: (x - 225) + 'px',
			top: y + 'px'
		});

		$('body').unbind('click', bodyClick);
		$('body').append(this.table);
		$(this.table).click(function(e){
		    e.stopPropagation();
		});

		var _this = this;		
		$('.picker-back').click(function(){
			_this.selectedDay = backOne(_this.selectedDay);
			_this.render(_this.x, _this.y);
		});
		$('.picker-forward').click(function(){
			_this.selectedDay = forwardOne(_this.selectedDay);
			_this.render(_this.x, _this.y);
		});
		$('.day').click(function(){
			if ($(this).html() == "&nbsp;") return false;
			var cal = this.cal;
			var timeVal = $('#datePickerTime').val();
			function internalSetTime(){
				if (timeVal && timeVal.length > 2){
					var hours = timeVal.match(/[0-9]{1,}(?=\:)/g);
					var minutes = timeVal.match(/[0-9]{1,}(?=[a-zA-Z]{2})/g);
					var ampm = timeVal.match(/[a-zA-Z]{2}/g);
					if (!hours || hours.length != 1 ||
							!minutes || minutes.length != 1 ||
							!ampm || ampm.length != 1) return;
					cal.hour = parseInt(hours[0]);
					if (ampm[0] == 'am' && cal.hour == 12) cal.hour = 0;
					else if (ampm[0] == 'pm' && cal.hour != 12) cal.hour += 12;
					cal.minutes = parseInt(minutes[0]);
				}
			}
			internalSetTime();

			var topic = $(_this.ele).parents('tr').prop('topic');
			var idx = $(_this.ele).index();
			var type = '';
			switch (idx){
				case 2: {type = 'start'; break;}
				case 3: {type = 'end'; break;}
				case 4: {type = 'duedate'; break;}
			}
			$('.picker-table').remove();
			topic.offsetByCal(cal, type);
			$(_this.ele).html(moment(topic[type]).local('en').format('MMM DD YYYY hh:mm a')); 
		});

		setTimeout(function(){
			$('body').bind('click', bodyClick);
		}, 10);
	}

	Calendar.prototype.setHeader = function(){
		var grid = $(this.table).prepend('<div class="ui center aligned grid picker-header" id="tmp"></div>').find('#tmp').removeAttr('id');
		grid.append('<div class="left floated left aligned four wide column"><a class="ui button picker-back" style="padding: 4px 20px"><</a></div>');
		var html = '<div class="eight wide column">';
		html += '<div id="monthDropDown"><span class="text" style="padding: 4px 7px">' + moment(this.selectedDay).format('MMMM') + '</span></div>';
		html += '<div id="yearDropDown"><span class="text" style="padding: 4px 7px">' + this.selectedDay.getFullYear() + '</span></div>';
		html += '</div>';
		grid.append(html);
		grid = $(createMonthDropDown(grid));
		grid = $(createYearDropDown(grid, this.selectedDay));
		grid.append('<div class="right floated right aligned four wide column"><a class="ui button picker-forward" style="padding: 4px 20px; margin: 0;">></a></div>');
		var _this = this;
		grid.find('#monthDropDown').dropdown({
			action: 'hide',
			onChange: function(value){
				var idx = months.indexOf(value);
				_this.selectedDay = new Date(_this.selectedDay.getFullYear(), idx, 1);
				_this.render(_this.x, _this.y);	
			}
		});
		grid.find('#yearDropDown').dropdown({
			action: 'hide',
			onChange: function(value){
				_this.selectedDay = new Date(parseInt(value), _this.selectedDay.getMonth(), 1);
				_this.render(_this.x, _this.y);	
			}
		});
	}

	Calendar.prototype.setNames = function(){
		var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		for (var i = 0; i < days.length; i++) this.table.find('.picker-dayNames').append('<th>' + days[i] + '</th>');
	}

	Calendar.prototype.setDays = function(){
		var body = $(this.table).find('tbody');
		var selectedDayNumber = this.selectedDay.getDate();
		var totalDays = daysInMonth(this.selectedDay.getMonth(), this.selectedDay.getFullYear());
		var startIdx = startMonthIdx(this.selectedDay.getMonth(), this.selectedDay.getFullYear());

		var days = [];
		var row = 0;
		var col = 0;
		// set first
		if (startIdx > 0){
			for (var i = 0; i < startIdx; i++){
				if (!days[row]) days[row] = [];
				days[row][col++] = -1;
				if (col % 7 == 0){
					row++;
					col = 0;
					days[row] = [];
				}
			}
		}

		for (var i = 1; i <= totalDays; i++){
			if (!days[row]) days[row] = [];
			days[row][col++] = i;
			if (col % 7 == 0){
				row++;
				col = 0;
				days[row] = [];
			}
		}

		// last row
		if (days[row].length > 0 || days[row].length < 7){
			for (var i = days[row].length; i < 7; i++){
				if (!days[row]) days[row] = [];
				days[row][col++] = -1;
				if (col % 7 == 0){
					row++;
					col = 0;
				}
			}
		}

		var _this = this;
		for (var i = 0; i < days.length; i++){
			var row = $(body).append('<tr id="tmp"></tr>').find('#tmp').removeAttr('id');
			var allEmpty = 0;
			for (var j = 0; j < days[i].length; j++){
				var d = days[i][j]
				if (d == -1) {
					d = '&nbsp;';
					allEmpty++;
				}
				$(row).append('<td class="day" id="tmp">' + d + '</td>').find('#tmp').removeAttr('id').prop('cal', {
					day: d,
					month: _this.selectedDay.getMonth(),
					year: _this.selectedDay.getFullYear()
				});
			}
			if (allEmpty == 7) $(row).remove();
		}

	}

	Calendar.prototype.show = function(e){
		if ($(this).html().length > 0) this.cal.selectedDay = new Date($(this).html());
		else this.cal.selectedDay = new Date();
		this.cal.render(e.clientX, e.clientY);
	}

	eles.each(function(){
		$(this).prop('cal', new Calendar());
		$(this).click(this.cal.show);
		this.cal.ele = this;
	});
}
/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-tablesort
	Version 0.0.6
*/
$(function(){var t=window.Zepto||window.jQuery;t.tablesort=function(e,s){var i=this;this.$table=e,this.$thead=this.$table.find("thead"),this.settings=t.extend({},t.tablesort.defaults,s),this.$sortCells=this.$thead.length>0?this.$thead.find("th:not(.no-sort)"):this.$table.find("th:not(.no-sort)"),this.$sortCells.bind("click.tablesort",function(){i.sort(t(this))}),this.index=null,this.$th=null,this.direction=null},t.tablesort.prototype={sort:function(e,s){var i=new Date,n=this,o=this.$table,a=this.$thead.length>0?o.find("tbody tr"):o.find("tr").has("td"),l=o.find("tr td:nth-of-type("+(e.index()+1)+")"),r=e.data().sortBy,d=[],h=l.map(function(s,i){return r?"function"==typeof r?r(t(e),t(i),n):r:null!=t(this).data().sortValue?t(this).data().sortValue:t(this).text()});0!==h.length&&("asc"!==s&&"desc"!==s?this.direction="asc"===this.direction?"desc":"asc":this.direction=s,s="asc"==this.direction?1:-1,n.$table.trigger("tablesort:start",[n]),n.log("Sorting by "+this.index+" "+this.direction),n.$table.css("display"),setTimeout(function(){n.$sortCells.removeClass(n.settings.asc+" "+n.settings.desc);for(var r=0,c=h.length;c>r;r++)d.push({index:r,cell:l[r],row:a[r],value:h[r]});d.sort(function(t,e){return t.value>e.value?1*s:t.value<e.value?-1*s:0}),t.each(d,function(t,e){o.append(e.row)}),e.addClass(n.settings[n.direction]),n.log("Sort finished in "+((new Date).getTime()-i.getTime())+"ms"),n.$table.trigger("tablesort:complete",[n]),n.$table.css("display")},h.length>2e3?200:10))},log:function(e){(t.tablesort.DEBUG||this.settings.debug)&&console&&console.log&&console.log("[tablesort] "+e)},destroy:function(){return this.$sortCells.unbind("click.tablesort"),this.$table.data("tablesort",null),null}},t.tablesort.DEBUG=!1,t.tablesort.defaults={debug:t.tablesort.DEBUG,asc:"sorted ascending",desc:"sorted descending"},t.fn.tablesort=function(e){var s,i;return this.each(function(){s=t(this),i=s.data("tablesort"),i&&i.destroy(),s.data("tablesort",new t.tablesort(s,e))})}});

 /*
 * @start object Topic
 * @name  Topic
 */
function Topic(obj, topics){
  this.obj = obj;
  this.topics = topics;
  this.isModule = (this.obj.Type == '0' ? true : false);
  this.start = this.isModule ? this.obj.ModuleStartDate : this.obj.StartDate;
  this.end = this.isModule ? this.obj.ModuleEndDate : this.obj.EndDate;
  this.duedate = this.isModule ? this.obj.ModuleDueDate : this.obj.DueDate;
  this.title = this.obj.Title;
  this.change = false;
  this.post = false;
  this.path = this.obj.path;
  this.type = (function(o){
    if (o.Url && o.Url.indexOf('&type=') > -1){
      var split = o.Url.split('&type=')[1];
      var type = split.split('&')[0];
      return type;
    }
    else{
      switch (o.TopicType){
        case 1: return 'file';
        case 3: return 'link';
      }
    }
  })(this.obj);

  this.isContentPage = true;

  if (this.type == undefined) this.type = 'module';

  this._id = (this.obj.Id ? this.obj.Id : this.obj.TopicId);

  // if (this.type == 'dropbox'){
  //   var dropbox = topics.getDropboxByName(this.title);
  //   if (dropbox.Availability && dropbox.Availability.StartDate) this.start = dropbox.Availability.StartDate;
  //   if (dropbox.Availability && dropbox.Availability.EndDate) this.end = dropbox.Availability.EndDate;
  //   this._dropboxId = dropbox.Id;
  // }
  // else if (this.type == 'quiz'){
  //   var quiz = topics.getQuizByName(this.title);
  //   this._quizId = quiz.id;
  //   this.start = quiz.start;
  //   this.end = quiz.end;
  // }
  // else if (this.type == 'survey'){
  //   var survey = topics.getSurveyByName(this.title);
  //   this._surveyId = survey.id;
  //   this.start = survey.start;
  //   this.end = survey.end;
  // }
  // else if (this.type == 'discuss'){
  //   var discuss = topics.getDiscussionByName(this.title);
  //   this._discussId = discuss.id;
  //   this.start = discuss.start;
  //   this.end = discuss.end;
  // }
  // else if (this.type == 'checklist'){
  //   var check = topics.getChecklistByName(this.title);
  //   this._checklistId = check.id;
  // }

  /**
   * Dateify the objects
   */
  this.keep = false;
  if (this.start) this.start = new Date(this.start);
  if (this.end) this.end = new Date(this.end);
  if (this.duedate) this.duedate = new Date(this.duedate);
  if (this.start || this.end || this.duedate) this.keep = true;
}

/**
 * @name  Topic.setOffset
 * @todo
 *  + Change the start date
 *  + Change the duedate
 *  + Change the end date
 *  + Verify the date changes
 */
Topic.prototype.setOffset = function(amount, type){
  if (!this.hasDates()) return;
  if (!type){
    if (this.start) this.start.setDate(this.start.getDate() + amount);
    if (this.end) this.end.setDate(this.end.getDate() + amount);
    if (this.duedate) this.duedate.setDate(this.duedate.getDate() + amount);
  }
  else{
    this[type] = new Date(this[type].setDate(this[type].getDate() + amount));
  }
  this.post = true;
}

Topic.prototype.isEditable = function(){
  return this.type.indexOf(' tool') == -1;
}

Topic.prototype.setEditable = function(){
  var isEditable = this.isEditable();
  if (!isEditable) {
    $(this.ele).find('.checkbox').addClass('disabled');
    $(this.ele).css('background-color', 'rgba(12, 15, 41, 0.59)');
    $(this.ele).addClass('nyi');
  }
}

/**
 * @name  Topic.draw
 * @description UPdate the dates
 * @todo
 *  + Update the dates (Chase)
 */
Topic.prototype.draw = function(){
  if (this.start) $(this.ele).find('td:nth-child(3)').text(moment(this.start).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(3)').text('');
  if (this.end) $(this.ele).find('td:nth-child(4)').text(moment(this.end).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(4)').text('');
  if (this.duedate) $(this.ele).find('td:nth-child(5)').text(moment(this.duedate).local('en').format('MMM DD YYYY hh:mm a'));
  else $(this.ele).find('td:nth-child(5)').text('');
}

/**
 * @name  Topic.setChecked
 * @todo
 *  + Set the checkmark
 */
Topic.prototype.setChecked = function(val){
  $(this.ele).find('.change')[0].checked = val;
  this.post = val;
  this.change = val;
}

/**
 * @name  Topic.clearDates
 * @description Clear the dates
 * @todo
 *  + Clear all 3 dates
 *  + update the UI
 */
Topic.prototype.clearDates = function(){
  this.start = null;
  this.end = null;
  this.duedate = null;
  this.draw();
  this.post = true;
}

/**
 * @name Topic.offsetByCal
 * @todo
 *  + offset the date by day, month, year
 */
Topic.prototype.offsetByCal = function(cal, type){

  var _this = this;
  function difference(date1, date2){
    var timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  }

  var selectedDate = null;
  var toDate = new Date(cal.year, cal.month, cal.day, cal.hour, cal.minutes, 0);

  selectedDate = this[type];

  if (selectedDate == undefined || selectedDate == null){
    switch (type){
      case 'start': this.setStart(toDate); break;
      case 'end': this.setEnd(toDate); break;
      case 'duedate': this.setDueDate(toDate); break;
    }
  }
  else{
    var offset = difference(selectedDate, toDate);
    this.setOffset(offset, type);
    this[type].setHours(cal.hour);
    this[type].setMinutes(cal.minutes);
  }
  this.setChecked(true);
}

Topic.prototype.setDate = function(type, date){
  switch (type){
    case 'start': this.setStart(date); break;
    case 'end': this.setEnd(date); break;
    case 'duedate': this.setDueDate(date); break;
  }
  this.setChecked(true);
}

/**
 * @description Set the start date
 * @name  Topic.setStart
 *  + set the start date
 */
Topic.prototype.setStart = function(date){
    this.start = date;
}

/**
 * @description Set the end date
 * @name Topic.setEnd
 *  + set the end date
 */
Topic.prototype.setEnd = function(date){
    this.end = date;
}

/**
 * @description Set the due date
 * @name  Topic.setDueDate
 * @todo
 *  + Set the duedate
 */
Topic.prototype.setDueDate = function(date){
    this.duedate = date;
}

/**
 * @description Checks if the topic has date
 */
Topic.prototype.hasDates = function(){
    return this.start != undefined ||
           this.end != undefined ||
           this.duedate != undefined;
}

/**
 * @name Topic.issueWithDates
 * @description Check if the dates conflict
 * @todo
 *  + Check if the start date comes after the end or due date
 *  + check if the due date comes after the end date
 */
Topic.prototype.issueWithDates = function(){
  return ((this.end && this.start) && this.start > this.end) || ((this.start && this.duedate) && this.start > this.duedate);
}

/**
 * @name  Topic.error
 * @description Throw an error
 * @todo
 *  + color the row and the cells
 */
Topic.prototype.error = function(msg){
  $(this.ele).css({backgroundColor: 'rgba(219, 40, 40, 0.35)'});
  if (this.issueWithDates()){
    $(this.ele).find('td:nth-child(3)').css({backgroundColor: 'rgba(219, 40, 40, 0.34)'});
    loading.stop();
  }
}

/**
 * @name  Topic.save
 * @todo 
 *  + Generate the appropriate post data
 *  + Post the data
 */
Topic.prototype.save = function(afterSaveCallback){

  if (this.issueWithDates()) {
    this.error('Invalid Date Sequence');
    return;
  }
  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createDateProperties(obj, date, name){
    var hasDate = date != null;
    if (date == null) date = new Date();
    obj['Has' + name] = hasDate ? 'TRUE' : 'FALSE';
    var selector = name + 'Selector$';
    obj[selector + 'year'] = date.getFullYear();
    obj[selector + 'month'] = date.getMonth() == 12 ? 1 : date.getMonth() + 1;
    obj[selector + 'day'] = date.getDate();
    obj[selector + 'isEnabled'] = hasDate ? 1 : 0;
    obj[selector + 'hasTime'] = 1;
    obj[selector + 'time$hour'] = date.getHours();
    obj[selector + 'time$minute'] = date.getMinutes();
    obj[selector + 'time$isEnabled'] = hasDate ? 1 : 0;
  }

  /**
   * @name  Topic.save.createModuleProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createModuleProperties(obj, topic){
    obj.ShowEditControls = 'True';
    if (topic.change){
      obj.ConditionSetId = null;
      obj.ConditionSetId = null;
      obj.HasConditionSet = 'False';
      obj.ConditionSetOperatorId = 1;
      obj.isXhr = 'True';
      obj.requestId = topic.topics.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.createTopicProperties
   * @todo
   *  + Set all the d2l variables
   */
  function createTopicProperties(obj, topic){
    obj._d2l_prc$headingLevel =  2;
    obj._d2l_prc$scope = 'restrictions';
    obj._d2l_prc$hasActiveForm = 'FALSE';
    obj.ShowEditControls = 'TRUE';
    if (topic.change){
      obj.ConditionSetId = null;
      obj.HasConditionSet = 'FALSE';
      obj.ConditionSetOperatorId = 1;
      obj.isXhr = 'TRUE';
      obj.requestId = topic.topics.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.getUrlType
   * @todo
   *  + Set all the d2l variables
   */
  function getUrlType(obj){
      switch (obj.type){
          case 'survey': return 'Survey';
          case 'file': return 'ContentFile';
          case 'dropbox': return 'Dropbox';
          case 'link': return 'ContentLink';
          case 'quiz': return 'quiz';
          case 'discuss': return 'DiscussionTopic';
          default: return obj.type;
      }
  }

  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   *  + Set the url to the Topic
   */
  function createCallUrl(obj, topic){
    var type = getUrlType(topic);
    if (type.indexOf(' tool')) type = type.replace(' tool', '');
    var url = '';
    if (topic.isModule){
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/module/' + topic._id + '/EditModuleRestrictions'
    } 
    // else if (topic.type == 'dropbox tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._dropboxId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'quiz tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._quizId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'survey tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._surveyId + '/UpdateRestrictions?topicId=' + topic._id;
    // }
    // else if (topic.type == 'discuss tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._discussId + '/UpdateRestrictions?topicId=' + topic._id; 
    // }
    // else if (topic.type == 'checklist tool'){
    //   url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._checklistId + '/UpdateRestrictions?topicId=' + topic._id; 
    // }
    else {
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + type + '/' + topic._id + '/UpdateRestrictions?topicId=' + topic._id;
    }
    topic.url = url;
  }

  var result = {};
  createDateProperties(result, this.start, 'StartDate');
  createDateProperties(result, this.end, 'EndDate');
  createDateProperties(result, this.duedate, 'DueDate');
  if (this.isModule) createModuleProperties(result, this);
  else createTopicProperties(result, this);
  createCallUrl(result, this);

  if (this.type == 'dropbox'){

  }

  var _this = this;
  $.post(this.url, result, function(data){}).always(function(){
    $(_this.ele).css({backgroundColor: ''});
    $(_this.ele).find('td:nth-child(3)').css({backgroundColor: ''});
    afterSaveCallback();
  });
}
/**
 * @end
 
/**
 * @start UI
 */
function Table(){
	this.html = $('<button class="ui button green" id="change">Submit</button><button class="ui button" id="OffsetDates">Set Offset</button><button class="ui button" id="toggle">Toggle All</button><button class="ui button" id="toggleAllWithDates">Toggle All With Dates</button><button class="ui button red" id="ClearDates">Clear Dates</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"><input placeholder="Filter..." id="filter"></div><table id="1231231231" class="ui compact celled definition table striped"><thead><tr><th>Change</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Due Date</th><th>Path</th><th>Type</th></tr></thead><tbody></tbody></table>');
	this.topics = [];
}

/**
 * @name  Table.draw
 * @todo
 *  - Toggle on / off
 */
Table.prototype.draw = function(){
	$('body').find('#1231231231').remove();
	$('body').append(this.html);
	$('table').tablesort().find('th').css({
		cursor: 'pointer',
		textDecoration: 'underline'
	});
	$('body').append('<style>.nyi:after{content:"Not Yet Implemented";color: white;text-align:center;width:100%;background-color:rgba(0, 0, 0, 0.65);display:block;position:absolute;left:0;}#top{top: 48px !important;}.ui.modal{top:4% !important;}th.sorted.ascending:after{content:"  \\2191"}th.sorted.descending:after{content:" \\2193"} .picker-hidden{display:none;}.filter-table .quick{margin-left:.5em;font-size:.8em;text-decoration:none}.fitler-table .quick:hover{text-decoration:underline}td.alt{background-color:#ffc;background-color:rgba(255,255,0,.2)}</style>');

	var _this = this;
	$('.change').on('change', function(){
		var val = $(this).val();
		_this.single($(this).attr('idx'), val);
	})

	$('#change').click(function(){
		topics.loading.start(true);
		_this.all(_this.topics);
	});

	$('#OffsetDates').click(function(){
		var amount = $('#offset').val();
		_this.offsetDates(parseInt(amount));
	});

	$('#ClearDates').click(function(){
		UI.prompt('Password', function(val){
			var input = '';
			for (i=0; i < val.length; i++) {
	     	input +=val[i].charCodeAt(0).toString(2) + " ";
	    }
			if (input == '1000011 1001001 1000100 1100001 1110100 1100101 1110011 '){
				window.topics.clearDates();
			}
		})
	})

	$('#toggle').click(function(){
		var total = 0;
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].change){
				total++;
			}
		}
		var on = (total / _this.topics.length < 1 || total == 0);
		for (var i = 0; i < _this.topics.length; i++){
			_this.topics[i].setChecked(on);
		}
	});

	$('#toggleAllWithDates').click(function(){
		var total = 0;
		var len = 0;
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].hasDates()) len++;
			if (_this.topics[i].hasDates() && _this.topics[i].change){
				total++;
			}
		}
		var on = (total / len < 1 || total == 0);
		for (var i = 0; i < _this.topics.length; i++){
			if (_this.topics[i].hasDates()) _this.topics[i].setChecked(on);
		}
	})

	$('#1231231231').filterTable({
		inputSelector: '#filter',
		callback: function(term, tbl){
			_this.topics = [];
			$(tbl).find('tr:not(:has(>th))').each(function(){
				if ($(this).hasClass('visible') && this.topic) _this.topics.push(this.topic);
			})
		}
	});
	$('.changeDate').picker();
}

/**
 * @name Table.offsetDates
 * @assign Chase
 * @todo
 *  + API call to the topics prototype function
 */
Table.prototype.offsetDates = function(amount){
	window.topics.uiOffsetActiveDates(amount);
}

/**
 * @Table.change
 * @todo
 *  + Set the callbacks to a local public variable
 */
Table.prototype.change = function(single, all){
	this.single = single;
	this.all = all;
}

Table.prototype.addRow = function(topic, idx){
	this.topics.push(topic);
	topic.idx = idx;
	var tmp = this.html.find('tbody').append('<tr id="tmp"></tr>').find('#tmp').removeAttr('id');
	$(tmp).prop('topic', topic);
	topic.ele = tmp[0];
	$(tmp).append('<td class=collapsing><div class="ui fitted slider checkbox"><input type="checkbox" class="change" idx="' + idx + '" ' + (topic.change ? 'checked' : '') + '><label></label></div></td>');
	$(tmp).append('<td>' + topic.title + '</td>');
	//$(tmp).append('<td>' + (topic.isModule ? 'Module' : 'Topic') + '</td>');
	if (topic.start) $(tmp).append('<td class="changeDate">' + moment(topic.start).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.end) $(tmp).append('<td class="changeDate">' + moment(topic.end).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.duedate) $(tmp).append('<td class="changeDate">' + moment(topic.duedate).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	$(tmp).append('<td>' + topic.path + '</td>');
	$(tmp).append('<td>' + topic.type + '</td>');
	$(tmp).find('.change').change(function(e){
		var val = $(this).val() == 'on';
		topic.post = val;
		topic.change = val;
	});
	topic.setEditable();
}

var UI = {
	alert: function(msg){
		var html = $('<div class="ui modal" id="modal"><i class="close icon"></i><div class=header>' + msg + '</div><div class=actions><div class="ui positive right labeled icon button">Ok <i class="checkmark icon"></i></div></div></div>');
		$('body').append(html);
		$('#modal').modal('toggle', function(){
			$('#modal').remove();
		}).modal('show');
	},
	prompt: function(msg, callback){
		var html = $('<div class="ui modal" id="modal"><i class="close icon"></i><div class=header>' + msg + '</div><div class="content"><div class="ui input" style="width:100%;"><input type="password" id="prompt_input" placeholder="Password"></div></div><div class=actions><div class="ui approve button">OK</div><div class="ui cancel button">Cancel</div></div></div>');
		$('body').append(html);
		$('#modal').modal('toggle', function(){
			$('#modal').remove();
		}).modal({
			onApprove: function(){
				var val = $('#prompt_input').val();
				callback(val);
				setTimeout(function(){
					$('#modal').remove();
				}, 20);
			}
		}).modal('show');
	}
}

/**
 * @end
 */
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
	this.dropboxes = [];
	this.checklist = [];
	this.surveys = [];
	this.quizzes = [];
	this.discussions = [];
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
 * @name  Topics.uiOffsetActiveDates
 * @description Offset the active dates
 * @assign Chase
 * @todo
 *  + Update the UI (Chase)
 *  + Offset only the toggled on dates (Chase)
 *  + Update the Topic object (Chase)
 */
Topics.prototype.uiOffsetActiveDates = function(amount){
	var toggled = this.getToggled();
	for (var i = 0; i < toggled.length; i++){
		toggled[i].setOffset(amount);
		toggled[i].draw();
	}
}

/**
 * @name  Topics.getToggled
 * @description returns the toggled dates
 * @todo
 *  - Return the toggled dates (Chase)
 */
Topics.prototype.getToggled = function(){
	var result = [];
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].post) result.push(this.items[i]);
	}
	return result;
}

/**
 * @name  Topics.getDropboxByName
 * @description See the title
 * @todo
 *  + Go through the dropboxes and find the one matching the name
 */
Topics.prototype.getDropboxByName = function(name){	
	for (var i = 0; i < this.dropboxes.length; i++){
		if (this.dropboxes[i].Name == name){
			return this.dropboxes[i];
		}
	}
}

/**
 * @name Topics.getQuizByName
 * @description A quick and dirty way to get the quiz ids
 * @todo
 *  + loop through and find the matching quiz
 */
Topics.prototype.getQuizByName = function(name){
	for (var i = 0; i < this.quizzes.length; i++){
		if (this.quizzes[i].name == name) return this.quizzes[i];
	}
}

/**
 * @name Topics.getSurveyByName
 * @description A quick and dirty way to get the survey ids
 * @todo
 *  + loop through and find the matching survey
 */
Topics.prototype.getSurveyByName = function(name){
	for (var i = 0; i < this.surveys.length; i++){
		if (this.surveys[i].name == name) return this.surveys[i];
	}
}

/**
 * @name Topics.getDiscussionByName
 * @description A quick and dirty way to get the discussion ids
 * @todo
 *  + loop through and find the matching discussion
 */
Topics.prototype.getDiscussionByName = function(name){
	for (var i = 0; i < this.discussions.length; i++){
		if (this.discussions[i].name == name) return this.discussions[i];
	}
}

/**
 * @name Topics.getChecklistByName
 * @description A quick and dirty way to get the discussion ids
 * @todo
 *  + loop through and find the matching discussion
 */
Topics.prototype.getChecklistByName = function(name){
	for (var i = 0; i < this.checklist.length; i++){
		if (this.checklist[i].name == name) return this.checklist[i];
	}
}

Topics.prototype.devStart = function(){
	var d = new Date();
	for (var i = 0; i < this.items.length; i++){
		this.items[i].setStart(d);
		this.items[i].draw();
	}
}

/** 
 * @name  Topics.setToolItems
 */
Topics.prototype.setToolItems = function(){
	for (var i = 0; i < this.discussions.length; i++){
		var d = this.discussions[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'discuss tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}
	for (var i = 0; i < this.quizzes.length; i++){
		var d = this.quizzes[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'quiz tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.surveys.length; i++){
		var d = this.surveys[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'survey tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.checklist.length; i++){
		var d = this.checklist[i];
		var t = new Topic({
			Id: d.id,
			Title: d.name,
			Type: '3',
			StartDate: d.start,
			EndDate: d.end
		}, this);

		t.type = 'checklist tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
	}

	for (var i = 0; i < this.dropboxes.length; i++){
		var d = this.dropboxes[i];
		var t = new Topic({
			Id: d.Id,
			Title: d.Name,
			Type: '3',
			StartDate: d.Availability ? d.Availability.StartDate : undefined,
			EndDate: d.Availability ? d.Availability.EndDate : undefined,
			DueDate: d.DueDate
		}, this);

		t.type = 'dropbox tool';
		t.raw = d;
		t.path = '';
		this.items.push(t);
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
	var _this = this;
	var topics = new Topics();
	topics.loading.start();
	topics.loading.setText('Getting Checklists');
	valence.checklist.getAll(function(checklist){
		topics.loading.setText('Getting Dropboxes');
		valence.dropbox.getFolder(function(a, b){
			topics.loading.setText('Getting Quizzes');
			valence.quiz.getAll(function(quizzes){
				topics.loading.setText('Getting Surveys');
				valence.survey.getAll(function(surveys){

					function getTheRest(discussions){
						valence.content.getToc(function(path, toc){
							var contents = [];
							topics.dropboxes = b;
							topics.quizzes = quizzes;
							topics.surveys = surveys;
							topics.discussions = discussions;
							topics.checklist = checklist;
							topics.setToolItems();
							topics.done = callback;
							// Loop through each module
							for (var i = 0; i < toc.Modules.length; i++){
								contents = contents.concat(topics.getModuleRecursive(toc.Modules[i], ''));
							}

							topics.total = contents.length;

							for (var i = 0; i < contents.length; i++){
								// Is it a module or topic
								if (contents[i].type == 0){
									topics._getModule(contents[i]);
								} else {
									topics._getTopic(contents[i]);
								}
							}
						});
					}

					topics.loading.setText('Getting Discussions');
					valence.discussion.getForums(function(p, forums){
						if (forums.length > 0){
							var total = forums.length;
							var spot = 0;
							var result = [];
							for (var i = 0; i < forums.length; i++){
								result.push({
									id: forums[i].ForumId,
									start: forums[i].StartDate,
									end: forums[i].EndDate,
									post: {
										start: forums[i].PostStartDate,
										end: forums[i].PostEndDate
									},
									name: forums[i].Name,
									type: 'forum'
								})
								valence.discussion.getTopics(forums[i].ForumId, function(p, forumTopics){
									if (forumTopics.length > 0){
										var r = [];
										for (var j = 0; j < forumTopics.length; j++){
											r.push({
												id: forumTopics[j].TopicId,
												start: forumTopics[j].StartDate,
												end: forumTopics[j].EndDate,
												unlock: {
													start: forumTopics[j].UnlockStartDate,
													end: forumTopics[j].UnlockEndDate
												},
												name: forumTopics[j].Name,
												type: 'forumTopic'
											})
										}
										result = result.concat(r);
									}
									if (++spot == total){
										getTheRest(result);
									}
								})
							}
						}
						else{
							getTheRest(null);
						}
					});
				})
			})
		})
	})
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
Topics.prototype.getModuleRecursive = function(module, path){
	// Add module
	var contents = [{
		id: module.ModuleId,
		title: module.Title,
		type: 0,
		path: path + '/' + module.Title
	}];
	// Add module topics if any
	for (var j = 0; j < module.Topics.length; j++){
		contents.push({
			id: module.Topics[j].TopicId,
			title: module.Topics[j].Title,
			type: 1,
			path: path + '/' + module.Title
		});
	}
	// Get modules within the module
	for (var j = 0; j < module.Modules.length; j++){
		contents = contents.concat(this.getModuleRecursive(module.Modules[j], path + '/' + module.Title));
	}

	return contents;
}

/**
 * @name Topics._getModule
 * @todo
 *  + Loop through the modules and get the sub topics and modules
 */
Topics.prototype._getModule = function(mod){
	var _this = this;
	valence.content.getModule(mod.id, function(path, module){
		module.Title = mod.title;
		module['path'] = mod.path;
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
Topics.prototype._getTopic = function(top){
	var _this = this;
	valence.content.getTopic(top.id, function(path, topic){
		topic.Title = top.title;
		topic['path'] = top.path;
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
 * @name Topics.clearDate
 * @description Clear the dates for all the selected items
 * @todo
 *  + Clear the dates
 */
Topics.prototype.clearDates = function(){
	var toggled = this.getToggled();
	for (var i = 0; i < toggled.length; i++){
		toggled[i].clearDates();
	}
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
		_this.items[parseInt(idx)].change = Boolean(val); // single
	}, function(topics){ // all
		// var offset = $('#offset').val();
		// if (offset.length > 0){
		// 	_this.offsetAll(parseInt(offset));
		// }

		var spot = 0;

		var toggled = _this.getToggled();
		var total = toggled.length;
		for (var i = 0; i < toggled.length; i++){
			if (toggled[i].post){
				toggled[i].save(function(){
					if (++spot == total){
						_this.loading.stop();
						UI.alert('Saved');
					}
				})
				toggled[i].setChecked(false);
				toggled[i].draw();
			}
		}

	});

	this.table.draw();
	$('.checkbox.disabled').checkbox();
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