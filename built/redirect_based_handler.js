"use strict";
/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
var authorization_request_1 = require("./authorization_request");
var authorization_request_handler_1 = require("./authorization_request_handler");
var authorization_response_1 = require("./authorization_response");
var crypto_utils_1 = require("./crypto_utils");
var logger_1 = require("./logger");
var query_string_utils_1 = require("./query_string_utils");
var storage_1 = require("./storage");
/** key for authorization request. */
var authorizationRequestKey = function (handle) {
    return handle + "_appauth_authorization_request";
};
/** key for authorization service configuration */
var authorizationServiceConfigurationKey = function (handle) {
    return handle + "_appauth_authorization_service_configuration";
};
/** key in local storage which represents the current authorization request. */
var AUTHORIZATION_REQUEST_HANDLE_KEY = 'appauth_current_authorization_request';
/**
 * Represents an AuthorizationRequestHandler which uses a standard
 * redirect based code flow.
 */
var RedirectRequestHandler = /** @class */ (function (_super) {
    __extends(RedirectRequestHandler, _super);
    function RedirectRequestHandler(
    // use the provided storage backend
    // or initialize local storage with the default storage backend which
    // uses window.localStorage
    storageBackend, utils, locationLike, generateRandom) {
        if (storageBackend === void 0) { storageBackend = new storage_1.LocalStorageBackend(); }
        if (utils === void 0) { utils = new query_string_utils_1.BasicQueryStringUtils(); }
        if (locationLike === void 0) { locationLike = window.location; }
        if (generateRandom === void 0) { generateRandom = crypto_utils_1.cryptoGenerateRandom; }
        var _this = _super.call(this, utils, generateRandom) || this;
        _this.storageBackend = storageBackend;
        _this.locationLike = locationLike;
        return _this;
    }
    RedirectRequestHandler.prototype.performAuthorizationRequest = function (configuration, request) {
        var _this = this;
        var handle = this.generateRandom();
        // before you make request, persist all request related data in local storage.
        var persisted = Promise.all([
            this.storageBackend.setItem(AUTHORIZATION_REQUEST_HANDLE_KEY, handle),
            this.storageBackend.setItem(authorizationRequestKey(handle), JSON.stringify(request.toJson())),
            this.storageBackend.setItem(authorizationServiceConfigurationKey(handle), JSON.stringify(configuration.toJson())),
        ]);
        persisted.then(function () {
            // make the redirect request
            var url = _this.buildRequestUrl(configuration, request);
            logger_1.log('Making a request to ', request, url);
            _this.locationLike.assign(url);
        });
    };
    /**
     * Attempts to introspect the contents of storage backend and completes the
     * request.
     */
    RedirectRequestHandler.prototype.completeAuthorizationRequest = function () {
        var _this = this;
        // TODO(rahulrav@): handle authorization errors.
        return this.storageBackend.getItem(AUTHORIZATION_REQUEST_HANDLE_KEY).then(function (handle) {
            if (handle) {
                // we have a pending request.
                // fetch authorization request, and check state
                return _this.storageBackend
                    .getItem(authorizationRequestKey(handle))
                    // requires a corresponding instance of result
                    // TODO(rahulrav@): check for inconsitent state here
                    .then(function (result) { return JSON.parse(result); })
                    .then(function (json) { return authorization_request_1.AuthorizationRequest.fromJson(json); })
                    .then(function (request) {
                    // check redirect_uri and state
                    var currentUri = "" + _this.locationLike.origin + _this.locationLike.pathname;
                    var queryParams = _this.utils.parse(_this.locationLike, true /* use hash */);
                    var state = queryParams['state'];
                    var code = queryParams['code'];
                    var error = queryParams['error'];
                    logger_1.log('Potential authorization request ', currentUri, queryParams, state, code, error);
                    var shouldNotify = state === request.state;
                    var authorizationResponse = null;
                    var authorizationError = null;
                    if (shouldNotify) {
                        if (error) {
                            // get additional optional info.
                            var errorUri = queryParams['error_uri'];
                            var errorDescription = queryParams['error_description'];
                            authorizationError =
                                new authorization_response_1.AuthorizationError(error, errorDescription, errorUri, state);
                        }
                        else {
                            authorizationResponse = new authorization_response_1.AuthorizationResponse(code, state);
                        }
                        // cleanup state
                        return Promise
                            .all([
                            _this.storageBackend.removeItem(AUTHORIZATION_REQUEST_HANDLE_KEY),
                            _this.storageBackend.removeItem(authorizationRequestKey(handle)),
                            _this.storageBackend.removeItem(authorizationServiceConfigurationKey(handle))
                        ])
                            .then(function () {
                            logger_1.log('Delivering authorization response');
                            return {
                                request: request,
                                response: authorizationResponse,
                                error: authorizationError
                            };
                        });
                    }
                    else {
                        logger_1.log('Mismatched request (state and request_uri) dont match.');
                        return Promise.resolve(null);
                    }
                });
            }
            else {
                return null;
            }
        });
    };
    return RedirectRequestHandler;
}(authorization_request_handler_1.AuthorizationRequestHandler));
exports.RedirectRequestHandler = RedirectRequestHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXJlY3RfYmFzZWRfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWRpcmVjdF9iYXNlZF9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7Ozs7Ozs7Ozs7OztBQUVILGlFQUF1RjtBQUN2RixpRkFBK0g7QUFDL0gsbUVBQTZHO0FBRTdHLCtDQUFxRTtBQUNyRSxtQ0FBNkI7QUFDN0IsMkRBQTZFO0FBQzdFLHFDQUE4RDtBQUs5RCxxQ0FBcUM7QUFDckMsSUFBTSx1QkFBdUIsR0FDekIsVUFBQyxNQUFjO0lBQ2IsT0FBVSxNQUFNLG1DQUFnQyxDQUFDO0FBQ25ELENBQUMsQ0FBQTtBQUVMLGtEQUFrRDtBQUNsRCxJQUFNLG9DQUFvQyxHQUN0QyxVQUFDLE1BQWM7SUFDYixPQUFVLE1BQU0saURBQThDLENBQUM7QUFDakUsQ0FBQyxDQUFBO0FBRUwsK0VBQStFO0FBQy9FLElBQU0sZ0NBQWdDLEdBQUcsdUNBQXVDLENBQUM7QUFFakY7OztHQUdHO0FBQ0g7SUFBNEMsMENBQTJCO0lBQ3JFO0lBQ0ksbUNBQW1DO0lBQ25DLHFFQUFxRTtJQUNyRSwyQkFBMkI7SUFDcEIsY0FBMEQsRUFDakUsS0FBbUMsRUFDNUIsWUFBNEMsRUFDbkQsY0FBcUM7UUFIOUIsK0JBQUEsRUFBQSxxQkFBcUMsNkJBQW1CLEVBQUU7UUFDakUsc0JBQUEsRUFBQSxZQUFZLDBDQUFxQixFQUFFO1FBQzVCLDZCQUFBLEVBQUEsZUFBNkIsTUFBTSxDQUFDLFFBQVE7UUFDbkQsK0JBQUEsRUFBQSxpQkFBaUIsbUNBQW9CO1FBUHpDLFlBUUUsa0JBQU0sS0FBSyxFQUFFLGNBQWMsQ0FBQyxTQUM3QjtRQUxVLG9CQUFjLEdBQWQsY0FBYyxDQUE0QztRQUUxRCxrQkFBWSxHQUFaLFlBQVksQ0FBZ0M7O0lBR3ZELENBQUM7SUFFRCw0REFBMkIsR0FBM0IsVUFDSSxhQUFnRCxFQUNoRCxPQUE2QjtRQUZq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Y2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0XG4gKiBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlXG4gKiBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0F1dGhvcml6YXRpb25SZXF1ZXN0LCBBdXRob3JpemF0aW9uUmVxdWVzdEpzb259IGZyb20gJy4vYXV0aG9yaXphdGlvbl9yZXF1ZXN0JztcbmltcG9ydCB7QXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyLCBBdXRob3JpemF0aW9uUmVxdWVzdFJlc3BvbnNlLCBCVUlMVF9JTl9QQVJBTUVURVJTfSBmcm9tICcuL2F1dGhvcml6YXRpb25fcmVxdWVzdF9oYW5kbGVyJztcbmltcG9ydCB7QXV0aG9yaXphdGlvbkVycm9yLCBBdXRob3JpemF0aW9uUmVzcG9uc2UsIEF1dGhvcml6YXRpb25SZXNwb25zZUpzb259IGZyb20gJy4vYXV0aG9yaXphdGlvbl9yZXNwb25zZSdcbmltcG9ydCB7QXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uLCBBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb25Kc29ufSBmcm9tICcuL2F1dGhvcml6YXRpb25fc2VydmljZV9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7Y3J5cHRvR2VuZXJhdGVSYW5kb20sIFJhbmRvbUdlbmVyYXRvcn0gZnJvbSAnLi9jcnlwdG9fdXRpbHMnO1xuaW1wb3J0IHtsb2d9IGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7QmFzaWNRdWVyeVN0cmluZ1V0aWxzLCBRdWVyeVN0cmluZ1V0aWxzfSBmcm9tICcuL3F1ZXJ5X3N0cmluZ191dGlscyc7XG5pbXBvcnQge0xvY2FsU3RvcmFnZUJhY2tlbmQsIFN0b3JhZ2VCYWNrZW5kfSBmcm9tICcuL3N0b3JhZ2UnO1xuaW1wb3J0IHtMb2NhdGlvbkxpa2UsIFN0cmluZ01hcH0gZnJvbSAnLi90eXBlcyc7XG5cblxuXG4vKioga2V5IGZvciBhdXRob3JpemF0aW9uIHJlcXVlc3QuICovXG5jb25zdCBhdXRob3JpemF0aW9uUmVxdWVzdEtleSA9XG4gICAgKGhhbmRsZTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gYCR7aGFuZGxlfV9hcHBhdXRoX2F1dGhvcml6YXRpb25fcmVxdWVzdGA7XG4gICAgfVxuXG4vKioga2V5IGZvciBhdXRob3JpemF0aW9uIHNlcnZpY2UgY29uZmlndXJhdGlvbiAqL1xuY29uc3QgYXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uS2V5ID1cbiAgICAoaGFuZGxlOiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiBgJHtoYW5kbGV9X2FwcGF1dGhfYXV0aG9yaXphdGlvbl9zZXJ2aWNlX2NvbmZpZ3VyYXRpb25gO1xuICAgIH1cblxuLyoqIGtleSBpbiBsb2NhbCBzdG9yYWdlIHdoaWNoIHJlcHJlc2VudHMgdGhlIGN1cnJlbnQgYXV0aG9yaXphdGlvbiByZXF1ZXN0LiAqL1xuY29uc3QgQVVUSE9SSVpBVElPTl9SRVFVRVNUX0hBTkRMRV9LRVkgPSAnYXBwYXV0aF9jdXJyZW50X2F1dGhvcml6YXRpb25fcmVxdWVzdCc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBdXRob3JpemF0aW9uUmVxdWVzdEhhbmRsZXIgd2hpY2ggdXNlcyBhIHN0YW5kYXJkXG4gKiByZWRpcmVjdCBiYXNlZCBjb2RlIGZsb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdFJlcXVlc3RIYW5kbGVyIGV4dGVuZHMgQXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvLyB1c2UgdGhlIHByb3ZpZGVkIHN0b3JhZ2UgYmFja2VuZFxuICAgICAgLy8gb3IgaW5pdGlhbGl6ZSBsb2NhbCBzdG9yYWdlIHdpdGggdGhlIGRlZmF1bHQgc3RvcmFnZSBiYWNrZW5kIHdoaWNoXG4gICAgICAvLyB1c2VzIHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgICAgIHB1YmxpYyBzdG9yYWdlQmFja2VuZDogU3RvcmFnZUJhY2tlbmQgPSBuZXcgTG9jYWxTdG9yYWdlQmFja2VuZCgpLFxuICAgICAgdXRpbHMgPSBuZXcgQmFzaWNRdWVyeVN0cmluZ1V0aWxzKCksXG4gICAgICBwdWJsaWMgbG9jYXRpb25MaWtlOiBMb2NhdGlvbkxpa2UgPSB3aW5kb3cubG9jYXRpb24sXG4gICAgICBnZW5lcmF0ZVJhbmRvbSA9IGNyeXB0b0dlbmVyYXRlUmFuZG9tKSB7XG4gICAgc3VwZXIodXRpbHMsIGdlbmVyYXRlUmFuZG9tKTtcbiAgfVxuXG4gIHBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdChcbiAgICAgIGNvbmZpZ3VyYXRpb246IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbixcbiAgICAgIHJlcXVlc3Q6IEF1dGhvcml6YXRpb25SZXF1ZXN0KSB7XG4gICAgbGV0IGhhbmRsZSA9IHRoaXMuZ2VuZXJhdGVSYW5kb20oKTtcbiAgICAvLyBiZWZvcmUgeW91IG1ha2UgcmVxdWVzdCwgcGVyc2lzdCBhbGwgcmVxdWVzdCByZWxhdGVkIGRhdGEgaW4gbG9jYWwgc3RvcmFnZS5cbiAgICBsZXQgcGVyc2lzdGVkID0gUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5zdG9yYWdlQmFja2VuZC5zZXRJdGVtKEFVVEhPUklaQVRJT05fUkVRVUVTVF9IQU5ETEVfS0VZLCBoYW5kbGUpLFxuICAgICAgdGhpcy5zdG9yYWdlQmFja2VuZC5zZXRJdGVtKFxuICAgICAgICAgIGF1dGhvcml6YXRpb25SZXF1ZXN0S2V5KGhhbmRsZSksIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QudG9Kc29uKCkpKSxcbiAgICAgIHRoaXMuc3RvcmFnZUJhY2tlbmQuc2V0SXRlbShcbiAgICAgICAgICBhdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb25LZXkoaGFuZGxlKSwgSlNPTi5zdHJpbmdpZnkoY29uZmlndXJhdGlvbi50b0pzb24oKSkpLFxuICAgIF0pO1xuXG4gICAgcGVyc2lzdGVkLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gbWFrZSB0aGUgcmVkaXJlY3QgcmVxdWVzdFxuICAgICAgbGV0IHVybCA9IHRoaXMuYnVpbGRSZXF1ZXN0VXJsKGNvbmZpZ3VyYXRpb24sIHJlcXVlc3QpO1xuICAgICAgbG9nKCdNYWtpbmcgYSByZXF1ZXN0IHRvICcsIHJlcXVlc3QsIHVybCk7XG4gICAgICB0aGlzLmxvY2F0aW9uTGlrZS5hc3NpZ24odXJsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBpbnRyb3NwZWN0IHRoZSBjb250ZW50cyBvZiBzdG9yYWdlIGJhY2tlbmQgYW5kIGNvbXBsZXRlcyB0aGVcbiAgICogcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBjb21wbGV0ZUF1dGhvcml6YXRpb25SZXF1ZXN0KCk6IFByb21pc2U8QXV0aG9yaXphdGlvblJlcXVlc3RSZXNwb25zZXxudWxsPiB7XG4gICAgLy8gVE9ETyhyYWh1bHJhdkApOiBoYW5kbGUgYXV0aG9yaXphdGlvbiBlcnJvcnMuXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZUJhY2tlbmQuZ2V0SXRlbShBVVRIT1JJWkFUSU9OX1JFUVVFU1RfSEFORExFX0tFWSkudGhlbihoYW5kbGUgPT4ge1xuICAgICAgaWYgKGhhbmRsZSkge1xuICAgICAgICAvLyB3ZSBoYXZlIGEgcGVuZGluZyByZXF1ZXN0LlxuICAgICAgICAvLyBmZXRjaCBhdXRob3JpemF0aW9uIHJlcXVlc3QsIGFuZCBjaGVjayBzdGF0ZVxuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlQmFja2VuZFxuICAgICAgICAgICAgLmdldEl0ZW0oYXV0aG9yaXphdGlvblJlcXVlc3RLZXkoaGFuZGxlKSlcbiAgICAgICAgICAgIC8vIHJlcXVpcmVzIGEgY29ycmVzcG9uZGluZyBpbnN0YW5jZSBvZiByZXN1bHRcbiAgICAgICAgICAgIC8vIFRPRE8ocmFodWxyYXZAKTogY2hlY2sgZm9yIGluY29uc2l0ZW50IHN0YXRlIGhlcmVcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiBKU09OLnBhcnNlKHJlc3VsdCEpKVxuICAgICAgICAgICAgLnRoZW4oanNvbiA9PiBBdXRob3JpemF0aW9uUmVxdWVzdC5mcm9tSnNvbihqc29uKSlcbiAgICAgICAgICAgIC50aGVuKHJlcXVlc3QgPT4ge1xuICAgICAgICAgICAgICAvLyBjaGVjayByZWRpcmVjdF91cmkgYW5kIHN0YXRlXG4gICAgICAgICAgICAgIGxldCBjdXJyZW50VXJpID0gYCR7dGhpcy5sb2NhdGlvbkxpa2Uub3JpZ2lufSR7dGhpcy5sb2NhdGlvbkxpa2UucGF0aG5hbWV9YDtcbiAgICAgICAgICAgICAgbGV0IHF1ZXJ5UGFyYW1zID0gdGhpcy51dGlscy5wYXJzZSh0aGlzLmxvY2F0aW9uTGlrZSwgdHJ1ZSAvKiB1c2UgaGFzaCAqLyk7XG4gICAgICAgICAgICAgIGxldCBzdGF0ZTogc3RyaW5nfHVuZGVmaW5lZCA9IHF1ZXJ5UGFyYW1zWydzdGF0ZSddO1xuICAgICAgICAgICAgICBsZXQgY29kZTogc3RyaW5nfHVuZGVmaW5lZCA9IHF1ZXJ5UGFyYW1zWydjb2RlJ107XG4gICAgICAgICAgICAgIGxldCBlcnJvcjogc3RyaW5nfHVuZGVmaW5lZCA9IHF1ZXJ5UGFyYW1zWydlcnJvciddO1xuICAgICAgICAgICAgICBsb2coJ1BvdGVudGlhbCBhdXRob3JpemF0aW9uIHJlcXVlc3QgJywgY3VycmVudFVyaSwgcXVlcnlQYXJhbXMsIHN0YXRlLCBjb2RlLCBlcnJvcik7XG4gICAgICAgICAgICAgIGxldCBzaG91bGROb3RpZnkgPSBzdGF0ZSA9PT0gcmVxdWVzdC5zdGF0ZTtcbiAgICAgICAgICAgICAgbGV0IGF1dGhvcml6YXRpb25SZXNwb25zZTogQXV0aG9yaXphdGlvblJlc3BvbnNlfG51bGwgPSBudWxsO1xuICAgICAgICAgICAgICBsZXQgYXV0aG9yaXphdGlvbkVycm9yOiBBdXRob3JpemF0aW9uRXJyb3J8bnVsbCA9IG51bGw7XG4gICAgICAgICAgICAgIGlmIChzaG91bGROb3RpZnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIC8vIGdldCBhZGRpdGlvbmFsIG9wdGlvbmFsIGluZm8uXG4gICAgICAgICAgICAgICAgICBsZXQgZXJyb3JVcmkgPSBxdWVyeVBhcmFtc1snZXJyb3JfdXJpJ107XG4gICAgICAgICAgICAgICAgICBsZXQgZXJyb3JEZXNjcmlwdGlvbiA9IHF1ZXJ5UGFyYW1zWydlcnJvcl9kZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQXV0aG9yaXphdGlvbkVycm9yKGVycm9yLCBlcnJvckRlc2NyaXB0aW9uLCBlcnJvclVyaSwgc3RhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uUmVzcG9uc2UgPSBuZXcgQXV0aG9yaXphdGlvblJlc3BvbnNlKGNvZGUsIHN0YXRlISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNsZWFudXAgc3RhdGVcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICAuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2VCYWNrZW5kLnJlbW92ZUl0ZW0oQVVUSE9SSVpBVElPTl9SRVFVRVNUX0hBTkRMRV9LRVkpLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZUJhY2tlbmQucmVtb3ZlSXRlbShhdXRob3JpemF0aW9uUmVxdWVzdEtleShoYW5kbGUpKSxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2VCYWNrZW5kLnJlbW92ZUl0ZW0oYXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uS2V5KGhhbmRsZSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBsb2coJ0RlbGl2ZXJpbmcgYXV0aG9yaXphdGlvbiByZXNwb25zZScpO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IGF1dGhvcml6YXRpb25SZXNwb25zZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBhdXRob3JpemF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICB9IGFzIEF1dGhvcml6YXRpb25SZXF1ZXN0UmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZygnTWlzbWF0Y2hlZCByZXF1ZXN0IChzdGF0ZSBhbmQgcmVxdWVzdF91cmkpIGRvbnQgbWF0Y2guJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19