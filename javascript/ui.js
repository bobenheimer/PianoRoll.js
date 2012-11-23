
/**
 * Piano Part of the Piano roll
 */
var Piano = function(sharpHeight, adgHeight, bcefHeight, track) {
    this.track = track;
    this.blackfillStyle = "#aae3ab";
    this.whitefillStyle = "#ddf4fc";
    this.strokeStyle = "#FA6";
    this.whiteWidth = 150;
    this.whiteCanvas = document.getElementById('white-keys');
    this.blackCanvas = document.getElementById('black-keys');
    this.whiteContext = this.whiteCanvas.getContext("2d");
    this.blackContext = this.blackCanvas.getContext("2d");
    this.keys = [];
    this.sharpHeight = sharpHeight;
    this.adgHeight = adgHeight;
    this.bcefHeight = bcefHeight;
    this.blackOffset = sharpHeight / 2;
    this.octaveHeight = 3 * this.adgHeight + 4 * this.bcefHeight; //The height of an entire octave is 7 x the height of a white key
    this.piano = document.getElementById('piano');
    this.container = document.getElementById('piano-container');
    this.blackKeyLookup = [];
    this.whiteKeyLookup = [];
    this.pastKey = null;
}

Piano.prototype.drawNote = function(key, highlight) {
    if (key == undefined) {
        return;
    }
    if (highlight) {
        if (key.black) {
            key.draw(this.blackContext, this.blackfillStyle, this.strokeStyle);
        }
        else {
            key.draw(this.whiteContext, this.whitefillStyle, this.strokeStyle);
        }        
    }
    else {
        if (key.black) {
            key.draw(this.blackContext);
        }
        else {
            key.draw(this.whiteContext);
        }            
    }
}

Piano.prototype.drawPiano = function(startKey, startOctave, numKeys) {
    this.height = 0;
    var notes =  ['g#', 'g', 'f#', 'f', 'e', 'd#', 'd' ,'c#', 'c', 'b', 'a#', 'a'];
    var mappings=[ 8,    7,    6,   5,   4,   3,   2,   1,   0,   11,   10,    9];
    var notesOffset = [
                       this.blackOffset,
                       this.adgHeight - this.blackOffset,
                       this.blackOffset,
                       this.bcefHeight,
                       this.bcefHeight - this.blackOffset,
                       this.blackOffset,
                       this.adgHeight - this.blackOffset,
                       this.blackOffset,
                       this.bcefHeight,
                       this.bcefHeight - this.blackOffset,
                       this.blackOffset,
                       this.adgHeight - this.blackOffset
                       ];
    var startindex = notes.indexOf(startKey);
    var startNote = 12 * startOctave - 8 + mappings[startindex] 
    octave = startOctave;
    var nextY = 0;
    for(var i=0, j = startindex; i < numKeys; i++, j = (j + 1) % 12) {
        var frequency =  Math.pow(2, (Math.abs(startNote - i) - 49) / 12) * 440;
        if(notes[j][1] == '#') {
            this.keys[i] = new PianoKey(nextY, this.sharpHeight, notes[j], octave, frequency);
        }
        else if(notes[j] == 'a' || notes[j] == 'd' || notes[j] == 'g') {
            this.height += this.adgHeight;
            this.keys[i] = new PianoKey(nextY, this.adgHeight, notes[j], octave, frequency);
        }
        else {
            this.height += this.bcefHeight;
            this.keys[i] = new PianoKey(nextY, this.bcefHeight, notes[j], octave, frequency);
        }
        if (this.keys[i].note == 'c') {
            octave -= 1;
        }
        nextY += notesOffset[j];
    }
    
    //create lookup table for black keys
    for(var i = 0; i < 12; i++) {
        if (this.keys[i].black) {
            for (var j = 0, k = this.keys[i].y; j < this.keys[i].height; j++, k++) {
                this.blackKeyLookup[k] = i;
            }
        }
    }
    //create lookup table for white keys
    for(var i = 0; i < 12; i++) {
        if (!this.keys[i].black) {
            for (var j = 0, k = this.keys[i].y; j < this.keys[i].height; j++, k++) {
                this.whiteKeyLookup[k] = i;
            }
        }
    }    
    if (this.keys[this.keys.length - 1].black) {
        this.height += this.blackOffset
    }
    
    this.piano.style.height = this.height + "px";
    this.whiteCanvas.height = this.height;
    this.blackCanvas.height = this.height;
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i].black) {
            this.keys[i].draw(this.blackContext);
        }
        else {
            this.keys[i].draw(this.whiteContext);
        }
    }
    this.piano.onmousedown = (function(e) {
        var x = e.pageX - this.piano.offsetLeft;
        var y = e.pageY - this.piano.offsetTop + this.container.scrollTop;
        var key = this.getKey(x, y);
        this.playNote(key);
    }).bind(this);
    
    this.piano.onmousemove = (function(e) {
        var x = e.pageX - this.piano.offsetLeft;
        var y = e.pageY - this.piano.offsetTop  + this.container.scrollTop;
        var key = this.getKey(x, y);
        if (key != this.pastKey) {
            this.drawNote(key, true)
            if (this.pastKey != null) {
                this.drawNote(this.pastKey, false);         
            }          
            this.pastKey = key;
        }
    }).bind(this);
    
    this.piano.onmouseout = (function() {
        this.drawNote(this.pastKey, false);
    }).bind(this);

}

