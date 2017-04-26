// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

import { SharedAccessSignature as Base } from 'azure-iot-common';

export class SharedAccessSignature {
  static create(host: string, policy: string, key: string, expiry: string | number): Base {
    /*Codes_SRS_NODE_IOTHUB_SAS_05_003: [The create method shall return the result of calling azure-iot-common.SharedAccessSignature.create with following arguments:
    resourceUri - host
    keyName - policy
    key - key
    expiry - expiry]*/
    return Base.create(host, policy, key, expiry);
  }

  static parse(source: string): Base {
    /*Codes_SRS_NODE_IOTHUB_SAS_05_001: [The parse method shall return the result of calling azure-iot-common.SharedAccessSignature.parse.]*/
    /*Codes_SRS_NODE_IOTHUB_SAS_05_002: [It shall throw ArgumentError if any of 'sr', 'sig', 'skn' or 'se' fields are not found in the source argument.]*/
    return Base.parse(source, ['sr', 'sig', 'skn', 'se']);
  }
}
