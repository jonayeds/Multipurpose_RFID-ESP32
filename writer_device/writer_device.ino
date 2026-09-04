#include <WebServer.h>
#include <WiFi.h>
#include <LittleFS.h> 
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h> // 1. Included the new library


// const char* ssid = "Sajjad";
// const char* pass = "12345678";

WebServer server(80);

void setup() {
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

    if (!wifiManager.autoConnect("RFID-Writer-Setup")) {
    Serial.println("Failed to connect to Wi-Fi. Restarting...");
    delay(3000);
    ESP.restart();
  }


  // wifiManager.resetSettings(); 
  // wifiManager.setConfigPortalTimeout(180);

  // WiFi.mode(WIFI_STA);
  // WiFi.begin(ssid, pass);

  // while(WiFi.status() != WL_CONNECTED){
  //   delay(500);
  //   Serial.print(".");
  // }


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
  server.on("/api/register-card", HTTP_POST, handleCardRegistration );

  server.begin();
  Serial.println("HTTP server started! Type the IP address into your browser.");
}

void loop() {
  server.handleClient();
  // if(WiFi.status() == WL_CONNECTED){
  // Serial.print("IP Address: ");
  // Serial.println(WiFi.localIP());
  // }
  delay(100);
  if (!LittleFS.begin(true)) {
    Serial.println("Error mounting LittleFS! Did you upload the data folder?");
  }

  delay(100);
}




void handleCardRegistration() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body received\"}");
    return;
  }
  
  String jsonString = server.arg("plain");
  
  // check and write on the card
  // -------------------------------

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin("https://multipurposerfidserver.vercel.app/api/v1/register-card"); 
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode == 201) {
      server.send(200, "application/json", "{\"status\":\"success\"}");
    } else {
      String responseStr = http.getString();
      server.send(httpResponseCode, "application/json", responseStr);
    }
    
    http.end();
  } else {
    server.send(503, "application/json", "{\"error\":\"ESP32 lost Wi-Fi connection\"}");
  }
}
