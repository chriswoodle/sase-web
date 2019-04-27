export function blobToArrayBuffer(blob: Blob) {
    // https://stackoverflow.com/a/51758200
    return fetch(URL.createObjectURL(blob)).then(res => {
        return res.arrayBuffer();
    })
}

import axios, { AxiosResponse } from 'axios';
export function getWavFile(fileName: string) {
    return axios({
        url: `${process.env.VUE_APP_SERVICE_HOST || 'http://localhost:3000'}/${fileName}`,
        method: 'GET',
        responseType: 'blob',
    }).then((response: AxiosResponse<Blob>) => {
        return response.data;
    });
}