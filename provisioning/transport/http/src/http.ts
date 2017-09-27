// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

import { EventEmitter } from 'events';
import { RestApiClient, Http as Base } from 'azure-iot-http-base';
import { errors } from 'azure-iot-common';
import * as machina from 'machina';
import { ClientRequest } from 'http';

export type ProvisioningResponseCallback = (err: Error, result?: any) => void;

export class Http extends EventEmitter {

  private _idScope: string;
  private _registrationId: string;
  private _body: any;
  private _forceRegistration: boolean;
  private _operationId: string;

  private _fsm: machina.Fsm;
  private _apiVersion: string = '2016-11-14';
  private _provisioningServer: string = 'https://global.azure-devices-provisioning.net';
  private _httpTimeout: number = 4000;
  private _operationStatusPollingInterval: number = 5000;
  private _pollingTimer: any;
  private _currentHttpRequest: ClientRequest;
  private _restApiClient: RestApiClient;

  // TODO: how to get the user agent string into here?

  /**
   * @private
   * @constructor
   * @param config The configuration object.
   */
  /* Codes_SRS_NODE_PROVISIONING_HTTP_18_001: [ The `Http` constructor shall accept the following properties:
  - `idScope` - a string specifiying the scope of the provisioning operations,
  - `registrationId` - the registration id for the specific device ] */
  constructor(idScope: string, registrationId: string, httpBase?: Base) {
    super();
    this._idScope = idScope;
    this._registrationId = registrationId;

    this._fsm = new machina.Fsm({
      namespace: 'http-provisioning',
      initialState: 'idle',
      states: {
        idle: {
          _onEnter: () => {
            this._pollingTimer = null;
            this._currentHttpRequest = null;
            this._restApiClient = null;
            this._body = null;
            this._forceRegistration = false;
            this._operationId = '';
          },
          register: (authorization, forceRegistration, body, callback) => {
            this._forceRegistration = forceRegistration;
            this._body = body;
            this._restApiClient = new RestApiClient({ 'host' : this._provisioningServer , 'sharedAccessSignature' : authorization}, 'azure-node-provisioning', httpBase);
            this._fsm.transition('registering', callback);
          },
          disconnect : (callback) => {
            // nothing to do.
            this._safeCallback(callback);
          }
        },
        registering: {
          _onEnter: (callback) => {
            this._sendRegistrationRequest((err, responseBody) => {
              if (err) {
                this._safeCallback(callback, err);
                this._fsm.transition('idle');
              } else if (this._isAssigning(responseBody)) {
                  /* Codes_SRS_NODE_PROVISIONING_HTTP_18_016: [ If the registration response has a success code with a 'status' of 'Assigning', `register` shall fire an `operationStatus` event with the deserialized body ] */
                  this.emit('operationStatus', responseBody);
                  /* Codes_SRS_NODE_PROVISIONING_HTTP_18_017: [ If the registration response has a success code with a 'status' of 'Assigning', `register` shall start polling for operation updates ] */
                  this._operationId = this._getOperationId(responseBody);
                  this._fsm.transition('waiting_to_poll', callback);
              } else if (this._isAssigned(responseBody)) {
                /* Codes_SRS_NODE_PROVISIONING_HTTP_18_015: [ If the registration response has a success code with a 'status' of 'Assigned', `register` call the `callback` with `err` == `null` and result `containing` the deserialized body ] */
                callback(null, responseBody);
                this._fsm.transition('idle');
              } else {
                /* Codes_SRS_NODE_PROVISIONING_HTTP_18_029: [ If the registration response has a success code with a 'status' that is not 'Assigned' or  'Assigning', `register` shall call the callback with a `SyntaxError` error. ] */
                this._safeCallback(callback, new SyntaxError('badly formed registration response'));
                this._fsm.transition('idle');
              }
            });
          },
          register: (authorization, forceRegistration, body, callback) => {
            /* Codes_SRS_NODE_PROVISIONING_HTTP_18_036: [ `register` shall call the `callback` with an `InvalidOperationError` if it is called while a previous registration is in progress. ] */
            callback(new errors.InvalidOperationError('registration already in progress.'));
          },
          disconnect : (callback) => {
            this._cancelCurrentOperation((err) => {
              this._fsm.transition('idle');
              this._safeCallback(callback);
            });
          }
        },
        waiting_to_poll: {
          _onEnter: (callback) => {
            /* Codes_SRS_NODE_PROVISIONING_HTTP_18_018: [ `register` shall poll for operation status every `operationStatusPollingInterval` milliseconds ] */
            this._pollingTimer = setTimeout(() => {
              this._fsm.transition('polling',  callback);
            }, this._operationStatusPollingInterval);
            /* TODO: Codes_SRS_NODE_PROVISIONING_HTTP_18_033: [ If `disconnect` is called while the register is waiting between polls, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
          },
          register: (authorization, forceRegistration, body, callback) => {
            /* Codes_SRS_NODE_PROVISIONING_HTTP_18_036: [ `register` shall call the `callback` with an `InvalidOperationError` if it is called while a previous registration is in progress. ] */
            callback(new errors.InvalidOperationError('registration already in progress.'));
          },
          disconnect : (callback) => {
            this._cancelCurrentOperation((err) => {
              this._fsm.transition('idle');
              this._safeCallback(callback);
            });
          }
        },
        polling: {
          _onEnter: (callback) => {
            this._sendOperationStatusRequest((err, body) => {
              if (err) {
                this._safeCallback(callback, err);
                this._fsm.transition('idle');
              } else if (this._isAssigning(body)) {
                /* Codes_SRS_NODE_PROVISIONING_HTTP_18_028: [ If the operation status response contains a success status code with a 'status' that is 'Assigning', `register` shall fire an `operationStatus` event with the deserialized body and continue polling. ] */
                this.emit('operationStatus', body);
                this._fsm.transition('waiting_to_poll', callback);
              } else if (this._isAssigned(body)) {
                /* Codes_SRS_NODE_PROVISIONING_HTTP_18_027: [ If the operation status response contains a success status code with a 'status' of 'Assigned', `register` shall stop polling and call the `callback` with `err` == null and the body containing the deserialized body. ] */
                callback(null, body);
                this._fsm.transition('idle');
              } else {
                /* Codes_SRS_NODE_PROVISIONING_HTTP_18_030: [ If the operation status response has a success code with a 'status' that is not 'Assigned' or  'Assigning', `register` shall call the callback with a `SyntaxError` error and stop polling. ] */
                this._safeCallback(callback, new SyntaxError('badly formed registration response'));
                this._fsm.transition('idle');
              }
            });
          },
          register: (authorization, forceRegistration, body, callback) => {
            /* Codes_SRS_NODE_PROVISIONING_HTTP_18_036: [ `register` shall call the `callback` with an `InvalidOperationError` if it is called while a previous registration is in progress. ] */
            callback(new errors.InvalidOperationError('registration already in progress.'));
          },
          disconnect : (callback) => {
            this._cancelCurrentOperation((err) => {
              this._fsm.transition('idle');
              this._safeCallback(callback);
            });
          }
        }
      }
    });
  }

