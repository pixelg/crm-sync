'use strict';

var async = require('async');
var mysql = require('mysql');
var apiHelper = require('../lib/APIHelper');
var settings = require('./settings');

var guestModel = require('../models/Guest');
var propertyModel = require('../models/Property');
var reservationModel = require('../models/Reservation');

var zohoSync = function(){
	return {
		postAll: function(options){
			
			var pool = mysql.createPool({
				host: 'localhost',
				user: settings.production.db_user,
				password: settings.production.db_pass,
				database: settings.production.database,
				timezone: 'utc'
			});

			// Post guests, properties, and then reservations as the CRM requires them in that order.
			// The error should bubble up to this location no matter where it happens.
			zohoSync.postGuests(pool, options, function(error){
				if (error){
					console.log(error);
				}

				pool.end(function (err) {
				  // all connections in the pool have ended
				  console.log("END\n\n");
				});
			});

			process.on('exit', function (){
			  console.log('Goodbye!');
			});
		},
		postGuests: function(pool, options, processDoneCallback){
			// Post the guest data that hasn't been sync'd. Continue on
			// to posting properties if successful or end and send the error message
			// back to the caller if not.
			console.log(new Date() + ' - Attempting POST: ' + guestModel.getModuleName());
			zohoSync.prepareAPIPost(pool, guestModel, options, function(apiPostError){
				if (apiPostError){
					processDoneCallback(apiPostError);
				} else {
					zohoSync.postProperties(pool, options, processDoneCallback);
				}
			});
		},
		postProperties: function(pool, options, processDoneCallback){
			// Post the property data that hasn't been sync'd. Continue on
			// to posting reservations if successful.
			console.log(new Date() + ' - Attempting POST: ' + propertyModel.getModuleName());
			zohoSync.prepareAPIPost(pool, propertyModel, options, function(apiPostError){
				if (apiPostError){
					processDoneCallback(apiPostError);
				} else {
					zohoSync.postReservations(pool, options, processDoneCallback);
				}
			});
		},
		postReservations: function(pool, options, processDoneCallback){
			// Post the reservation data that hasn't been sync'd. This ends the chain.
			console.log(new Date() + ' - Attempting POST: ' + reservationModel.getModuleName());
			triggerRules = "&wfTrigger=true";
			options = (options ? options += triggerRules : triggerRules);
			zohoSync.prepareAPIPost(pool, reservationModel, options, function(apiPostError){
				if (apiPostError){
					processDoneCallback(apiPostError);
				} else {
					processDoneCallback(null);
				}
			});
		},
		prepareAPIPost: function(pool, model, options, prepareAPIPostCallback){
			pool.getConnection(function(connectionError, conn){
				// If an error happens here we should stop execution
				if (connectionError){
					return prepareAPIPostCallback(connectionError);
				}

				// Get all the data that hasn't been sync'd to the CRM.
				model.getUnsyncd(conn, function(queryError, modelData){
					// If an error happens here we should clean up and stop execution.
					if (queryError){
						conn.release();
						return prepareAPIPostCallback(queryError);
					}

					if (modelData.length === 0){
						console.log(model.getModuleName() + ' Rows upated: NOTHING TO POST.');
						return prepareAPIPostCallback(null);
					}

					// console.log(modelData);
					// console.log(model.buildXMLSchema(modelData));

					// Because the Zoho API uses the query string to post data to their CRM we need to
					// run a loop posting one row at a time so the query string isn't too long. I'm using the async
					// library here to make sure everything is processed in order. Stop processing if an error occurs
					// on any row.
					async.eachSeries(modelData, function(modelRow, rowDoneCallback){
						// Build the XML schema that the CRM is expecting from the database results.
						var xmlData = model.buildXMLSchemaSingle(modelRow);		
						
						zohoSync.postAPI(conn, modelRow, xmlData, model, options, function(postAPIError){
							if (postAPIError){
								rowDoneCallback(postAPIError);
							} else {
								rowDoneCallback();
							}
						});

					}, function(postAPIError){

						try{
							conn.release();
						} catch(e){

						}

						if (postAPIError){
							return prepareAPIPostCallback(postAPIError);
						} else {
							return prepareAPIPostCallback(null);
						}
					});
				});
			});
		},
		postAPI: function(conn, modelRow, xmlData, model, options, postAPICallback){
			// We need the module name for the API call.
			var moduleName = model.getModuleName();
			// Escape all the spaces.
			//var xmlDataEscaped = xmlData.split(' ').join('%20');
			var xmlDataEscaped = encodeURI(xmlData);
			var zohoAPIHelper = apiHelper(null);

			// Attempt to post the XML data to the CRM.
			zohoAPIHelper.postRequest(moduleName, xmlDataEscaped, options, function(postError, statusCode, stringResponse){
                // DEBUG
                console.log(xmlData);
                console.log(stringResponse);
                
				// If an error happens here we should stop execution
				if (postError){
					console.error(moduleName + ' Error:');
					console.error(postError);
					return postAPICallback(postError);
				}

				switch(statusCode){
					case 200:
						// If we get the HTTP response 200, then we need to analyze response string for errors
						// and update crm_sync field if no error messages where returned from the CRM.
						zohoAPIHelper.analyzeResponse(stringResponse, function(parseError, success){
							if (parseError){
								console.error('XML Parse Error');
								console.error("XML Data: \n");
								console.error(xmlData);
								console.error('\n');
								return postAPICallback(parseError); 
							}

							if (!success){
								console.error(stringResponse);
								console.error('XMLData: \n');
								console.error(xmlData);
								console.error('\n');
								return postAPICallback(new Error('There was an error returned from the CRM. Please check the error log for details.'));
							}

							// Update the crm_sync field
							model.updateCrmSync(conn, modelRow, function(queryError, affectedRows){
								if (queryError){
									return postAPICallback(queryError);
								} else {
									// Log the number of rows affected.
									console.log(moduleName + ' Rows updated: ' + affectedRows);
									return postAPICallback(null);
								}
							});
						});

						break;

					default:
						// Any other status codes and we should output debugging info.
						console.error('HTTP Status Code: ' + statusCode);
						console.error("POST Response " + moduleName + ":\n");
						console.error(stringResponse);
						console.error("\nXMLData:\n");
						console.error(xmlData);
						console.error("\n");
						return postAPICallback(new Error('HTTP response code not expected.'));
				}
			});
		},
		test: function(){
			return true;
		}
	}
}();

zohoSync.postAll();

module.exports = {
	postAll: zohoSync.postAll,
	postGuests: zohoSync.postGuests,
	postProperties: zohoSync.postProperties,
	postReservations: zohoSync.postReservations,
	prepareAPIPost: zohoSync.prepareAPIPost,
	postAPI: zohoSync.postAPI,
	test: zohoSync.test
}


