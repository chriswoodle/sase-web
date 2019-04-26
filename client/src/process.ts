

import axios, { AxiosResponse } from 'axios';

// export function load() {
//     axios({
//         url: `${process.env.VUE_APP_SERVICE_HOST}/output.wav`,
//         method: 'GET',
//         responseType: 'blob',
//     }).then((response: AxiosResponse<Blob>) => {
//         console.log(response.data);
//         return blobToArrayBuffer(response.data);
//     }).then(buffer => {
//         const { sampleRate, channelData } = wav.decode(buffer);
//         const data = channelData[0];
//         console.log(sampleRate);
//         console.log(data)
//     })
// }

