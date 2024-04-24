var admin = require("firebase-admin");

var serviceAccount = require("../ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://nodejs-a11db-default-rtdb.firebaseio.com",
  //databaseURL: "https://testbe-28a98-default-rtdb.firebaseio.com/",
  databaseURL: "https://academic-management-backend-default-rtdb.firebaseio.com",
  storageBucket: "gs://academic-management-backend.appspot.com"
});

const database = admin.firestore();
const storage = admin.storage();
module.exports = {
  database,
  storage
}