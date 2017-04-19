import { ConnectionString as Base } from 'azure-iot-common';
export declare class ConnectionString {
    static parse(source: string): Base;
    static createWithSharedAccessKey(hostName: string, deviceId: string, symmetricKey: string): string;
    static createWithX509Certificate(hostName: string, deviceId: string): string;
}