Piano.prototype.getHeight = function() {
    return this.keys[this.keys.length - 1].y + this.keys[this.keys.length - 1].height;
}


Piano.prototype.playNote = function(key) {
    if (key == undefined || key == null) {
        return;
    }
    this.track.playNote(key.frequency, 0, 1, 1);
}

Piano.prototype.getKey = function(x, y) {
    var relativeYOffset = y % this.octaveHeight;
    var octaveOffset = 12 * Math.floor(y / this.octaveHeight);
    if (x > 75) {
        return this.keys[this.whiteKeyLookup[relativeYOffset] + octaveOffset];
    }
    else {
        if(y > this.octaveHeight * Math.floor(y / this.octaveHeight) && y < this.octaveHeight * Math.floor(y / this.octaveHeight) + this.blackOffset) {
            return this.keys[this.blackKeyLookup[this.octaveHeight] + octaveOffset - 12];
        }
        return this.keys[this.blackKeyLookup[relativeYOffset] + octaveOffset] || this.keys[this.whiteKeyLookup[relativeYOffset] + octaveOffset];
    }
}


var PianoKey = function (y, height, note, octave, frequency) {
    this.octave = octave;
    this.frequency = frequency || 440;
    this.y = y;
    this.height = height;
    this.note = note;
    if (this.note[1] == '#') {
        this.black = true;
        this.width = 75;
        this.fillStyle = '#000'; 
    }
    else {
        this.black = false;
        this.width = 150;
        this.fillStyle = '#FFF'; 
    }
}

PianoKey.prototype.draw = function(context, fillStyle, strokeStyle) {
    context.fillStyle = fillStyle || this.fillStyle; 
    context.strokeStyle = strokeStyle || '#000';
    context.lineWidth = 0;
    context.fillRect(0, this.y, this.width, this.height);
    context.strokeRect(0, this.y, this.width, this.height);
    if (this.black) {
        context.fillStyle = "#FFF";    
    }
    else {
        context.fillStyle = "#000";             
    }
    context.fillText(this.note.toUpperCase() + this.octave, this.width - 25, this.y + (this.height / 2));    
}

var Grid = function() {
    this.beatsPerMeter = 4;
    this.canvas = document.getElementById('canvas-grid');
    this.noteCanvas = document.getElementById('canvas-notes');
    this.context = this.canvas.getContext("2d");
    this.noteContext = this.noteCanvas.getContext("2d");
    this.grid = document.getElementById('grid');
    this.container = document.getElementById('grid-container');
    this.drawnNotes = [];
    this.currentNoteDuration = 1;
    this.smallestBeatIncrement = 0.25;
    this.startY = 0;
    this.pastKey;
    this.measureCounter = document.getElementById("measure-counter-canvas");
    this.measureCounterContext = this.measureCounter.getContext("2d");
    this.noteXLookup = [];
}


