load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');

let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');
let pirButton = 4;
let soundButton = 27;


let topic = '/devices/' + Cfg.get('device.id') + '/events';
let pirTopic = '/devices/' + Cfg.get('device.id') + '/pir/state';
let buttonTopic = '/devices/' + Cfg.get('device.id') + '/button/state';
let soundTopic = '/devices/' + Cfg.get('device.id') + '/sound/state';

print('LED GPIO:', led, 'button GPIO:', button);

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