  register(authorization: string, forceRegistration: boolean, body: any, callback: ProvisioningResponseCallback): void {
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_002: [ `register` shall throw a `ReferenceError` if `callback` is falsy. ] */
    if (!callback) {
      throw new ReferenceError();
    }

    this._fsm.handle('register', authorization, forceRegistration, body, callback);
  }

  disconnect(callback?: (err: Error) => void): void {
    this._fsm.handle('disconnect', callback);
  }

  private _cancelCurrentOperation(callback: (err: Error) => void): void {
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_034: [ disconnect will cancel any http operations that are in progress ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_035: [ disconnect will cause polling to cease ] */
    if (this._currentHttpRequest != null) {
      this._currentHttpRequest.abort();
      this._currentHttpRequest = null;
    }
    if (this._pollingTimer != null) {
      clearTimeout(this._pollingTimer);
      this._pollingTimer = null;
    }
  }

  private _sendRegistrationRequest(callback: (err: Error, body?: any) => void): void {
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_009: [ `register` shall POST the registration request to 'https://global.azure-devices-provisioning.net/{idScope}/registrations/{registrationId}' ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_005: [ The registration request shall include the current `api-version` as a URL query string value named 'api-version'. ] */
    let path: string = '/' + this._idScope + '/registrations/' + this._registrationId + '?api-version=' + this._apiVersion;

    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_008: [ If `forceRegistration` is specified, the registration request shall include this as a query string value named 'forceRegistration' ] */
    if (this._forceRegistration) {
      path += '&forceRegistration=true';
    }

    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_006: [ The registration request shall specify the following in the Http header:
      Accept: application/json
      Content-Type: application/json; charset=utf-8 ] */
    let httpHeaders = {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json; charset=utf-8'
    };

    // TODO: requirements about body being passed and populated

    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_007: [ If an `authorization` string is specifed, it shall be URL encoded and included in the Http Authorization header. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_010: [ `register` shall wait for the response to the POST request. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_011: [ If the registration request times out, `register` shall call the `callback` with a `TimeoutError` error ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_012: [ If the registration response contains a body, `register` shall deserialize this into an object. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_013: [ If registration response body fails to deserialize, `register` will throw an `SyntaxError` error. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_014: [ If the registration response has a failed status code, `register` shall use `translateError` to translate this to a common error object and pass this into the `callback` function along with the deserialized body of the response. ] */
    this._currentHttpRequest = this._restApiClient.executeApiCall('POST', path, httpHeaders, this._body, this._httpTimeout, (err: Error, responseBody?: any, response?: any) => {
      if (err) {
        callback(err);
      } else {
        callback(null, responseBody);
      }
    });

    /* TODO: Codes_SRS_NODE_PROVISIONING_HTTP_18_031: [ If `disconnect` is called while the registration request is in progress, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
  }

  private _sendOperationStatusRequest(callback: (err: Error, body: any) => void): void {
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_022: [ operation status request polling shall be a GET operation sent to 'https://global.azure-devices-provisioning.net/{idScope}/registrations/{registrationId}/operations/{operationId}' ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_037: [ The operation status request shall include the current `api-version` as a URL query string value named 'api-version'. ] */
    let path: string = '/' + this._idScope + '/registrations/' + this._registrationId + '?api-version=' + this._apiVersion;

    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_020: [ The operation status request shall have the following in the Http header:
      Accept: application/json
      Content-Type: application/json; charset=utf-8 ] */
    let httpHeaders = {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json; charset=utf-8'
    };

    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_021: [ If an `authorization` string is specifed, it shall be URL encoded and included in the Http Authorization header of the operation status request. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_023: [ If the operation status request times out, `register` shall stop polling and call the `callback` with a `TimeoutError` error. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_024: [ `register` shall deserialize the body of the operation status response into an object. ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_025: [ If the body of the operation status response fails to deserialize, `register` will throw an `SyntaxError` error. . ] */
    /* Codes_SRS_NODE_PROVISIONING_HTTP_18_026: [ If the operation status response contains a failure status code, `register` shall stop polling and call the `callback` with an error created using `translateError`. ] */
    this._currentHttpRequest = this._restApiClient.executeApiCall('GET', path, httpHeaders, this._body, this._httpTimeout, (err: Error, responseBody?: any, response?: any) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, responseBody);
      }
    });

    /* TODO: Codes_SRS_NODE_PROVISIONING_HTTP_18_032: [ If `disconnect` is called while the operation status request is in progress, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
  }

  private _safeCallback(callback: (error2?: Error | null, result2?: any) => void, error?: Error | null, result?: any): void {
    if (callback) {
      process.nextTick(() => callback(error, result));
    }
  }

  private _isAssigning(body: any): boolean {
    return body.status.toLowerCase() === 'assigning';
  }

  private _isAssigned(body: any): boolean {
    return body.status.toLowerCase() === 'assigned';
  }

  private _getOperationId(body: any): string {
    return body.operationId;
  }
}



