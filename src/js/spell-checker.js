/*
 * https://github.com/sparksuite/codemirror-spell-checker
 * */

// Use strict mode (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
'use strict';

// Requires
var Typo = require('typo-js');

// Create function
function CodeMirrorSpellChecker(options) {
	// Initialize
	options = options || {};


	// Verify
	if(typeof options.codeMirrorInstance !== 'function' || typeof options.codeMirrorInstance.defineMode !== 'function') {
		console.log('CodeMirror Spell Checker: You must provide an instance of CodeMirror via the option `codeMirrorInstance`');
		return;
	}


	// Because some browsers don't support this functionality yet
	if(!String.prototype.includes) {
		String.prototype.includes = function() {
			'use strict';
			return String.prototype.indexOf.apply(this, arguments) !== -1;
		};
	}

	// Define the new mode
	options.codeMirrorInstance.defineMode('spell-checker', function(config) {
		// var lang = 'en_US';
		var lang = options.lang;

		// Load AFF/DIC data
		if(!CodeMirrorSpellChecker.aff_loading) {
			CodeMirrorSpellChecker.aff_loading = true;
			var xhr_aff = new XMLHttpRequest();
			// xhr_aff.open('GET', 'https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.aff', true);
			xhr_aff.open('GET', options.url + '.aff', true);
			xhr_aff.onload = function() {
				if(this.readyState === XMLHttpRequest.DONE) {
					if(this.status === 200) {
						CodeMirrorSpellChecker.aff_data = xhr_aff.responseText;
						CodeMirrorSpellChecker.num_loaded++;

						if(CodeMirrorSpellChecker.num_loaded == 2) {
							CodeMirrorSpellChecker.typo = new Typo(
								lang,
								CodeMirrorSpellChecker.aff_data,
								CodeMirrorSpellChecker.dic_data,
								{ platform: 'any' }
							);
						}
					} else {
						console.error('Downloading fails');
					}
				}
			};
			xhr_aff.send(null);
		}

		if(!CodeMirrorSpellChecker.dic_loading) {
			CodeMirrorSpellChecker.dic_loading = true;
			var xhr_dic = new XMLHttpRequest();
			// xhr_dic.open('GET', 'https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.dic', true);
			xhr_dic.open('GET', options.url + '.dic', true);
			xhr_dic.onload = function() {
				if(this.readyState === XMLHttpRequest.DONE) {
					if(this.status === 200) {
						CodeMirrorSpellChecker.dic_data = xhr_dic.responseText;
						CodeMirrorSpellChecker.num_loaded++;

						if(CodeMirrorSpellChecker.num_loaded == 2) {
							CodeMirrorSpellChecker.typo = new Typo(
								lang,
								CodeMirrorSpellChecker.aff_data,
								CodeMirrorSpellChecker.dic_data,
								{ platform: 'any' }
							);
						}
					} else {
						console.error('Downloading fails');
					}
				}
			};
			xhr_dic.send(null);
		}


		// Define what separates a word
		// var rx_word = '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~ ';
		var rx_word = '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~ 0123456789';

		// Create the overlay and such
		var overlay = {
			token: function(stream) {
				var ch = stream.peek();
				var word = '';

				if(rx_word.includes(ch)) {
					stream.next();
					return null;
				}

				while((ch = stream.peek()) != null && !rx_word.includes(ch)) {
					word += ch;
					stream.next();
				}

				if(CodeMirrorSpellChecker.typo && !CodeMirrorSpellChecker.typo.check(word)) {
					// CSS class: cm-spell-error
					return 'spell-error';
				}

				return null;
			},
		};

		var mode = options.codeMirrorInstance.getMode(
			config,
			config.backdrop || 'text/plain'
		);

		return options.codeMirrorInstance.overlayMode(mode, overlay, true);
	});
}


// Initialize data globally to reduce memory consumption
CodeMirrorSpellChecker.num_loaded = 0;
CodeMirrorSpellChecker.aff_loading = false;
CodeMirrorSpellChecker.dic_loading = false;
CodeMirrorSpellChecker.aff_data = '';
CodeMirrorSpellChecker.dic_data = '';
CodeMirrorSpellChecker.typo;


// Export
module.exports = CodeMirrorSpellChecker;
