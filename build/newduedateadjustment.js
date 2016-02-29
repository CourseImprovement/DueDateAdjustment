/**
 * RULES:
 * 	1. If it's not been developed yet, return undefined
 */


window.byui = (function(){

	var version = '0.2.0',
			name = 'byui',
			_byui = function(selector){
				return new _byui.init(selector);
			};

	// basic checks
	if (!window.$ || !window.jQuery) throw 'Expected jQuery, please include';

	_byui.init = function(selector){
		if (selector == null) selector = window;
		this.initalContext = selector;
		this.context = this.initalContext;
		this.errors = [];
		this.type();
		this.x99909 = true;
		if (this.baseType == 'object' && this.initalContext.x99909){
			this.context = this.initalContext.context;
			this.baseType = this.initalContext.baseType;
			this.initalContext = this.initalContext.initalContext;
		}
		_byui.fn._internal.clean(this);
	}

	_byui.globals = {};
	_byui.template = {};

	_byui.fn = function(name, obj){
		_byui.fn[name] = obj;
	}

	_byui.version = version;
	_byui.name = name;

	_byui.extend = function(name, obj){
		_byui[name] = obj;
	}

	_byui.fn._internal = {
		getType: function(obj){
			var t = Object.prototype.toString.call(obj);
			var ty = t.replace('[object ', '').replace(']', '').toLowerCase();
			if (ty.indexOf('element') > -1 || ty == 'xmldocument') return 'xml';
			return ty;
		},
		clean: function(a){
			switch (a.type()){
				case 'string': {
					if (a.exists('http')){
						try{
							var u = new URL(a.context);
						}
						catch (e){
							var err = 'Invalid URL';
							a.errors.push(err);
							console.log(err);
						}
						break;
					}
					else if (a.exists('@')){
						a.context = a.context.split('@')[0];
						break;
					}
					else if (a.context.match(_byui.fn._internal.regex.ALL_NUMBERS)){
						var num = new Number(a.context).valueOf();
						if (!isNaN(num)){
							a.context = num;
						}
						break;
					}
				}
			}
		},
		regex: {
			SPACE: / /g,
			ALL_NUMBERS: /[0-9]+$/g
		}
	}

	_byui.fn.type = function(expected){
		if (!!expected) return expected === this.baseType;
		this.baseType = _byui.fn._internal.getType(this.context);
		return this.baseType
	}

	_byui.fn.$ = function(selector){
		return $(selector);
	}

	_byui.fn.raw = function(){return this.initalContext;}

	_byui.init.prototype = _byui.fn;

	return _byui;

})();
/**
 * {
 * 		calls: [
 * 			{
 * 				url: '',
 * 				data: {},
 * 				headers: {},
 * 				name: '',
 * 				callAfter: ''
 * 			}
 * 		],
 * 		done: function(errors, success){},
 * 		stopOnFail: false,
 * 		progress: function(spot, total){}
 * }
 */
byui.extend('ajaxPool', function(obj){
	if (!byui.fn._internal.getType(obj) == 'object') throw 'Invalid ajaxPool, expected object';
	this.ajaxConfig = {
		init: obj,
		total: obj.calls.length,
		spot: 0,
		success: {},
		error: []
	}
	if (obj.stopOnFail == undefined || obj.stopOnFail == null) obj.stopOnFail = false;
	var _this = this;
	function checkComplete(err){
		if (++_this.ajaxConfig.spot == _this.ajaxConfig.total || (err && obj.stopOnFail)){
			obj.done(_this.ajaxConfig.error, _this.ajaxConfig.success);
			return;
		}
		if (obj.progress){
			obj.progress(_this.ajaxConfig.spot, _this.ajaxConfig.total);
		}
	}
	for (var i = 0; i < this.ajaxConfig.total; i++){
		var c = this.ajaxConfig.init.calls[i];
		c.method = !c.method ? 'GET' : c.method;
		(function(idx, c){
			$.ajax({
				method: c.method,
				url: c.url,
				data: c.data,
				headers: c.headers,
				success: function(data){
					if (!c.name) c.name = idx + 1;
					_this.ajaxConfig.success[c.name] = data;
					checkComplete();
				},
				error: function(a, b, c){
					_this.ajaxConfig.error.push({
						code: b,
						msg: c
					})
					checkComplete(true);
				}
			})
		})(i, c);
	}
});
byui.fn('len', function(){
	switch (this.type()){
		case 'array': case 'string': {
			return this.context.length;
		}
		default: {
			return undefined;
		}
	}
});

byui.fn('remove', function(idx, num){
	if (!num){
		num = 1;
	}
	switch (this.type()){
		case 'string': {
			if (idx == 0){
				this.context = this.context.slice(1);
			}
			else{
				this.context = this.context.slice(0, num) + this.context.slice((num + 1));
			}
			return this;
		}
		case 'array': {
			this.context.splice(idx, num);
			return this;
		}
	}
});

byui.fn('exists', function(what){
	switch (this.type()){
		case 'string': case 'array': {
			return this.context.indexOf(what) > -1;
		}
		case 'number': {
			var str = this.context + '';
			return str.indexOf(what) > -1;
		}
		case 'object': {
			var keys = this.keys();
			return keys.indexOf(what) > -1;
		}
		default: {
			return undefined;
		}
	}
});

/**
 * Do we pass the value through?
 */
byui.fn('val', function(idx){
	var includeJquery = false;
	if (byui.fn._internal.getType(idx) == 'string' && idx == 'jquery') includeJquery = true;
	switch (this.type()){
		case 'string': case 'array': {
			if (byui.fn._internal.getType(idx) == 'number'){
				return this.context[idx];
			}
		}
		default: {
			if (includeJquery) return $(this.context);
			return this.context;
		}
	}
});

byui.fn('index', function(val){
	switch (this.type()){
		case 'string': case 'array': {
			return this.context.indexOf(val);
		}
		default: {
			return undefined;
		}
	}
});

byui.fn('same', function(obj){
	var str = JSON.stringify(obj);
	var str2 = JSON.stringify(this.context);
	return str == str2 && this.type() == byui.fn._internal.getType(obj);
});

byui.fn('filter', function(obj){
	if (obj.returnValue == null || obj.returnValue == undefined) obj.returnValue = false;
	if (!obj.type) obj.type == 'out';
	var ary = [];
	switch (this.type()){
		case 'array': {
			var len = this.len();
			for (var i = 0; i < len; i++){
				if (obj.type == 'out' && this.context[i] != obj.val) ary.push(this.context[i]);
				else if (obj.type == 'in' && this.context[i] == obj.val) ary.push(this.context[i]);
			}
			break;
		}
		default: {
			this.context = '';
		}
	}
	if (obj.returnValue){
		return byui(ary);
	}
	else{
		this.context = ary;
		return this;
	}
});

