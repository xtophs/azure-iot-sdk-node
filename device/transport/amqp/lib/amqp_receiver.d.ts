/// <reference types="node" />
import { EventEmitter } from 'events';
import { Message, results, Receiver } from 'azure-iot-common';
import { ClientConfig, DeviceMethodRequest, DeviceMethodResponse } from 'azure-iot-device';
import { AmqpDeviceMethodClient } from './amqp_device_method_client';
import { Amqp as BaseAmqpClient } from 'azure-iot-amqp-base';
export declare class AmqpReceiver extends EventEmitter implements Receiver {
    private _config;
    private _amqpClient;
    private _deviceMethodClient;
    private _messagingEndpoint;
    constructor(config: ClientConfig, amqpClient: BaseAmqpClient, deviceMethodClient: AmqpDeviceMethodClient);
    complete(msg: Message, callback?: (err?: Error, result?: results.MessageCompleted) => void): void;
    reject(msg: Message, callback?: (err?: Error, result?: results.MessageRejected) => void): void;
    abandon(msg: Message, callback?: (err?: Error, result?: results.MessageAbandoned) => void): void;
    onDeviceMethod(methodName: string, methodCallback: (request: DeviceMethodRequest, response: DeviceMethodResponse) => void): void;
}
