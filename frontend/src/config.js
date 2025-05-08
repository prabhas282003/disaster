const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000',
    LOCAL_BASE_URL: 'http://localhost:8000',
    LOCAL_SOCKET_URL: 'http://localhost:8000'
};

const isLocal = window.location.hostname === 'localhost';

export const API_BASE_URL = isLocal ? API_CONFIG.LOCAL_BASE_URL : API_CONFIG.BASE_URL;
export const SOCKET_URL = isLocal ? API_CONFIG.LOCAL_SOCKET_URL : API_CONFIG.SOCKET_URL;