Grid.prototype.drawGrid = function(cellWidth, cellBeatLength, piano, notes) {
    this.piano = piano;
    this.keyHeight = this.piano.blackOffset * 2;
    this.keys = piano.keys;
    this.canvas.height = piano.height;
    this.noteCanvas.height = piano.height;
    this.grid.style.height = piano.height + "px";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.cellWidth = cellWidth || this.width / 16;
    this.cellBeatLength = cellBeatLength || 1;
    this.smallestPixelBeatIncrement = this.cellWidth * this.smallestBeatIncrement / this.cellBeatLength;
    this.context.lineWidth = 0;

    if (this.keys[0].black) {
        this.startY = 0;        
    }
    else {
        this.startY = this.piano.blackOffset;        
    }
    
    for(var i = 0; i < this.keys.length; i++) {
        if (this.keys[i].black) {
            this.context.fillStyle = '#cae3eb';
        }
        else if (!this.keys[i].black){
            this.context.fillStyle = '#ddf4fc';
        }
        
        if(this.keys[i].black) {
            this.context.fillRect(0, this.keys[i].y, this.width, this.keys[i].height);
            this.context.strokeRect(0, this.keys[i].y, this.width, this.keys[i].height);
        }
        else if(this.keys[i].note == 'a' || this.keys[i].note == 'd' || this.keys[i].note == 'g'){
            this.context.fillRect(0, this.keys[i].y + this.piano.blackOffset, this.width, this.keys[i].height -  this.piano.blackOffset);
            this.context.strokeRect(0, this.keys[i].y + this.piano.blackOffset, this.width, this.keys[i].height - this.piano.blackOffset);   
        }
        else if(this.keys[i].note == 'c' || this.keys[i].note == 'f'){
            this.context.fillRect(0, this.keys[i].y + this.piano.blackOffset, this.width, this.keys[i].height);
            this.context.strokeRect(0, this.keys[i].y + this.piano.blackOffset, this.width, this.keys[i].height);  
        }
        else {
            this.context.fillRect(0, this.keys[i].y, this.width, this.keys[i].height -  this.piano.blackOffset);
            this.context.strokeRect(0, this.keys[i].y, this.width, this.keys[i].height -  this.piano.blackOffset);  
        }
    }
    
    var numCells = this.width / this.cellWidth;
    var cellsInMeasure = this.beatsPerMeter / this.cellBeatLength;
    for(var i = 0; i < numCells; i++) {
        if(i % cellsInMeasure == 0) {
            this.context.strokeStyle = '#000';
        }
        else {
            this.context.strokeStyle = '#6E6E6E';   
        }
        this.context.beginPath();
        this.context.moveTo(i * this.cellWidth, 0);
        this.context.lineTo(i * this.cellWidth, this.height);
        this.context.stroke();
        
        this.context.fillStyle = '#000'; 
        this.measureCounterContext.fillText(i + 1, i * this.cellWidth + this.cellWidth / 2, 12);    

    }
    
    if (this.noteXLookup.length == 0) {
        for (var i = 0; i < this.width / this.smallestPixelBeatIncrement; i++) {
            this.noteXLookup[i] = [];
        }
    }

    if (notes) {
        for (var i = 0; i < notes.length; i++) {
            this.addNote(notes[i]);
            //console.log(notes[i]);
        }
    }
    this.grid.onmousemove = (function(e) {
        var x = e.pageX - this.grid.offsetLeft + this.container.scrollLeft;
        var y = e.pageY - this.grid.offsetTop + this.container.scrollTop;
        var key = this.keys[this.getKeyIndex(x, y)];
        if (key == undefined) {
            return;
        }
        if (key != this.pastKey) {
            this.piano.drawNote(key, true);
            if (this.pastKey != null) {
                this.piano.drawNote(this.pastKey, false);             
            }     
            this.pastKey = key;
        }
    }).bind(this);
    
    this.grid.onmousedown = (function(e) {
        var x = e.pageX - this.grid.offsetLeft + this.container.scrollLeft;
        var y = e.pageY - this.grid.offsetTop + this.container.scrollTop;;
        this.processClick(x, y);
    }).bind(this);
    
    this.grid.onmouseout = (function() {
        this.piano.drawNote(this.pastKey, false);
    }).bind(this);
}


Grid.prototype.getKeyIndex = function(x, y) {
    var keyIndex = Math.floor((y - this.startY)/ this.keyHeight);
    return keyIndex;
}