byui.fn('each', function(callback){
	var keys = this.keys();
	var len = keys.length;
	for (var i = 0; i < len; i++){
		var val = callback(i, this.context[keys[i]]);
	}
});
byui.extend('client', (function(){
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
	          (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}
	var OSName="Unknown OS";
	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

	return {
		browser: browserName + ':' + fullVersion,
		os: OSName
	}
})());
/*!
	Papa Parse
	v4.1.2
	https://github.com/mholt/PapaParse
*/
(function(global)
{
	'use strict';

	var IS_WORKER = !global.document && !!global.postMessage,
		IS_PAPA_WORKER = IS_WORKER && /(\?|&)papaworker(=|&|$)/.test(global.location.search),
		LOADED_SYNC = false, AUTO_SCRIPT_PATH;
	var workers = {}, workerIdCounter = 0;

	var Papa = {};

	Papa.parse = CsvToJson;
	Papa.unparse = JsonToCsv;

	Papa.RECORD_SEP = String.fromCharCode(30);
	Papa.UNIT_SEP = String.fromCharCode(31);
	Papa.BYTE_ORDER_MARK = '\ufeff';
	Papa.BAD_DELIMITERS = ['\r', '\n', '"', Papa.BYTE_ORDER_MARK];
	Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
	Papa.SCRIPT_PATH = null;	// Must be set by your code if you use workers and this lib is loaded asynchronously

	// Configurable chunk sizes for local and remote files, respectively
	Papa.LocalChunkSize = 1024 * 1024 * 10;	// 10 MB
	Papa.RemoteChunkSize = 1024 * 1024 * 5;	// 5 MB
	Papa.DefaultDelimiter = ',';			// Used if not specified and detection fails

	// Exposed for testing and development only
	Papa.Parser = Parser;
	Papa.ParserHandle = ParserHandle;
	Papa.NetworkStreamer = NetworkStreamer;
	Papa.FileStreamer = FileStreamer;
	Papa.StringStreamer = StringStreamer;

	if (typeof module !== 'undefined' && module.exports)
	{
		// Export to Node...
		module.exports = Papa;
	}
	else if (isFunction(global.define) && global.define.amd)
	{
		// Wireup with RequireJS
		define(function() { return Papa; });
	}
	else
	{
		// ...or as browser global
		global.Papa = Papa;
	}

	if (global.jQuery)
	{
		var $ = global.jQuery;
		$.fn.parse = function(options)
		{
			var config = options.config || {};
			var queue = [];

			this.each(function(idx)
			{
				var supported = $(this).prop('tagName').toUpperCase() === 'INPUT'
								&& $(this).attr('type').toLowerCase() === 'file'
								&& global.FileReader;

				if (!supported || !this.files || this.files.length === 0)
					return true;	// continue to next input element

				for (var i = 0; i < this.files.length; i++)
				{
					queue.push({
						file: this.files[i],
						inputElem: this,
						instanceConfig: $.extend({}, config)
					});
				}
			});

			parseNextFile();	// begin parsing
			return this;		// maintains chainability


			function parseNextFile()
			{
				if (queue.length === 0)
				{
					if (isFunction(options.complete))
						options.complete();
					return;
				}

				var f = queue[0];

				if (isFunction(options.before))
				{
					var returned = options.before(f.file, f.inputElem);

					if (typeof returned === 'object')
					{
						if (returned.action === 'abort')
						{
							error('AbortError', f.file, f.inputElem, returned.reason);
							return;	// Aborts all queued files immediately
						}
						else if (returned.action === 'skip')
						{
							fileComplete();	// parse the next file in the queue, if any
							return;
						}
						else if (typeof returned.config === 'object')
							f.instanceConfig = $.extend(f.instanceConfig, returned.config);
					}
					else if (returned === 'skip')
					{
						fileComplete();	// parse the next file in the queue, if any
						return;
					}
				}

				// Wrap up the user's complete callback, if any, so that ours also gets executed
				var userCompleteFunc = f.instanceConfig.complete;
				f.instanceConfig.complete = function(results)
				{
					if (isFunction(userCompleteFunc))
						userCompleteFunc(results, f.file, f.inputElem);
					fileComplete();
				};

				Papa.parse(f.file, f.instanceConfig);
			}

			function error(name, file, elem, reason)
			{
				if (isFunction(options.error))
					options.error({name: name}, file, elem, reason);
			}

			function fileComplete()
			{
				queue.splice(0, 1);
				parseNextFile();
			}
		}
	}


	if (IS_PAPA_WORKER)
	{
		global.onmessage = workerThreadReceivedMessage;
	}
	else if (Papa.WORKERS_SUPPORTED)
	{
		AUTO_SCRIPT_PATH = getScriptPath();

		// Check if the script was loaded synchronously
		if (!document.body)
		{
			// Body doesn't exist yet, must be synchronous
			LOADED_SYNC = true;
		}
		else
		{
			document.addEventListener('DOMContentLoaded', function () {
				LOADED_SYNC = true;
			}, true);
		}
	}




	function CsvToJson(_input, _config)
	{
		_config = _config || {};

		if (_config.worker && Papa.WORKERS_SUPPORTED)
		{
			var w = newWorker();

			w.userStep = _config.step;
			w.userChunk = _config.chunk;
			w.userComplete = _config.complete;
			w.userError = _config.error;

			_config.step = isFunction(_config.step);
			_config.chunk = isFunction(_config.chunk);
			_config.complete = isFunction(_config.complete);
			_config.error = isFunction(_config.error);
			delete _config.worker;	// prevent infinite loop

			w.postMessage({
				input: _input,
				config: _config,
				workerId: w.id
			});

			return;
		}

		var streamer = null;
		if (typeof _input === 'string')
		{
			if (_config.download)
				streamer = new NetworkStreamer(_config);
			else
				streamer = new StringStreamer(_config);
		}
		else if ((global.File && _input instanceof File) || _input instanceof Object)	// ...Safari. (see issue #106)
			streamer = new FileStreamer(_config);

		return streamer.stream(_input);
	}






	function JsonToCsv(_input, _config)
	{
		var _output = '';
		var _fields = [];

		// Default configuration

		/** whether to surround every datum with quotes */
		var _quotes = false;

		/** delimiting character */
		var _delimiter = ',';

		/** newline character(s) */
		var _newline = '\r\n';

		unpackConfig();

		if (typeof _input === 'string')
			_input = JSON.parse(_input);

		if (_input instanceof Array)
		{
			if (!_input.length || _input[0] instanceof Array)
				return serialize(null, _input);
			else if (typeof _input[0] === 'object')
				return serialize(objectKeys(_input[0]), _input);
		}
		else if (typeof _input === 'object')
		{
			if (typeof _input.data === 'string')
				_input.data = JSON.parse(_input.data);

			if (_input.data instanceof Array)
			{
				if (!_input.fields)
					_input.fields =  _input.meta && _input.meta.fields;

				if (!_input.fields)
					_input.fields =  _input.data[0] instanceof Array
									? _input.fields
									: objectKeys(_input.data[0]);

				if (!(_input.data[0] instanceof Array) && typeof _input.data[0] !== 'object')
					_input.data = [_input.data];	// handles input like [1,2,3] or ['asdf']
			}

			return serialize(_input.fields || [], _input.data || []);
		}

		// Default (any valid paths should return before this)
		throw 'exception: Unable to serialize unrecognized input';


		function unpackConfig()
		{
			if (typeof _config !== 'object')
				return;

			if (typeof _config.delimiter === 'string'
				&& _config.delimiter.length === 1
				&& Papa.BAD_DELIMITERS.indexOf(_config.delimiter) === -1)
			{
				_delimiter = _config.delimiter;
			}

			if (typeof _config.quotes === 'boolean'
				|| _config.quotes instanceof Array)
				_quotes = _config.quotes;

			if (typeof _config.newline === 'string')
				_newline = _config.newline;
		}


		/** Turns an object's keys into an array */
		function objectKeys(obj)
		{
			if (typeof obj !== 'object')
				return [];
			var keys = [];
			for (var key in obj)
				keys.push(key);
			return keys;
		}

		/** The double for loop that iterates the data and writes out a CSV string including header row */
		function serialize(fields, data)
		{
			var csv = '';

			if (typeof fields === 'string')
				fields = JSON.parse(fields);
			if (typeof data === 'string')
				data = JSON.parse(data);

			var hasHeader = fields instanceof Array && fields.length > 0;
			var dataKeyedByField = !(data[0] instanceof Array);

			// If there a header row, write it first
			if (hasHeader)
			{
				for (var i = 0; i < fields.length; i++)
				{
					if (i > 0)
						csv += _delimiter;
					csv += safe(fields[i], i);
				}
				if (data.length > 0)
					csv += _newline;
			}

			// Then write out the data
			for (var row = 0; row < data.length; row++)
			{
				var maxCol = hasHeader ? fields.length : data[row].length;

				for (var col = 0; col < maxCol; col++)
				{
					if (col > 0)
						csv += _delimiter;
					var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
					csv += safe(data[row][colIdx], col);
				}

				if (row < data.length - 1)
					csv += _newline;
			}

			return csv;
		}

		/** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
		function safe(str, col)
		{
			if (typeof str === 'undefined' || str === null)
				return '';

			str = str.toString().replace(/"/g, '""');

			var needsQuotes = (typeof _quotes === 'boolean' && _quotes)
							|| (_quotes instanceof Array && _quotes[col])
							|| hasAny(str, Papa.BAD_DELIMITERS)
							|| str.indexOf(_delimiter) > -1
							|| str.charAt(0) === ' '
							|| str.charAt(str.length - 1) === ' ';

			return needsQuotes ? '"' + str + '"' : str;
		}

		function hasAny(str, substrings)
		{
			for (var i = 0; i < substrings.length; i++)
				if (str.indexOf(substrings[i]) > -1)
					return true;
			return false;
		}
	}

	/** ChunkStreamer is the base prototype for various streamer implementations. */
	function ChunkStreamer(config)
	{
		this._handle = null;
		this._paused = false;
		this._finished = false;
		this._input = null;
		this._baseIndex = 0;
		this._partialLine = '';
		this._rowCount = 0;
		this._start = 0;
		this._nextChunk = null;
		this.isFirstChunk = true;
		this._completeResults = {
			data: [],
			errors: [],
			meta: {}
		};
		replaceConfig.call(this, config);

		this.parseChunk = function(chunk)
		{
			// First chunk pre-processing
			if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk))
			{
				var modifiedChunk = this._config.beforeFirstChunk(chunk);
				if (modifiedChunk !== undefined)
					chunk = modifiedChunk;
			}
			this.isFirstChunk = false;

			// Rejoin the line we likely just split in two by chunking the file
			var aggregate = this._partialLine + chunk;
			this._partialLine = '';

			var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);

			if (this._handle.paused() || this._handle.aborted())
				return;

			var lastIndex = results.meta.cursor;

			if (!this._finished)
			{
				this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
				this._baseIndex = lastIndex;
			}

			if (results && results.data)
				this._rowCount += results.data.length;

			var finishedIncludingPreview = this._finished || (this._config.preview && this._rowCount >= this._config.preview);

			if (IS_PAPA_WORKER)
			{
				global.postMessage({
					results: results,
					workerId: Papa.WORKER_ID,
					finished: finishedIncludingPreview
				});
			}
			else if (isFunction(this._config.chunk))
			{
				this._config.chunk(results, this._handle);
				if (this._paused)
					return;
				results = undefined;
				this._completeResults = undefined;
			}

			if (!this._config.step && !this._config.chunk) {
				this._completeResults.data = this._completeResults.data.concat(results.data);
				this._completeResults.errors = this._completeResults.errors.concat(results.errors);
				this._completeResults.meta = results.meta;
			}

			if (finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted))
				this._config.complete(this._completeResults);

			if (!finishedIncludingPreview && (!results || !results.meta.paused))
				this._nextChunk();

			return results;
		};

		this._sendError = function(error)
		{
			if (isFunction(this._config.error))
				this._config.error(error);
			else if (IS_PAPA_WORKER && this._config.error)
			{
				global.postMessage({
					workerId: Papa.WORKER_ID,
					error: error,
					finished: false
				});
			}
		};

		function replaceConfig(config)
		{
			// Deep-copy the config so we can edit it
			var configCopy = copy(config);
			configCopy.chunkSize = parseInt(configCopy.chunkSize);	// parseInt VERY important so we don't concatenate strings!
			if (!config.step && !config.chunk)
				configCopy.chunkSize = null;  // disable Range header if not streaming; bad values break IIS - see issue #196
			this._handle = new ParserHandle(configCopy);
			this._handle.streamer = this;
			this._config = configCopy;	// persist the copy to the caller
		}
	}


	function NetworkStreamer(config)
	{
		config = config || {};
		if (!config.chunkSize)
			config.chunkSize = Papa.RemoteChunkSize;
		ChunkStreamer.call(this, config);

		var xhr;

		if (IS_WORKER)
		{
			this._nextChunk = function()
			{
				this._readChunk();
				this._chunkLoaded();
			};
		}
		else
		{
			this._nextChunk = function()
			{
				this._readChunk();
			};
		}

		this.stream = function(url)
		{
			this._input = url;
			this._nextChunk();	// Starts streaming
		};

		this._readChunk = function()
		{
			if (this._finished)
			{
				this._chunkLoaded();
				return;
			}

			xhr = new XMLHttpRequest();

			if (this._config.withCredentials)
			{
				xhr.withCredentials = this._config.withCredentials;
			}

			if (!IS_WORKER)
			{
				xhr.onload = bindFunction(this._chunkLoaded, this);
				xhr.onerror = bindFunction(this._chunkError, this);
			}

			xhr.open('GET', this._input, !IS_WORKER);

			if (this._config.chunkSize)
			{
				var end = this._start + this._config.chunkSize - 1;	// minus one because byte range is inclusive
				xhr.setRequestHeader('Range', 'bytes='+this._start+'-'+end);
				xhr.setRequestHeader('If-None-Match', 'webkit-no-cache'); // https://bugs.webkit.org/show_bug.cgi?id=82672
			}

			try {
				xhr.send();
			}
			catch (err) {
				this._chunkError(err.message);
			}

			if (IS_WORKER && xhr.status === 0)
				this._chunkError();
			else
				this._start += this._config.chunkSize;
		}

		this._chunkLoaded = function()
		{
			if (xhr.readyState != 4)
				return;

			if (xhr.status < 200 || xhr.status >= 400)
			{
				this._chunkError();
				return;
			}

			this._finished = !this._config.chunkSize || this._start > getFileSize(xhr);
			this.parseChunk(xhr.responseText);
		}

		this._chunkError = function(errorMessage)
		{
			var errorText = xhr.statusText || errorMessage;
			this._sendError(errorText);
		}

		function getFileSize(xhr)
		{
			var contentRange = xhr.getResponseHeader('Content-Range');
			return parseInt(contentRange.substr(contentRange.lastIndexOf('/') + 1));
		}
	}
	NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
	NetworkStreamer.prototype.constructor = NetworkStreamer;


	function FileStreamer(config)
	{
		config = config || {};
		if (!config.chunkSize)
			config.chunkSize = Papa.LocalChunkSize;
		ChunkStreamer.call(this, config);

		var reader, slice;

		// FileReader is better than FileReaderSync (even in worker) - see http://stackoverflow.com/q/24708649/1048862
		// But Firefox is a pill, too - see issue #76: https://github.com/mholt/PapaParse/issues/76
		var usingAsyncReader = typeof FileReader !== 'undefined';	// Safari doesn't consider it a function - see issue #105

		this.stream = function(file)
		{
			this._input = file;
			slice = file.slice || file.webkitSlice || file.mozSlice;

			if (usingAsyncReader)
			{
				reader = new FileReader();		// Preferred method of reading files, even in workers
				reader.onload = bindFunction(this._chunkLoaded, this);
				reader.onerror = bindFunction(this._chunkError, this);
			}
			else
				reader = new FileReaderSync();	// Hack for running in a web worker in Firefox

			this._nextChunk();	// Starts streaming
		};

		this._nextChunk = function()
		{
			if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview))
				this._readChunk();
		}

		this._readChunk = function()
		{
			var input = this._input;
			if (this._config.chunkSize)
			{
				var end = Math.min(this._start + this._config.chunkSize, this._input.size);
				input = slice.call(input, this._start, end);
			}
			var txt = reader.readAsText(input, this._config.encoding);
			if (!usingAsyncReader)
				this._chunkLoaded({ target: { result: txt } });	// mimic the async signature
		}

		this._chunkLoaded = function(event)
		{
			// Very important to increment start each time before handling results
			this._start += this._config.chunkSize;
			this._finished = !this._config.chunkSize || this._start >= this._input.size;
			this.parseChunk(event.target.result);
		}

		this._chunkError = function()
		{
			this._sendError(reader.error);
		}

	}
	FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
	FileStreamer.prototype.constructor = FileStreamer;


	function StringStreamer(config)
	{
		config = config || {};
		ChunkStreamer.call(this, config);

		var string;
		var remaining;
		this.stream = function(s)
		{
			string = s;
			remaining = s;
			return this._nextChunk();
		}
		this._nextChunk = function()
		{
			if (this._finished) return;
			var size = this._config.chunkSize;
			var chunk = size ? remaining.substr(0, size) : remaining;
			remaining = size ? remaining.substr(size) : '';
			this._finished = !remaining;
			return this.parseChunk(chunk);
		}
	}
	StringStreamer.prototype = Object.create(StringStreamer.prototype);
	StringStreamer.prototype.constructor = StringStreamer;



	// Use one ParserHandle per entire CSV file or string
	function ParserHandle(_config)
	{
		// One goal is to minimize the use of regular expressions...
		var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;

		var self = this;
		var _stepCounter = 0;	// Number of times step was called (number of rows parsed)
		var _input;				// The input being parsed
		var _parser;			// The core parser being used
		var _paused = false;	// Whether we are paused or not
		var _aborted = false;   // Whether the parser has aborted or not
		var _delimiterError;	// Temporary state between delimiter detection and processing results
		var _fields = [];		// Fields are from the header row of the input, if there is one
		var _results = {		// The last results returned from the parser
			data: [],
			errors: [],
			meta: {}
		};

		if (isFunction(_config.step))
		{
			var userStep = _config.step;
			_config.step = function(results)
			{
				_results = results;

				if (needsHeaderRow())
					processResults();
				else	// only call user's step function after header row
				{
					processResults();

					// It's possbile that this line was empty and there's no row here after all
					if (_results.data.length === 0)
						return;

					_stepCounter += results.data.length;
					if (_config.preview && _stepCounter > _config.preview)
						_parser.abort();
					else
						userStep(_results, self);
				}
			};
		}

		/**
		 * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
		 * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
		 * when an input comes in multiple chunks, like from a file.
		 */
		this.parse = function(input, baseIndex, ignoreLastRow)
		{
			if (!_config.newline)
				_config.newline = guessLineEndings(input);

			_delimiterError = false;
			if (!_config.delimiter)
			{
				var delimGuess = guessDelimiter(input, _config.newline);
				if (delimGuess.successful)
					_config.delimiter = delimGuess.bestDelimiter;
				else
				{
					_delimiterError = true;	// add error after parsing (otherwise it would be overwritten)
					_config.delimiter = Papa.DefaultDelimiter;
				}
				_results.meta.delimiter = _config.delimiter;
			}

			var parserConfig = copy(_config);
			if (_config.preview && _config.header)
				parserConfig.preview++;	// to compensate for header row

			_input = input;
			_parser = new Parser(parserConfig);
			_results = _parser.parse(_input, baseIndex, ignoreLastRow);
			processResults();
			return _paused ? { meta: { paused: true } } : (_results || { meta: { paused: false } });
		};

		this.paused = function()
		{
			return _paused;
		};

		this.pause = function()
		{
			_paused = true;
			_parser.abort();
			_input = _input.substr(_parser.getCharIndex());
		};

		this.resume = function()
		{
			_paused = false;
			self.streamer.parseChunk(_input);
		};

		this.aborted = function () {
			return _aborted;
		}

		this.abort = function()
		{
			_aborted = true;
			_parser.abort();
			_results.meta.aborted = true;
			if (isFunction(_config.complete))
				_config.complete(_results);
			_input = '';
		};

		function processResults()
		{
			if (_results && _delimiterError)
			{
				addError('Delimiter', 'UndetectableDelimiter', 'Unable to auto-detect delimiting character; defaulted to \''+Papa.DefaultDelimiter+'\'');
				_delimiterError = false;
			}

			if (_config.skipEmptyLines)
			{
				for (var i = 0; i < _results.data.length; i++)
					if (_results.data[i].length === 1 && _results.data[i][0] === '')
						_results.data.splice(i--, 1);
			}

			if (needsHeaderRow())
				fillHeaderFields();

			return applyHeaderAndDynamicTyping();
		}

		function needsHeaderRow()
		{
			return _config.header && _fields.length === 0;
		}

		function fillHeaderFields()
		{
			if (!_results)
				return;
			for (var i = 0; needsHeaderRow() && i < _results.data.length; i++)
				for (var j = 0; j < _results.data[i].length; j++)
					_fields.push(_results.data[i][j]);
			_results.data.splice(0, 1);
		}

		function applyHeaderAndDynamicTyping()
		{
			if (!_results || (!_config.header && !_config.dynamicTyping))
				return _results;

			for (var i = 0; i < _results.data.length; i++)
			{
				var row = {};

				for (var j = 0; j < _results.data[i].length; j++)
				{
					if (_config.dynamicTyping)
					{
						var value = _results.data[i][j];
						if (value === 'true' || value === 'TRUE')
							_results.data[i][j] = true;
						else if (value === 'false' || value === 'FALSE')
							_results.data[i][j] = false;
						else
							_results.data[i][j] = tryParseFloat(value);
					}

					if (_config.header)
					{
						if (j >= _fields.length)
						{
							if (!row['__parsed_extra'])
								row['__parsed_extra'] = [];
							row['__parsed_extra'].push(_results.data[i][j]);
						}
						else
							row[_fields[j]] = _results.data[i][j];
					}
				}

				if (_config.header)
				{
					_results.data[i] = row;
					if (j > _fields.length)
						addError('FieldMismatch', 'TooManyFields', 'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j, i);
					else if (j < _fields.length)
						addError('FieldMismatch', 'TooFewFields', 'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j, i);
				}
			}

			if (_config.header && _results.meta)
				_results.meta.fields = _fields;
			return _results;
		}

		function guessDelimiter(input, newline)
		{
			var delimChoices = [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];
			var bestDelim, bestDelta, fieldCountPrevRow;

			for (var i = 0; i < delimChoices.length; i++)
			{
				var delim = delimChoices[i];
				var delta = 0, avgFieldCount = 0;
				fieldCountPrevRow = undefined;

				var preview = new Parser({
					delimiter: delim,
					newline: newline,
					preview: 10
				}).parse(input);

				for (var j = 0; j < preview.data.length; j++)
				{
					var fieldCount = preview.data[j].length;
					avgFieldCount += fieldCount;

					if (typeof fieldCountPrevRow === 'undefined')
					{
						fieldCountPrevRow = fieldCount;
						continue;
					}
					else if (fieldCount > 1)
					{
						delta += Math.abs(fieldCount - fieldCountPrevRow);
						fieldCountPrevRow = fieldCount;
					}
				}

				if (preview.data.length > 0)
					avgFieldCount /= preview.data.length;

				if ((typeof bestDelta === 'undefined' || delta < bestDelta)
					&& avgFieldCount > 1.99)
				{
					bestDelta = delta;
					bestDelim = delim;
				}
			}

			_config.delimiter = bestDelim;

			return {
				successful: !!bestDelim,
				bestDelimiter: bestDelim
			}
		}

		function guessLineEndings(input)
		{
			input = input.substr(0, 1024*1024);	// max length 1 MB

			var r = input.split('\r');

			if (r.length === 1)
				return '\n';

			var numWithN = 0;
			for (var i = 0; i < r.length; i++)
			{
				if (r[i][0] === '\n')
					numWithN++;
			}

			return numWithN >= r.length / 2 ? '\r\n' : '\r';
		}

		function tryParseFloat(val)
		{
			var isNumber = FLOAT.test(val);
			return isNumber ? parseFloat(val) : val;
		}

		function addError(type, code, msg, row)
		{
			_results.errors.push({
				type: type,
				code: code,
				message: msg,
				row: row
			});
		}
	}





	/** The core parser implements speedy and correct CSV parsing */
	function Parser(config)
	{
		// Unpack the config object
		config = config || {};
		var delim = config.delimiter;
		var newline = config.newline;
		var comments = config.comments;
		var step = config.step;
		var preview = config.preview;
		var fastMode = config.fastMode;

		// Delimiter must be valid
		if (typeof delim !== 'string'
			|| Papa.BAD_DELIMITERS.indexOf(delim) > -1)
			delim = ',';

		// Comment character must be valid
		if (comments === delim)
			throw 'Comment character same as delimiter';
		else if (comments === true)
			comments = '#';
		else if (typeof comments !== 'string'
			|| Papa.BAD_DELIMITERS.indexOf(comments) > -1)
			comments = false;

		// Newline must be valid: \r, \n, or \r\n
		if (newline != '\n' && newline != '\r' && newline != '\r\n')
			newline = '\n';

		// We're gonna need these at the Parser scope
		var cursor = 0;
		var aborted = false;

		this.parse = function(input, baseIndex, ignoreLastRow)
		{
			// For some reason, in Chrome, this speeds things up (!?)
			if (typeof input !== 'string')
				throw 'Input must be a string';

			// We don't need to compute some of these every time parse() is called,
			// but having them in a more local scope seems to perform better
			var inputLen = input.length,
				delimLen = delim.length,
				newlineLen = newline.length,
				commentsLen = comments.length;
			var stepIsFunction = typeof step === 'function';

			// Establish starting state
			cursor = 0;
			var data = [], errors = [], row = [], lastCursor = 0;

			if (!input)
				return returnable();

			if (fastMode || (fastMode !== false && input.indexOf('"') === -1))
			{
				var rows = input.split(newline);
				for (var i = 0; i < rows.length; i++)
				{
					var row = rows[i];
					cursor += row.length;
					if (i !== rows.length - 1)
						cursor += newline.length;
					else if (ignoreLastRow)
						return returnable();
					if (comments && row.substr(0, commentsLen) === comments)
						continue;
					if (stepIsFunction)
					{
						data = [];
						pushRow(row.split(delim));
						doStep();
						if (aborted)
							return returnable();
					}
					else
						pushRow(row.split(delim));
					if (preview && i >= preview)
					{
						data = data.slice(0, preview);
						return returnable(true);
					}
				}
				return returnable();
			}

			var nextDelim = input.indexOf(delim, cursor);
			var nextNewline = input.indexOf(newline, cursor);

			// Parser loop
			for (;;)
			{
				// Field has opening quote
				if (input[cursor] === '"')
				{
					// Start our search for the closing quote where the cursor is
					var quoteSearch = cursor;

					// Skip the opening quote
					cursor++;

					for (;;)
					{
						// Find closing quote
						var quoteSearch = input.indexOf('"', quoteSearch+1);

						if (quoteSearch === -1)
						{
							if (!ignoreLastRow) {
								// No closing quote... what a pity
								errors.push({
									type: 'Quotes',
									code: 'MissingQuotes',
									message: 'Quoted field unterminated',
									row: data.length,	// row has yet to be inserted
									index: cursor
								});
							}
							return finish();
						}

						if (quoteSearch === inputLen-1)
						{
							// Closing quote at EOF
							var value = input.substring(cursor, quoteSearch).replace(/""/g, '"');
							return finish(value);
						}

						// If this quote is escaped, it's part of the data; skip it
						if (input[quoteSearch+1] === '"')
						{
							quoteSearch++;
							continue;
						}

						if (input[quoteSearch+1] === delim)
						{
							// Closing quote followed by delimiter
							row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
							cursor = quoteSearch + 1 + delimLen;
							nextDelim = input.indexOf(delim, cursor);
							nextNewline = input.indexOf(newline, cursor);
							break;
						}

						if (input.substr(quoteSearch+1, newlineLen) === newline)
						{
							// Closing quote followed by newline
							row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
							saveRow(quoteSearch + 1 + newlineLen);
							nextDelim = input.indexOf(delim, cursor);	// because we may have skipped the nextDelim in the quoted field

							if (stepIsFunction)
							{
								doStep();
								if (aborted)
									return returnable();
							}

							if (preview && data.length >= preview)
								return returnable(true);

							break;
						}
					}

					continue;
				}

				// Comment found at start of new line
				if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments)
				{
					if (nextNewline === -1)	// Comment ends at EOF
						return returnable();
					cursor = nextNewline + newlineLen;
					nextNewline = input.indexOf(newline, cursor);
					nextDelim = input.indexOf(delim, cursor);
					continue;
				}

				// Next delimiter comes before next newline, so we've reached end of field
				if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1))
				{
					row.push(input.substring(cursor, nextDelim));
					cursor = nextDelim + delimLen;
					nextDelim = input.indexOf(delim, cursor);
					continue;
				}

				// End of row
				if (nextNewline !== -1)
				{
					row.push(input.substring(cursor, nextNewline));
					saveRow(nextNewline + newlineLen);

					if (stepIsFunction)
					{
						doStep();
						if (aborted)
							return returnable();
					}

					if (preview && data.length >= preview)
						return returnable(true);

					continue;
				}

				break;
			}


			return finish();


			function pushRow(row)
			{
				data.push(row);
				lastCursor = cursor;
			}

			/**
			 * Appends the remaining input from cursor to the end into
			 * row, saves the row, calls step, and returns the results.
			 */
			function finish(value)
			{
				if (ignoreLastRow)
					return returnable();
				if (typeof value === 'undefined')
					value = input.substr(cursor);
				row.push(value);
				cursor = inputLen;	// important in case parsing is paused
				pushRow(row);
				if (stepIsFunction)
					doStep();
				return returnable();
			}

			/**
			 * Appends the current row to the results. It sets the cursor
			 * to newCursor and finds the nextNewline. The caller should
			 * take care to execute user's step function and check for
			 * preview and end parsing if necessary.
			 */
			function saveRow(newCursor)
			{
				cursor = newCursor;
				pushRow(row);
				row = [];
				nextNewline = input.indexOf(newline, cursor);
			}

			/** Returns an object with the results, errors, and meta. */
			function returnable(stopped)
			{
				return {
					data: data,
					errors: errors,
					meta: {
						delimiter: delim,
						linebreak: newline,
						aborted: aborted,
						truncated: !!stopped,
						cursor: lastCursor + (baseIndex || 0)
					}
				};
			}

			/** Executes the user's step function and resets data & errors. */
			function doStep()
			{
				step(returnable());
				data = [], errors = [];
			}
		};

		/** Sets the abort flag */
		this.abort = function()
		{
			aborted = true;
		};

		/** Gets the cursor position */
		this.getCharIndex = function()
		{
			return cursor;
		};
	}


	// If you need to load Papa Parse asynchronously and you also need worker threads, hard-code
	// the script path here. See: https://github.com/mholt/PapaParse/issues/87#issuecomment-57885358
	function getScriptPath()
	{
		var scripts = document.getElementsByTagName('script');
		return scripts.length ? scripts[scripts.length - 1].src : '';
	}

	function newWorker()
	{
		if (!Papa.WORKERS_SUPPORTED)
			return false;
		if (!LOADED_SYNC && Papa.SCRIPT_PATH === null)
			throw new Error(
				'Script path cannot be determined automatically when Papa Parse is loaded asynchronously. ' +
				'You need to set Papa.SCRIPT_PATH manually.'
			);
		var workerUrl = Papa.SCRIPT_PATH || AUTO_SCRIPT_PATH;
		// Append 'papaworker' to the search string to tell papaparse that this is our worker.
		workerUrl += (workerUrl.indexOf('?') !== -1 ? '&' : '?') + 'papaworker';
		var w = new global.Worker(workerUrl);
		w.onmessage = mainThreadReceivedMessage;
		w.id = workerIdCounter++;
		workers[w.id] = w;
		return w;
	}

	/** Callback when main thread receives a message */
	function mainThreadReceivedMessage(e)
	{
		var msg = e.data;
		var worker = workers[msg.workerId];
		var aborted = false;

		if (msg.error)
			worker.userError(msg.error, msg.file);
		else if (msg.results && msg.results.data)
		{
			var abort = function() {
				aborted = true;
				completeWorker(msg.workerId, { data: [], errors: [], meta: { aborted: true } });
			};

			var handle = {
				abort: abort,
				pause: notImplemented,
				resume: notImplemented
			};

			if (isFunction(worker.userStep))
			{
				for (var i = 0; i < msg.results.data.length; i++)
				{
					worker.userStep({
						data: [msg.results.data[i]],
						errors: msg.results.errors,
						meta: msg.results.meta
					}, handle);
					if (aborted)
						break;
				}
				delete msg.results;	// free memory ASAP
			}
			else if (isFunction(worker.userChunk))
			{
				worker.userChunk(msg.results, handle, msg.file);
				delete msg.results;
			}
		}

		if (msg.finished && !aborted)
			completeWorker(msg.workerId, msg.results);
	}

	function completeWorker(workerId, results) {
		var worker = workers[workerId];
		if (isFunction(worker.userComplete))
			worker.userComplete(results);
		worker.terminate();
		delete workers[workerId];
	}

	function notImplemented() {
		throw 'Not implemented.';
	}

	/** Callback when worker thread receives a message */
	function workerThreadReceivedMessage(e)
	{
		var msg = e.data;

		if (typeof Papa.WORKER_ID === 'undefined' && msg)
			Papa.WORKER_ID = msg.workerId;

		if (typeof msg.input === 'string')
		{
			global.postMessage({
				workerId: Papa.WORKER_ID,
				results: Papa.parse(msg.input, msg.config),
				finished: true
			});
		}
		else if ((global.File && msg.input instanceof File) || msg.input instanceof Object)	// thank you, Safari (see issue #106)
		{
			var results = Papa.parse(msg.input, msg.config);
			if (results)
				global.postMessage({
					workerId: Papa.WORKER_ID,
					results: results,
					finished: true
				});
		}
	}

	/** Makes a deep copy of an array or object (mostly) */
	function copy(obj)
	{
		if (typeof obj !== 'object')
			return obj;
		var cpy = obj instanceof Array ? [] : {};
		for (var key in obj)
			cpy[key] = copy(obj[key]);
		return cpy;
	}

	function bindFunction(f, self)
	{
		return function() { f.apply(self, arguments); };
	}

	function isFunction(func)
	{
		return typeof func === 'function';
	}
})(typeof window !== 'undefined' ? window : this);

