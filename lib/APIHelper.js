'use strict';

var https = require('https');
var parseString = require('xml2js').parseString;
var settings = require('../app/settings.js');

module.exports = function(){
    return {
        getRequest: function(){
            var options = {
                host: 'crm.zoho.com',
                port: 443,
                path: '/crm/private/json/CustomModule5/getFields?authtoken=' + settings.production.api_auth_token + '&scope=crmapi',
                method: 'GET'
            };

            console.info('Options prepared');
            console.info(options);

            var request = https.request(options, function(response){
                console.log("statusCode: ", response.statusCode);

                response.on('data', function(data){
                    console.info('GET result:\n');
                    process.stdout.write(data);
                    console.info('\n\nEND');
                });
            });

            request.end();
            request.on('error', function(error){
                console.error(error);
            });
        },
        postRequest: function(moduleName, xmlData, postOptions, postCallback){
            postOptions = postOptions || '';
             
            var options = {
                host: 'crm.zoho.com',
                port: 443,
                path: '/crm/private/xml/' + moduleName + '/insertRecords?authtoken=' + settings.production.api_auth_token + '&scope=crmapi&' + 
                      'newFormat=1&duplicateCheck=2&version=4' + postOptions + '&xmlData=' + xmlData,
                method: 'POST',
                headers: {'Content-Type': 'text/xml;charset=utf-8','charset': 'utf-8'}
            };

            // console.log(xmlData);

            var statusCode = 0;
            var request = https.request(options, function(response){
                statusCode = response.statusCode;
                var stringResponse = '';

                response.on('data', function(chunk){
                    stringResponse += chunk;
                });

                response.on('end', function(){
                    postCallback(null, statusCode, stringResponse);
                })
            });

            request.end();
            request.on('error', function(error){
                postCallback(error, statusCode, null);
            });
        },
        analyzeResponse: function(responseString, parseErrorCallback){
            parseString(responseString, function (err, result) {
                
                if (err){
                    return parseErrorCallback(err, false);
                }

                if (result.response.error){
                    return parseErrorCallback(null, false);
                } else {
                    return parseErrorCallback(null, true);
                }
            });
        }
    }
}


