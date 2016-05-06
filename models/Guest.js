'use strict';

var mysql = require('mysql');
var builder = require('xmlbuilder');

var moduleName = 'CustomModule5';

exports.getUnsyncd = function(conn, queryCallback){
	conn.query("SELECT guests.id, CONCAT(guests.first_name, ' ', guests.last_name) as guest_name, guests.email, guests.nationality " + 
			   "FROM guests as guests " + 
               "WHERE guests.crm_sync = 0 " +
			   "GROUP BY guests.email", 
		function(queryError, guests, queryFields){
			if (queryError){
				return queryCallback(queryError, null);
			}

			return queryCallback(null, guests);
		});
};

exports.buildXMLSchemaMulti = function(guests){
	var xml = builder.create(moduleName, null, null, {headless: true});

	guests.forEach(function(guest, index){
		exports.buildXMLSchemaRow(xml, index, guest);
	});
		
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaSingle = function(guest){
	var xml = builder.create(moduleName, null, null, {headless: true});
	exports.buildXMLSchemaRow(xml, 0, guest);
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaRow = function(xml, index, guest){
	var rowEle = xml.ele('row', {'no': index + 1});
		rowEle.ele('FL', {'val': moduleName + ' Name'}, guest.email);
		rowEle.ele('FL', {'val': 'Guest OTEID'}, guest.id);
		rowEle.ele('FL', {'val': 'Guest Name'}, guest.guest_name);
		rowEle.ele('FL', {'val': 'Email'}, guest.email);
		rowEle.ele('FL', {'val': 'Nationality'}, guest.nationality);

	return rowEle;
}

exports.updateCrmSync = function(conn, guests, queryCallback){

	var idsToUpdate = 0;

	if (Array.isArray(guests)){
		var idsMapped = guests.map(function(guest){
			return guest.id;
		});

		idsToUpdate = idsMapped.join(', ');
	} else {
		idsToUpdate = guests.id;
	}

	conn.query("UPDATE guests SET crm_sync = 1 WHERE id in (" + idsToUpdate + ")", function(queryError, result){
		if (queryError){
			return queryCallback(queryError, 0);
		} else {
			return queryCallback(null, result.affectedRows);
		}
	});
};

exports.getModuleName = function(){
	return moduleName;
}