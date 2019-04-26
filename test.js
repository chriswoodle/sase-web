const Fili = require('./client/node_modules/fili');


const iirCalculator = new Fili.CalcCascades();

const iirFilterCoeffs = iirCalculator.lowpass({
    order: 3, // cascade 3 biquad filters (max: 5)
    characteristic: 'tschebyscheff3',
    transform: 'matchedZ',
    Fs: 1000, // sampling frequency
    Fc: 100, // cutoff frequency / center frequency for bandpass, bandstop, peak
    preGain: false // uses k when true for gain correction b[0] otherwise
  });


const firFilter = new Fili.FirFilter(iirFilterCoeffs);
console.log(firFilter);

const filtered = firFilter.multiStep([1,2,3,4,5,6,7,8,9,10]);
console.log(filtered);

for (var cnt = 0; cnt < 10; cnt++) {
    console.log(firFilter.singleStep(cnt));
  }