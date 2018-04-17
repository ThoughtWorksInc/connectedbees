load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_dht.js');


let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');
let pirButton = 4;
let soundButton = 27;
let lightButton = 12;
let tempButton = 15;


let topic = '/devices/' + Cfg.get('device.id') + '/events';
let pirTopic = '/devices/' + Cfg.get('device.id') + '/pir/state';
let buttonTopic = '/devices/' + Cfg.get('device.id') + '/button/state';
let soundTopic = '/devices/' + Cfg.get('device.id') + '/sound/state';
let lightTopic = '/devices/' + Cfg.get('device.id') + '/light/state';
let tempTopic = '/devices/' + Cfg.get('device.id') + '/temp/state';
let humidityTopic = '/devices/' + Cfg.get('device.id') + '/humidity/state';

let roomId = "1234";



print('LED GPIO:', led, 'button GPIO:', button);
// Initialize DHT library
let dht = DHT.create(tempButton, DHT.DHT22);

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};


// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let message = 'pressed';
  let ok = MQTT.pub(buttonTopic, message, 1);
  print('Published:', ok, buttonTopic, '->', message);
}, null);

// Publish to MQTT topic on a pir active. Wired to GPIO pin 4
GPIO.set_button_handler(pirButton, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let message = 'activated';
  let ok = MQTT.pub(pirTopic, message, 1);
  print('PIR Published:', ok, pirTopic, '->', message);
}, null);

// Publish to MQTT topic on a sound active. Wired to GPIO pin 27
GPIO.set_button_handler(soundButton, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let message = 'soundDetected';
  let ok = MQTT.pub(soundTopic, message, 1);
  print('SOUND Published:', ok, soundTopic, '->', message);
}, null);

// Publish to MQTT topic when light present. Wired to GPIO pin 12
GPIO.set_button_handler(lightButton, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let message = 'lightDetected';
  let ok = MQTT.pub(lightTopic, message, 1);
  print('LIGHT Published:', ok, lightTopic, '->', message);
}, null);

// This function reads data from the DHT sensor every 5 seconds
Timer.set(5000 /* milliseconds */, Timer.REPEAT, function() {
  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from temp sensor');
    return;
  }

  print('Temperature:', t, '*C');
  print('Humidity:', h, '%');
  let tempMessage = JSON.stringify({status: t, room: roomId});
  let humMessage = JSON.stringify({status: h, room: roomId});

  let tok = MQTT.pub(tempTopic, tempMessage, 1);
  print('TEMP Published:', tok, tempTopic, '->', tempMessage);

  let hok = MQTT.pub(humidityTopic, humMessage, 1);
  print('HUMIDITY Published:', hok, humidityTopic, '->', humMessage);

}, null);


// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
