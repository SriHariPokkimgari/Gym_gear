import axios from "axios";

const API = axios.create({
    baseURL: '/api',
    withCredentials: true
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void}[] = []

const processQueue = (error: unknown) =>{
    failedQueue.forEach((promise) =>{
        if(error) promise.reject(error)
            else promise.resolve()
    });
    failedQueue = []
};

API.interceptors.response.use(
    (response) =>  response ,
    async(error) => {
        const originalRequest = error.config
        if(error.response?.status === 401 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise((resolve, reject) =>{
                    failedQueue.push({resolve, reject})
                }).then(() => API(originalRequest))
            }

            originalRequest._retry = true
            isRefreshing = true

            try{
                await axios.post('/api/auth/refresh', {}, {withCredentials: true});
                processQueue(null);
                return API(originalRequest)
            }catch(refreshError){
                processQueue(refreshError);
                window.location.href = '/pages/login'
                return Promise.reject(refreshError)
            }finally{
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default API