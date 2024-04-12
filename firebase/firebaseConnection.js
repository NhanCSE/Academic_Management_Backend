var admin = require("firebase-admin");

var serviceAccount = require("../ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nodejs-a11db-default-rtdb.firebaseio.com"
  //databaseURL: "https://testbe-28a98-default-rtdb.firebaseio.com/"
  //databaseURL: "https://academic-management-backend-default-rtdb.firebaseio.com"
});

const database = admin.firestore();

module.exports = database;