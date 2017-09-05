/* jshint esversion: 6 */

// HTML5 Speech Recognition API 
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const grammarTable = (function () {

	let rawTable = {
		a: ["a", "alpha", "alfa"],
		b: ["b", "bravo", "baker"],
		c: ["c", "charlie"],
		d: ["d", "delta"],
		e: ["e", "echo"],
		f: ["f", "fox", "foxtrot"],
		g: ["g", "golf", "george"],
		h: ["h", "hotel"],
		i: ["i", "india"],
		j: ["j", "juliet"],
		k: ["k", "kilo", "hilo"],
		l: ["l", "lima"],
		m: ["m", "mike"],
		n: ["n", "november"],
		o: ["o", "oscar"],
		p: ["p", "papa"],
		q: ["q", "quebec"],
		r: ["r", "romeo"],
		s: ["s", "sierra"],
		t: ["t", "tango"],
		u: ["u", "uniform"],
		v: ["v", "victor"],
		w: ["w", "whiskey"],
		x: ["x", "xray"],
		y: ["y", "yankee"],
		z: ["z", "zed", "zulu", "zebra"],
		0: ["0", "zero"],
		1: ["1", "one"],
		2: ["2", "two"],
		3: ["3", "three", "tree"],
		4: ["4", "four"],
		5: ["5", "five", "phi", "fie"],
		6: ["6", "six"],
		7: ["7", "seven"],
		8: ["8", "eight"],
		9: ["9", "nine", "niner"],
	};

	let grammarTable = {};

	Object.keys(rawTable).forEach(function (k) {
		let arr = rawTable[k];
		arr.forEach(function (def) {
			grammarTable[def] = k;
		});
	});

	return grammarTable;
})();

/**
 * Utility for recognizing phonetic symbols visa HTML5"s
 * Speech recognition api.
 * 
 */
class PhoneticInterpreter {

	constructor() {
		let buf = "#JSGF V1.0; grammar phonetics; public <symbol> = ";
		buf += Object.keys(grammarTable).join(" | ");
		buf += " ;";
		this.sgl = new SpeechGrammarList();
		this.sgl.addFromString(buf, 1);
	}

	translate(str) {
		let words = str.split(" ");
		words = words.map(function (w) {
			return w.toLowerCase();
		});
		let out = "";
		words.forEach(function (w) {
			let s = grammarTable[w];
			if (s === undefined) {
				s = w.charAt(0);
			}
			out += s;
		});
		return out;
	}

	onStart() {

	}

	onResult(final, translated) {

	}

	onError() {

	}

	onEnd() {

	}

	start() {
		if (!SpeechRecognition) {
			return;
		}
		let finalTxt = "";

		let recog = new SpeechRecognition();
		recog.continuous = true;
		recog.interimResults = false;
		recog.grammars = this.sgl;
		recog.lang = "en-US";

		let that = this;

		recog.onstart = function (e) {
			finalTxt = "";
			that.onStart();
		};
		
		recog.onresult = function (e) {

			for (let i = e.resultIndex; i < e.results.length; ++i) {
				let r = e.results[i];
				if (r.isFinal) {
					finalTxt += r[0].transcript;
				}
			}
			let translated = that.translate(finalTxt);
			that.onResult(finalTxt, translated);
			finalTxt = "";
		};

		recog.onerror = function (e) {
			that.onError(e);
		};

		recog.onend = function (e) {
			that.onEnd(e);
		};

		//everything is set up.  let"s go!
		recog.start();
		
	}

}