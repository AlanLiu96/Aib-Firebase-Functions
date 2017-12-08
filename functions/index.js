const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// GET REQUEST for KIOSK BALL DISPENSE
// Checks if the orb is ready to be dispensed 
exports.checkReady = functions.https.onRequest((req, res) => {
    const kioskNumber = req.query.kiosk_number;

    admin.database().ref('/kiosk/' + parseInt(kioskNumber)).once('value').then(function(snapshot) {
    	var kiosk = snapshot.val()
    	var name = (kiosk && kiosk.name)
    	var email = (kiosk && kiosk.email)
    	var objectId = (kiosk && kiosk.object)
	 	if (kiosk && name && email && objectId){
	 		setObjectData(objectId, name, email, kioskNumber);
	 		return res.status(201).send("True"); // ready for dispense 
	 	}
	 	else {
	 		return res.status(200).send("False");
	 	}
	});
});

function setObjectData(objectId, name, email, kioskNumber) {
  admin.database().ref('object/' + objectId).set({ // set object and prepare it 
    name: name,
    email: email,
    active : 1,
    brightness: 255,
    pattern: 1
  });
  admin.database().ref('/kiosk/' + parseInt(kioskNumber)).set({}); // reset kiosk
}

// GET REQUEST FOR USER INFORMATION ENTRY
exports.userInfo = functions.https.onRequest((req, res) => {
    const kioskNumber = req.query.kiosk_number;
    const name = req.query.name;
    const email = req.query.email;
    if (!(name && email && kioskNumber)){
    	res.status(400).send("Invalid Arguments, expected kiosk_number, name, email in request, got" + kioskNumber + name + email);
    }

    var updates = {};
  	updates['/kiosk/' + parseInt(kioskNumber) + '/name'] = name;
  	updates['/kiosk/' + parseInt(kioskNumber) + '/email'] = email;
    admin.database().ref().update(updates);

    return res.status(201).send("Name and Email Created");
});

// GET REQUEST for EXHIBIT ORB IDENTIFICATION
// Checks if the orb is ready to be dispensed 
exports.getNames = functions.https.onRequest((req, res) => {
    admin.database().ref('/object').once('value').then(function(snapshot) {
      names = [];
      emails = [];
      snapshot.forEach(function(child) {
        if (child.val().location == "FuturePod"){
          names.push(child.val().name);
          emails.push(child.val().email);
        }
      });
      return res.status(200).send(names.join(',') + '\t' + emails.join(','));
  });
});


/*

1. Get Return.
  a. User enters in information/ Kiosk Sends information
     POST REQUEST --> username, email, kiosk
  c. Ball sees electromagnet & updates kiosk directly in firebase
  d. Servo/Arduino requests info from FB on whether or not to release
     GET REQUEST --> URL Param with kiosk number

2. Exhibit 
  a. 


*/
// 1. needs a post request for the username & email & kiosk # upload
// 1. 
// 2. needs a get request for knowing if we should release or not 