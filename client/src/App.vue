<template>
    <div id="app">
        <div class='header'>
            <img alt="Vue logo" src="./assets/logo.png">
            <div class='title'>
                <h1>SASE Web</h1>
                <h4>By Chris Woodle</h4>
            </div>
        </div>

        <h3>Raw Source</h3>
        <div class='small'>
            <wav-chart v-if='blob' :data="blob" v-on:seek="select"></wav-chart>
        </div>
        <h3>Pre-emphasis</h3>
        <div class='small'>
            <wav-chart v-if='filteredBlob' :data="filteredBlob"></wav-chart>
        </div>
        <hr>
        <h3>Frame</h3>
        <div class='window-plots'>
            <frame-plot v-if='speechFrameChart' :chart-data="speechFrameChart"></frame-plot>
            <frame-plot v-if='windowedFrameChart' :chart-data="windowedFrameChart"></frame-plot>
        </div>
        <br>
        <div class='window-plots'>
            <frame-plot v-if='fftOfWindowedFrameChart' :chart-data="fftOfWindowedFrameChart"></frame-plot>
            <frame-plot v-if='mfccFrameChart' :chart-data="mfccFrameChart"></frame-plot>
        </div>

    </div>
</template>

<style lang="scss">
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 100px;
    width: 800px;
    margin-left: auto;
    margin-right: auto;
}
.header {
    margin-bottom: 40px;
    img {
        height: 100px;
        display: inline-block;
    }
    div {
        padding-left: 20px;
        display: inline-block;
        vertical-align: top;
        h1 {
            font-size: 50px;
            margin-top: 5px;
            margin-bottom: 0;
        }
        h4 {
            margin-top: 0;
            color: #2f4960;
        }
    }
}
h3 {
    margin-bottom: 10px;
}
.window-plots {
    width: 800px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
}
</style>


<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import WavChart from './components/WavChart.vue';
import FramePlot from './components/FramePlot.vue';

import { getWavFile, blobToArrayBuffer } from "./utils";

// @ts-ignore
import * as windowing from 'fft-windowing';
// @ts-ignore
import * as wav from 'node-wav';
// @ts-ignore
import { IIRFilter2, DSP } from './dsp.js';
// @ts-ignore
import { fft, util } from 'fft-js';
// @ts-ignore
import * as MFCC from 'mfcc/src/mfcc';

const FRAMES_PER_SEC = 100;
const WINDOW_LENGTH = 256; // Number of samples per frame
const NUMBER_OF_MEL_FILTERS = 25;

@Component({
    components: {
        WavChart,
        FramePlot
    }
})
export default class App extends Vue {
    sampleRate: number | null = null;
    speechFrames: Float32Array[] = [];

    data: any = null;
    blob: Blob | null = null;
    filteredBlob: Blob | null = null;

    selectedFrame = 0;

    get speechFrame() {
        if (!this.speechFrames[this.selectedFrame]) return;
        return this.speechFrames[this.selectedFrame];
    }

    get windowedFrame() {
        if (!this.speechFrame) return;
        const windowed_speech = windowing.hamming(Object.assign([], this.speechFrame));
        return windowed_speech;
    }

    get fftOfWindowedFrame() {
        const frame = this.windowedFrame;
        if (!frame) return;
        const phasors = fft(frame);
        const frequencies: number[] = util.fftFreq(phasors, this.sampleRate);
        const magnitudes: number[] = util.fftMag(phasors);
        const data = frequencies.map((f, ix) => {
            return { x: f, y: magnitudes[ix] };
        });
        console.log('frequencies', frequencies);
        return data;
    }

    get mfccFrame() {
        if (!this.fftOfWindowedFrame) return;

        const mfcc = MFCC.construct(
            128,                       // Number of expected FFT magnitudes
            NUMBER_OF_MEL_FILTERS,    // Number of Mel filter banks
            300,                      // Low frequency cutoff
            10000,                     // High frequency cutoff
            this.sampleRate);              // Sample Rate (hz)

        const coef = mfcc(this.fftOfWindowedFrame.map(point => point.y));
        return coef;
    }


    get speechFrameChart() {
        if (!this.speechFrame) return;
        return {
            labels: Object.keys(this.speechFrame),
            datasets: [
                {
                    label: 'Speech Frame',
                    borderColor: '#40b883',
                    pointRadius: 0,
                    borderWidth: 1,
                    lineTension: 0.75,
                    fill: false,
                    data: this.speechFrame
                }
            ]
        }
    }


