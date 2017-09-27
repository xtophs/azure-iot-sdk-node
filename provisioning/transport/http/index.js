// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Http = require('./lib/http.js').Http;

/**
 * The `azure-iot-device-http` module provides support for the HTTPS protocol to the device [client]{@link module:azure-iot-device.Client}.
 *
 * @module azure-iot-provisioning-http
 * @requires module:azure-iot-http-base
 */

module.exports = {
  Http: Http
};