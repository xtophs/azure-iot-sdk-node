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
var machina = require("machina");
var dbg = require("debug");
var debug = dbg('azure-iot-device-amqp.AmqpDeviceMethodClient');
var azure_iot_common_1 = require("azure-iot-common");
var methodMessagePropertyKeys = {
    methodName: 'IoThub-methodname',
    status: 'IoThub-status'
};
var AmqpDeviceMethodClient = (function (_super) {
    __extends(AmqpDeviceMethodClient, _super);
    function AmqpDeviceMethodClient(config, amqpClient) {
        var _this = _super.call(this) || this;
        /*Codes_SRS_NODE_AMQP_DEVICE_METHOD_CLIENT_16_001: [The `AmqpDeviceMethodClient` shall throw a `ReferenceError` if the `config` argument is falsy.]*/
        if (!config) {
            throw new ReferenceError('\'config\' cannot be \'' + config + '\'');
        }
        /*Codes_SRS_NODE_AMQP_DEVICE_METHOD_CLIENT_16_002: [The `AmqpDeviceMethodClient` shall throw a `ReferenceError` if the `amqpClient` argument is falsy.]*/
        if (!amqpClient) {
            throw new ReferenceError('\'amqpClient\' cannot be \'' + amqpClient + '\'');
        }
        /*Codes_SRS_NODE_AMQP_DEVICE_METHOD_CLIENT_16_003: [The `AmqpDeviceMethodClient` shall inherit from the `EventEmitter` class.]*/
        _this._config = config;
        _this._amqpClient = amqpClient;
        /*Codes_SRS_NODE_AMQP_DEVICE_METHOD_CLIENT_16_017: [The endpoint used to for the sender and receiver link shall be `/devices/<device-id>/methods/devicebound`.]*/
        _this._methodEndpoint = azure_iot_common_1.endpoint.devicePath(encodeURIComponent(_this._config.deviceId)) + '/methods/devicebound';
        _this._methodReceiverInitialized = false;
        _this._fsm = new machina.Fsm({
            namespace: 'device-method-client',
            initialState: 'disconnected',
            states: {
                'disconnected': {
                    sendMethodResponse: function () {
                        _this._fsm.deferUntilTransition('connected');
                        _this._fsm.transition('connecting');
                    },
                    onDeviceMethod: function () {
                        _this._fsm.deferUntilTransition('connected');
                        _this._fsm.transition('connecting');
                    }
                },
                'connecting': {
                    _onEnter: function () {
                        var linkOptions = {
                            attach: {
                                properties: {
                                    'com.microsoft:api-version': azure_iot_common_1.endpoint.apiVersion,
                                    'com.microsoft:channel-correlation-id': _this._config.deviceId
                                }
                            }
                        };
                        _this._amqpClient.attachSenderLink(_this._methodEndpoint, linkOptions, function (err) {
                            if (err) {
                                _this._fsm.transition('disconnected');
                                _this.emit('errorReceived', err);
                            }
                            else {
                                _this._amqpClient.attachReceiverLink(_this._methodEndpoint, linkOptions, function (err) {
                                    if (err) {
                                        _this._fsm.transition('disconnected');
                                        _this.emit('errorReceived', err);
                                    }
                                    else {
                                        _this._fsm.transition('connected');
                                    }
                                });
                            }
                        });
                    },
                    sendMethodResponse: function () {
                        _this._fsm.deferUntilTransition('connected');
                        _this._fsm.transition('connecting');
                    },
                    onDeviceMethod: function () {
                        _this._fsm.deferUntilTransition('connected');
                        _this._fsm.transition('connecting');
                    }
                },
                'connected': {
                    sendMethodResponse: function (response, callback) {
                        var message = new azure_iot_common_1.Message(JSON.stringify(response.payload));
                        message.correlationId = response.requestId;
                        message.properties.add(methodMessagePropertyKeys.status, response.status);
                        _this._amqpClient.send(message, _this._methodEndpoint, undefined, callback);
                    },
                    onDeviceMethod: function (methodName, methodCallback) {
                        _this._amqpClient.getReceiver(_this._methodEndpoint, function (err, methodReceiver) {
                            if (!_this._methodReceiverInitialized) {
                                methodReceiver.on('message', function (msg) {
                                    debug('got method request');
                                    debug(JSON.stringify(msg, null, 2));
                                    var methodName = msg.properties.getValue(methodMessagePropertyKeys.methodName);
                                    var methodRequest = {
                                        methods: { methodName: methodName },
                                        requestId: msg.correlationId,
                                        body: msg.getData()
                                    };
                                    debug(JSON.stringify(methodRequest, null, 2));
                                    _this.emit('method_' + methodName, methodRequest);
                                });
                                methodReceiver.on('errorReceived', function (err) { return _this.emit('errorReceived', err); });
                                _this._methodReceiverInitialized = true;
                            }
                            debug('attaching callback for method: ' + methodName);
                            _this.on('method_' + methodName, methodCallback);
                        });
                    }
                }
            }
        });
        return _this;
    }
    AmqpDeviceMethodClient.prototype.sendMethodResponse = function (response, callback) {
        if (!response)
            throw new ReferenceError('response cannot be \'' + response + '\'');
        if (response.status === null || response.status === undefined)
            throw new azure_iot_common_1.errors.ArgumentError('response.status cannot be \'' + response.status + '\'');
        if (!response.requestId)
            throw new azure_iot_common_1.errors.ArgumentError('response.requestId cannot be \'' + response.requestId + '\'');
        this._fsm.handle('sendMethodResponse', response, callback);
    };
    AmqpDeviceMethodClient.prototype.onDeviceMethod = function (methodName, callback) {
        if (!methodName)
            throw new ReferenceError('methodName cannot be \'' + methodName + '\'');
        /*Codes_SRS_NODE_AMQP_DEVICE_METHOD_CLIENT_16_018: [The `onDeviceMethod` method shall throw an `ArgumentError` if the `methodName` argument is not a string.]*/
        if (typeof methodName !== 'string')
            throw new azure_iot_common_1.errors.ArgumentError('methodName must be a string');
        this._fsm.handle('onDeviceMethod', methodName, callback);
    };
    return AmqpDeviceMethodClient;
}(events_1.EventEmitter));
exports.AmqpDeviceMethodClient = AmqpDeviceMethodClient;
//# sourceMappingURL=amqp_device_method_client.js.map