#include <WebServer.h>
#include <WiFi.h>
#include <LittleFS.h> 
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Mahi";
const char* pass = "1357mahi";

WebServer server(80);

void setup() {
  Serial.begin(115200);
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

  Serial.println("\n--- Starting Wi-Fi ---");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);

  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if(MDNS.begin("writer")){ // http://writer.local
    Serial.println("MDNS initialized");
  }

  // register card html
  server.serveStatic("/register-card", LittleFS, "/register-card.html");
  // register card api
  server.on("/api/register-card", HTTP_POST, handleCardRegistration );

  server.serveStatic("/", LittleFS, "/");


  server.begin();
  Serial.println("HTTP server started! Type the IP address into your browser.");
}

void loop() {
  server.handleClient();
  if(WiFi.status() == WL_CONNECTED){
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  }

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

    // Send the exact JSON string we got from the browser to the cloud
    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode == 201) {
      // Success! Tell the browser to redirect.
      server.send(200, "application/json", "{\"status\":\"success\"}");
    } else {
      // Capture the error from Express and pass it to the browser
      String responseStr = http.getString();
      server.send(httpResponseCode, "application/json", responseStr);
    }
    
    http.end();
  } else {
    server.send(503, "application/json", "{\"error\":\"ESP32 lost Wi-Fi connection\"}");
  }
}
