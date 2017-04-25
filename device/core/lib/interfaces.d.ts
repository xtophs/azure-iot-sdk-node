/// <reference types="node" />
import { EventEmitter } from 'events';
import { SharedAccessSignature } from './shared_access_signature';
import { X509, results, Message, Receiver } from 'azure-iot-common';
import { DeviceMethodResponse } from './device_method';
export interface Transport extends EventEmitter {
    setOptions(options: any, done?: (err?: Error, result?: results.TransportConfigured) => void): void;
    updateSharedAccessSignature(sharedAccessSignature: string, done: (err?: Error, result?: results.SharedAccessSignatureUpdated) => void): void;
    getReceiver(func: (err?: Error, receiver?: Receiver) => void): void;
    sendEvent(message: Message, done: (err?: Error, result?: results.MessageEnqueued) => void): void;
    complete(message: Message, done: (err?: Error, result?: results.MessageCompleted) => void): void;
    reject(message: Message, done: (err?: Error, results?: results.MessageRejected) => void): void;
    abandon(message: Message, done: (err?: Error, results?: results.MessageAbandoned) => void): void;
}
export interface BatchingTransport extends Transport {
    sendEventBatch(messages: Message[], done: (err: Error, result?: results.MessageEnqueued) => void): void;
}
export interface StableConnectionTransport extends Transport {
    connect(done: (err?: Error, result?: results.Connected) => void): void;
    disconnect(done: (err?: Error, result?: results.Disconnected) => void): void;
}
export interface TwinTransport extends Transport {
    getTwinReceiver(done: (err?: Error, receiver?: Receiver) => void): void;
    sendTwinRequest(method: string, resource: string, properties: {
        [key: string]: any;
    }, body: any, done?: (err?: Error, result?: any) => void): void;
}
export interface MethodMessage {
    methods: {
        methodName: string;
    };
    requestId: string;
    properties: {
        [key: string]: string;
    };
    body: Buffer;
    verb: string;
}
export interface DeviceMethodTransport extends Transport {
    sendMethodResponse(response: DeviceMethodResponse, done?: (err?: Error, result?: any) => void): void;
}
export interface DeviceMethodReceiver extends Receiver {
    onDeviceMethod(methodName: string, callback: (message: MethodMessage) => void): void;
}
export interface ClientConfig {
    deviceId: string;
    host: string;
    hubName: string;
    symmetricKey?: string;
    sharedAccessSignature?: string | SharedAccessSignature;
    x509?: X509;
}
