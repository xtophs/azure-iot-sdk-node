// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var Http = require('../lib/http.js').Http;
var errors = require('azure-iot-common').errors;

describe('Http', function () {
  var fakeErrorString = "__fake_error__";
  var fakeScope = '__scope__';
  var fakeRegistrationId = '__registrationId__';
  var fakeAuthorization = '__authorization__'
  var fakeBody = JSON.stringify({
    'fake' : 'yep'
  });
  var fakeAssignedStatus = JSON.stringify({
    'status' : 'Assigned'
  });

  var fakeRequest = {
    setTimeout: sinon.spy(),
    write:  sinon.spy(),
    end: sinon.spy(),
    abort: sinon.spy()
  };
  
  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_001: [ The `Http` constructor shall accept the following properties:
  - `idScope` - a string specifiying the scope of the provisioning operations,
  - `registrationId` - the registration id for the specific device ] */
  it ('accepts the right arguments', function() {
    var http = new Http(fakeScope, fakeRegistrationId, null);
  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_002: [ `register` shall throw a `ReferenceError` if `callback` is falsy. ] */
  [undefined, null].forEach(function(badCallback) {
    it('throws a ReferenceError if \'callback\' is \'' + badCallback + '\'', function() {
      var http = new Http(fakeScope, fakeRegistrationId, null);
      assert.throws(function() {
        http.register(fakeAuthorization, false, fakeBody, badCallback)
      }, ReferenceError);
    });
  });
  
  it('builds the http request correctly', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_006: [ The registration request shall specify the following in the Http header:
        Accept: application/json
        Content-Type: application/json; charset=utf-8 ] */
      assert.equal(httpHeaders['Accept'], 'application/json');
      assert.equal(httpHeaders['Content-Type'], 'application/json; charset=utf-8')

      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_007: [ If an `authorization` string is specifed, it shall be URL encoded and included in the Http Authorization header. ] */
      assert.equal(httpHeaders['Authorization'], fakeAuthorization);

      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_009: [ `register` shall POST the registration request to 'https://global.azure-devices-provisioning.net/{idScope}/registrations/{registrationId}' ] */
      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_005: [ The registration request shall include the current `api-version` as a URL query string value named 'api-version'. ] */
      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_008: [ If `forceRegistration` is specified, the registration request shall include this as a query string value named 'forceRegistration' ] */
      assert.equal(method, 'POST');
      assert.equal(host, 'https://global.azure-devices-provisioning.net')
      assert.equal(path, '/' + fakeScope + '/registrations/' + fakeRegistrationId + '?api-version=2016-11-14&forceRegistration=true');

      done(null, fakeAssignedStatus);

      return fakeRequest;
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.equal(null, err);
      testCallback();
    });
  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_036: [ `register` shall call the `callback` with an `InvalidOperationError` if it is called while a previous registration is in progress. ] */
  it ('fails if a registration is in progress', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      // do not call done.  do not pass go.  do not collect $200.
      return fakeRequest;
    };
    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      // should never complete because the above request function never calls done
      /* Tests_SRS_NODE_PROVISIONING_HTTP_18_010: [ `register` shall wait for the response to the POST request. ] */
      assert.fail();
    });

    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.instanceOf(err, errors.InvalidOperationError);
      testCallback();
    });
  });

  // TODO: rename REQ from TimeoutError to pass through
  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_011: [ If the registration request times out, `register` shall call the `callback` with a `TimeoutError` error ] */
  it ('fails on timeout', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      done(new Error(fakeErrorString));
      return fakeRequest;
    };
    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.equal(fakeErrorString, err.message);
      testCallback();
    });
  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_031: [ If `disconnect` is called while the registration request is in progress, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
  it('fails if if disconnected while registration request is in progress', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      // do not call done.  do not pass go.  do not collect $200.
      var myFakeRequest = {
        setTimeout: sinon.spy(),
        write:  sinon.spy(),
        end: sinon.spy(),
        abort:() => {
          done(new errors.OperationCancelledError());
        }
      };
      return myFakeRequest;
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.instanceOf(err, errors.OperationCancelledError);
      testCallback();
    });

    http.disconnect();
  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_013: [ If registration response body fails to deserialize, `register` will throw an `SyntaxError` error. ] */
  it ('throws if POST response body fails to parse', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      assert.throws( function() {
        done(null, '}body that fails to parse{');
      }, SyntaxError);
      testCallback();
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      // register should not complete because of assertion above
      assert.fail();
    });

  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_014: [ If the registration response has a failed status code, `register` shall use `translateError` to translate this to a common error object and pass this into the `callback` function along with the deserialized body of the response. ] */
  it ('fails correctly if the POST response fails', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      done(new Error(), '{}');
      return fakeRequest;
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.instanceOf(err, Error);
      testCallback();
    });

  });

  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_012: [ If the registration response contains a body, `register` shall deserialize this into an object. ] */
  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_015: [ If the registration response has a success code with a 'status' of 'Assigned', `register` call the `callback` with `err` == `null` and result `containing` the deserialized body ] */
  it ('completes if the POST response is Assigned', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      done(null, '{"status" : "Assigned" }');
      return fakeRequest;
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
      assert.isNull(err);
      assert.equal('Assigned', result.status);
      testCallback();
    });
  });

  // TODO: throw here instead
  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_029: [ If the registration response has a success code with a 'status' that is not 'Assigned' or  'Assigning', `register` shall call the callback with a `SyntaxError` error. ] */
  it ('fails on syntax error', function(testCallback) {
    testCallback();
  });


  /* Tests_SRS_NODE_PROVISIONING_HTTP_18_016: [ If the registration response has a success code with a 'status' of 'Assigning', `register` shall fire an `operationStatus` event with the deserialized body ] */
  it ('fires an operationStatus event if the POST response is Assigning', function(testCallback) {
    var fakeBase = {};
    fakeBase.buildRequest = function(method, path, httpHeaders, host, done) {
      done(null, '{"status" : "Assigning" }');
      return fakeRequest;
    };

    var http = new Http(fakeScope, fakeRegistrationId, fakeBase);
    http.on('operationStatus', function(result) {
      assert.equal('Assigning', result.status);
      testCallback();
    });
    http.register(fakeAuthorization, true, fakeBody, function(err, result) {
    });
  });
    

