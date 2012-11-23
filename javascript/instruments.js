var instrumentList = {       
        piano: {
            playFunction: function(audiolet, frequency, duration, volume) {
                AudioletGroup.apply(this, [audiolet, 0, 1]);
                // Basic wave
                var attack = 0.01;
                var release = 0.5 * duration;
                this.sine = new Sine(audiolet, frequency);
                
                // Gain envelope
                this.gain = new Gain(audiolet, 4);
                this.env = new PercussiveEnvelope(audiolet, 1, 0.01, release,
                    function() {
                        audiolet.scheduler.addRelative(0, this.remove.bind(this));
                    }.bind(this)
                );
                this.envMulAdd = new MulAdd(audiolet, 0.2 * volume, 0);

                // Main signal path
                this.sine.connect(this.gain);
                this.gain.connect(this.outputs[0]);

                // Envelope
                this.env.connect(this.envMulAdd);
                this.envMulAdd.connect(this.gain, 0, 1);
            }
        },
            
            
        
        RockOrgan: {
            playFunction: function(audiolet, frequency, duration, volume, bpm) {
                AudioletGroup.apply(this, [audiolet, 0, 1]);
                var fullDuration = duration * 60 / bpm || duration / 2;            
                console.log(bpm);
                this.triangle1 = new Triangle(audiolet, frequency);
                this.triangle2 = new Square(audiolet, frequency * 2);
                this.triangle3 = new Sine(audiolet, frequency / 2);
                this.gain1 = new Gain(audiolet, 0.9);
                this.gain2 = new Gain(audiolet, 0.2);
                this.gain3 = new Gain(audiolet, 0.5);

                //this.modulator = new Sine(this.audiolet, frequency);
                console.log(frequency);
                this.modulatorMulAdd = new Tanh(this.audiolet);
                
                this.finalGain = new Gain(audiolet, 0.1);
                /*this.envelope = new Envelope(audiolet, 1, [1, 2, 4, 8], [0.2 * fullDuration, 0.6 * fullDuration, 0.2 * fullDuration], 0.1,
                    function() {
                    console.log("test");
                        audiolet.scheduler.addRelative(0, this.remove.bind(this));

                    }.bind(this)
                ); */
                this.envelope = new PercussiveEnvelope(audiolet, 1, fullDuration * 0.1, fullDuration * 0.9,
                    function() {
                        audiolet.scheduler.addRelative(0, this.remove.bind(this));
                    }.bind(this)
                );
                
                this.filter = new LowPassFilter(this.audiolet, 3000);
                //this.modulator = new Sine(this.audiolet, 1);
                //this.modulator.connect(this.modulatorMulAdd);
                //this.modulator.connect(this.modulatorMulAdd);
                //this.modulatorMulAdd.connect(this.triangle1);
                //this.triangle1.connect(this.modulatorMulAdd);  
                this.triangle1.connect(this.gain1);  
                this.triangle2.connect(this.gain2);
                this.triangle3.connect(this.gain3); 
                
                this.envelope.connect(this.finalGain);

               // console.log(this.gain1);
                //this.envelope.connect(this.gain3);
                this.gain1.connect(this.finalGain);
                this.gain2.connect(this.finalGain);
                this.gain3.connect(this.finalGain);
                this.finalGain.connect(this.filter);
                this.filter.connect(this.outputs[0]);
            }
        },    
        
        harpsichord: { 
            playFunction: function(audiolet, frequency, duration, volume) {
                AudioletGroup.apply(this, [audiolet, 0, 1]);
                
                var release = 0.5 * duration;
                // Basic wave
                this.sine = new Saw(audiolet, frequency);
                
                this.filter = new DampedCombFilter(audiolet, 0.06, 0.02, 0.04, 0.2);
                
                //this.filter = new Reverb(audiolet, 1.5, 0.5, 0.8);
                
                // Gain envelope
                this.gain = new Gain(audiolet, 0.07);
                this.env = new PercussiveEnvelope(audiolet, 0.01, 0.05, release,
                  function() {
                    this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
                  }.bind(this)
                );
                
                this.envMulAdd = new MulAdd(audiolet, 0.1 * volume, 0);

                // Main signal path
                //this.sine.connect(this.gain);
                this.sine.connect(this.filter);
                this.filter.connect(this.gain);    
                this.gain.connect(this.outputs[0]);

                // Envelope
                this.env.connect(this.envMulAdd);
                this.envMulAdd.connect(this.filter);
            }
                        
        },
    
        percussion: {
            playFunction: function(audiolet, frequency, duration, volume) {
                AudioletGroup.apply(this, [audiolet, 0, 1]);
                // Basic wave
                this.white = new WhiteNoise(audiolet);        
                this.filter = new BandPassFilter(audiolet, frequency);
                
                this.sine = new Sine(audiolet, frequency);
                this.clip = new SoftClip(audiolet);
                
                this.gain = new Gain(audiolet);
                
                this.env = new PercussiveEnvelope(audiolet, 0.01, 0.01, 0.1,
                  function() {
                    this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
                  }.bind(this)
                );
                this.envMulAdd = new MulAdd(audiolet, 0.5 * volume, 0);
                
                this.sine_filteredwhite_MulAdd = new MulAdd(audiolet, 0.5, 0);
                   
                //Main signal path
                this.white.connect(this.filter);
                this.sine.connect(this.sine_filteredwhite_MulAdd);
                this.sine_filteredwhite_MulAdd.connect(this.filter);
                   
                // Envelope    
                this.filter.connect(this.gain);
                
                this.env.connect(this.envMulAdd);
                this.envMulAdd.connect(this.gain, 0, 1);
                this.gain.connect(this.outputs[0]);
            }            
        },


};

for (var key in instrumentList) {
    extend(instrumentList[key].playFunction, AudioletGroup);
}


