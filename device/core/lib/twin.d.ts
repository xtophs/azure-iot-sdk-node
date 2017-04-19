/// <reference types="node" />
import { EventEmitter } from 'events';
import { Client } from './client';
export declare class Twin extends EventEmitter {
    static timeout: 120000;
    static errorEvent: 'error';
    static subscribedEvent: 'subscribed';
    static responseEvent: 'response';
    static postEvent: 'post';
    static desiredPath: 'properties.desired';
    properties: any;
    private _rid;
    private _client;
    private _receiver;
    constructor(client: Client);
    /**
     * @method          module:azure-iot-device.Twin#fromDeviceClient
     * @description     Get a Twin object for the given client connection
     *
     * @param {Object}      client  The [client]{@link module:azure-iot-device.Client} object that this Twin object is associated with.
     *
     * @param {Function}      done  the callback to be invoked when this function completes.
     *
     * @throws {ReferenceError}   One of the required parameters is falsy
     */
    fromDeviceClient(client: Client, done: (err?: Error, result?: Twin) => void): void;
    updateSharedAccessSignature(): void;
    private _connectSubscribeAndGetProperties(done);
    private _subscribe(done);
    private _sendTwinRequest(method, resource, properties, body, done);
    private _updateReportedProperties(state, done);
    private _mergePatch(dest, patch);
    private _clearCachedProperties();
    private _getPropertiesFromService(done);
    private _fireChangeEvents(desiredProperties);
    private _onServicePost(body);
    private _handleNewListener(eventName);
}