Grid.prototype.removeAll = function() {
    for(var i = 0; i < this.noteXLookup.length; i++) {
        this.noteXLookup[i] = [];
    }
    this.drawNotes();
}

Grid.prototype.drawNote = function(x, y, height, width) {
    this.noteContext.fillStyle = '#F00';
    this.noteContext.fillRect(x, y, height, width);
    this.noteContext.strokeRect(x, y, height, width);
}

Grid.prototype.processClick = function(x, y, draw) {
    var cellLocation = Math.floor(x / this.cellWidth) * this.cellWidth;
    var notePixelLength = this.currentNoteDuration / this.cellBeatLength * this.cellWidth;
    var cellLocationOffset = Math.floor(x % this.cellWidth  / (this.smallestBeatIncrement * this.cellWidth / this.cellBeatLength)) *  this.smallestPixelBeatIncrement;
    var xPosition = cellLocation + cellLocationOffset;
    var keyIndex = Math.floor((y - this.startY)/ this.keyHeight);
    if (keyIndex < 0) {
        return;
    }
    var yPosition = this.startY + keyIndex * this.keyHeight;
    
    
    var beatNumber = xPosition * this.cellBeatLength / this.cellWidth;
    var noteToDraw = new DrawnNote(xPosition, yPosition, notePixelLength, true);
    var currentIndex = xPosition / this.smallestPixelBeatIncrement;
    var durationInIncrements = this.currentNoteDuration / this.smallestBeatIncrement;
    var noteToDelete = this.checkSameNote(noteToDraw, this.noteXLookup[currentIndex]);    
    
    if(noteToDelete) {
        var startIndex = noteToDelete.x / this.smallestPixelBeatIncrement;
        var stopIndex = noteToDelete.length / this.smallestPixelBeatIncrement + startIndex;
        for (var i = startIndex; i < stopIndex; i++) {
            this.removeNote(noteToDelete.x, yPosition, this.noteXLookup[i]);
        }
        this.drawNotes();
        this.piano.track.removeNote(this.keys[keyIndex].frequency, noteToDelete.x * this.cellBeatLength / this.cellWidth, this.currentNoteDuration, 1);
    }
    else {
        this.addNotes(currentIndex, durationInIncrements, noteToDraw);
        if (draw == undefined || draw == true) {
            this.drawNote(xPosition, yPosition, notePixelLength, this.keyHeight);
            this.piano.track.playNote(this.keys[keyIndex].frequency, 0, this.currentNoteDuration, 1);                
        }  
        this.piano.track.addNote(new Note(this.keys[keyIndex].frequency, beatNumber, this.currentNoteDuration, 1));
    }
}


Grid.prototype.addNote = function(note) {
    //console.log(this.keys);
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i].frequency == note.frequency) {
            var currentIndex = note.beat * this.cellWidth / this.cellBeatLength / this.smallestPixelBeatIncrement;
            var durationInIncrements = note.duration / this.smallestBeatIncrement;
            var notePixelLength = note.duration / this.cellBeatLength * this.cellWidth;
            var noteToDraw = new DrawnNote(note.beat * this.cellWidth / this.cellBeatLength, this.startY + i * this.keyHeight, notePixelLength, true);
            this.addNotes(currentIndex, durationInIncrements, noteToDraw);
            //this.processClick(note.beat * this.cellWidth / this.cellBeatLength, this.startY + i * this.keyHeight , false);
        }
    }
}

Grid.prototype.addNotes = function(currentIndex, durationIncrements, noteToDraw) {
    if (durationIncrements == 0) {
        return;
    }
    else if (this.noteXLookup[currentIndex].length == 0) {
        this.noteXLookup[currentIndex] = [noteToDraw];
        this.addNotes(currentIndex + 1, durationIncrements - 1, noteToDraw);
    }
    else {
        this.noteXLookup[currentIndex][this.noteXLookup[currentIndex].length] = noteToDraw; 
        this.addNotes(currentIndex + 1, durationIncrements - 1, noteToDraw);
    }
    
}

