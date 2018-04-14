#!/bin/sh -el

echo "AWS_DEFAULT_REGION='$AWS_DEFAULT_REGION'"
echo "SERIAL_PORT='$SERIAL_PORT'"

mos aws-iot-setup --port $SERIAL_PORT --aws-region $AWS_DEFAULT_REGION