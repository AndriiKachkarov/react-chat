import firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDxuNl9NRuPhhXbIFL4rq8ALn1O8MiwsUE",
    authDomain: "react-slack-a0725.firebaseapp.com",
    databaseURL: "https://react-slack-a0725-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "react-slack-a0725",
    storageBucket: "react-slack-a0725.appspot.com",
    messagingSenderId: "137846584636",
    appId: "1:137846584636:web:b225b9a69becdc33305a39"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
