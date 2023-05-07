import axios from "axios";
import $ from "jquery";

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

// export function ajaxGet(url) {
//     return new Promise((resolve, reject) => {
//         $.ajax(url, {
//             type: "GET",
//             success: function (data) {
//                 resolve(data);
//             },
//             error: function (_, __, error) {
//                 reject(error);
//             }
//         })
//     });
// }

// export function ajaxPost(url, body) {
//     return new Promise((resolve, reject) => {
//         $.ajax(url, {
//             type: "POST",
//             dataType: 'json',
//             data: body,
//             success: function (data) {
//                 resolve(data);
//             },
//             error: function (_, __, error) {
//                 reject(error);
//             }
//         })
//     })
// }

// export function ajaxDelete(url) {
//     return new Promise((resolve, reject) => {
//         $.ajax(url, {
//             type: "DELETE",
//             success: function (data) {
//                 resolve(data);
//             },
//             error: function (_, __, error) {
//                 reject(error);
//             }
//         })
//     })
// }
