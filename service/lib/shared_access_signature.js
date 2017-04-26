// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var azure_iot_common_1 = require("azure-iot-common");
var SharedAccessSignature = (function () {
    function SharedAccessSignature() {
    }
    SharedAccessSignature.create = function (host, policy, key, expiry) {
        /*Codes_SRS_NODE_IOTHUB_SAS_05_003: [The create method shall return the result of calling azure-iot-common.SharedAccessSignature.create with following arguments:
        resourceUri - host
        keyName - policy
        key - key
        expiry - expiry]*/
        return azure_iot_common_1.SharedAccessSignature.create(host, policy, key, expiry);
    };
    SharedAccessSignature.parse = function (source) {
        /*Codes_SRS_NODE_IOTHUB_SAS_05_001: [The parse method shall return the result of calling azure-iot-common.SharedAccessSignature.parse.]*/
        /*Codes_SRS_NODE_IOTHUB_SAS_05_002: [It shall throw ArgumentError if any of 'sr', 'sig', 'skn' or 'se' fields are not found in the source argument.]*/
        return azure_iot_common_1.SharedAccessSignature.parse(source, ['sr', 'sig', 'skn', 'se']);
    };
    return SharedAccessSignature;
}());
exports.SharedAccessSignature = SharedAccessSignature;
//# sourceMappingURL=shared_access_signature.js.map