byui.fn('csv', function(obj){
	switch (this.type()){
		case 'string': {
			var p = Papa.parse(this.context);
			this.context = p.data;
			this.errors = p.errors;
		}
	}
})
byui.fn('sum', function(){
	switch (this.type()){
		case 'array': {
			var sum = 0;
			for (var i = 0; i < this.context.length; i++){
				if (byui.fn._internal.getType(this.context[i]) == 'number'){
					sum += this.context[i];
				}
			}
			return sum;
		}
		default: {
			return undefined;
		}
	}
});

byui.fn('avg', function(){
	switch (this.type()){
		case 'array': {
			var sum = this.sum();
			var len = this.len();
			return sum / len;
		}
		default: {
			return undefined;
		}
	}
});

byui.fn('percent', function(obj){
	if (!obj.percision) obj.percision = 1;
	if (obj.occurance == undefined || obj.occurance == null) obj.occurance = true;
	obj.percision = Math.pow(10, obj.percision);
	var hasValue = byui.fn._internal.getType(JSON.stringify(obj.val)) == 'string';
	switch (this.type()){
		case 'number': {
			var val = Math.floor(this.context * obj.percision) / obj.percision;
			return val + '%';
		}
		case 'array': {
			if (hasValue && obj.occurance){
				var total = this.len();
				var filtered = this.filter({val: obj.val, returnValue: true, type: 'in'});
				var filteredTotal = filtered.len();
				var norm = (filteredTotal / total) * 100;
				var result = Math.floor(norm * obj.percision) / obj.percision;
				return result + '%';
			}
			else if (hasValue && !obj.occurance){
				var sum = this.sum();
				var filtered = this.filter({val: obj.val, returnValue: true, type: 'in'});
				var filteredSum = filtered.sum();
				var norm = (filteredSum / sum) * 100;
				var result = Math.floor(norm * obj.percision) / obj.percision;
				return result + '%';
			}
		}
		default: {
			return undefined;
		}
	}
});
byui.fn('keys', function(){
	return Object.keys(this.context);
})

