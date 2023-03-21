# Getting Started
Before clone this repo, setup a PocketBase server first (https://pocketbase.io/docs)
After cloning, create .env file at root with the following variables:
```
POCKETBASE_API_ADMIN_EMAIL=
EXPRESS_URL=
ARDUINO_PORT=
OAUTH_CLIENT_SECRET=
PORT=
OAUTH_CLIENTID=
ARDUINO_PATH=
ARDUINO_MODE=
GOOGLE_PASSWORD=
OAUTH_REFRESH_TOKEN=
POCKETBASE_API_ADMIN_PASSWORD=
POCKETBASE_API_URL=
GOOGLE_EMAIL=
```
Change `EXPRESS_URL` to `127.0.0.1` for development or `0.0.0.0` for production.
To be able to send email, you have to obtain your token via Google Cloud Platform.
# Getting Arduino data
There are two ways to get data from your Arduino, wired or wireless (via WiFi).
### Wired
Requirement:
- Arduino UNO

Upload the following code to your Arduino:
```C++
int timeToWait = 20;
float sensorValue = -1;

void setup() {
	Serial.begin(9600);
	Serial.println("Waiting for MQ2 sensor to warmup (" + String(timeToWait) + "s)");
  for(int i = 1; i <= timeToWait; i++){
    delay(1000);
  }
  Serial.println("Ready!");
}

void loop() {
	sensorValue = analogRead(0);
	delay(1000);
}
```
After that, clone this repo and change `ARDUINO_PORT` in .env file. Finally, run `node index.js`. You should see `Arduino serial port initialized` message in your terminal.

### Wireless
Requirement:
- Arduino UNO with WiFi module

Upload the following code to your Arduino:
```C++
// This code only work for WeMos D1
// Only support HTTP request (HTTPS is not supported)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char* ssid = "YOUR_NETWORK_SSID"; // change this to your network ssid
const char* password = "YOUR_NETWORK_PASSWORD"; // change this to your network password

String serverName = "API_URL/update/"; // change API_URL to your deployement url

unsigned long timerDelay = 2000;

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  delay(timerDelay);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String serverPath = serverName + String(analogRead(0));
    http.begin(client, serverPath.c_str());

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  delay(timerDelay);
}
```
After that, clone this repo and run `index.js`. You should see your terminal logging ppm value from your Arduino.
