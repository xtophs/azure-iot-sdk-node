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
var amqp_js_1 = require("./amqp.js");
/**
 * @class module:azure-iot-device-amqp.AmqpWs
 * @classdesc Constructs an {@linkcode AmqpWs} object that can be used on a device to send
 *            and receive messages to and from an IoT Hub instance, using the AMQP protocol over secure websockets.
 *            This class overloads the constructor of the base {@link module:azure-iot-device-amqp:Amqp} class from the AMQP transport, and inherits all methods from it.
 *
 * @augments module:azure-iot-device-amqp.Amqp
 *
 * @param {Object}  config   Configuration object generated from the connection string by the client.
 */
var AmqpWs = (function (_super) {
    __extends(AmqpWs, _super);
    function AmqpWs(config) {
        return _super.call(this, config) || this;
    }
    AmqpWs.prototype._getConnectionUri = function () {
        return 'wss://' + this._config.host + ':443/$iothub/websocket';
    };
    return AmqpWs;
}(amqp_js_1.Amqp));
exports.AmqpWs = AmqpWs;
//# sourceMappingURL=amqp_ws.js.map