    get windowedFrameChart() {
        if (!this.windowedFrame) return;
        return {
            labels: Object.keys(this.windowedFrame),
            datasets: [
                {
                    label: 'Windowed Frame',
                    borderColor: '#40b883',
                    borderWidth: 1,
                    pointRadius: 0,
                    lineTension: 0.75,
                    fill: false,
                    data: this.windowedFrame
                }
            ]
        }
    }

    get fftOfWindowedFrameChart() {
        const data = this.fftOfWindowedFrame;
        const sampleRate = this.sampleRate
        if (!data || !sampleRate) return;
        return {
            labels: Object.keys(data).map(index => {
                return Math.round((parseInt(index)/ Object.keys(data).length) * (sampleRate / 2)  )
                
            }),
            datasets: [
                {
                    label: 'FFT of Windowed Speech Signal',
                    borderColor: '#40b883',
                    pointRadius: 0,
                    borderWidth: 1,
                    lineTension: 0.75,
                    fill: false,
                    data: data
                }
            ]
        }
    }

    get mfccFrameChart() {
        if (!this.mfccFrame) return;
        return {
            labels: Object.keys(this.mfccFrame),
            datasets: [
                {
                    label: 'MFCC',
                    borderColor: '#40b883',
                    borderWidth: 1,
                    pointRadius: 0,
                    lineTension: 0,
                    fill: false,
                    data: this.mfccFrame
                }
            ]
        }
    }


    select(position: number) {
        // Position of slider between 0-1
        const frameNumber = Math.round(this.speechFrames.length * position);
        console.log(frameNumber);
        this.selectedFrame = frameNumber;
    }

    mounted() {
        const filename = 'output.wav';
        getWavFile(filename)
            .then(blob => {
                console.log('Recieved wav blob:', blob);
                this.blob = blob;
                return blobToArrayBuffer(blob);
            })
            .then(buffer => {
                const result = wav.decode(buffer);

                const sampleRate = result.sampleRate;
                this.sampleRate = sampleRate;

                const data: Float32Array = result.channelData[0];
                this.data = data;

                // Filter/preemph
                const filter = new IIRFilter2(DSP.HIGHPASS, 1000, 0.5, sampleRate);
                filter.process(data); // Modifys buffer in place

                // Encode filtered data
                const encoded = wav.encode([data], { sampleRate, bitDepth: 16 });
                this.filteredBlob = new Blob([encoded.buffer], { type: 'audio/x-wav' });

                const speechLength = data.length;

                const frameSize = Math.round(sampleRate / FRAMES_PER_SEC);
                console.log('frameSize:', frameSize);

                const numberOfFrames = Math.round((speechLength - WINDOW_LENGTH) / frameSize);
                console.log('numberOfFrames:', numberOfFrames);

                for (let i = 0; i < numberOfFrames; i++) {
                    // beginning of current frame
                    const sample_number = i * frameSize + 1;
                    console.log('Frame: ', sample_number)

                    // grab a frame of speech from original signal
                    const speech_frame = data.slice(sample_number, sample_number + WINDOW_LENGTH);
                    this.speechFrames.push(speech_frame);
                    console.log('speech_frame: ', speech_frame)

                    // apply windowing function to current frame
                    // const windowed_speech = windowing.hamming(Object.assign([], speech_frame));
                    // this.windowedFrames.push(windowed_speech);
                    // console.log('windowed_speech: ', windowed_speech)

                    // // apply FFT to windowed speech
                    // const phasors = fft(windowed_speech);
                    // console.log(phasors);

                    // const mags = util.fftMag(phasors);

                    // const mfcc = MFCC.construct(
                    //     128,                       // Number of expected FFT magnitudes
                    //     NUMBER_OF_MEL_FILTERS,    // Number of Mel filter banks
                    //     300,                      // Low frequency cutoff
                    //     3500,                     // High frequency cutoff
                    //     sampleRate);              // Sample Rate (hz)

                    // const coef = mfcc(mags);
                    // console.log(coef);
                    // this.mfccFrames.push(coef)

                }
                console.log('Complete');
            });
    }
    getRandomInt() {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    }
}
</script>