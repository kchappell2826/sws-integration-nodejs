/*

 Copyright (c) 2013, CoreLogic, Inc. All rights reserved.
 Redistribution and use in source and binary forms, with or without modification, are permitted
 provided that the following conditions are met:

     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.

     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.

     * Neither the name of CoreLogic nor the names of its
       contributors may be used to endorse or promote products derived from
       this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.

 */

var http = require("http");

var hostOptions = {
    "host": "",
    "port": ""
};

/**
 * Function used internal to this module, creates a request options object.
 *
 * @param path
 * @param method
 * @returns {{host: string, port: string, path: *, method: *, headers: {Content-Type: string, Accept: string}}}
 *
 */
function getRequestOptions(path, method) {
    return {
        "host": hostOptions.host,
        "port": hostOptions.port,
        "path": path,
        "method": method,
        "headers": {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }
}

/**
 * Authenticates against CoreLogic Spatial Solutions using the given username and password. Callback is executed on
 * success or failure. In the case of success, the error object will be null and the jsonResponse object will be populated.
 * In the case of failure, the error object will be populated and the jsonResponse object will be null.
 *
 * @param username
 * @param password
 * @param callback
 *
 */
function authenticate(username, password, callback) {
    console.log("Attempting authentication ...");

    var credentials = JSON.stringify({
        "username": username,
        "password": password
    });

    var requestOptions = getRequestOptions("/api/authenticate", "POST");

    console.log("SWS Authentication URL  : [POST] http://" + requestOptions.host + requestOptions.path);

    var request = http.request(requestOptions, function(response) {

        response.on("data", function (chunk) {
            console.log("Received response from CoreLogic SWS.");

            var jsonResponse = JSON.parse(chunk);

            if(jsonResponse && jsonResponse.authKey && callback) {
                console.log("Successful authentication!");
                (callback)(null, jsonResponse);
            }else if(callback){
                var error = new Error("Authentication request failed.");
                (callback)(error, jsonResponse);
            }
        });

    });

    request.write(credentials);
    request.end();
}

/**
 * Performs a Geocode query against CoreLogic Spatial Solutions using the given authkey, address line, and city line parameters.
 * Callback is executed on success or failure. In the case of success, the error object will be null and the jsonResponse object will
 * be populated. In the case of failure, the error object will populated and the jsonResponse object will be null.
 *
 * @param authkey
 * @param addressline
 * @param cityline
 * @param callback
 *
 */
function geocode(authKey, addressline, cityline, callback) {
    var unencodedUrl = "/api/geocode?address=$addressline&city=$cityLine&authKey=$authKey";
    var url = "/api/geocode" +
              "?address=" + encodeURIComponent(addressline) +
              "&city=" + encodeURIComponent(cityline) +
              "&authKey=" + authKey;

    var requestOptions = getRequestOptions(url, "GET");

    console.log("SWS Geocode unencoded URL: [GET] http://" + requestOptions.host + unencodedUrl);
    console.log("SWS Geocode encoded URL  : [GET] http://" + requestOptions.host + requestOptions.path);

    var request = http.request(requestOptions, function(response) {

        response.on("data", function (chunk) {
            var jsonResponse = JSON.parse(chunk);

            if(jsonResponse && callback) {
                (callback)(null, jsonResponse);
            }else if(callback){
                var error = new Error("Geocode request failed.");
                (callback)(error, jsonResponse);
            }
        });
    });

    request.end();
}

module.exports.hostOptions = hostOptions;
module.exports.authenticate = authenticate;
module.exports.geocode = geocode;