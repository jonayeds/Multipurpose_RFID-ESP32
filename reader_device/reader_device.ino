// File upload
#include <LittleFS.h> 
// wifi
#include <WiFiManager.h> 
#include <WiFi.h>
// web server (incoming)
#include <WebServer.h>
#include <ESPmDNS.h>
// web server (outgoing)
#include <HTTPClient.h>
#include <ArduinoJson.h>
// display
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
// rfid
#include <SPI.h>
#include <MFRC522.h>


#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// rfid Pins
#define SS_PIN 5
#define RST_PIN 4


MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WebServer server(80);

void setup() {
  Serial.begin(9600);
  delay(1000); 
  Serial.println("\n-----READER Device-----");
  Serial.println("--- Initializing LittleFS ---");
  
  if (!LittleFS.begin(true)) {
    Serial.println("Error mounting LittleFS!");
    return;
  }

  File root = LittleFS.open("/");
  File file = root.openNextFile();
  
  if (!file) {
    Serial.println("No files found in LittleFS!");
  } else {
    Serial.println("Files found on the reader:");
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

  // wifiManager.resetSettings(); 

  if (!wifiManager.autoConnect("RFID-Reader-Setup")) {
    Serial.println("Failed to connect to Wi-Fi or hit timeout. Restarting...");
    delay(3000);
    ESP.restart();
  }

  // If the code reaches here, you are successfully connected!
  Serial.println("\nConnected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if(MDNS.begin("reader")){ // http://reader.local
    Serial.println("MDNS initialized");
  }

  server.serveStatic("/register-reader", LittleFS, "/register-reader.html");
  server.on("/", []() {
    server.sendHeader("Location", "/register-reader", true);
    server.send(302, "text/plain", "");
  });
  server.serveStatic("/", LittleFS, "/");
  server.on("/api/register-reader", HTTP_POST, handleReaderRegistration);

  server.begin();
  Serial.println("HTTP server started! Type the IP address into your browser.");



  // Display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed. Check wiring!"));
    while(1); 
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("UniCard Reader");
  display.display();


  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RC522 RFID module initialized.");

  rfid.PCD_DumpVersionToSerial();

}

void loop() {
  server.handleClient();
  delay(2);

  // Check if a new card is tapped on the reader
  if (rfid.PICC_IsNewCardPresent()) {
    
    // read the card's data
    if (rfid.PICC_ReadCardSerial()) {
      Serial.print("Card UID Detected: ");
      
      String cardUID = "";
      // Loop through the UID bytes and convert them to a readable string
      for (byte i = 0; i < rfid.uid.size; i++) {
        cardUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
        cardUID += String(rfid.uid.uidByte[i], HEX);
      }
      
      cardUID.toUpperCase();
      Serial.println(cardUID);

      // Halt the card so it doesn't read the same tap 100 times a second
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
    }
  }
}

void handleReaderRegistration() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body received\"}");
    return;
  }
  
  String jsonString = server.arg("plain");
  
  // check if the reader is already registered
  // -------------------------------
  

  Serial.println("API request Sent to register card");
  Serial.print("Data: ");
  Serial.println(jsonString);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin("https://unicard-api.sajjadjonayed.com/api/v1/register-reader"); 
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode == 201) {
      showSuccessAnimation();
      display.display();

      Serial.println("Reader Registration Successful");
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
    server.send(503, "application/jso n", "{\"error\":\"ESP32 lost Wi-Fi connection\"}");
  }
}




void showSuccessAnimation() {
  int centerX = 64;
  int centerY = 40; 

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("UniCard System");
  display.display();

  for(int r = 0; r <= 14; r += 2) {
    if (r > 0) {
      display.drawCircle(centerX, centerY, r - 2, SSD1306_BLACK); 
    }
    display.drawCircle(centerX, centerY, r, SSD1306_WHITE);
    display.display();
    delay(20); 
  }

  // short leg of the checkmark
  // Starts on the left, goes down and right
  for(int i = 0; i <= 6; i++) {
    display.drawLine(54, 40, 54 + i, 40 + i, SSD1306_WHITE);
    display.display();
    delay(25);
  }

  // long leg of the checkmark
  // Starts at the bottom, goes up and right
  for(int i = 0; i <= 12; i++) {
    display.drawLine(60, 46, 60 + i, 46 - i, SSD1306_WHITE);
    display.display();
    delay(25);
  }

  // Add the "SUCCESS" text just above the circle
  display.setTextSize(1);
  display.setCursor(43, 18);
  display.println("SUCCESS");
  display.display();
  
  // Hold the success screen for 2.5 seconds before it clears
  delay(2500); 
  display.clearDisplay();
  display.display();
}
