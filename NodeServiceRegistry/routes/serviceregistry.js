
var taffy = require('taffydb').taffy;





function servicerecord (name, type, host, port, timestampInSeconds)  {
	this.name = name;
	this.type = type;
	this.host = host;
	this.port = port;
	this._timestamp = timestampInSeconds;
}


var inJSON = [
				new servicerecord(
					"getTemp-01",
					"HTTP",
					"192.169.0.103",
					 "5683",
					Math.floor(new Date().getTime() / 1000)
				),
				new servicerecord(
					"setTemp-01",
					"HTTP",
					"192.169.0.103",
					 "5684",
					Math.floor(new Date().getTime() / 1000)
				)
          ];
var db = new taffy(inJSON);

var serviceWatchdog = setInterval(function () {
	var timenow = Math.floor(new Date().getTime() / 1000);
	getServiceResponse().forEach(
			function(item) {
				if ((timenow - item._timestamp) > 300) { //make this a 5 minute timeout
					deregisterService(item);
				}
			});
}, 10000); //check every 10 seconds



function getProvider(name) {
	if(name){
		return db.filter()
	}
}




/*
 * GET Service list.
 */
function getServiceResponse(name) {
	if(name) {
		return db().filter({name:{like:name}}).get();
	} else {
		return db().get();
	}
}

exports.getProvider = function(name){
		return db().filter({name:{like:name}}).get();
}

exports.service = function(req, res){
	res.setHeader('Content-Type','application/json');
	var responsePayload = getServiceResponse(req.params.name);
	res.send(responsePayload);
};
exports.service_coap = function(req, res){
	res.setOption('Content-Format','application/json');
	var responsePayload = getServiceResponse(req.url.split('/')[3]);
	res.end(JSON.stringify(responsePayload));
};



/*
 * GET type list or service list.
 */
function getTypeResponse(type) {
	if(type) {
		var temp = db().filter({type:{like:type}}).get();
		//for (var key in temp){ if(key. delete customer[key];}
		return temp;
	} else {
		return db().distinct("type");
	}
}
exports.type = function(req, res){
	res.setHeader('Content-Type','application/json');
	var responsePayload = getTypeResponse(req.params.type);
	res.send(responsePayload);
};
exports.type_coap = function(req, res){
	res.setOption('Content-Format','application/json');
	var responsePayload = getTypeResponse(req.url.split('/')[3]);
	res.end(JSON.stringify(responsePayload));
};





/*
 * publish new service methods
 */
var registerNewService = function (element) {
	if(element.name) {
		db({name:element.name}).remove();

		db.insert(new servicerecord(
				element.name,
				element.host,
				element.port,
				Math.floor(new Date().getTime() / 1000)));


	} else {
		throw new Error("service name not provided");

	}
};
/*
 * POST publish new service
 */
exports.publish = function(req, res){
	try {
		registerNewService(req.body);

		res.send("HTTP request published!");

	} catch (error) {
		console.log('exception when parsing body = ' + error);
		res.code = '4.00';
		res.end();
	}

};
exports.publish_mqtt = function(message){
	try {

		registerNewService(message);
	} catch (error) {
		console.log('exception when parsing body = ' + error);
	}
};

exports.publish_coap = function(req, res){
	try {

		var payload = JSON.parse(req.payload);
		//payload.forEach(registerNewService);
		registerNewService(payload);

//		if(payload.name) {
//			db({name:payload.name}).remove();
//
//			db.insert(new servicerecord(
//						payload.name,
//						payload.type,
//						payload.host,
//						payload.port,
//						payload.properties ));
//
//			res.end("ok");
//		} else throw new Error("service name not provided");
	} catch (e) {
		console.log('exception when parsing body');
		res.code = '4.00';
		res.end();
	}
};

/*
 * un-publish new service methods
 */
/*
 * POST un-publish service
 */
var deregisterService = function (service)  {
	db(service).remove();
};
exports.unpublish = function(req, res){
	deregisterService({name:req.body.name});
	res.send("ok");
};
exports.unpublish_coap = function(req, res){
	try {
		var payload = JSON.parse(req.payload);
		deregisterService({name:payload.name});//db({name:payload.name}).remove();
		res.end("ok");
	} catch (e) {
		console.log('exception when parsing body');
		res.code = '4.00';
		res.end();
	}
};
