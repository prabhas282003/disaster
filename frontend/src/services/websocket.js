import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

// Singleton pattern to ensure only one socket instance
let socketInstance = null;
let connectionPromise = null;

class WebSocketService {
    constructor() {
        if (socketInstance) {
            return socketInstance;
        }

        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second delay
        socketInstance = this;
    }

    connect() {
        if (this.socket && this.isConnected) {
            return Promise.resolve();
        }

        if (connectionPromise) {
            return connectionPromise;
        }

        connectionPromise = new Promise((resolve, reject) => {
            try {
                this.socket = io(SOCKET_URL, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: this.maxReconnectAttempts,
                    reconnectionDelay: this.reconnectDelay,
                    timeout: 10000
                });

                this.socket.on('connect', () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('WebSocket connection error:', error);
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        reject(error);
                    }
                });

                this.socket.on('error', (error) => {
                    console.error('WebSocket error:', error);
                });

                // Handle new post events from Flask-SocketIO
                this.socket.on('new_post', (data) => {
                    this.notifyListeners('new_post', data);
                });

                this.socket.on('new_posts', (data) => {
                    this.notifyListeners('new_posts', data);
                });

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                reject(error);
            }
        });

        return connectionPromise;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            connectionPromise = null;
        }
    }

    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    isConnected() {
        return this.isConnected && this.socket !== null;
    }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;