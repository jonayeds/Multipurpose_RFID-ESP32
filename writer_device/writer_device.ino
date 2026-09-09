#include <WebServer.h>
#include <WiFi.h>
#include <LittleFS.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <SPI.h>
#include <MFRC522.h>


// rfid pins
#define RST_PIN 32
#define SDA_PIN 33
#define CUSTOM_MOSI 25
#define CUSTOM_MISO 26
#define CUSTOM_SCK 27

// Reset button Pin
#define BUTTON_PIN 14

// LED pins
#define LED_RED 17
#define LED_GREEN 5
#define LED_BLUE 22

WebServer server(80);
MFRC522 rfid(SDA_PIN, RST_PIN);

String cardUID = "";
long cardUID_hold_time = 10000;
long reset_timer = 3000;

WiFiManager wifiManager;

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
    while (file) {
      Serial.print(" - /");
      Serial.println(file.name());
      file = root.openNextFile();
    }
  }

  Serial.println("\n--- Starting Wi-FiManager ---");


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

  if (MDNS.begin("writer")) {  // http://writer.local
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


  // RFID
  SPI.begin(CUSTOM_SCK, CUSTOM_MISO, CUSTOM_MOSI, SDA_PIN);
  rfid.PCD_Init();
  Serial.println("Writer Device RC522 initialized on custom 3.3V-side pins.");
  rfid.PCD_DumpVersionToSerial();

  // reset button
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // led
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  setRGB(false, false, false);
}

void loop() {
  server.handleClient();
  delay(100);

  int buttonPressed = digitalRead(BUTTON_PIN) == LOW;
  if (buttonPressed) {
    if (reset_timer <= 0) {
      setRGB(true, true, true);
      reset_timer = 3000;
      Serial.println("Wifi Reseting!");
      wifiManager.resetSettings();
      delay(1000);
      ESP.restart();
    } else {
      reset_timer -= 100;
    }
  } else {
    reset_timer = 3000;
  }



  if (rfid.PICC_IsNewCardPresent() && (cardUID == "")) {
    if (rfid.PICC_ReadCardSerial()) {
      Serial.print("Card UID Detected: ");

      for (byte i = 0; i < rfid.uid.size; i++) {
        cardUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
        cardUID += String(rfid.uid.uidByte[i], HEX);
      }
      Serial.println(cardUID);
      cardUID.toLowerCase();

      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
    } else {
      Serial.println("Card detected but could not pull UID");
    }
  }

  if (cardUID_hold_time <= 0) {
    cardUID = "";
    cardUID_hold_time = 10000;
  } else {
    cardUID_hold_time -= 100;
  }
}

void handleCardRegistration() {
  if (server.hasArg("plain") == false) {
    setRGB(true, false, false);
    server.send(400, "application/json", "{\"error\":\"No body received\"}");
    delay(1500);
    setRGB(false, false, false);
    return;
  }

  String jsonString = server.arg("plain");

  setRGB(true, true, false);


  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON format received\"}");
    return;
  }


  if (cardUID == "") {
    setRGB(true, false, false);
    server.send(400, "application/json", "{\"error\":\"Card not detected\"}");
    delay(1500);
    setRGB(false, false, false);
    return;
  } else {
    doc["cardUID"] = cardUID;
  }


  String modifiedJsonString;
  serializeJson(doc, modifiedJsonString);

  Serial.println("UID extracted from the Card and injected into the request body. API request Sending to register card");
  Serial.print("Data: ");
  Serial.println(modifiedJsonString);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin("https://unicard-api.sajjadjonayed.com/api/v1/register-card");
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(modifiedJsonString);

    if (httpResponseCode == 201) {
      setRGB(false, true, false);
      Serial.println("Registration Successful");
      server.send(200, "application/json", "{\"status\":\"success\"}");
      delay(1500);
      setRGB(false, false, false);
    } else {
      setRGB(true, false, false);
      String responseStr = http.getString();
      Serial.println("Registration failed");
      server.send(httpResponseCode, "application/json", responseStr);
      Serial.print("Response: ");
      Serial.println(responseStr);
      delay(1500);
      setRGB(false, false, false);
    }

    http.end();
  } else {
    server.send(503, "application/json", "{\"error\":\"ESP32 lost Wi-Fi connection\"}");
  }
}


void setRGB(bool redOn, bool greenOn, bool blueOn) {
  digitalWrite(LED_RED, redOn ? LOW : HIGH);
  digitalWrite(LED_GREEN, greenOn ? LOW : HIGH);
  digitalWrite(LED_BLUE, blueOn ? LOW : HIGH);
}