byui.fn('obj', function(base){
	switch (this.type()){
		case 'object':  return this.context;
		case 'xml': {
			return byui.createObject(this.context);
		}
		default: {
			var o = {};
			o[base] = this.context;
			return o;
		}
	}
})

byui.extend('createObject', function(node){
	var name = node.nodeName.toLowerCase();
	var result = {_name: name};
	result[name] = {
		children: []
	};
	var attrs = node.attributes;
	if (attrs && attrs.length > 0){
		for (var i = 0; i < attrs.length; i++){
			var attrName = attrs[i].name;
			var attrVal = attrs[i].value;
			result[name][attrName] = attrVal;
		}
	} 
	var children = node.children;
	if (children){
		for (var i = 0; i < children.length; i++){
			result[name].children.push(byui.createObject(children[i]));
		}
	}
	return result;
});
byui.fn('asName', function(){
	switch (this.type()){
		case 'string': {
			var lower = this.context.toLowerCase();
			var words = lower.split(byui.fn._internal.regex.SPACE);
			for (var i = 0; i < words.length; i++){
				words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
			}
			return words.join(' ');
		}
		default: return undefined;
	}
});

byui.fn('asEmail', function(ext){
	switch (this.type()){
		case 'string': {
			var raw = this.raw();
			if (raw.indexOf('@') > -1) return raw;
			return raw + '@' + ext;
		}	
		default: return undefined;
	}
});

