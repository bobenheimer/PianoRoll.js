/**
 * A track has notes, an instrument, and methods to remove and add Notes
 * @param instrument The instrument used in the track
 */
var Track = function(audiolet, instrument) {
    this.audiolet = audiolet;
    this.notes = [];
    this.instrument = instrument;
}

/**
 * Add a single note to the track
 * @param {Note} The note to add
 */
Track.prototype.addNote = function(note) {
    //binary search tree seems kind of overkill for now
    for (var i = 0; i < this.notes.length; i++) {
        if (this.notes[i].beat >= note.beat) {
            this.notes.splice(i, 0, note);
            return note;
        }
    }
    this.notes[this.notes.length] = note;
    return note;
}

/**
 * Remove the given note
 * @param {Number} frequency
 * @param {Number} beat
 * @param {Number} duration
 */
Track.prototype.removeNote = function(frequency, beat, duration, volume) {  
    //binary search tree seems kind of overkill for now
    for (var i = 0; i < this.notes.length; i++) {
        //if (this.notes[i].frequency == frequency && this.notes[i].duration == duration && this.notes[i].beat == beat) {
        if (this.notes[i].frequency == frequency && this.notes[i].beat == beat) {
            this.notes.splice(i, 1);
            return;
        }
    }
}

Track.prototype.removeAll = function() {
    this.notes = [];
}

/**
 * Play the song
 * may want to add startbeat as an instance variable or something and then have a setter function
 * @param {Number} beat The beat of the song to start at
 */
Track.prototype.play = function(beat) {
    var startNote;
    if (beat != undefined) {
        startNote = this.findBeatIndex(beat);  
        if (startNote == this.notes.length) {
            return;
        }
        //offset = this.notes[startNote].beat - beat;
    }
    else {
        startNote = 0;
        beat = 0;
        //offset = 0;
    }
    for (var i = startNote; i < this.notes.length; i++) {
        this.audiolet.scheduler.addRelative(this.notes[i].beat - beat, this.playNote.bind(this, this.notes[i].frequency, this.notes[i].beat, this.notes[i].duration, this.notes[i].volume));
    }    
}

/**
 * Play a note
 * @param {Number} frequency
 * @param {Number} beat
 * @param {Number} duration
 * @param {Number} volume
 */
Track.prototype.playNote = function(frequency, beat, duration, volume) {
    var note = new Note(frequency, beat, duration, volume);
    var noteToPlay = new this.instrument(this.audiolet, note.frequency, note.duration, note.volume, this.audiolet.scheduler.bpm);
    noteToPlay.connect(this.audiolet.output);
}

/**
 * Get the index where the Beat should be
 * @param {Number} beat The beat 
 */
Track.prototype.findBeatIndex = function(beat) {
    var i;
	for (i = 0; i < this.notes.length; i++) {
		if (beat <= this.notes[i].beat) {
            return i;		    
		}
	}
	return i;
}

/**
 * A note consists of a frequency, a beat, and a duration
 * @param {Number} frequency
 * @param {Number} beat 
 * @param {Number} duration
 */
var Note = function(frequency, beat, duration, volume) {
    this.frequency = frequency;
    this.beat = beat;
    this.duration = duration; 
    this.volume = volume;
}

Note.prototype.toString = function() {
    return "frequency:" + this.frequency + " beat: " + this.beat + " duration: " + this.duration; 
}

/**
 * A Song contains 0 or more tracks, a tempo
 */
var Song = function() {
    this.audiolet = new Audiolet();
	this.tempo = 100;
	this.tracks = [];
}

/**
 * Create a new track for the song
 * @param instrument
 */
Song.prototype.createTrack = function(instrument) {
    this.tracks[this.tracks.length] = new Track(this.audiolet, instrument);
    return this.tracks[this.tracks.length - 1];
}

/**
 * Change the tempo of the track
 * @param newTempo New tempo
 */
Song.prototype.changeTempo  = function(newTempo) {
    this.tempo = newTempo;
    this.audiolet.scheduler.setTempo(newTempo);
}

/**
 * Play the song at the specified beat
 * @param {Number} beat
 */
Song.prototype.play = function(beat) {
	for (var i = 0; i < this.tracks.length; i++) {
		this.tracks[i].play(beat);
	}
}

Song.prototype.getAllNotes = function() {
    var allNotes = [];
    for (var i = 0; i < this.tracks.length; i++) {
        allNotes[i] = this.tracks[i].notes;
    }
    return allNotes;
}