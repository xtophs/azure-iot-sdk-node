/// <reference types="node" />
import { EventEmitter } from 'events';
import { ClientConfig, DeviceMethodResponse } from 'azure-iot-device';
import { results, Message, X509 } from 'azure-iot-common';
import { AmqpReceiver } from './amqp_receiver';
/**
 * @class module:azure-iot-device-amqp.Amqp
 * @classdesc Constructs an {@linkcode Amqp} object that can be used on a device to send
 *            and receive messages to and from an IoT Hub instance, using the AMQP protocol.
 *
 */
export declare class Amqp extends EventEmitter {
    protected _config: ClientConfig;
    private _deviceMethodClient;
    private _receiver;
    private _amqp;
    constructor(config: ClientConfig);
    /**
     * @method              module:azure-iot-device-amqp.Amqp#connect
     * @description         Establishes a connection with the IoT Hub instance.
     * @param {Function}   done   Called when the connection is established of if an error happened.
     *
     */
    connect(done?: (err?: Error, result?: results.Connected) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#disconnect
     * @description         Disconnects the link to the IoT Hub instance.
     * @param {Function}   done   Called when disconnected of if an error happened.
     */
    disconnect(done?: (err?: Error) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#sendEvent
     * @description         Sends an event to the IoT Hub.
     * @param {Message}  message    The [message]{@linkcode module:common/message.Message}
     *                              to be sent.
     * @param {Function} done       The callback to be invoked when `sendEvent`
     *                              completes execution.
     */
    sendEvent(message: Message, done: (err: Error, result?: results.MessageEnqueued) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#getReceiver
     * @description         Gets the {@linkcode AmqpReceiver} object that can be used to receive messages from the IoT Hub instance and accept/reject/release them.
     * @param {Function}  done      Callback used to return the {@linkcode AmqpReceiver} object.
     */
    getReceiver(done: (err: Error, receiver?: AmqpReceiver) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#complete
     * @description         Settles the message as complete and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as complete.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    complete(message: Message, done?: (err?: Error, result?: results.MessageCompleted) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#reject
     * @description         Settles the message as rejected and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as rejected.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    reject(message: Message, done?: (err?: Error, result?: results.MessageRejected) => void): void;
    /**
     * @method              module:azure-iot-device-amqp.Amqp#abandon
     * @description         Settles the message as abandoned and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as abandoned.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    abandon(message: Message, done?: (err?: Error, result?: results.MessageAbandoned) => void): void;
    /**
     * @method          module:azure-iot-device-amqp.Amqp#updateSharedAccessSignature
     * @description     This methods sets the SAS token used to authenticate with the IoT Hub service.
     *
     * @param {String}        sharedAccessSignature  The new SAS token.
     * @param {Function}      done      The callback to be invoked when `updateSharedAccessSignature` completes.
     */
    updateSharedAccessSignature(sharedAccessSignature: string, done?: (err?: Error, result?: results.SharedAccessSignatureUpdated) => void): void;
    /**
     * @method          module:azure-iot-device-amqp.Amqp#setOptions
     * @description     This methods sets the AMQP specific options of the transport.
     *
     * @param {object}        options   Options to set.  Currently for amqp these are the x509 cert, key, and optional passphrase properties. (All strings)
     * @param {Function}      done      The callback to be invoked when `setOptions` completes.
     */
    setOptions(options: X509, done?: () => void): void;
    /**
     * The `sendEventBatch` method sends a list of event messages to the IoT Hub.
     * @param {array<Message>} messages   Array of [Message]{@linkcode module:common/message.Message}
     *                                    objects to be sent as a batch.
     * @param {Function}      done      The callback to be invoked when
     *                                  `sendEventBatch` completes execution.
     */
    /**
     * The `sendMethodResponse` method sends a direct method response to the IoT Hub
     * @param {Object}     methodResponse   Object describing the device method response.
     * @param {Function}   callback         The callback to be invoked when
     *                                      `sendMethodResponse` completes execution.
     */
    sendMethodResponse(methodResponse: DeviceMethodResponse, callback: (err?: Error, result?: any) => void): void;
    protected _getConnectionUri(): string;
}