byui.fn('asUrl', function(){
	if (this.errors.length > 0) return '';
	return this.context;
});

byui.fn('replace', function(what, withVal){
	if (withVal == undefined || withVal == null) withVal = '';
	switch (this.type()){
		case 'string': {
			var regex = new RegExp(what, 'g');
			this.context = this.context.replace(regex, withVal);
		}
	}
	return this;
});

byui.fn('split', function(val){
	if (byui.fn._internal.getType(val) != 'string') return;
	switch (this.type()){
		case 'string': {
			this.context = this.context.split(val);
		}
	}
	return this;
});

byui.fn('hex', function(decode){
	if (decode){
		var j;
    var hexes = this.context.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    this.context = back;
	}
	else{
		var hex, i;

    var result = "";
    for (i=0; i<this.context.length; i++) {
        hex = this.context.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    this.context = result
	}
	return this;
})

byui.extend('strTemplate', function(name, val){
	byui.strTemplate[name] = val;
});

byui.fn('strTemplate', function(name){
	if (this.baseType == 'object'){
		var template = byui(byui.strTemplate[name]);
		var keys = this.keys();
		for (var i = 0; i < keys.length; i++){
			template.replace('\\$\\{' + keys[i] + '\}', this.context[keys[i]]);
		}
		return template;
	}
	return byui('');
});

byui.fn('str', function(){
	switch (this.type()){
		case 'string': return this.context;
		case 'number': return this.context + '';
		case 'date': return this.context.toString();
		case 'object': return JSON.stringify(this.context);
		case 'xml': return (new XMLSerializer()).serializeToString(this.context);
		default: return this.context + '';
	}
});
/**
 * byui().addFunc(function(){});
 */
byui.fn('addFunc', function(func){
	if (byui.fn._internal.getType(this.context) != 'array') this.context = [];
	this.context.push(func);
});

/**
 * byui().start();
 */
byui.fn('start', function(){
	if (!this.threadPoolSetup) this.poolSetup();
	var _this = this;
	for (var i = 0; i < _this.threadPoolSetup.total; i++){
		(function(idx){
			setTimeout(function(){
				if (byui.fn._internal.getType(_this.context[idx]) == 'function'){
					_this.context[idx]();
					if (++_this.threadPoolSetup.spot == _this.threadPoolSetup.total){
						if (_this.threadPoolSetup.init.done) _this.threadPoolSetup.init.done(_this.threadPoolSetup.error, _this.threadPoolSetup.success);
					}
				}
			}, 10);
		})(i);
	}
})

/**
 * obj = {
 * 	done: func
 * }
 */
byui.fn('poolSetup', function(obj){
	if (!byui.fn._internal.getType(obj) == 'object') throw 'Invalid ajaxPool, expected object';
	this.threadPoolSetup = {
		init: obj,
		total: this.context.length,
		spot: 0,
		success: {},
		error: []
	}
});
byui.fn('url', function(action, param){
	if (this.type() == 'global'){
		switch (action){
			case 'reload': {
				this.context.location.reload();
				break;
			}
			case 'redirect': {
				this.context.location.href = param;
				break;
			}
			case 'host': {
				try {
					var u = new URL(this.url());
					return u.hostname;
				}
				catch (e){
					return '';
				}
			}
			case 'base': {
				try {
					var u = new URL(this.url());
					return u.protocol + '//' + u.hostname;
				}
				catch (e){
					return '';
				}
			}
			default: return this.context.location.href;
		}
	}
})

byui.extend('params', (function(){
    var map = {};
    var loc = window.location.href;
    if (loc.indexOf('#') > -1){
      loc = loc.split('#')[0];
    }
    var hashes = loc.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        map[hash[0]] = hash[1];
    }
    if (hashes[0] == loc) return {};
    return map;
})());
byui.fn('save', function(name){
	byui.globals[name] = this.context;
});

