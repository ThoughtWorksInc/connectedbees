load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');

let button = 4;
let topic = '/devices/' + Cfg.get('device.id') + '/state';
let roomId = "fill_in_room_id_here";

function publish(topic, message) {
  let ok = MQTT.pub(topic, message, 1, true);
  print('Success:', ok ? 'yes' : 'no');
  print('Published:', ok, topic, '->', message);
}

GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_ANY, 200, function(pin) {
  let pinValue = GPIO.read(pin);
  print('Interrupt with ', pinValue);
  let message = JSON.stringify({status: pinValue, room: roomId});
  publish(topic, message);
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