/* Tests_SRS_NODE_PROVISIONING_HTTP_18_017: [ If the registration response has a success code with a 'status' of 'Assigning', `register` shall start polling for operation updates ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_018: [ `register` shall poll for operation status every `operationStatusPollingInterval` milliseconds ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_032: [ If `disconnect` is called while the operation status request is in progress, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_033: [ If `disconnect` is called while the register is waiting between polls, `register` shall call the `callback` with an `OperationCancelledError` error. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_037: [ The operation status request shall include the current `api-version` as a URL query string value named 'api-version'. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_020: [ The operation status request shall have the following in the Http header:
  Accept: application/json
  Content-Type: application/json; charset=utf-8 ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_021: [ If an `authorization` string is specifed, it shall be URL encoded and included in the Http Authorization header of the operation status request. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_022: [ operation status request polling shall be a GET operation sent to 'https://global.azure-devices-provisioning.net/{idScope}/registrations/{registrationId}/operations/{operationId}' ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_023: [ If the operation status request times out, `register` shall stop polling and call the `callback` with a `TimeoutError` error. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_024: [ `register` shall deserialize the body of the operation status response into an object. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_025: [ If the body of the operation status response fails to deserialize, `register` will throw an `SyntaxError` error. . ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_026: [ If the operation status response contains a failure status code, `register` shall stop polling and call the `callback` with an error created using `translateError`. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_027: [ If the operation status response contains a success status code with a 'status' of 'Assigned', `register` shall stop polling and call the `callback` with `err` == null and the body containing the deserialized body. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_028: [ If the operation status response contains a success status code with a 'status' that is 'Assigning', `register` shall fire an `operationStatus` event with the deserialized body and continue polling. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_030: [ If the operation status response has a success code with a 'status' that is not 'Assigned' or  'Assigning', `register` shall call the callback with a `SyntaxError` error and stop polling. ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_034: [ disconnect will cancel any http operations that are in progress ] */
/* Tests_SRS_NODE_PROVISIONING_HTTP_18_035: [ disconnect will cause polling to cease ] */

});
