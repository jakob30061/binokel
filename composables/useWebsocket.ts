const websocket = ref<WebSocket | null>(null);

const connectWebSocket = () => {
  if (websocket.value) return; // Falls bereits verbunden, nichts tun

  if(!location) return;
  const isSecure = location.protocol === "https:";
  const url = `${isSecure ? "wss" : "ws"}://${location.host}/_ws`;

  websocket.value = new WebSocket(url);

  websocket.value.onopen = () => console.log("WebSocket connected");
  websocket.value.onclose = () => {
    console.log("WebSocket disconnected, attempting reconnect...");
    setTimeout(connectWebSocket, 2000); // Reconnect nach 2 Sekunden
  };
  websocket.value.onerror = (error) => console.error("WebSocket error:", error);
};

// Verbindung direkt beim Laden des Moduls starten
connectWebSocket();

// Funktion für den WebSocket-Zugriff exportieren
export const useWebSocket = () => websocket;
