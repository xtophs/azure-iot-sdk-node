/// <reference types="node" />
import { EventEmitter } from 'events';
import { results, Message } from 'azure-iot-common';
import { HttpReceiver } from './http_receiver.js';
import { Transport, BatchingTransport, ClientConfig } from 'azure-iot-device';
/**
 * @class module:azure-iot-device-http.Http
 * @classdesc       Provide HTTP transport to the device [client]{@link module:azure-iot-device.Client}.
 *
 * @param   {Object}    config  Configuration object derived from the connection string by the client.
 */
export declare class Http extends EventEmitter implements Transport, BatchingTransport {
    private _config;
    private _http;
    private _receiver;
    constructor(config: ClientConfig);
    /**
     * @method          module:azure-iot-device-http.Http#sendEvent
     * @description     This method sends an event to the IoT Hub as the device indicated in the
     *                  `config` parameter.
     *
     * @param {Message}  message    The [message]{@linkcode module:common/message.Message}
     *                              to be sent.
     * @param {Object}  config      This is a dictionary containing the following keys
     *                              and values:
     *
     * | Key     | Value                                                   |
     * |---------|---------------------------------------------------------|
     * | host    | The host URL of the Azure IoT Hub                       |
     * | hubName | The name of the Azure IoT Hub                           |
     * | keyName | The identifier of the device that is being connected to |
     * | key     | The shared access key auth                              |
     *
     * @param {Function} done       The callback to be invoked when `sendEvent`
     *                              completes execution.
     */
    sendEvent(message: Message, done: (err?: Error, result?: results.MessageEnqueued) => void): void;
    /**
     * @method          module:azure-iot-device-http.Http#sendEventBatch
     * @description     The `sendEventBatch` method sends a list of event messages to the IoT Hub
     *                  as the device indicated in the `config` parameter.
     * @param {array<Message>} messages   Array of [Message]{@linkcode module:common/message.Message}
     *                                    objects to be sent as a batch.
     * @param {Object}  config            This is a dictionary containing the
     *                                    following keys and values:
     *
     * | Key     | Value                                                   |
     * |---------|---------------------------------------------------------|
     * | host    | The host URL of the Azure IoT Hub                       |
     * | hubName | The name of the Azure IoT Hub                           |
     * | keyName | The identifier of the device that is being connected to |
     * | key     | The shared access key auth                              |
     *
     * @param {Function}      done      The callback to be invoked when
     *                                  `sendEventBatch` completes execution.
     */
    sendEventBatch(messages: Message[], done: (err?: Error, result?: results.MessageEnqueued) => void): void;
    /**
     * @method          module:azure-iot-device-http.Http#getReceiver
     * @description     This methods gets the unique instance of the receiver that is used to asynchronously retrieve messages from the IoT Hub service.
     *
     * @param {Function}      done      The callback to be invoked when `getReceiver` completes execution, passing the receiver object as an argument.
     */
    getReceiver(done: (err?: Error, result?: HttpReceiver) => void): void;
    /**
     * @method          module:azure-iot-device-http.Http#setOptions
     * @description     This methods sets the HTTP specific options of the transport.
     *
     * @param {Function}      done      The callback to be invoked when `setOptions` completes.
     */
    setOptions(options: any, done: (err?: Error, result?: any) => void): void;
    /**
     * @method              module:azure-iot-device-http.Http#complete
     * @description         Settles the message as complete and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as complete.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    complete(message: Message, done: (err?: Error, result?: results.MessageCompleted) => void): void;
    /**
     * @method              module:azure-iot-device-http.Http#reject
     * @description         Settles the message as rejected and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as rejected.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    reject(message: Message, done: (err?: Error, result?: results.MessageRejected) => void): void;
    /**
     * @method              module:azure-iot-device-http.Http#abandon
     * @description         Settles the message as abandoned and calls the done callback with the result.
     *
     * @param {Message}     message     The message to settle as abandoned.
     * @param {Function}    done        The callback that shall be called with the error or result object.
     */
    abandon(message: Message, done: (err?: Error, result?: results.MessageAbandoned) => void): void;
    /**
     * @method          module:azure-iot-device-http.Http#updateSharedAccessSignature
     * @description     This methods sets the SAS token used to authenticate with the IoT Hub service.
     *
     * @param {String}        sharedAccessSignature  The new SAS token.
     * @param {Function}      done      The callback to be invoked when `updateSharedAccessSignature` completes.
     */
    updateSharedAccessSignature(sharedAccessSignature: string, done: (err?: Error, result?: results.SharedAccessSignatureUpdated) => void): void;
    private _insertAuthHeaderIfNecessary(headers);
}
