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

#include <vector>

// display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// rfid Pins
#define SDA_PIN 5
#define RST_PIN 4

// buzzer pin
#define BUZZER_PIN 27


MFRC522 rfid(SDA_PIN, RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WebServer server(80);

// reader info
String readerId = "";
String readerMode = "";
String readerDoorcode = "";
int deductionAmount = 0;
std::vector<String> readerCardIds;

// card info
String username="";
String userDoorcode="";
long userBalance=0;

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
    while (file) {
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

  if (MDNS.begin("reader")) {  // http://reader.local
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
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed. Check wiring!"));
    while (1)
      ;
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

  // get mac address
  readerId = WiFi.macAddress();
  Serial.print("This Reader's Unique ID is: ");
  Serial.println(readerId);
  fetchReaderConfiguration();

  // buzzer setup
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

void loop() {
  server.handleClient();
  delay(2);

  // Check if a new card is tapped on the reader
  if (rfid.PICC_IsNewCardPresent()) {

    // read the card's data
    if (rfid.PICC_ReadCardSerial()) {
      Serial.print("Card UID Detected: ");

      if (readerMode != "") {

        String cardUID = "";
        // Loop through the UID bytes and convert them to a readable string
        for (byte i = 0; i < rfid.uid.size; i++) {
          cardUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
          cardUID += String(rfid.uid.uidByte[i], HEX);
        }

        // cardUID.toUpperCase();
        Serial.println(cardUID);


        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 20);
        display.setTextColor(SSD1306_WHITE);
        display.println("Varifying...");
        display.display();

        cardUID.toLowerCase();
        fetchCardData(cardUID);

        String firstName = username;
        int spaceIndex = username.indexOf(' ');
        if (spaceIndex != -1) {
          firstName = username.substring(0, spaceIndex);
        }

        if (username == "") {
          // Failed to fetch or parse the name
          display.clearDisplay();
          display.setTextSize(1);
          display.setCursor(0, 20);
          display.setTextColor(SSD1306_WHITE);
          display.println("Card is not verified");
          display.display();

          failureBeep();
        } else {

          // Check doorcode if mode is doorlock
          if(readerMode=="doorlock"){
            if(readerDoorcode == userDoorcode){
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("---Welcome---");

              display.setTextSize(2);
              display.setCursor(0, 30);
              display.setTextColor(SSD1306_WHITE);
              display.println(firstName);
              display.display();

              addEntry(readerId, cardUID, readerMode);

              display.setTextSize(1);
              display.setCursor(0, 50);
              display.setTextColor(SSD1306_WHITE);
              display.println("Door code Matched");
              display.display();

              successBeep();
            }else{
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("Wrong Door code!!");
              display.display();

              failureBeep();
            }
          }
          else if(readerMode == "payment"){
            if(userBalance >= deductionAmount){
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("---Welcome---");

              display.setTextSize(2);
              display.setCursor(0, 30);
              display.setTextColor(SSD1306_WHITE);
              display.println(firstName);
              display.display();

              // reduce card balance
              long prevBalance=userBalance;
              deductBalance( readerId, cardUID);
              if(userBalance == (prevBalance-deductionAmount)){
                display.setTextSize(1);
                display.setCursor(0, 50);
                display.setTextColor(SSD1306_WHITE);
                display.println("Payment Successfull");
                display.display();

                successBeep();
              }else{
                display.clearDisplay();
                display.setTextSize(1);
                display.setCursor(0, 50);
                display.setTextColor(SSD1306_WHITE);
                display.println("Payment could not be completed");
                display.display();

                failureBeep();
              }
            }else{
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("Not enough Balance!!");
              display.display();

              failureBeep();
            }
          }else if(readerMode == "identification"){
            if(isCardAuthorized(cardUID)){
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("---Welcome---");

              display.setTextSize(2);
              display.setCursor(0, 30);
              display.setTextColor(SSD1306_WHITE);
              display.println(firstName);
              display.display();

              display.setTextSize(1);
              display.setCursor(0, 50);
              display.setTextColor(SSD1306_WHITE);
              display.println("you are authorized");
              display.display();

              successBeep();

              addEntry(readerId, cardUID, readerMode);

            }else{
              display.clearDisplay();
              display.setTextSize(1);
              display.setCursor(0, 20);
              display.setTextColor(SSD1306_WHITE);
              display.println("Not authorized!!");
              display.display();

              failureBeep();
            }
          }
        }

      } else {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 20);
        display.setTextColor(SSD1306_WHITE);
        display.println("Reader Not Registered");
        display.display();

        failureBeep();
      }

      // Halt the card so it doesn't read the same tap 100 times a second
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();

      delay(5000);
      display.clearDisplay();
      display.display();

      username="";
      userBalance=0;
      userDoorcode="";
    }
  }
}

void handleReaderRegistration() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body received\"}");
    return;
  }

  String jsonString = server.arg("plain");

  if (readerMode != "") {
    server.send(403, "application/json", "{\"error\":\"The Reader is already registered\"}");
    return;
  }
  if (readerId == "") {
    server.send(404, "application/json", "{\"error\":\"The Reder is not recognized\"}");
    return;
  }

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, jsonString);

  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON format received\"}");
    return;
  }

  // Inject the readerId into the JSON payload
  doc["readerId"] = readerId;

  String modifiedJsonString;
  serializeJson(doc, modifiedJsonString);

  Serial.println("API request Sent to register reader");
  Serial.print("Data: ");
  Serial.println(modifiedJsonString);



  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin("https://unicard-api.sajjadjonayed.com/api/v1/register-reader");
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(modifiedJsonString);

    if (httpResponseCode == 201) {
      showSuccessAnimation();
      display.display();

      Serial.println("Reader Registration Successful");
      const char* modeVal = doc["mode"];
      readerMode = modeVal ? String(modeVal) : "";

      const char* doorcodeVal = doc["doorcode"];
      readerDoorcode = doorcodeVal ? String(doorcodeVal) : "";
      deductionAmount = doc["deductionAmount"] | 0;
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


void showSuccessAnimation() {
  int centerX = 64;
  int centerY = 40;

  display.clearDisplay();

  for (int r = 0; r <= 14; r += 2) {
    if (r > 0) {
      display.drawCircle(centerX, centerY, r - 2, SSD1306_BLACK);
    }
    display.drawCircle(centerX, centerY, r, SSD1306_WHITE);
    display.display();
    delay(20);
  }

  // short leg of the checkmark
  // Starts on the left, goes down and right
  for (int i = 0; i <= 6; i++) {
    display.drawLine(54, 40, 54 + i, 40 + i, SSD1306_WHITE);
    display.display();
    delay(25);
  }

  // long leg of the checkmark
  // Starts at the bottom, goes up and right
  for (int i = 0; i <= 12; i++) {
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


void fetchCardData(String uid) {
  String doorcode = "";
  long balance = 0;

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverPath = "https://unicard-api.sajjadjonayed.com/api/v1/get-card/" + uid;

    Serial.print("Fetching data from: ");
    Serial.println(serverPath);

    http.begin(serverPath);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);

      if (httpResponseCode == 200) {
        String payload = http.getString();
        Serial.println("Response Payload: " + payload);

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);

        if (!error) {
          username = doc["fullname"].as<String>();
          const char* doorcodeVal = doc["doorcode"];
          userDoorcode = doorcodeVal ? String(doorcodeVal) : "";
          userBalance = doc["balance"] | 0;

          Serial.println("Parsed Successfully:");
          Serial.println("Name: " + username);
          Serial.println("Doorcode: " + (userDoorcode == "" ? "None" : userDoorcode));
          Serial.println("Balance: " + String(userBalance));

        } else {
          Serial.print("JSON Parsing failed: ");
          Serial.println(error.c_str());
        }
      } else {
        Serial.print("Error fetching the card data: ");
        Serial.println(httpResponseCode);
      }
    } else {
      Serial.print("Error on HTTP request: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Wi-Fi Disconnected. Cannot verify card.");
  }

  
  return;
}


