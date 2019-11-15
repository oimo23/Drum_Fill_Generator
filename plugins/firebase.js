import firebase from "firebase";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyC4mzBzucJ2w5vj7sgMDS9DN9NcXqr8gx0",
    authDomain: "drumfills-c209e.firebaseapp.com",
    databaseURL: "https://drumfills-c209e.firebaseio.com",
    projectId: "drumfills-c209e",
    storageBucket: "drumfills-c209e.appspot.com",
    messagingSenderId: "186712334905",
    appId: "1:186712334905:web:7c7d4a13af26f8e2da23e8",
    measurementId: "G-5SEWSX4T8F"
  });
}

export default firebase;
