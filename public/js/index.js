  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAjyoXEAKoYxquvVrwAjNMsgMvTctC6cQk",
    authDomain: "guestbook-jylee.firebaseapp.com",
    databaseURL: "https://guestbook-jylee.firebaseio.com",
    projectId: "guestbook-jylee",
    storageBucket: "guestbook-jylee.appspot.com",
    messagingSenderId: "109006041721"
  };
  firebase.initializeApp(config);

/***** 전역변수 설정 *****/
var log = console.log;
var auth = firebase.auth();
var db = firebase.database();
var googleAuth = new firebase.auth.GoogleAuthProvider(); //facebook이면 google을 facebook으로 바꿔주면 됨.
var ref = null;
var user = null; //login 한 사용자에 대한 전역변수

/***** Auth *****/
$("#login_bt").on("click", function(){
  /**자바 스크립트는 비동기 이므로 난 명령만 내리고 나의 갈길을 간다.. 그리고 callback에 대한 응답을 주면 그때 해당되는 일을 한다. */
  /**callback 개념으로 비동기 통신을 구현해야 한다. 1쓰레드임.. */
  auth.signInWithPopup(googleAuth); //인증객체를 보내면됨. popup을 통해 login을 시도.
  //auth.signInWithRedirect(googleAuth); //login을 누르면 page 이동을 하고 login이 끝나면 다시 이동함.post방식..
});
$("#logout_bt").on("click", function(){
  auth.signOut();
});

//callback 개념으로 이벤트만 붙혀주면 됨.
auth.onAuthStateChanged(function(result){ //auth 객체를 주시하다가 auth가 변하면 callback을 실행.
  if(result) {
    user = result;
    log(result); //auth result를 볼 수 있음. uid가 필수 값이자 고유값이이며 유저를 의미함.)
    //log(result.displayName);
    //log(result.email);
    //log(result.uid);
    //log(result.photoURL);
    var email = '<img src="'+result.photoURL+'" style="width:24px;border-radius:50%;"> '+result.email;
    $("#login_bt").hide();
    $("#logout_bt").show();
    $("#user_email").html(email);
  }
  else {
    user = null;
    $("#login_bt").show();
    $("#logout_bt").hide();
    $("#user_email").html('');
  }
}); //on click이라던지 change라던지.. 이벤트를 붙혀준다.

/***** Database *****/
init();
function init() {
  ref = db.ref("root/guestbook");
  ref.on("child_added", onAdded);
}
function onAdded(data){
  log(data);
}

$("#save_bt").on("click", function(){
  var $content = $("#content");
  if ($content.val() == ""){
    alert("내용을 입력해주세요.");
    $content.focus();
  }
  else {
    db.ref("root/guestbook/"); //root가 database, guestbook - table
    ref.push({
      email: user.email,
      uid: user.uid,
      uname: user.displayName,
      content: $content.val(),
      wdate: Date.now()
    }).key;
    $content.val('');
  }
});