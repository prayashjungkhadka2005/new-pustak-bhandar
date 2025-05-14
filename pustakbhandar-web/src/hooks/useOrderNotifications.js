import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export function useOrderNotifications(onNotification) {
  const connectionRef = useRef(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      if (isConnectingRef.current || connectionRef.current?.state === 'Connected') {
        return;
      }

      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        console.warn('No user session found for SignalR connection');
        return;
      }

      try {
        const { token } = JSON.parse(userSession);
        if (!token) {
          console.warn('No authentication token found in user session');
          return;
        }

        isConnectingRef.current = true;

        const connection = new HubConnectionBuilder()
          .withUrl(
            `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/notificationHub`,
            {
              accessTokenFactory: () => token,
              skipNegotiation: true,
              transport: 1 // WebSockets only
            }
          )
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry with increasing delays
          .build();

        connection.on('ReceiveNotification', (notification) => {
          if (isMounted) {
            onNotification(notification);
          }
        });

        connection.onclose((error) => {
          if (isMounted) {
            console.warn('SignalR connection closed:', error);
          }
        });

        try {
          await connection.start();
          if (isMounted) {
            console.log('SignalR connection established');
            connectionRef.current = connection;
          } else {
            await connection.stop();
          }
        } catch (error) {
          if (isMounted) {
            console.error('SignalR connection error:', error);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error parsing user session:', error);
        }
      } finally {
        isConnectingRef.current = false;
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop()
          .then(() => {
            if (isMounted) {
              console.log('SignalR connection stopped');
            }
          })
          .catch((error) => {
            if (isMounted) {
              console.error('Error stopping SignalR connection:', error);
            }
          });
        connectionRef.current = null;
      }
    };
  }, [onNotification]);
} 