import http from '@/axios/index.js';

export function apiKeyList() {
    return http.get('/apiKey/list')
}

export function apiKeyAdd(form) {
    return http.post('/apiKey/generate', form)
}

export function apiKeyDelete(keyId) {
    return http.delete('/apiKey/delete?keyId=' + keyId)
}