void fetchReaderConfiguration() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "https://unicard-api.sajjadjonayed.com/api/v1/get-reader/" + readerId;

    Serial.print("\nFetching reader config from: ");
    Serial.println(url);

    http.begin(url);
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String payload = http.getString();
      Serial.println("Config received: " + payload);

      // Create JSON document
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        // Safely extract strings. If the JSON value is null, default to an empty string ("")
        const char* modeVal = doc["mode"];
        readerMode = modeVal ? String(modeVal) : "";

        const char* doorcodeVal = doc["doorcode"];
        readerDoorcode = doorcodeVal ? String(doorcodeVal) : "";

        deductionAmount = doc["deductionAmount"] | 0;
        

        readerCardIds.clear();
        JsonArray cardArray = doc["cardIds"].as<JsonArray>();
        if (!cardArray.isNull()) {
          for (JsonVariant v : cardArray) {
            readerCardIds.push_back(v.as<String>());
          }
        }

        Serial.println("\n--- Reader Successfully Configured ---");
        Serial.println("Mode: " + readerMode);
        Serial.println("Doorcode: " + (readerDoorcode == "" ? "None" : readerDoorcode));
        Serial.println("Deduction: $" + String(deductionAmount));
        Serial.println("------------------------------------\n");

      } else {
        Serial.print("JSON Parsing failed: ");
        Serial.println(error.c_str());
      }
    } else {
      Serial.print("Failed to fetch config. HTTP Error: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

void deductBalance(String readerId, String cardUID){
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "https://unicard-api.sajjadjonayed.com/api/v1/deduct-balance/" + cardUID + "/" + readerId;

    Serial.print("\nUpdating Card's balance from: ");
    Serial.println(url);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.PATCH("{}");

    if (httpResponseCode == 200) {
      String payload = http.getString();
      Serial.println("Response received: " + payload);
      userBalance -= deductionAmount;
    } else {
      Serial.print("Failed to fetch config. HTTP Error: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }

}

void addEntry(String readerId, String cardUID, String mode) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "https://unicard-api.sajjadjonayed.com/api/v1/add-entry";

    Serial.println("\nAdding new entry to database...");
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["cardUID"] = cardUID;
    doc["readerId"] = readerId;
    doc["mode"] = mode;

    String requestBody;
    serializeJson(doc, requestBody);
    
    Serial.print("Payload: ");
    Serial.println(requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String responsePayload = http.getString();
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + responsePayload);
    } else {
      Serial.print("Failed to add entry. HTTP Error: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("Wi-Fi Disconnected. Cannot add entry.");
  }
}


bool isCardAuthorized(String tappedUID) {
  if (readerCardIds.size() == 0) return false; 
  
  for (int i = 0; i < readerCardIds.size(); i++) {
    if (readerCardIds[i] == tappedUID) {
      return true;
    }
  }
  return false; 
}

void successBeep() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  delay(100);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
}

void failureBeep() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(800);
  digitalWrite(BUZZER_PIN, LOW);
}