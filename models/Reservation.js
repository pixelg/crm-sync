'use strict';

var mysql = require('mysql');
var builder = require('xmlbuilder');
var EscapeData = require('../lib/EscapeData');

var moduleName = 'CustomModule1';

exports.getUnsyncd = function(conn, queryCallback){
	conn.query("SELECT reservations.ref_no," +
					"reservations.id," +
					"CASE reservations.status " +
						"WHEN 0 THEN 'CANCELLED' " +
						"WHEN 1 THEN 'CONFIRMED' " +
						"WHEN 2 THEN 'PENDING' " +
					"END as status_text," +
					"reservations.booking_type," +
					"reservations.currency_code," +
					"reservations.total_deposit," +
					"reservations.deposit_discount_value," +
					"reservations.total," +
					"guests.email as guest_lookup," +
					"CONCAT(guests.first_name, ' ', guests.last_name) as guest_name," +
					"DATE_FORMAT(reservations.arrival_date, '%m/%d/%Y') as arrival_date," +
					"DATE_FORMAT(reservations.departure_date, '%m/%d/%Y') as departure_date," +
					"datediff(reservations.departure_date, reservations.arrival_date) as nights," +
					"reservations.total_guests," +
					"source_properties.id as source_property_lookup," +
					"source_properties.name as source_property_name," +
					"destination_properties.id as destination_property_lookup," +
					"destination_properties.name as destination_property_name," +
					"DATE_FORMAT(reservations.created, '%m/%d/%Y') as created_date," +
					"DATE_FORMAT(reservations.created, '%H:%i') as created_time," +
					"DATE_FORMAT(reservations.modified, '%m/%d/%Y') as modified_date," +
					"DATE_FORMAT(reservations.modified, '%H:%i') as modified_time " +
					"FROM reservations as reservations " + 
						"JOIN guests as guests ON guests.id = reservations.guest_id " +
					    "JOIN properties as source_properties ON source_properties.id = reservations.source_property_id " +
					    "JOIN properties as destination_properties ON destination_properties.id = reservations.property_id " +
					"WHERE source_properties.status = 1 " +
					"AND destination_properties.status = 1 " +
					"AND reservations.crm_sync = 0",
		function(queryError, reservations, queryFields){
			if (queryError){
				return queryCallback(queryError, null);
			}

			// console.log(reservations);
			// console.log(queryFields);
			return queryCallback(null, reservations);
	});
};

exports.buildXMLSchema = function(reservations){
	var xml = builder.create(moduleName, null, null, {headless: true});

	reservations.forEach(function(reservation, index){
		exports.buildXMLSchemaRow(xml, index, reservation);
	});
		
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaSingle = function(reservation){
	var xml = builder.create(moduleName, null, null, {headless: true});
	exports.buildXMLSchemaRow(xml, 0, reservation);
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaRow = function(xml, index, reservation){
	var rowEle = xml.ele('row', {'no': index + 1});
		rowEle.ele('FL', {'val': moduleName + ' Name'}, reservation.ref_no);
		rowEle.ele('FL', {'val': 'Reservation Status'}, reservation.status_text);
		rowEle.ele('FL', {'val': 'Reservation OTEID'}, reservation.id);
		rowEle.ele('FL', {'val': 'Booking Type'}, reservation.booking_type);
		rowEle.ele('FL', {'val': 'Currency Code'}, reservation.currency_code);
		rowEle.ele('FL', {'val': 'Created Date'}, reservation.created_date);
		rowEle.ele('FL', {'val': 'Deposit'}, reservation.total_deposit);
		rowEle.ele('FL', {'val': 'Modified Date'}, reservation.modified_date);
		rowEle.ele('FL', {'val': 'Deposit Discount Amount'}, reservation.deposit_discount_value);
		rowEle.ele('FL', {'val': 'Total'}, reservation.total);
		rowEle.ele('FL', {'val': 'Guest Lookup'}, reservation.guest_lookup);
		rowEle.ele('FL', {'val': 'Arrival Date'}, reservation.arrival_date);
		rowEle.ele('FL', {'val': 'Guest Name'}, reservation.guest_name);
		rowEle.ele('FL', {'val': 'Departure Date'}, reservation.departure_date);
		rowEle.ele('FL', {'val': 'Total Guests'}, reservation.total_guests);
		rowEle.ele('FL', {'val': 'Nights'}, reservation.nights);
		rowEle.ele('FL', {'val': 'Source Property Lookup'}, reservation.source_property_lookup);
        
        // The property names sometimes have ampersands in them, replace them with spaces since ZOHO won't accept them
        var escapeData = new EscapeData(); 
		rowEle.ele('FL', {'val': 'Source Property Name'}, escapeData.amp(reservation.source_property_name));
        
		rowEle.ele('FL', {'val': 'Destination Property Lookup'}, reservation.destination_property_lookup);
        
        // The property names sometimes have ampersands in them, replace them with spaces since ZOHO won't accept them
		rowEle.ele('FL', {'val': 'Destination Property Name'}, escapeData.amp(reservation.destination_property_name));

	return rowEle;
};

exports.updateCrmSync = function(conn, reservations, queryCallback){
	var idsToUpdate = 0;

	if (Array.isArray(reservations)){
		var idsMapped = reservations.map(function(reservation){
			return reservation.id;
		});

		idsToUpdate = idsMapped.join(', ');
	} else {
		idsToUpdate = reservations.id;
	}

	conn.query("UPDATE reservations SET crm_sync = 1 WHERE id in (" + idsToUpdate + ")", function(queryError, result){
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