import { Errors as Amqp10Errors } from 'amqp10';
export interface AmqpBaseError extends Error {
    amqpError?: Error;
}
export declare function translateError(message: string, amqpError: Amqp10Errors.BaseError): AmqpBaseError;
