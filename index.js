const audioContext = new AudioContext();
const fileInput = byId("fileInput");
const gainNode = new GainNode(audioContext);
const oscillator = new OscillatorNode(audioContext, {frequency: 0});
const reader = new FileReader();
const select = byId("track");
const value = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1};

let activePress; let frequencies; let index; let indents; let midi; 
let normalGain; let notes; let octave; let on = false; let paused; let press; 
let track; let tuning;

oscillator.connect(gainNode).connect(audioContext.destination); resetVars();

function byId(id) { return document.getElementById(id); };

function toFreq(note) {
    return tuning.frequency * 2**((note.pitch - tuning.pitch)/12 
        + note.octave - tuning.octave);
}

function convertNotesToFrequencies() {
    octave = 4;
    for (let i = 0; i < notes.length; i++) {
        const note = unbundle(notes[i]); notes[i] = note.text;
        frequencies.push(toFreq(note));
        const indent = note.pitch + (note.octave + 1) * 12;
        indents.push(indent);
    } 
}

function down(e) {
    e.preventDefault();
    let gain = 0;
    const press = e.pointerId;
    strPress = ""+press;
    if (on && !paused
        && (index < frequencies.length) && (press != activePress)
        && (document.activeElement.nodeName !== 'INPUT')) {
        const freq = frequencies[index];
        if (freq > 0) {
            gain = normalGain * (49 / freq);
        }
        if (activePress === null) {
            oscillator.frequency.value = freq;
        } else {
            oscillator.frequency.setTargetAtTime(freq, 
                audioContext.currentTime, 0.003)    
        }
        gainNode.gain.setTargetAtTime(gain, 
            audioContext.currentTime, 0.015);
        activePress = press; index++;
    }
}

function format(x) {return x.trim().toLowerCase();}

function pause() { paused = true; oscillator.frequency.value = 0; }

function resetVars() {
    activePress = null; frequencies = []; index = 0; indents = []; octave = 4; 
    paused = false;
    tuning = unbundle(byId("tuningNote").value);
    tuning.frequency = +byId("tuningFrequency").value;
    if (byId("fileRadio").checked) {
        track = select.selectedIndex;
        notes = midi.tracks[track].notes.map(x => format(x.name));
    } else {
        notes = format(byId("notes").value).split(/\s+/);
        midi = new Midi();
        const track = midi.addTrack();
        for (let i = 0; i < notes.length; i++) {
            track.addNote({ name: notes[0] });
        }
    }
    const proposedGain = +byId("gain").value;
    if (proposedGain <= 1 && proposedGain >= 0) {normalGain = proposedGain;} 
    else {normalGain = 0.15;}
    gainNode.gain.value = 0;
}

function resume() { paused = false; }

function start() { 
    window.setTimeout(() => {
        resetVars(); convertNotesToFrequencies();
        if (!on) {oscillator.start(); on = true;}
    });
}

function unbundle(note) {
    let text = format(note); note = text.split('');
    if (+note.at(-1)) {octave = +note.pop();} else {text += octave;}
    let pitch = 0; while (note.length) { pitch += value[note.pop()]; }
    return {pitch:pitch, octave:octave, text:text};
}

function up(e) {
    e.preventDefault();
    if (on && (e.pointerId === activePress)) {
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.015);
        activePress = null;
    }
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; if (file) {reader.readAsArrayBuffer(file);}
});
reader.addEventListener("load", (e) => {
    midi = new Midi(e.target.result);
    while (select.options.length) {select.options.remove(0);}
    for (let i = 0; i < midi.tracks.length; i++) {
        const option = document.createElement("option");
        option.text = midi.tracks[i].name; select.add(option);
    }
});
const touchstart = (e) => {keydown(e);}; const touchend = (e) => {keyup(e);};
const buttonFuncs = [start,pause,resume];
const docEventTypes = [down,up];
for (f of buttonFuncs) {byId(f.name).addEventListener("click", f);}

const canvas = document.getElementById("tap-area");
const context = canvas.getContext("2d");

for (et of docEventTypes) {canvas.addEventListener("pointer"+et.name, et, {passive: false});}

context.fillStyle="#FF0000";
context.fillRect(0,0,canvas.width,canvas.height);

const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log(
        `The time to ${entry.name} was ${entry.startTime} milliseconds.`
      );
      // Logs "The time to first-paint was 386.7999999523163 milliseconds."
      // Logs "The time to first-contentful-paint was 400.6999999284744 milliseconds."
    });
  });
  
  observer.observe({ type: "paint", buffered: true });

  canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
  }, false); 


// Turn off default event listeners

canvas.addEventListener('focus', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

//
  canvas.addEventListener('pointerover', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerenter', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerdown', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('gotpointercapture', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('pointermove', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('pointerup', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('lostpointercapture', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerout', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerleave', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('touchend', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 