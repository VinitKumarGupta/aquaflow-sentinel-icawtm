import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage the WebSocket connection state and data.
 * @param {string} url - The WebSocket URL to connect to.
 * @returns {object} { status, lastMessage }
 * - status: 'connecting', 'open', 'closed', 'error'
 * - lastMessage: The parsed JSON object or raw string representing the last received packet.
 */
export const useWebSocket = (url) => {
  const [status, setStatus] = useState('connecting');
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const maxReconnectAttempts = 10;
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!url) return;

      if (ws.current) {
        ws.current.close();
      }

      setStatus('connecting');
      console.log(`Connecting to WebSocket: ${url}`);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        if (!isMounted) return;
        console.log('WebSocket connection established.');
        setStatus('open');
        reconnectAttempts.current = 0; // Reset reconnection counter
      };

      ws.current.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsedData = JSON.parse(event.data);
          setLastMessage(parsedData);
        } catch (err) {
          console.warn('Failed to parse WebSocket message as JSON:', err);
          setLastMessage(event.data);
        }
      };

      ws.current.onclose = (event) => {
        if (!isMounted) return;
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setStatus('closed');

        // Trigger auto-reconnect if it wasn't a clean local close
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000); // Exponential backoff capped at 10s
          console.log(`Scheduling reconnect attempt #${reconnectAttempts.current + 1} in ${delay}ms...`);
          
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, delay);
        } else {
          console.error('Max WebSocket reconnect attempts reached. Please check the backend server.');
        }
      };

      ws.current.onerror = (error) => {
        if (!isMounted) return;
        console.error('WebSocket encountered an error:', error);
        setStatus('error');
      };
    };

    connect();

    // Clean up on component unmount
    return () => {
      isMounted = false;
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url]);

  return { status, lastMessage };
};
