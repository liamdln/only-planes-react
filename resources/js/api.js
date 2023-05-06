import axios from "axios";

export function get(url) {
    return new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
}

export function post(url, body) {
    return new Promise((resolve, reject) => {
        axios.post(url, body).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
}

export function put(url, body) {
    return new Promise((resolve, reject) => {
        axios.put(url, body).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
}

export function httpDelete(url) {
    return new Promise((resolve, reject) => {
        axios.delete(url).then((res) => {
            resolve(res.data || res);
        }).catch((err) => {
            reject(err)
        })
    })
}
