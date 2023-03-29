# Getting Started
Before cloning this repo, setup a PocketBase server first (https://pocketbase.io/docs)

After cloning, create .env file at root with the following variables:
```
PORT=
EXPRESS_URL=
ARDUINO_PORT=
ARDUINO_PATH=
ARDUINO_MODE=
GOOGLE_EMAIL=
GOOGLE_PASSWORD=
OAUTH_CLIENTID=
OAUTH_REFRESH_TOKEN=
OAUTH_CLIENT_SECRET=
POCKETBASE_API_URL=
POCKETBASE_API_ADMIN_EMAIL=
POCKETBASE_API_ADMIN_PASSWORD=
```
Change `EXPRESS_URL` to `127.0.0.1` for development or `0.0.0.0` for production.
To be able to send email, you have to obtain your token via Google Cloud Platform.

# Getting Arduino data

Hook MQ2 sensor to your Arduino like this diagram

<img src="https://user-images.githubusercontent.com/71075654/226717333-9024f791-bb62-4069-b672-480909f9a33a.png" width="500">

There are two ways to get data from your Arduino, wired (via USB) or wireless (via WiFi or Ethernet).
### Wired

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
After that, clone this repo and change `ARDUINO_PATH` in .env file. Finally, run `node index.js`. You should see `Arduino serial port initialized` message in your terminal.

### Wireless

Upload the following code to your Arduino:
```C++
// This code only work for WeMos D1
// Only support HTTP request (HTTPS is not supported)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char* ssid = "YOUR_NETWORK_SSID"; // change this to your network ssid
const char* password = "YOUR_NETWORK_PASSWORD"; // change this to your network password

int speakerPin = 4;

String serverName = "http://14.225.210.207:5050/update/";

void setup() {
  pinMode(4, OUTPUT);
  Serial.begin(115200);
  digitalWrite(4, LOW);
  Serial.print("Waiting for MQ2 sensor to warmup (20s)");
  for(int i = 0; i < 20; i++){
    Serial.print(".");
    delay(1000);
  }
  Serial.println("Ready!");
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  delay(1000);
}

void loop() {
  int sensorValue = analogRead(0);
  Serial.println(sensorValue);
  if(sensorValue > 320 && sensorValue <= 600){
    digitalWrite(4, HIGH);
    delay(100);
    digitalWrite(4, LOW);
  }
  else if(sensorValue > 600) {
    digitalWrite(4, HIGH);
  }
  else {
    digitalWrite(4, LOW);
  }
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String serverPath = serverName + String(sensorValue);
    http.begin(client, serverPath.c_str());

    int httpResponseCode = http.GET();

    if (httpResponseCode <= 0) {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  delay(500);
}
```
After that, clone this repo and run `index.js`. You should see your terminal logging ppm value from your Arduino.
