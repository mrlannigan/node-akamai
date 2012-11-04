// var akamai = require('./akamai');

// akamai.purge(['http://google.com'], function(body) {
// 	console.log(body)
// });

var purge = require('./lib/purge');

var res = new purge.AkamaiPurgeResponse('<?xml version="1.0" encoding="UTF-8"?>'+
 '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Body SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsd1="http://www.w3.org/1999/XMLSchema" xmlns:xsd2="http://www.w3.org/2000/10/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsi1="http://www.w3.org/1999/XMLSchema-instance" xmlns:xsi2="http://www.w3.org/2000/10/XMLSchema-instance"><ns0:purgeRequestResponse xmlns:ns0="http://www.akamai.com/purge"><return xsi1:type="ns0:PurgeResult" xsi2:type="ns0:PurgeResult" xsi:type="ns0:PurgeResult"><resultCode xsi1:type="xsd1:int" xsi2:type="xsd1:int" xsi:type="xsd1:int">301</resultCode><resultMsg xsi1:type="xsd1:string" xsi2:type="xsd1:string" xsi:type="xsd1:string">Invalid username or password.</resultMsg><sessionID xsi1:type="xsd1:string" xsi2:type="xsd1:string" xsi:type="xsd1:string">17F1351884344192</sessionID><estTime xsi1:type="xsd1:int" xsi2:type="xsd1:int" xsi:type="xsd1:int">-1</estTime><uriIndex xsi1:type="xsd1:int" xsi2:type="xsd1:int" xsi:type="xsd1:int">-1</uriIndex><modifiers SOAP-ENC:arrayType="xsd1:string[0]" xsi1:null="true" xsi2:null="true" xsi:nil="true"/></return></ns0:purgeRequestResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>');

// var res = new purge.AkamaiPurgeResponse('<?xml version="1.0" encoding="UTF-8"?>'+
// '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Body><SOAP-ENV:Fault><faultcode>SOAP-ENV:Server</faultcode><faultstring>Exception: class org.xml.sax.SAXParseException: Content is not allowed in trailing section.</faultstring></SOAP-ENV:Fault></SOAP-ENV:Body></SOAP-ENV:Envelope>');

var res = new purge.AkamaiPurgeRequestBody(['http://google.com']);

// res.process(function(err) {
// 	//if (err) return console.log(err);

// 	//console.log(require('util').inspect(res, 1, null, 1));
// });

console.log(res.toXML());