<script>
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
    extends: Line,
    mixins: [reactiveProp],
    props: ["options"],
    mounted() {
        this.renderChart(this.chartData, {
            spanGaps: true
        });
    }
};
</script>

<style <style lang="scss" scoped>
canvas {
    border: solid 1px #40b883;
    background-color: rgba(0, 0, 0, 0.1);
}
</style>