// WebSocket Real-time Client for Live Sensors and Case DMs

import { getApiBase } from './api';

class WebSocketService {
  constructor() {
    this.sensorSockets = {};
    this.chatSockets = {};
    this.sensorListeners = {};
    this.chatListeners = {};
  }

  getWsUrl(path) {
    const httpBase = getApiBase();
    const wsBase = httpBase.replace(/^http/, 'ws');
    return `${wsBase}${path.startsWith('/') ? path : '/' + path}`;
  }

  connectSensors(fieldId, onData) {
    if (!this.sensorListeners[fieldId]) {
      this.sensorListeners[fieldId] = [];
    }
    this.sensorListeners[fieldId].push(onData);

    if (this.sensorSockets[fieldId] && this.sensorSockets[fieldId].readyState === WebSocket.OPEN) {
      return () => this.disconnectSensors(fieldId, onData);
    }

    try {
      const ws = new WebSocket(this.getWsUrl(`/ws/sensors/${fieldId}`));

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (this.sensorListeners[fieldId]) {
            this.sensorListeners[fieldId].forEach((cb) => cb(parsed));
          }
        } catch (e) {}
      };

      ws.onerror = (e) => {
        console.warn(`WS sensor error for field ${fieldId}:`, e.message);
      };

      ws.onclose = () => {
        delete this.sensorSockets[fieldId];
      };

      this.sensorSockets[fieldId] = ws;
    } catch (err) {
      console.warn('WS creation error:', err);
    }

    return () => this.disconnectSensors(fieldId, onData);
  }

  disconnectSensors(fieldId, callback) {
    if (this.sensorListeners[fieldId]) {
      this.sensorListeners[fieldId] = this.sensorListeners[fieldId].filter((cb) => cb !== callback);
      if (this.sensorListeners[fieldId].length === 0) {
        if (this.sensorSockets[fieldId]) {
          this.sensorSockets[fieldId].close();
          delete this.sensorSockets[fieldId];
        }
      }
    }
  }

  connectChat(caseId, onMessage) {
    if (!this.chatListeners[caseId]) {
      this.chatListeners[caseId] = [];
    }
    this.chatListeners[caseId].push(onMessage);

    if (this.chatSockets[caseId] && this.chatSockets[caseId].readyState === WebSocket.OPEN) {
      return () => this.disconnectChat(caseId, onMessage);
    }

    try {
      const ws = new WebSocket(this.getWsUrl(`/ws/chat/${caseId}`));

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (this.chatListeners[caseId]) {
            this.chatListeners[caseId].forEach((cb) => cb(parsed));
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        delete this.chatSockets[caseId];
      };

      this.chatSockets[caseId] = ws;
    } catch (err) {
      console.warn('WS chat creation error:', err);
    }

    return () => this.disconnectChat(caseId, onMessage);
  }

  sendChatMessage(caseId, messagePayload) {
    const ws = this.chatSockets[caseId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messagePayload));
      return true;
    }
    return false;
  }

  disconnectChat(caseId, callback) {
    if (this.chatListeners[caseId]) {
      this.chatListeners[caseId] = this.chatListeners[caseId].filter((cb) => cb !== callback);
      if (this.chatListeners[caseId].length === 0) {
        if (this.chatSockets[caseId]) {
          this.chatSockets[caseId].close();
          delete this.chatSockets[caseId];
        }
      }
    }
  }
}

export const wsService = new WebSocketService();
