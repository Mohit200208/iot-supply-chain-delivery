#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN,DHTTYPE); TinyGPSPlus gps; HardwareSerial gpsSerial(2);
const char* WIFI_SSID="YOUR_WIFI"; const char* WIFI_PASSWORD="YOUR_PASSWORD";
const char* API_URL="http://YOUR_SERVER:5000/api/iot/ingest";
const char* DEVICE_ID="YOUR_DEVICE_ID"; const char* DEVICE_KEY="YOUR_DEVICE_KEY";
void setup(){Serial.begin(115200);dht.begin();gpsSerial.begin(9600,SERIAL_8N1,16,17);WiFi.begin(WIFI_SSID,WIFI_PASSWORD);while(WiFi.status()!=WL_CONNECTED){delay(500);Serial.print(".");}Serial.println(" WiFi connected");}
void loop(){while(gpsSerial.available())gps.encode(gpsSerial.read());float t=dht.readTemperature(),h=dht.readHumidity();if(isnan(t)||isnan(h)){Serial.println("DHT read failed");delay(5000);return;}
 if(WiFi.status()==WL_CONNECTED){HTTPClient http;http.begin(API_URL);http.addHeader("Content-Type","application/json");http.addHeader("x-device-id",DEVICE_ID);http.addHeader("x-device-key",DEVICE_KEY);StaticJsonDocument<256> doc;doc["temperature"]=t;doc["humidity"]=h;doc["source"]="hardware";// Server timestamps this hardware reading on receipt; millis() is not epoch time.if(gps.location.isValid()){doc["latitude"]=gps.location.lat();doc["longitude"]=gps.location.lng();}String body;serializeJson(doc,body);int code=http.POST(body);Serial.printf("POST %d: %s\\n",code,http.getString().c_str());http.end();}delay(10000);}
