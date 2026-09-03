#include <WebServer.h>
#include <WiFi.h>
#include <LittleFS.h> 

const char* ssid = "Mahi";
const char* pass = "1357mahi";

WebServer server(80);

void setup() {
  Serial.begin(115200);
  delay(1000); 
  Serial.println("\n--- Initializing LittleFS ---");
  

  if (!LittleFS.begin(true)) {
    Serial.println("Error mounting LittleFS! Did you upload the data folder?");
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


  server.serveStatic("/", LittleFS, "/");
  
  // Default fallback to index.html if they visit the root IP address
  server.serveStatic("/", LittleFS, "/index.html");

  server.begin();
  Serial.println("HTTP server started! Type the IP address into your browser.");
}
// 
// IP Address: 192.168.0.105

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