const audioContext = new AudioContext();
const fileInput = byId("fileInput");
const gainNodes = [];
const oscillators = [];
const reader = new FileReader();
const select = byId("track");
const value = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1};

let activePress; let chords; let index; let indents; let midi; 
const normalGain = 0.15; 
let notes; let octave; let on = false; let press; 
let track; let tuning;

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

function convertNoteToMidiNumber(note) {
  note = unbundle(note);
  const indent = note.pitch + (note.octave + 1) * 12;
  return indent;
}

function down(e) {
    e.preventDefault();
    const press = e.pointerId;
    strPress = ""+press;
    if (on && (index < chords.length) && (press !== activePress)) {
        // turn the old oscillators off
        if (index > 0) {
          const previousChord = chords[index-1];
          for (let note of previousChord) {
            const midiNumber = note.midi;
            gainNodes[midiNumber].gain.setTargetAtTime(0,
              audioContext.currentTime, 0.015);
          }  
        }
        
        // turn the new oscillators on
        const chord = chords[index];
        for (let note of chord) {
          const midiNumber = note.midi;
          gainNodes[midiNumber].gain.setTargetAtTime(normalGain,
            audioContext.currentTime, 0.015);
        }
        activePress = press; index++;
    }
}

function format(x) {return x.trim().toLowerCase();}

function getChords(notes) {
  ticks = [];
  chords = [];
  for (let note of notes) {
    let index = ticks.indexOf(note.ticks);
    if (index > -1) {
      chords[index].push(note);
    } else {
      chords.push([note]);
      ticks.push(note.ticks);
    }
  }
  return chords;
}

function resetVars() {
    activePress = null; chords = []; index = 0; indents = []; octave = 4; 
    tuning = {pitch: 9, octave: 4, text: "a4", frequency: 440}; 

    const tuningMidiNumber = tuning.pitch + 12 * (tuning.octave + 1);

    for (let i = 0; i < 128; i++) {
      const frequency = tuning.frequency * 2**((i - tuningMidiNumber)/12);
    
      // 48+9 = 57 for a4
      //60 is middle C
    
      const oscillator = new OscillatorNode(audioContext, {frequency: frequency});
      const gainNode = new GainNode(audioContext);
    
      oscillator.connect(gainNode).connect(audioContext.destination);
    
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    }

    notes = [];
    for (let track of midi.tracks) {
      for (let note of track.notes) {
        notes.push(note);
      }
    }
    chords = getChords(notes);

    for (gainNode of gainNodes) {
      gainNode.gain.value = 0;
    }
}

function start() { 
    window.setTimeout(() => {
        resetVars(); //convertNotesToFrequencies();
        if (!on) {
          for (let oscillator of oscillators) {
            oscillator.start();
          }
          on = true;
        }
    });
}

function up(e) {
    e.preventDefault();
    if (on && (e.pointerId === activePress)) {
        // turn the old oscillators off
        const previousChord = chords[index-1];
        for (let note of previousChord) {
          const midiNumber = note.midi;
          gainNodes[midiNumber].gain.setTargetAtTime(0,
            audioContext.currentTime, 0.015);
        }
        activePress = null;
    }
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; 
    if (file) {reader.readAsArrayBuffer(file);}
});
reader.addEventListener("load", (e) => {
  midi = new Midi(e.target.result);
  start();
});
const touchstart = (e) => {keydown(e);}; const touchend = (e) => {keyup(e);};
const docEventTypes = [down,up];

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