// import and configure the firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import{getDatabase, ref, set, get, child, update, remove} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdiHf1zsaoxxKZs2ZlLMfSS_qn7pYdMQM",
  authDomain: "abc-bank-20ca6.firebaseapp.com",
  projectId: "abc-bank-20ca6",
  storageBucket: "abc-bank-20ca6.appspot.com",
  messagingSenderId: "408793597867",
  appId: "1:408793597867:web:aee149bd3e0a98054474ee"
};


window.onload = function(){

  // Initialize Firebase
 const app = initializeApp(firebaseConfig);

 const db=getDatabase();
 const dbref= ref(db);


   
   

 document.getElementById('swithToReg').onclick=switchToReg;
 document.getElementById('swithToLogin').onclick=switchTologin;
 document.getElementById('login-btn').onclick = loginValidation;
 document.getElementById('register-btn').onclick = registerValidation;


//------switch to reg-----//
function switchToReg(){
 document.getElementById('register-portal').style = "display:inline-block";
 document.getElementById('login-portal').style = "display:none";
}
function switchTologin(){
 document.getElementById('register-portal').style = "display: none ";
 document.getElementById('login-portal').style = "display:inline-block";
}


//---acc no and pin pattern-----//
var accNoPat = "^[0-9]{6}$";
var accPinPat = "^[0-9]{4}$";
//----login validation------//
function loginValidation(){
 var lAccNo = document.getElementById('lAccNo').value;
 var lAccPin = document.getElementById('lAccPin').value;
 if(lAccNo.match(accNoPat) && lAccPin.match(accPinPat)){
   portal(lAccNo,lAccPin);
 }else{
     alert("Please enter valid details");
 }
}


//-----Register validation----------//
function registerValidation(){
var rAccName = document.getElementById('rAccName').value;
var rAccNo = document.getElementById('rAccNo').value;
var rAccPin = document.getElementById('rAccPin').value;
var rConAccPin = document.getElementById('rConAccPin').value;
if(rAccName!==null && rAccNo.match(accNoPat) && rAccPin.match(accPinPat) && rAccPin == rConAccPin){

  set(ref(db,"accNo "+rAccNo+"/accPin "+rAccPin+"/accDetails"),{
    name: rAccName,
    avalBal: 0
  }).then(()=>{
    alert("Registered");
  }).catch((error)=>{
    alert("Registered Failed\n"+error);
  });

  set(ref(db,"accNo "+rAccNo+"/received"),{
    receivedAmt: 0
  }).then(()=>{
    console.log("received amt updated");
  }).catch((error)=>{
    alert("received amt updation Failed\n"+error);
  });
}else{
 alert("Please enter a valid details");
}
}


//----------------------------Portal----------------------------//
function portal(accNo,accPin){
 document.getElementById('login-portal').style = "display:none";
 document.getElementById('register-portal').style = "display:none";
 document.getElementById('portal').style = "display:inline-block";

 var name,avalBal,totalBal,receivedAmt,msg;

 //-----------getting data from firebase------------//
get(child(dbref,"accNo "+accNo+"/accPin "+accPin+"/accDetails")).then((snapshot)=>{
 if(snapshot.exists()){
    name = snapshot.val().name;
    avalBal = snapshot.val().avalBal;
    document.getElementById('userName').innerHTML = 'Hi '+name;
 }else{
   alert("no data found in the database");
 }
}).catch((error)=>{
 alert("error while getting  data\n"+error);
});

get(child(dbref,"accNo "+accNo+"/received")).then((snapshot)=>{
 if(snapshot.exists()){
     receivedAmt = snapshot.val().receivedAmt;
     totalBal = avalBal + receivedAmt;
     msg="welcome, "+name;
     updateAvalBal(msg,totalBal);
     updateReceivedAmt();
 }else{
   alert("no received amount found in the database");
 }
}).catch((error)=>{
 alert("error while getting  data\n"+error);
});


//----------update values in firebase----------------//
function updateAvalBal(msg,totalBal){
  update(ref(db,"accNo "+accNo+"/accPin "+accPin+"/accDetails"),{
    avalBal: totalBal
  }).then(()=>{
    alert(msg);
    document.getElementById('totalBal').innerHTML = "TotalBal: "+totalBal;
  }).catch((error)=>{
    alert("error\n"+error);
  });
}
  function updateReceivedAmt(){
     update(ref(db,"accNo "+accNo+"/received"),{
       receivedAmt: 0
     }).then(()=>{
       console.log("recived amount updated");
     }).catch((error)=>{
       alert("error\n"+error);
     });
}


//-------------deposit--------------------///
document.getElementById('depoist-btn').addEventListener('click',depoist);

function depoist(){
 document.getElementById('depoist-portal').style= "display:inline-block";
 document.getElementById('withdraw-portal').style= "display:none";
 document.getElementById('transfer-portal').style= "display:none";

 document.getElementById('dep-submit').addEventListener('click',function(){
   document.getElementById('depoist-btn').removeEventListener('click',depoist);
   var depoistAmt = Number(document.getElementById('depoist-amt').value);
   if(depoistAmt>=100){
     totalBal += depoistAmt;
     document.getElementById('depoist-amt').value = '';
     msg = "Rs. "+depoistAmt+" was successfully depoisted";
     updateAvalBal(msg,totalBal);
   }else{
     alert('Minium depoist amount Rs.100');
   }
 });
}


///-------------withdraw---------------///
document.getElementById('withdraw-btn').addEventListener('click',withdraw);
function withdraw(){
 document.getElementById('depoist-portal').style= "display:none ";
 document.getElementById('withdraw-portal').style= "display:inline-block";
 document.getElementById('transfer-portal').style= "display:none";

 document.getElementById('wit-submit').addEventListener('click',function(){
   document.getElementById('withdraw-btn').removeEventListener('click',depoist);
   var withdrawAmt = Number(document.getElementById('withdraw-amt').value);
   if(withdrawAmt>=100){
     totalBal -= withdrawAmt;
     document.getElementById('withdraw-amt').value = '';
     msg = "Rs. "+withdrawAmt+" was successfully withdrawn";
     updateAvalBal(msg,totalBal);
   }else{
     alert('Minium withdraw amount Rs.100');
   }
 });
}


//-----------------transfer------------------//
document.getElementById('transfer-btn').addEventListener('click',transfer);
function transfer(){
 document.getElementById('depoist-portal').style= "display:none ";
 document.getElementById('withdraw-portal').style= "display:none";
 document.getElementById('transfer-portal').style= "display:inline-block";

 document.getElementById('trans-submit').addEventListener('click',function(){

   document.getElementById('transfer-btn').removeEventListener('click',transfer);

   var transAccNo = document.getElementById('transfer-acc-no').value;
   var transferAmt = Number(document.getElementById('transfer-amt').value);

   document.getElementById('transfer-acc-no').value = '';
   document.getElementById('transfer-amt').value = '';

   if(transAccNo.match(accNoPat) && transferAmt>=100){

     update(ref(db,"accNo "+transAccNo+"/received"),{
       receivedAmt: transferAmt
     }).then(()=>{
       totalBal -= transferAmt;
       document.getElementById('withdraw-amt').value = '';
       msg = "Rs. "+transferAmt+" was successfully transfer to "+transAccNo;
       updateAvalBal(msg,totalBal);
     }).catch((error)=>{
       alert('error\n'+error);
     });
   }else{
     alert('Minium withdraw amount Rs.100');
   }
 });
 }
}

}

// sql zoo
//leatcode
//hackerrank
//hackerearth