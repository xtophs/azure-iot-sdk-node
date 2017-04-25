import { Amqp } from './amqp.js';
import { ClientConfig, Transport, StableConnectionTransport } from 'azure-iot-device';
/**
 * @class module:azure-iot-device-amqp.AmqpWs
 * @classdesc Constructs an {@linkcode AmqpWs} object that can be used on a device to send
 *            and receive messages to and from an IoT Hub instance, using the AMQP protocol over secure websockets.
 *            This class overloads the constructor of the base {@link module:azure-iot-device-amqp:Amqp} class from the AMQP transport, and inherits all methods from it.
 *
 * @augments module:azure-iot-device-amqp.Amqp
 *
 * @param {Object}  config   Configuration object generated from the connection string by the client.
 */
export declare class AmqpWs extends Amqp implements Transport, StableConnectionTransport {
    constructor(config: ClientConfig);
    protected _getConnectionUri(): string;
}
