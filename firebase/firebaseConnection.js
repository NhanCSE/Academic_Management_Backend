var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://academic-management-backend-default-rtdb.firebaseio.com"
});

const database = admin.firestore();

module.exports = database;