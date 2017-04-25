/// <reference types="node" />
import { MqttBase } from './mqtt_base';
import { Message, X509 } from 'azure-iot-common';
import { ClientConfig, DeviceMethodResponse, Transport, StableConnectionTransport, TwinTransport } from 'azure-iot-device';
import { EventEmitter } from 'events';
import { MqttTwinReceiver } from './mqtt_twin_receiver';
import { MqttReceiver } from './mqtt_receiver';
/**
 * @class        module:azure-iot-device-mqtt.Mqtt
 * @classdesc    Provides MQTT transport for the device [client]{@link module:azure-iot-device.Client} class.
 *
 * @param   {Object}    config  Configuration object derived from the connection string by the client.
 */
export declare class Mqtt extends EventEmitter implements Transport, StableConnectionTransport, TwinTransport {
    protected _config: ClientConfig;
    private _mqtt;
    private _twinReceiver;
    constructor(config: ClientConfig, provider?: MqttBase);
    /**
     * @method              module:azure-iot-device-mqtt.Mqtt#connect
     * @description         Establishes the connection to the Azure IoT Hub instance using the MQTT protocol.
     *
     * @param {Function}    done   callback that shall be called when the connection is established.
     */
    connect(done?: (err?: Error, result?: any) => void): void;
    /**
     * @method              module:azure-iot-device-mqtt.Mqtt#disconnect
     * @description         Terminates the connection to the IoT Hub instance.
     *
     * @param {Function}    done      Callback that shall be called when the connection is terminated.
     */
    disconnect(done?: (err?: Error, result?: any) => void): void;
    /**
     * @method              module:azure-iot-device-mqtt.Mqtt#sendEvent
     * @description         Sends an event to the server.
     *
     * @param {Message}     message   Message used for the content of the event sent to the server.
     */
    sendEvent(message: Message, done?: (err?: Error, result?: any) => void): void;
    /**
     * @method              module:azure-iot-device-mqtt.Mqtt#getReceiver
     * @description         Gets a receiver object that is used to receive and settle messages.
     *
     * @param {Function}    done   callback that shall be called with a receiver object instance.
     */
    getReceiver(done?: (err?: Error, receiver?: MqttReceiver) => void): void;
    /**
     * @deprecated          // Implementation test belongs in the client.
     * @method              module:azure-iot-device-mqtt.Mqtt#complete
     * @description         Settles the message as complete and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as complete.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    complete(message: Message, done?: (err?: Error, result?: any) => void): void;
    /**
     * @deprecated          // Implementation test belongs in the client.
     * @method              module:azure-iot-device-mqtt.Mqtt#reject
     * @description         Settles the message as rejected and calls the done callback with the result.
     *
     * @throws {Error}      The MQTT transport does not support rejecting messages.
     */
    reject(): void;
    /**
     * @deprecated          // Implementation test belongs in the client.
     * @method              module:azure-iot-device-mqtt.Mqtt#abandon
     * @description         Settles the message as abandoned and calls the done callback with the result.
     *
     * @throws {Error}      The MQTT transport does not support abandoning messages.
     */
    abandon(): void;
    /**
     * @method          module:azure-iot-device-mqtt.Mqtt#updateSharedAccessSignature
     * @description     This methods sets the SAS token used to authenticate with the IoT Hub service.
     *
     * @param {String}        sharedAccessSignature  The new SAS token.
     * @param {Function}      done      The callback to be invoked when `updateSharedAccessSignature` completes.
     */
    updateSharedAccessSignature(sharedAccessSignature: string, done?: (err?: Error, result?: any) => void): void;
    /**
     * @method          module:azure-iot-device-mqtt.Mqtt#setOptions
     * @description     This methods sets the MQTT specific options of the transport.
     *
     * @param {object}        options   Options to set.  Currently for MQTT these are the x509 cert, key, and optional passphrase properties. (All strings)
     * @param {Function}      done      The callback to be invoked when `setOptions` completes.
     */
    setOptions(options: X509, done?: (err?: Error, result?: any) => void): void;
    /**
     * @method          module:azure-iot-device-mqtt.Mqtt#sendTwinRequest
     * @description     Send a device-twin specific messager to the IoT Hub instance
     *
     * @param {String}        method    name of the method to invoke ('PUSH', 'PATCH', etc)
     * @param {String}        resource  name of the resource to act on (e.g. '/properties/reported/') with beginning and ending slashes
     * @param {Object}        properties  object containing name value pairs for request properties (e.g. { 'rid' : 10, 'index' : 17 })
     * @param {String}        body  body of request
     * @param {Function}      done  the callback to be invoked when this function completes.
     *
     * @throws {ReferenceError}   One of the required parameters is falsy
     * @throws {ArgumentError}  One of the parameters is an incorrect type
     */
    sendTwinRequest(method: string, resource: string, properties: {
        [key: string]: string;
    }, body: any, done?: (err?: Error, result?: any) => void): void;
    /**
     * @method            module:azure-iot-device-mqtt.Mqtt.Mqtt#sendMethodResponse
     * @description       Sends the response for a device method call to the service.
     *
     * @param {Object}   response     This is the `response` object that was
     *                                produced by the device client object when a
     *                                C2D device method call was received.
     * @param {Function} done         The callback to be invoked when the response
     *                                has been sent to the service.
     *
     * @throws {Error}                If the `response` parameter is falsy or does
     *                                not have the expected shape.
     */
    sendMethodResponse(response: DeviceMethodResponse, done?: (err?: Error, result?: any) => void): void;
    /**
     * @method          module:azure-iot-device-mqtt.Mqtt#getTwinReceiver
     * @description     Get a receiver object that handles C2D device-twin traffic
     *
     * @param {Function}  done      the callback to be invoked when this function completes.
     *
     * @throws {ReferenceError}   One of the required parameters is falsy
     */
    getTwinReceiver(done?: (err?: Error, receiver?: MqttTwinReceiver) => void): void;
}
