# SASE Web
A Web implementation of SASE Lab, originally written by [Dr. Veton Kepuska](https://www.fit.edu/faculty-profiles/8/veton-kepuska/) in Matlab.

![screenshot](https://raw.githubusercontent.com/chriswoodle/sase-web/master/screenshot.png)

# Setup and Run

1. Download and install [NodeJS](https://nodejs.org/en/)
2. Download and install [Yarn](https://yarnpkg.com/en/docs/install)
3. Download or clone this repo
4. From the project root directory, run `yarn` and `yarn build`
5. Then from two different terminals, 
    * Start the NodeJS Express server: `yarn dev:serve` 
    * Start the Vue web development server: `yarn dev:client`
6. Open a web browser: `http://localhost:8080`

# Notes
Currently the app can load `.wav` files from the NodeJS Express server, in the future you may be able to directly upload audio files or record directly from the browser using your computers mic.

The default audio file is located at `/server/public/output.wav`.

## TIMIT Corpus `.wav` files
If you wish to use TIMIT Corpus `.wav` files (SPHERE-formatted digital audio data) they must be first converted into Microsoft RIFF ("WAV") format. I used [sph2pipe](https://github.com/robd003/sph2pipe) on macos.

Install `sph2pipe` (for unix systems):
```shell
tar xzf sph2pipe_v2.4.tgz
cd sph2pipe_v2.4
gcc -o sph2pipe *.c -lm         ## On unix
sudo cp sph2pipe /usr/local/    ## Install into directory in path
```

Convert TIMIT `.wav`
```shell
sph2pipe -f wav SA1.wav output.wav
```

