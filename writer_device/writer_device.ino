#include <WebServer.h>
#include <WiFi.h>
#include <LittleFS.h> 
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h> 

WebServer server(80);

void setup() {
  // 1. Fixed your baud rate to match your serial monitor
  Serial.begin(9600);
  delay(1000); 
  Serial.println("\n--- Initializing LittleFS ---");
  
  if (!LittleFS.begin(true)) {
    Serial.println("Error mounting LittleFS!");
    return;
  }

  File root = LittleFS.open("/");
  File file = root.openNextFile();
  
  if (!file) {
    Serial.println("No files found in LittleFS!");
  } else {
    Serial.println("Files found on ESP32:");
    while(file){
      Serial.print(" - /");
      Serial.println(file.name());
      file = root.openNextFile();
    }
  }

  Serial.println("\n--- Starting Wi-FiManager ---");
  WiFiManager wifiManager;
  
  // Set a 3-minute timeout on the portal so it doesn't get stuck forever
  wifiManager.setConfigPortalTimeout(180);

  // If you ever need to force-wipe the memory, UNCOMMENT the line below. 
  // Otherwise, leave it commented out so it remembers your Wi-Fi!
  // wifiManager.resetSettings(); 

  // This single block handles ALL connection logic
  if (!wifiManager.autoConnect("RFID-Writer-Setup")) {
    Serial.println("Failed to connect to Wi-Fi or hit timeout. Restarting...");
    delay(3000);
    ESP.restart();
  }

  // If the code reaches here, you are successfully connected!
  Serial.println("\nConnected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if(MDNS.begin("writer")){ // http://writer.local
    Serial.println("MDNS initialized");
  }

  server.serveStatic("/register-card", LittleFS, "/register-card.html");
  server.on("/", []() {
    server.sendHeader("Location", "/register-card", true);
    server.send(302, "text/plain", "");
  });
  server.serveStatic("/", LittleFS, "/");
  server.on("/api/register-card", HTTP_POST, handleCardRegistration);

  server.begin();
  Serial.println("HTTP server started! Type the IP address into your browser.");
}

void loop() {
  // 2. Fixed the crash bug: Kept the loop perfectly clean!
  server.handleClient();
  delay(2);
}

void handleCardRegistration() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body received\"}");
    return;
  }
  
  String jsonString = server.arg("plain");
  
  // check and write on the card
  // -------------------------------
  Serial.println("API request Sent to register card");
  Serial.print("Data: ");
  Serial.println(jsonString);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin("https://unicard-api.sajjadjonayed.com/api/v1/register-card"); 
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode == 201) {
      Serial.println("Registration Successful");
      server.send(200, "application/json", "{\"status\":\"success\"}");
    } else {
      String responseStr = http.getString();
      Serial.println("Registration failed");
      server.send(httpResponseCode, "application/json", responseStr);
      Serial.print("Response: ");
      Serial.println(responseStr);
    }
    
    http.end();
  } else {
    server.send(503, "application/json", "{\"error\":\"ESP32 lost Wi-Fi connection\"}");
  }
}