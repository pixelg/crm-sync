'use strict';

var expect = require('chai').expect;
var mySqlSpecHelper = require('./MySqlSpecHelper');
var guestModel = require('../models/Guest');

describe('Guest', function(){
	describe('#getUnsyncd', function(){
		it('should return guest records that have not been syncd from the database.', function(done){
			mySqlSpecHelper.getUnsyncdData(guestModel, function(error, guestData){
				if (error){
					console.error(error);
				} else {
					console.log(guestData);
				}

				done();
			});
		});
	});
	describe('#getUnsyncdLoopTest', function(){
		it('should return guest records that have not been syncd from the database.', function(done){
			mySqlSpecHelper.getUnsyncdData(guestModel, function(error, guestData){
				if (error){
					console.error(error);
				} else {
					guestData.forEach(function(row, index){
						console.log('Row: ' + index);
						console.log(row);
					});
						
					console.log(guestData);
				}

				done();
			});
		});
	});
	describe('#buildXMLSchema', function(){
		it('should return the correct Guest XML Schema for the Zoho CRM.', function(done){
			mySqlSpecHelper.getUnsyncdData(guestModel, function(error, guestData){
				if (error){
					console.error(error);
				} else {
					var filteredCustomer = guestData.filter(function(guest){
						return guest.id === 3;
					});

					var moduleName = guestModel.getModuleName();
					var expectedXML = '<' + moduleName + '><row no="1"><FL val="' + moduleName + ' Name">pixelguerrilla@gmail.com</FL><FL val="Guest OTEID">3</FL>' + 
									  '<FL val="Guest Name">Brent Lee</FL><FL val="Email">pixelguerrilla@gmail.com</FL><FL val="Nationality"/>' +
									  '</row></' + moduleName + '>';

					// var actualXML = guestModel.buildXMLSchema(guestData);
					// console.log(actualXML);
					
					var actualXML = guestModel.buildXMLSchemaSingle(filteredCustomer[0]);
					expect(actualXML).to.equal(expectedXML);
				}

				done();
			});
		});
	});
	describe('#updateCrmSyncMulti', function(){
		it('should update multiple Guest crm_sync fields.', function(done){
			mySqlSpecHelper.getSQLConnection(function(pool, conn){
				var guests = [{id: 4, name: 'Brent'}, {id: 5, name: 'Jason'}];

				guestModel.updateCrmSync(conn, guests, function(queryError, affectedRows){
					console.log("Rows Affected: " + affectedRows);
					done();
				})
			});
		});
	});
	describe('#updateCrmSyncSingle', function(){
		it('should update a single Guest crm_sync field.', function(done){
			mySqlSpecHelper.getSQLConnection(function(pool, conn){
				var guests = {id: 4, name: 'Brent'};
				
				guestModel.updateCrmSync(conn, guests, function(queryError, affectedRows){
					console.log("Rows Affected: " + affectedRows);
					done();
				})
			});
		});
	});
});