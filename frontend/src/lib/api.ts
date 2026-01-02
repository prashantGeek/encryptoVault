import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to request headers
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
}
);

// If expired token or unauthorized, log out user
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

//auth api
export const authApi = {
    register: (data:{name:string, email:string, password:string}) => api.post('/auth/register', data),
    login: (data:{email:string, password:string}) => api.post('/auth/login', data),
}

//user api
export const userApi ={
    getProfile: () => api.get('/users/profile'),
    checkAuth: () => api.get('/users/check'),
}

//file api
export const fileApi = {
    getFiles: () => api.get('/files'),
    generateUploadUrl: (data:{fileName:string, mimeType:string, fileSize:number}) => api.post('/files/upload', data),
    getDownloadUrl: (fileId:number) => api.get(`/files/${fileId}/download-url`),
    deleteFile: (fileId:number) => api.delete(`/files/${fileId}`),
}

//upload to s3 directly
export const uploadToS3 = async (uploadUrl:string, file:File) => {
    await axios.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
        },
    });
}

export default api;