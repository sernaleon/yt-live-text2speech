function fixStorage() {
	if(navigator.userAgent.search('Chrome') == -1) {
		// Seems like storage.sync doesn't work on Firefox.
		chrome.storage.sync = chrome.storage.local;
		console.log('WARNING: Using local storage.');
	}
}
fixStorage();

document.addEventListener('DOMContentLoaded', function() {
	let voiceSelect = document.getElementById('voice');
	let emojisCheck = document.getElementById('emojis');
	let rateInput = document.getElementById('rate');
	let pitchInput = document.getElementById('pitch');
	let volumeInput = document.getElementById('volume');
	let delayInput = document.getElementById('delay');
	let beginWithInput = document.getElementById('beginWith');
	let statusText = document.getElementById('status');

	function saveChanges() {
		let voice = voiceSelect.options[voiceSelect.selectedIndex].value;
		let emojis = emojisCheck.checked;
		let voiceRate = rateInput.value;
		let voicePitch = pitchInput.value;
		let voiceVolume = volumeInput.value;
		let delay = delayInput.value;
		let beginWith = beginWithInput.value;

		chrome.storage.sync.set({
			voiceType: voice,
			emojisEnabled: emojis,
			voiceRate: voiceRate,
			voicePitch: voicePitch,
			voiceVolume: voiceVolume,
			delay: delay,
			beginWith:beginWith
		}, function() {
			statusText.textContent = 'Options saved.';
			console.log('Changes saved! Voice: ' + voice + '; emojis: ' + emojis + '; rate: ' + voiceRate + '; pitch: ' + voicePitch + '; volume: ' + voiceVolume + '; delay: ' + delay);
		});
	}

	function loadOptions() {
		chrome.storage.sync.get({
			// default values
			voiceType: '',
			emojisEnabled: true,
			voiceRate: 1.0,
			voicePitch: 1.0,
			voiceVolume: 1.0,
			delay: 0.0,
			beginWith:"AA"
		}, function(items) {
			console.log('Options loaded! Voice: ' + items.voiceType + '; emojis: ' + items.emojisEnabled + '; rate: ' + items.voiceRate + '; pitch: ' + items.voicePitch + '; volume: ' + items.voiceVolume);
			
			voiceSelect.value = voiceSelect.options[0].value;
			for(let i=0; i < voiceSelect.options.length; i++) {
				if(voiceSelect.options[i].value == items.voiceType || voiceSelect.options[i].getAttribute('data-lang') == items.voiceType) {
					voiceSelect.value = voiceSelect.options[i].value;
					break;
				}
			}
			emojisCheck.checked = items.emojisEnabled;
			rateInput.value = items.voiceRate;
			pitchInput.value = items.voicePitch;
			volumeInput.value = items.voiceVolume;
			delayInput.value = items.delay;
			beginWithInput.value = items.beginWith;

			voiceSelect.disabled = false;
			emojisCheck.disabled = false;
			rateInput.disabled = false;
			pitchInput.disabled = false;
			volumeInput.disabled = false;
			delayInput.disabled = false;
			beginWithInput.disabled = false;
		});
	}

	voiceSelect.addEventListener('change', saveChanges);
	emojisCheck.addEventListener('change', saveChanges);
	rateInput.addEventListener('change', saveChanges);
	pitchInput.addEventListener('change', saveChanges);
	volumeInput.addEventListener('change', saveChanges);
	delayInput.addEventListener('change', saveChanges);
	beginWithInput.addEventListener('change', saveChanges);

	function loadVoices() {
		let voices = speechSynthesis.getVoices();
		for(i = 0; i < voices.length; i++) {
			let option = document.createElement('option');
			option.textContent = voices[i].name;
			if(voices[i].lang !== '') {
				option.textContent += ' (' + voices[i].lang + ')';	
			}
			if(voices[i].localService) {
				option.textContent += ' (local)';
			} else {
				option.textContent += ' (network)';
			}
			option.value = voices[i].voiceURI;
			option.setAttribute('data-lang', voices[i].lang);
			voiceSelect.appendChild(option);
		}
		console.log('Options: loaded ' + voices.length + ' voices.');
		loadOptions();
	}

	if(speechSynthesis.getVoices().length > 0) {
		loadVoices();
	}

	window.speechSynthesis.onvoiceschanged = function() {
		loadVoices();
	};

	if(window.location.href.endsWith('?dark')) {
		document.body.style.color = 'white';
	}
});
