import axios from 'axios';

const http = {
    get: (url, params) => {
        const headers = { };
        return new Promise((resolve) => {
            axios.get(
                url,
                params,
                headers
            ).then(res => {
                resolve(res.data)
            })
        })
    },
    post: (url, params) => {
        const headers = { };
        return new Promise((resolve) => {
            axios.post(
                url,
                params,
                headers
            ).then(res => {
                resolve(res.data)
            })
        })
    }
}

export default http;