byui.extend('get', function(name){
	var raw = byui.globals[name];
	if (byui.fn._internal.getType(raw) == 'xml') return $(raw);
	return byui(raw);
});

byui.extend('type', function(obj){
	return byui.fn._internal.getType(obj);
});
byui.extend('createNode', function(name, obj){
	var keys = Object.keys(obj);
	var xml = $('<' + name + '></' + name + '>');
	for (var i = 0; i < keys.length; i++){
		switch (byui.fn._internal.getType(obj[keys[i]])){
			case 'string': case 'number': case 'boolean': {
				if (keys[i] == '$text'){
					$(xml).append(obj[keys[i]]);
				}
				else{
					if (keys[i].charAt(0) != '_'){
						$(xml).attr(keys[i], obj[keys[i]]);
					}
				}
				break;
			}
			case 'undefined': case 'null':{
				$(xml).attr(keys[i], '');
				break;
			}
			case 'object': {
				var child = byui.createNode(keys[i], obj[keys[i]]);
				$(xml).append(child);
				break;
			}
			case 'array': {
				var ary = obj[keys[i]];
				for (var j = 0; j < ary.length; j++){
					var child = byui.createNode(keys[i], ary[j]);
					$(xml).append(child);
				}
				break;
			}
		}
	}
	return $(xml)[0];
});

byui.fn('find', function(path){
	this.context = $(this.context).find(path)[0];
	return this;
})

byui.fn('xml', function(name){
	switch (this.type()){
		case 'object': {
			var xml = byui.createNode(name, this.context);
			this.context = xml;
			break;
		}
	}
	return this;
})

byui.extend('registerXmlTemplate', function(obj){
	if (byui.fn._internal.getType(obj.obj) != 'object') throw 'Expected object';
	var keys = Object.keys(obj.obj);
	if (keys.length > 1) throw 'Only 1 key is allowed';
	if (keys.length == 0) throw 'Expected object';
	var name = keys[0];
	byui.template[obj.name] = {
		config: obj.obj,
		xml: byui.createNode(name, obj.obj[name]),
		functions: obj.functions,
		paths: obj.paths
	};
});

byui.extend('getTemplate', function(name){
	return byui.template[name];
})

byui.fn('encodeXml', function(){
	if (this.type() == 'string'){
		this.context = this.replace("\&", '&amp;').replace("\<", '&lt;').replace("\>", '&gt;').val();
	}
	return this;
})