Grid.prototype.removeNote = function(x, y, notes) {
    for (var i = 0; i < notes.length; i++) {
        if(notes[i].y == y && notes[i].x == x) {
            notes.splice(i ,1);
            return;
        }
    }
}

Grid.prototype.checkSameNote = function(noteToDraw, notes) {
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].y == noteToDraw.y)
            return notes[i];
    }
    return false;
}

Grid.prototype.drawNotes = function() {
    //console.log(this.noteXLookup);
    //this.noteContext.save();
    //this.noteContext.setTransform(1, 0, 0, 1, 0, 0);
    this.noteContext.clearRect(0, 0, this.width, this.height);
    //this.noteContext.restore();
    for (var i = 0; i < this.noteXLookup.length; i++) {
        for(var j = 0; j < this.noteXLookup[i].length; j++) {
            this.drawNote(this.noteXLookup[i][j].x, this.noteXLookup[i][j].y, this.noteXLookup[i][j].length, this.keyHeight);
        } 
    }
}

var DrawnNote = function(x, y, length, isStart, startIndex) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.isStart = isStart;
    this.startIndex = startIndex;
}

var Controls = function(song, piano, grid, sequencer) {
    this.sequencer = sequencer;
    this.song = song;
    this.piano = piano;
    this.grid = grid;
    this.playButton = document.getElementById('play-button');
    this.tempoButton = document.getElementById('tempo');
    this.tempoButton.value = this.song.tempo;
    this.noteLengthsElements = document.getElementById('note-lengths').children;
    this.noteLengths = [4, 2, 1, 0.5, 0.25];
    this.tracks = [];
    this.tracksElement = document.getElementById('tracks');
    this.clearElement = document.getElementById('clear');
    this.clearElement.onclick = (function() {
        var del = confirm('Are you sure you want to delete track ' + sequencer.getCurrentTrackName());
        if (del) {
            var track = this.sequencer.getCurrentTrack();
            var grid = this.sequencer.getCurrentGrid();
            track.removeAll();
            grid.removeAll();
            
        }
    }).bind(this);  
    this.tracksElement.onchange = (function() {
        var instrument = this.tracksElement.options[this.tracksElement.selectedIndex].value;
        sequencer.changeTrack(instrument);
    }).bind(this);
}

Controls.prototype.addListeners = function() {
    var self = this;
    this.playButton.addEventListener('click', function() {
        self.song.play(0);
    }, false);
    
    this.tempoButton.onblur = (function() {
        var val = parseInt(this.tempoButton.value, 10);
        if (val < 30 || isNaN(val)) {
            this.tempoButton.value = this.song.tempo;
        }
        else {
            this.song.changeTempo(val);
        }

    }.bind(this));

    for (var i = 0; i < this.noteLengthsElements.length; i++) {
        this.noteLengthsElements[i].addEventListener('click', this.changeNoteLength.bind(this, this.noteLengths[i], this.noteLengthsElements[i]), false);
    }    
} 

Controls.prototype.changeNoteLength = function(length, element) {
    element = element || this.noteLengthsElements[this.noteLengths.indexOf(length)];

    this.sequencer.getCurrentGrid().currentNoteDuration = length;
    for (var i = 0; i < this.noteLengthsElements.length; i++) {
        this.noteLengthsElements[i].style.border = "outset";
    }
    element.style.border = "inset";
}

Controls.prototype.addTrack = function(track) {
    this.tracks[this.tracks.length] = track;
    this.tracksElement.options[this.tracksElement.options.length]= new Option(track, track);
}

var Sequencer = function () {
    this.song = new Song();
    this.instruments = instrumentList;
    this.tracks = [];
    this.trackNames = [];
    this.pianos = [];
    this.grids = [];
    this.index = 0;

    var i = 0;
    for (var key in instrumentList) {
        this.tracks[i] = this.song.createTrack(this.instruments[key].playFunction);
        this.trackNames[i] = key;
        this.pianos[i] = new Piano(20, 40, 30, this.tracks[i]);
        this.grids[i] = new Grid();
        i++;
    }
    
    //menu   
    this.controls = new Controls(this.song, this.piano, grid, this);
    this.controls.addListeners();    
    this.getSaved();
    console.log(this.index);
    for (var i = 0; i < this.tracks.length; i++) {
        this.drawMain(this.tracks[i], this.allSavedNotes[i]);
    }
    console.log(this.index);
    this.drawMain(this.tracks[0]);
    
    /*for (var i = 0; i < this.tracks.length; i++) {
        this.drawMain(this.tracks[i]);
    }*/

    
    for (var key in instrumentList) {
        this.controls.addTrack(key);
    }
    


    /*this.allNotes = [];
    //this.allDrawnNotes = [];
    for (var i = 0; i < this.tracks.length; i++) {
        this.allNotes[i] = this.tracks[i].notes;
        //this.allDrawnNotes[i] = this.grids[i].noteXLookup;
    }

    this.getSaved();
    this.changeTrack("piano");*/

    setInterval(function() {
        this.save();

    }.bind(this), 1000);

}

