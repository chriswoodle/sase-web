<template>
    <div class='wavesurfer'>
        <div ref='waveform'></div>
        <button @click="play">
            Play/Pause
        </button>
    </div>
</template>

<style lang="scss" scoped>
.wavesurfer > div {
    border: solid 1px #40b883;
    background-color: rgba(0, 0, 0, 0.1);
}
button {
    margin-top: 5px;
    margin-bottom: 15px;
}
</style>


<script>
export default {
    props: ["data", "options"],
    created() {
        this.$nextTick(() => {
            this.wavesurfer = WaveSurfer.create({
                container: this.$refs["waveform"],
                waveColor: "#40B883",
                progressColor: "#205c41",
                cursorColor: "gray",
                height: 200,
                barHeight: 8,
            });
            this.wavesurfer.loadBlob(this.data);
            this.wavesurfer.on("seek", event => {
                // console.log(event);
                this.$emit('seek', event)
            });
        });
    },
    methods: {
        play() {
            this.wavesurfer.playPause();
        }
    }
};
</script>