var admin = require("firebase-admin");

var serviceAccount = require("../ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: "https://testbe-28a98-default-rtdb.firebaseio.com/",
  // storageBucket: "gs://testbe-28a98.appspot.com"
  databaseURL: "https://academicmanagenent-default-rtdb.firebaseio.com",
  storageBucket: "gs://academicmanagenent.appspot.com"
});

const database = admin.firestore();
const storage = admin.storage();
module.exports = {
  database,
  storage
}