function test(){
	var example = {
		test: {
			test: 'test'
		}
	}
	byui.registerXmlTemplate({
		name: 'example',
		obj: example,
		functions: {
			addPerson: function(first, last, email){
				email = byui(email).val();
				first = byui(first).asName();
				last = byui(last).asName();
				var xml = byui.createNode('person', {
					first: first,
					last: last,
					email: email
				});
				var t = byui.template.example;
				$(byui.template.example.xml).find(t.paths.topPeople).append(xml);
			},
			getPerson: function(email){
				var t = byui.template.example;
				email = byui(email).val();
				return $(byui.template.example.xml).find(t.paths.topPeople + '[email=' + email + ']')[0];
			}
		},
		paths: {
			topPeople: 'semester[code=FA15] > people > person'
		}
	})
}
var UI = {
	initButton: function(){
		$('body').append('<div style="text-align:center;margin-top:30px;"><button class="ui button green large" id="start">Start</button></div>');
		$('#start').click(function(){
			$(this).parent().remove();
			window.items.start();
		});
	},
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

setTimeout(function(){
	UI.initButton();
}, 10);

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

Loading.prototype.setText = function(val){
	$('.ui.indeterminate').text(val);
}

function Items(){
	this.items = [];
	this.loading = new Loading();
	this.table = null;
	this.toc = null;
	this.requestId = 0;
}

Items.prototype.clearDates = function(){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change){
			this.items[i].clearDates();
		}
	}
}

Items.prototype.draw = function(){
	this.table = new Table(this);
	this.table.draw();
}

Items.prototype.offsetDates = function(amount){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change) this.items[i].offsetDates(amount);
	}
}

Items.prototype.changeSelected = function(){
	var total = 0;
	var spot = 0;
	this.loading.setText('Saving Changes');
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].change){
			total++;
			this.items[i].save(function(){
				if (++spot == total){
					items.loading.stop();
					UI.alert('Saved');
				}
			});
		}
	}
}

Items.prototype.addItem = function(obj, type, isContentType){
	var item = new Item(this);
	item._setObject(obj, type, isContentType);
	this.items.push(item);
}

Items.prototype.getById = function(id){
	for (var i = 0; i < this.items.length; i++){
		if (this.items[i].getId() == id) return this.items[i];
	}
}

Items.prototype.setPaths = function(){
	var _this = this;
	function setPathsRecursive(mod, path){
		for (var i = 0; i < mod.Topics.length; i++){
			var item = _this.getById(mod.Topics[i].TopicId);
			item.path = path;
		}
		for (var i = 0; i < mod.Modules.length; i++){
			var item = _this.getById(mod.Modules[i].ModuleId);
			item.path = path;
			setPathsRecursive(mod.Modules[i], path + '/' + mod.Modules[i].Title);
		}
	}

	for (var i = 0; i < this.toc.Modules.length; i++){
		var m = this.toc.Modules[i];
		var item = this.getById(m.ModuleId);
		item.path = '/';
		setPathsRecursive(m, '/' + m.Title);
	}
}

Items.prototype.start = function(){
	this.loading.start(true);
	// Collection time
	
	function getDiscussionTopics(ary){
		byui.ajaxPool({
			calls: ary,
			done: function(err, suc){
				for (var key in suc){
					for (var i = 0; i < suc[key].length; i++){
						items.addItem(suc[key][i], 'discussion-topic', false);
					}
				}
				items.setPaths();
				items.loading.setText('Drawing the results');
				items.draw();
				items.loading.stop();
			}
		});	
	}

	function getDiscussions(){
		items.loading.setText('Getting Discussions');
		byui.ajaxPool({
			calls: [
				{
					url: valence.discussion.getForums(),
					headers: valence.getHeaders(),
					name: 'forums'
				}
			],
			done: function(err, suc){
				var calls = [];
				for (var i = 0; i < suc.forums.length; i++){
					items.addItem(suc.forums[i], 'discussion-forum', false);
					calls.push({
						headers: valence.getHeaders(),
						name: i,
						url: valence.discussion.getTopics(suc.forums[i].ForumId)
					});
				}
				getDiscussionTopics(calls);
			}
		})
	}

	function getSurveys(){
		items.loading.setText('Getting Surveys');
		valence.survey.getAll(function(surveys){
			for (var i = 0; i < surveys.length; i++){
				items.addItem(surveys[i], 'survey', false);
			}
			getDiscussions();
		})
	}

	function getQuizzes(){
		items.loading.setText('Getting Quizzes');
		valence.quiz.getAll(function(quizzes){
			for (var i = 0; i < quizzes.length; i++){
				items.addItem(quizzes[i], 'quiz', false);
			}
			getSurveys();
		})
	}

	function getDropboxes(){
		items.loading.setText('Getting Dropboxes');
		byui.ajaxPool({
			calls: [
				{
					url: valence.dropbox.getFolder(),
					headers: valence.getHeaders(),
					name: 'folders'
				}
			],
			done: function(err, suc){
				for (var i = 0; i < suc.folders.length; i++){
					items.addItem(suc.folders[i], 'dropbox', false);
				}
				getQuizzes();
			}
		})
	}

	function getChecklists(){
		items.loading.setText('Getting checklists');
		valence.checklist.getAll(function(checklist){
			for (var i = 0; i < checklist.length; i++){
				items.addItem(checklist[i], 'checklist', false);
			}
			getDropboxes();
		});
	}

	function getModulesAndTopicsRecursive(mod, path){
		var result = [];
		result.push({type: 'mod', url: valence.content.getModule(mod.ModuleId)});
		for (var i = 0; i < mod.Topics.length; i++){
			result.push({type: 'top', url: valence.content.getTopic(mod.Topics[i].TopicId)});
		}
		for (var i = 0; i < mod.Modules.length; i++){
			result = result.concat(getModulesAndTopicsRecursive(mod.Modules[i]));
		}
		return result;
	}

	function collectContentUrls(toc){
		var calls = [];

		for (var i = 0; i < toc.Modules.length; i++){
			calls = calls.concat(getModulesAndTopicsRecursive(toc.Modules[i]));
		}

		for (var i = 0; i < calls.length; i++){
			calls[i] = {
				url: calls[i].url,
				headers: valence.getHeaders(),
				name: i + ':' + calls[i].type
			}
		}

		byui.ajaxPool({
			calls: calls,
			done: function(err, suc){
				items.loading.setText('Creating items');
				for (var key in suc){
					items.addItem(suc[key], key.split(':')[1], true);
				}
				getChecklists();
			}
		});
	}

	// Get the Table of Contents
	this.loading.setText('Getting table of contents');
	byui.ajaxPool({
		calls: [
			{
				url: valence.content.getToc(),
				headers: valence.getHeaders(),
				name: 'toc'
			}
		],
		done: function(err, suc){
			items.loading.setText('Getting content items');
			items.toc = suc.toc;
			collectContentUrls(suc.toc);
		}
	});

}
function Item(items){
	this.isTopic = false;
	this.isModule = false;
	this.isContentItem = false;
	this.raw = null;
	this.due = null;
	this.start = null;
	this.end = null;	
	this.itemType = "";
	this.name = '';
	this.isEditable = true;
	this.path = '';
	this.ele = null;
	this.post = false;
	this.callType = null;
	this.isTool = false;
	this.items = items;
}

Item.prototype.getType = function(){
	if (this.isModule) return 'Module';

	var type = (function(o){
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
  })(this.raw);

  function getInternalType(t){
  	switch (t){
	      case 'survey': return 'Survey';
	      case 'file': return 'ContentFile';
	      case 'dropbox': return 'Dropbox';
	      case 'link': return 'ContentLink';
	      case 'quiz': return 'Quiz';
	      case 'discuss': return 'DiscussionTopic';
	      default: return false;
	  }
  }

  var t = getInternalType(type);
  if (!t) return getInternalType(this.itemType);
  return t;
}

Item.prototype.error = function(){
	$(this.ele).css({backgroundColor: 'rgba(219, 40, 40, 0.35)'});
  if (this.issueWithDates()){
    $(this.ele).find('td:nth-child(3)').css({backgroundColor: 'rgba(219, 40, 40, 0.34)'});
    loading.stop();
  }
}

Item.prototype.issueWithDates = function(){
	return ((this.end && this.start) && this.start > this.end) || ((this.start && this.duedate) && this.start > this.duedate);
}

Item.prototype.clearDates = function(){
	this.start = null;
	this.end = null;
	this.due = null;
	this.render();
}

Item.prototype.setChecked = function(val){
	$(this.ele).find('.change')[0].checked = val;
  this.post = val;
  this.change = val;
}

Item.prototype.setDate = function(type, date){
  switch (type){
    case 'start': this.start = date; break;
    case 'end': this.end = date; break;
    case 'duedate': this.due = date; break;
  }
  this.setChecked(true);
}

Item.prototype.hasDates = function(){
	return this.start || this.end || this.due;
}

Item.prototype.render = function(){
	if (this.start) $(this.ele).find('td:nth-child(3)').html(moment(this.start).local('en').format('MMM DD YYYY hh:mm a'));
	if (this.end) $(this.ele).find('td:nth-child(4)').html(moment(this.end).local('en').format('MMM DD YYYY hh:mm a'));
	if (this.due) $(this.ele).find('td:nth-child(5)').html(moment(this.due).local('en').format('MMM DD YYYY hh:mm a'));
}

