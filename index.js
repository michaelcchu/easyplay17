const audioContext = new AudioContext();
const fileInput = byId("fileInput");
const gainNodes = [];
const normalGain = 0.15; 
const reader = new FileReader();

let activePress; let chords; let index; let midi; let notes; let on = false; 
let press; let tuning;

function byId(id) {return document.getElementById(id);};

function setChord(i, gain) {
  const chord = chords[i];
  for (let note of chord) {
    gainNodes[note.midi].gain.setTargetAtTime(gain,
      audioContext.currentTime, 0.015);
  }  
}
function down(e) {
    e.preventDefault();
    const press = e.pointerId;
    if (on && (index < chords.length) && (press !== activePress)) {
        if (index > 0) {
          setChord(index-1, 0); // turn the old oscillators off
        }
        setChord(index, normalGain); // turn the new oscillators on
        activePress = press; index++;
    }
}

function getChords(notes) {
  ticks = []; chords = [];
  for (let note of notes) {
    let index = ticks.indexOf(note.ticks);
    if (index > -1) {
      chords[index].push(note);
    } else {
      let i = 0;
      while ((i < ticks.length) && (ticks[i] < note.ticks)) {i++;}
      chords.splice(i, 0, [note]); // should insert chord in correct location
      ticks.splice(i, 0, note.ticks);
    }
  }
  return chords;
}

function resetVars() {
    activePress = null; chords = []; index = 0; 

    notes = [];
    for (let track of midi.tracks) {
      for (let note of track.notes) {
        notes.push(note);
      }
    }
    chords = getChords(notes);

    for (gainNode of gainNodes) {gainNode.gain.value = 0;}
}

function start() { 
    window.setTimeout(() => {
        if (!on) {
          tuning = {pitch: 9, octave: 4, text: "a4", frequency: 440}; 

          const tuningMidiNumber = tuning.pitch + 12 * (tuning.octave + 1);
      
          for (let i = 0; i < 128; i++) {
            const freq = tuning.frequency * 2**((i - tuningMidiNumber) / 12);
          
            const oscillator = new OscillatorNode(audioContext, 
              {frequency: freq});
            const gainNode = new GainNode(audioContext, {gain: 0});
          
            oscillator.connect(gainNode).connect(audioContext.destination);
            oscillator.start();

            gainNodes.push(gainNode);
          }

          on = true;
        }
        resetVars();
    });
}

function up(e) {
    e.preventDefault();
    if (on && (e.pointerId === activePress)) {
        setChord(index-1, 0); // turn the old oscillators off
        activePress = null;
    }
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; 
    if (file) {reader.readAsArrayBuffer(file);}
});
reader.addEventListener("load", (e) => {midi = new Midi(e.target.result);});
const touchstart = (e) => {keydown(e);}; const touchend = (e) => {keyup(e);};
const docEventTypes = [down,up];

const canvas = document.getElementById("tap-area");
const context = canvas.getContext("2d");

byId("start").addEventListener("click", start);

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