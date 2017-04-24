/// <reference types="node" />
import { EventEmitter } from 'events';
import { ClientConfig, DeviceMethodRequest, DeviceMethodResponse } from 'azure-iot-device';
import { Amqp as BaseAmqpClient } from 'azure-iot-amqp-base';
export declare class AmqpDeviceMethodClient extends EventEmitter {
    private _config;
    private _amqpClient;
    private _methodEndpoint;
    private _methodReceiverInitialized;
    private _fsm;
    constructor(config: ClientConfig, amqpClient: BaseAmqpClient);
    sendMethodResponse(response: DeviceMethodResponse, callback?: (err?: Error, result?: any) => void): void;
    onDeviceMethod(methodName: string, callback: (request: DeviceMethodRequest, response: DeviceMethodResponse) => void): void;
}
