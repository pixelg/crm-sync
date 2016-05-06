'use strict';

var expect = require('chai').expect;
var mySqlSpecHelper = require('./MySqlSpecHelper');
var propertyModel = require('../models/Property');

describe('Property', function(){
	describe('#getUnsyncd', function(){
		it('should return property records that have not been syncd from the database.', function(done){
			mySqlSpecHelper.getUnsyncdData(propertyModel, function(error, propertyData){
				if (error){
					console.error(error);
				} else {
					console.log(propertyData);
				}

				done();
			});
		});
	});
	describe('#buildXMLSchema', function(){
		it('should return the correct Property XML Schema for the Zoho CRM.', function(done){
			mySqlSpecHelper.getUnsyncdData(propertyModel, function(error, propertyData){
				if (error){
					console.error(error);
				} else {
					// console.log(propertyData);

					var filteredProperty = propertyData.filter(function(property){
						return property.id === 20;
					});

					var moduleName = propertyModel.getModuleName();
					var expectedXML = '<' + moduleName + '><row no="1"><FL val="' + moduleName + ' Name">Gracias Amigo</FL><FL val="Property OTEID">20</FL>' + 
							          '<FL val="Email">brent@pixelguerrilla.net</FL><FL val="City">Cabo San Lucas</FL><FL val="Country">MX</FL>' +
							          '<FL val="District"/><FL val="Contact Name">Brent Lee</FL><FL val="Phone">415.513.8657</FL>' + 
							          '</row></' + moduleName + '>';

					var actualXML = propertyModel.buildXMLSchemaSingle(filteredProperty[0]);
					expect(actualXML).to.equal(expectedXML);
				}

				done();
			});
		});
	});
	describe('#updateCrmSync', function(){
		it('should update the Property crm_sync field.', function(done){
			mySqlSpecHelper.getSQLConnection(function(pool, conn){
				var properties = [{id: 1, name: 'Happy Hostel'}, {id: 2, name: 'Cabo Inn'}];

				propertyModel.updateCrmSync(conn, properties, function(queryError){
					done();
				})
			});
		});
	});
});