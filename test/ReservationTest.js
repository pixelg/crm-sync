'use strict';

var expect = require('chai').expect;
var mySqlSpecHelper = require('./MySqlSpecHelper');
var reservationModel = require('../models/Reservation');

describe('Reservation', function(){
	// describe('#getUnsyncd', function(){
	// 	it('should return reservation records that have not been syncd from the database.', function(done){
	// 		mySqlSpecHelper.getUnsyncdData(reservationModel, function(error, reservationData){
	// 			if (error){
	// 				console.error(error);
	// 			} else {
	// 				console.log(reservationData);
	// 			}

	// 			done();
	// 		});
	// 	});
	// });
	describe('#buildXMLSchema', function(){
		it('should return the correct Reservation XML Schema for the Zoho CRM.', function(done){
			mySqlSpecHelper.getUnsyncdData(reservationModel, function(error, reservationData){
				if (error){
					console.error(error);
				} else {
					// console.log(reservationData);

					var filteredReservation = reservationData.filter(function(reservation){
						return reservation.id === 45;
					});

					var moduleName = reservationModel.getModuleName();

					var expectedXML = '<' + moduleName + '><row no="1"><FL val="' + moduleName + ' Name">PI423876</FL><FL val="Reservation Status">CONFIRMED</FL>' +
									  '<FL val="Reservation OTEID">45</FL><FL val="Booking Type">H2H</FL><FL val="Currency Code">MXN</FL>' + 
									  '<FL val="Created Date">03/31/2014</FL><FL val="Deposit">0</FL><FL val="Modified Date">03/31/2014</FL>' +
									  '<FL val="Deposit Discount Amount">0</FL><FL val="Total">40</FL><FL val="Guest Lookup">pixelguerrilla@gmail.com</FL>' +
									  '<FL val="Arrival Date">03/31/2014</FL><FL val="Guest Name">Brent Lee</FL><FL val="Departure Date">04/02/2014</FL>' +
									  '<FL val="Total Guests">2</FL><FL val="Nights">2</FL><FL val="Source Property Lookup">4</FL>' +
                                      '<FL val="Source Property Name"><![CDATA[Another Cabo Hostel & Hotel]]></FL><FL val="Destination Property Lookup">1</FL>' +
                                      '<FL val="Destination Property Name"><![CDATA[Happy Hostel]]></FL>' +
							          '</row></' + moduleName + '>';

					var actualXML = reservationModel.buildXMLSchemaSingle(filteredReservation[0]);
					expect(actualXML).to.equal(expectedXML);
				}

				done();
			});
		});
	});
	describe('#updateCrmSync', function(){
		it('should update the Reservation crm_sync field.', function(done){
			mySqlSpecHelper.getSQLConnection(function(pool, conn){
				var reservations = [{id: 3, name: 'NE596463'}, {id: 4, name: 'MF417581'}];

				reservationModel.updateCrmSync(conn, reservations, function(queryError){
					done();
				})
			});
		});
	});
});