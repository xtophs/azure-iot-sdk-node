import { ClientConfig, Transport, StableConnectionTransport, TwinTransport } from 'azure-iot-device';
import { Mqtt } from './mqtt';
/**
 * @class        module:azure-iot-device-mqtt.MqttWs
 * @classdesc    Provides MQTT over WebSockets transport for the device [client]{@link module:azure-iot-device.Client} class.
 *
 * @param   {Object}    config  Configuration object derived from the connection string by the client.
 */
export declare class MqttWs extends Mqtt implements Transport, StableConnectionTransport, TwinTransport {
    constructor(config: ClientConfig);
}
