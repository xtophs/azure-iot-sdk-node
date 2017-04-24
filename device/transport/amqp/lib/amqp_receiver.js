// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var azure_iot_common_1 = require("azure-iot-common");
/*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_002: [The `AmqpReceiver` object shall inherit from the `EventEmitter` node object.]*/
var AmqpReceiver = (function (_super) {
    __extends(AmqpReceiver, _super);
    function AmqpReceiver(config, amqpClient, deviceMethodClient) {
        var _this = _super.call(this) || this;
        /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_001: [The `AmqpReceiver` constructor shall initialize a new instance of an `AmqpReceiver` object.]*/
        _this._config = config;
        _this._amqpClient = amqpClient;
        _this._deviceMethodClient = deviceMethodClient;
        _this._deviceMethodClient.on('errorReceived', function (err) {
            _this.emit('errorReceived', err);
        });
        _this._messagingEndpoint = azure_iot_common_1.endpoint.messagePath(encodeURIComponent(_this._config.deviceId));
        var errorListener = function (err) {
            _this.emit('errorReceived', err);
        };
        var errorListenerInitialized = false;
        /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_008: [The `AmqpReceiver` shall remove any new listener of the `message` or `errorReceived` event of the underlying message receiver if removed from its own `message` and `errorReceived` events.]*/
        _this.on('removeListener', function (eventName, eventCallback) {
            if (eventName === 'message') {
                _this._amqpClient.getReceiver(_this._messagingEndpoint, function (err, msgReceiver) {
                    msgReceiver.removeListener('message', eventCallback);
                    if (msgReceiver.listeners('message').length === 0) {
                        msgReceiver.removeListener('errorReceived', errorListener);
                        errorListenerInitialized = false;
                    }
                });
            }
        });
        /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_003: [The `AmqpReceiver` shall forward any new listener of the `message` or `errorReceived` events to the underlying message receiver.]*/
        _this.on('newListener', function (eventName, eventCallback) {
            if (eventName === 'message') {
                _this._amqpClient.getReceiver(_this._messagingEndpoint, function (err, msgReceiver) {
                    msgReceiver.on(eventName, eventCallback);
                    if (!errorListenerInitialized) {
                        msgReceiver.on('errorReceived', errorListener);
                        errorListenerInitialized = true;
                    }
                });
            }
        });
        return _this;
    }
    /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_004: [The `complete` method shall forward the `message` and `callback` arguments to the underlying message receiver.]*/
    AmqpReceiver.prototype.complete = function (msg, callback) {
        this._amqpClient.getReceiver(this._messagingEndpoint, function (err, msgReceiver) {
            msgReceiver.complete(msg, callback);
        });
    };
    /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_005: [The `reject` method shall forward the `message` and `callback` arguments to the underlying message receiver.]*/
    AmqpReceiver.prototype.reject = function (msg, callback) {
        this._amqpClient.getReceiver(this._messagingEndpoint, function (err, msgReceiver) {
            msgReceiver.reject(msg, callback);
        });
    };
    /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_006: [The `abandon` method shall forward the `message` and `callback` arguments to the underlying message receiver.]*/
    AmqpReceiver.prototype.abandon = function (msg, callback) {
        this._amqpClient.getReceiver(this._messagingEndpoint, function (err, msgReceiver) {
            msgReceiver.abandon(msg, callback);
        });
    };
    /*Codes_SRS_NODE_DEVICE_AMQP_RECEIVER_16_007: [The `onDeviceMethod` method shall forward the `methodName` and `methodCallback` arguments to the underlying `Amqp[DeviceMethodClient` object.]*/
    AmqpReceiver.prototype.onDeviceMethod = function (methodName, methodCallback) {
        this._deviceMethodClient.onDeviceMethod(methodName, methodCallback);
    };
    return AmqpReceiver;
}(events_1.EventEmitter));
exports.AmqpReceiver = AmqpReceiver;
//# sourceMappingURL=amqp_receiver.js.map