Item.prototype.offsetDates = function(amount, type){
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
  this.render();
}

Item.prototype.getId = function(){
	if (this.raw.Id) return this.raw.Id;
	if (this.raw.ModuleId) return this.raw.ModuleId;
	if (this.raw.ForumId) return this.raw.ForumId;
	if (this.raw.TopicId) return this.raw.TopicId;
	if (this.raw.id) return this.raw.id;
	console.log(this.raw);
}

Item.prototype.setEditable = function(val){
	this.isEditable = val;
}

Item.prototype._setObject = function(obj, type, isContentType){
	this.raw = obj;
	this.isContentItem = isContentType;
	this.isTopic = type == 'top';
	this.isModule = type == 'mod';
	this.itemType = type + '';
	this.itemType = this.itemType == 'top' ? 'Content Topic' : this.itemType;
	this.itemType = this.itemType == 'mod' ? 'Content Module' : this.itemType;
	this.name = this.raw.Name ? this.raw.Name : this.raw.Title;
	this._setDates();
}

Item.prototype._setDates = function(){
	if (this.isModule){
		this.due = this.raw.ModuleDueDate ? new Date(this.raw.ModuleDueDate) : null;
		this.start = this.raw.ModuleStartDate ? new Date(this.raw.ModuleStartDate) : null;
		this.end = this.raw.ModuleEndDate ? new Date(this.raw.ModuleEndDate) : null;
	}
	if (this.isTopic){
		this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
		this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
		this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
	}
	if (!this.isContentItem){
		switch (this.itemType){
			case 'dropbox': {
				this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
				if (!this.raw.Availability){
					this.due = this.raw.DueDate ? new Date(this.raw.DueDate) : null;
					this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				}
				else{
					this.start = this.raw.Availability.StartDate ? new Date(this.raw.Availability.StartDate) : null;
					this.end = this.raw.Availability.EndDate ? new Date(this.raw.Availability.EndDate) : null;
				}
				break;
			}
			case 'quiz': case 'survey': {
				this.start = this.raw.start;
				this.end = this.raw.end;
				this.name = this.raw.name;
				break;
			}
			case 'checklist': {

				break;
			}
			case 'discussion-forum': {
				this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
				this.postStartDate = this.raw.PostStartDate ? new Date(this.raw.PostStartDate) : null;
				this.postEndDate = this.raw.PostEndDate ? new Date(this.raw.PostEndDate) : null;
				break;
			}
			case 'discussion-topic': {
				this.start = this.raw.StartDate ? new Date(this.raw.StartDate) : null;
				this.end = this.raw.EndDate ? new Date(this.raw.EndDate) : null;
				this.unlockStartDate = this.raw.UnlockStartDate ? new Date(this.raw.UnlockStartDate) : null;
				this.unlockEndDate = this.raw.UnlockEndDate ? new Date(this.raw.UnlockEndDate) : null;
				break;
			}
		}
	}
}

Item.prototype.setOffset = function(amount, type){
	if (!this.hasDates()) return;
  if (!type){
    if (this.start) this.start.setDate(this.start.getDate() + amount);
    if (this.end) this.end.setDate(this.end.getDate() + amount);
    if (this.due) this.due.setDate(this.due.getDate() + amount);
  }
  else{
    this[type] = new Date(this[type].setDate(this[type].getDate() + amount));
  }
}

Item.prototype.offsetByCal = function(cal, type){
	var _this = this;
  function difference(date1, date2){
    var timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  }

  var selectedDate = null;
  var toDate = new Date(cal.year, cal.month, cal.day, cal.hour, cal.minutes, 0);

  selectedDate = this[type];

  if (selectedDate == undefined || selectedDate == null){
    this[type] = toDate;
  }
  else{
    var offset = difference(selectedDate, toDate);
    this.setOffset(offset, type);
    this[type].setHours(cal.hour);
    this[type].setMinutes(cal.minutes);
  }
  this.setChecked(true);
}

Item.prototype.save = function(callback){
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
      obj.requestId = topic.items.requestId++;
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
      obj.requestId = topic.items.requestId++;
      obj.d2l_referrer = localStorage['XSRF.Token'];
    }
  }

  /**
   * @name  Topic.save.createDateProperties
   * @todo
   *  + Set all the d2l variables
   *  + Set the url to the Topic
   */
  function createCallUrl(obj, topic){
    var url = '';
    if (topic.isModule){
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/module/' + topic.getId() + '/EditModuleRestrictions'
    } 
    else {
      url = 'https://byui.brightspace.com/d2l/le/content/' + valence.courses.getId() + '/updateresource/' + topic.getType() + '/' + topic.getId() + '/UpdateRestrictions?topicId=' + topic.getId();
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

  var _this = this;
  $.ajax({
    method: 'POST',
    url: this.url,
    data: result,
    success: function(data){},
    error: function(error){
      if (error.status >= 400) $(_this.ele).addClass('nyi');
    }
  }).always(function(){
    $(_this.ele).css({backgroundColor: ''});
    $(_this.ele).find('td:nth-child(3)').css({backgroundColor: ''});
    _this.setChecked(false);
    callback();
  });
}
function Table(items){
	this.html = $('<button class="ui button green" id="change">Submit</button><button class="ui button" id="OffsetDates">Set Offset</button><button class="ui button" id="toggle">Toggle All</button><button class="ui button" id="toggleAllWithDates">Toggle All With Dates</button><button class="ui button red" id="ClearDates">Clear Dates</button><div class="ui input"><input placeholder="Offset Amount" id="offset" value="180"><input placeholder="Filter..." id="filter"></div><table id="1231231231" class="ui compact celled definition table striped"><thead><tr><th>Change</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Due Date</th><th>Path</th><th>Type</th></tr></thead><tbody></tbody></table>');
	this.items = items;
	this.topics = [];
}

Table.prototype.draw = function(){
	$('body').find('#1231231231').remove();
	$('body').append(this.html);

	for (var i = 0; i < items.items.length; i++){
		this.addRow(items.items[i]);
	}
	var _this = this;
	
	$('table').tablesort().find('th').css({
		cursor: 'pointer',
		textDecoration: 'underline'
	});
	$('body').append('<style>.nyi:after{content:"Not Yet Implemented";color: white;text-align:center;width:100%;background-color:rgba(0, 0, 0, 0.65);display:block;position:absolute;left:0;}#top{top: 48px !important;}.ui.modal{top:1% !important;}th.sorted.ascending:after{content:"  \\2191"}th.sorted.descending:after{content:" \\2193"} .picker-hidden{display:none;}.filter-table .quick{margin-left:.5em;font-size:.8em;text-decoration:none}.fitler-table .quick:hover{text-decoration:underline}td.alt{background-color:#ffc;background-color:rgba(255,255,0,.2)}</style>');

	var _this = this;
	$('.change').on('change', function(){
		var val = $(this).val();
		$(this).parents('tr').prop('topic').change = Boolean(val);
	})

	$('#change').click(function(){
		items.loading.start(true);
		items.changeSelected();
	});

	$('#OffsetDates').click(function(){
		var amount = $('#offset').val();
		items.offsetDates(parseInt(amount));
	});

	$('#ClearDates').click(function(){
		UI.prompt('Password', function(val){
			var input = '';
			for (i=0; i < val.length; i++) {
	     	input +=val[i].charCodeAt(0).toString(2) + " ";
	    }
			if (input == '1000011 1001001 1000100 1100001 1110100 1100101 1110011 '){
				window.items.clearDates();
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
	$(tmp).append('<td>' + topic.name + '</td>');
	//$(tmp).append('<td>' + (topic.isModule ? 'Module' : 'Topic') + '</td>');
	if (topic.start) $(tmp).append('<td class="changeDate">' + moment(topic.start).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.end) $(tmp).append('<td class="changeDate">' + moment(topic.end).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	if (topic.due) $(tmp).append('<td class="changeDate">' + moment(topic.due).local('en').format('MMM DD YYYY hh:mm a') + '</td>');
	else $(tmp).append('<td class="changeDate"></td>');
	$(tmp).append('<td>' + topic.path + '</td>');
	$(tmp).append('<td>' + topic.itemType + '</td>');
	$(tmp).find('.change').change(function(e){
		var val = $(this).val() == 'on';
		topic.post = val;
		topic.change = val;
	});
	topic.setEditable();
}
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

/**
 * To Get
 * - Checklist
 * - dropbox
 * - quiz
 * - survey
 * - discussion
 * 	- forums
 * 	- topics
 * -√ Toc
 * -√ Modules
 * -√ Topics
 */

window.items = new Items();
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
				case 4: {type = 'due'; break;}
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