Sequencer.prototype.drawMain = function(track, savedNotes) {
    this.index = this.tracks.indexOf(track);
    this.pianos[this.index].drawPiano('c', 7, 60);
    this.grids[this.index].drawGrid(100, 1, this.pianos[this.index], savedNotes);
    //console.log(this.grids[this.index].notes);
    this.grids[this.index].drawNotes();
    this.controls.changeNoteLength(this.grids[this.index].currentNoteDuration);
    //if (savedNotes)
}



Sequencer.prototype.save = function() {
    //this.allNotes
    //console.log(this.song.getAllNotes());
    localStorage.setItem('notes', JSON.stringify(this.song.getAllNotes()));
    //var startTime = new Date().getTime();                    
    //while (new Date().getTime() < startTime + 500);
    //localStorage.setItem('allDrawnNotes', JSON.stringify(this.allDrawnNotes));
    localStorage.setItem('tempo', this.song.tempo);
}

Sequencer.prototype.getSaved = function() {    
    this.allSavedNotes = JSON.parse(localStorage.getItem('notes'));
    var notes = JSON.parse(localStorage.getItem('notes'));
    var tempo = localStorage.getItem('tempo');
    //console.log(notes);
    for (var i = 0; i < notes.length; i++) {
        this.tracks[i].notes = notes[i];
        //for (var j = 0; j < notes[i].length; j++) { 
            //this.grids[i].addNote(notes[i][j]);
       // }  
        //this.tracks[i];
    }
    //this.getCurrentGrid().drawNotes();
    
    if(tempo != null && tempo != undefined) {
        this.song.changeTempo(parseInt(tempo, 10));
        document.getElementById('tempo').value = tempo;
    }
    

    /*
    try {
        var notes = JSON.parse(localStorage.getItem('allNotes'));
        var drawnNotes = JSON.parse(localStorage.getItem('allDrawnNotes'));
        var tempo = localStorage.getItem('tempo');
        
        if(tempo != null && tempo != undefined) {
            this.song.changeTempo(tempo);
            document.getElementById('tempo').value = tempo;
        }
        if (notes != null && notes != undefined) {
            for (var i = 0; i < notes.length; i++) {
                this.tracks[i].notes = notes[i];
            }
        }
        if (drawnNotes != null && drawnNotes != undefined) {
            for (var i = 0; i < drawnNotes.length; i++) {
                this.grids[i].noteXLookup = drawnNotes[i];
            }
            this.getCurrentGrid().drawNotes();
        }
    }
    catch(err){
           
    } */
}


Sequencer.prototype.getCurrentTrack = function() {
    return this.tracks[this.index];
}

Sequencer.prototype.getCurrentGrid = function() {
    return this.grids[this.index];
}

Sequencer.prototype.getCurrentTrackName = function() {
    return this.trackNames[this.index];
}

Sequencer.prototype.changeTrack = function(track) {
    this.drawMain(this.tracks[this.trackNames.indexOf(track)]);
}

var initialize = function(startNote) {
    var menuHeight = document.getElementById('menu').clientHeight;
    var counterHeight = document.getElementById('measure-counter').clientHeight;
    //var footerHeight = document.getElementById('about').clientHeight;
   // var height = window.innerHeight - menuHeight - counterHeight - footerHeight - 20;
    var height = window.innerHeight - menuHeight - counterHeight - 20;
    document.getElementById('main').style.height = height + "px";
    document.getElementById('quarter').style.border = "inset";
}

