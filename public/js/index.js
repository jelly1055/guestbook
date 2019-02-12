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
var key = '';

/***** Auth *****/
$("#login_bt").on("click", function(){
  /**자바 스크립트는 비동기 이므로 난 명령만 내리고 나의 갈길을 간다.. 그리고 callback에 대한 응답을 주면 그때 해당되는 일을 한다. */
  /**callback 개념으로 비동기 통신을 구현해야 한다. 1쓰레드임.. */
  auth.signInWithPopup(googleAuth); //인증객체를 보내면됨. popup을 통해 login을 시도.
  //auth.signInWithRedirect(googleAuth); //login을 누르면 page 이동을 하고 login이 끝나면 다시 이동함.post방식..
});
$("#logout_bt").on("click", function(){
  auth.signOut();
  alert("Good Bye");
});

//callback 개념으로 이벤트만 붙혀주면 됨.
auth.onAuthStateChanged(function(result){ //auth 객체를 주시하다가 auth가 변하면 callback을 실행.
  if(result) {
    user = result;
    //log(result); //auth result를 볼 수 있음. uid가 필수 값이자 고유값이이며 유저를 의미함.)
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
  init(); //data를 지우고 다시 읽어 오는 구간. 이것은 login/logout시 정보를 갱신하는 역할을 한다고 보면 됨.
}); //on click이라던지 change라던지.. 이벤트를 붙혀준다.

/***** Database *****/

function init() {
  $(".gbooks").empty();
  ref = db.ref("root/guestbook");  
  ref.on("child_added", onAdd);
  ref.on("child_removed", onRev);
  ref.on("child_changed", onChg);
}
function onAdd(data){
  var k = data.key;
  var v = data.val();
  var date = tsChg(v.wdate);
  //log( data.key );
  //log( data.val() );
  //log(data);
  var icon = "";
  if(user){
    if(user.uid == v.uid) {
      icon+= '<i onclick="onUpdate(this);" class="fas fa-edit"></i> ';
      icon+= '<i onclick="onDelete(this);" class="fas fa-trash"></i>';
   }
 }
  var html = '<ul id="'+k+'"data-uid="'+v.uid+'" class="gbook">';
  html += '<li>'+v.uname+' ('+v.email+') | <span>'+date+'</span></li>';
  html += '<li>'+v.content+'</li>';
  html += '<li>'+icon+'</li>';
  html += '</ul>';
  //$(".gbooks").append(html); //입력순.
  $(".gbooks").prepend(html); //최신순.
}

function onRev(data){
  var k = data.key;
  $("#"+k).remove(); //jquery remove (아래의 remove는 firebase db삭제)
}

function onChg(data) {
  var k = data.key;
  var v = data.val();
  $("#"+k).children("li").eq(0).children("span").html(tsChg(v.wdate));
  $("#"+k).children("li").eq(1).html(v.content); //자식중에 1번쨰(0,1 즉 2)에 값을 변경.
  $("#"+k).find(".fa-edit").show();
}

function zeroAdd(n) {
  if(n<10) return "0"+n;
  else return n;
}

function tsChg(ts){ //time stamp변경
  var d = new Date(ts);
  var month = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  var date = String(d.getFullYear()).substr(0)+"년 "+month[d.getMonth()]+" "+d.getDay()+"일 "+zeroAdd(d.getHours())+":"+zeroAdd(d.getMinutes())+":"+zeroAdd(d.getSeconds());
  return date;
}

$("#save_bt").on("click", function(){
  var $content = $("#content");
  if ($content.val() == ""){
    alert("Please enter your comment");
    $content.focus();
  }
  else {
    ref = db.ref("root/guestbook/"); //root가 database, guestbook - table
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

function onUpdate(obj) { //this는 받는게 obj 
  key = $(obj).parent().parent().attr("id");
  var $target = $(obj).parent().prev();
  var v = $(obj).parent().prev().html();
  var html = '<input type="text" class="w3-input w3-show-inline-block w3-border w3-border-red" style="width:calc(100% - 220px);" value="'+v+'">&nbsp;';
  html += '<button type="button" class="w3-button w3-orange" style="margin-top:-4px;" onclick="onUpdateDo(this);">UPDATE</button>';
  html += '<button type="button" class="w3-button w3-black" style="margin-top:-4px;" onclick="onCancel(this, \''+v+'\');">CANCEL</button>';
  $target.html(html);
  $(obj).hide(); //중복 클릭 방지를 위하여 버튼을 숨김.
}

function onCancel(obj, val){
  var $target = $(obj).parent().html(val);
  $target.parent().parent().find(".fa-edit").show(); //취소시 비활성화된 수정 버튼 활성화.
}

function onUpdateDo(obj){
  var $input = $(obj).prev();
  var content = $input.val();
  key = $(obj).parent().parent().attr("id");
  if(confirm("Are you sure want to update?")){
    ref = db.ref("root/guestbook/"+key).update({
      content: content,
      wdate: Date.now()
    })
  };
}

function onDelete(obj) {
  //i tag입장에서 부모를 찾아가야 한다. $를 붙히면 jquery 객체.
  key = $(obj).parent().parent().attr("id");
  if(confirm("Are you sure want to remove?")) {
    db.ref("root/guestbook/"+key).remove();
  }
}