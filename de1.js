var url = "https://api-crm-v21.ercdn.com/membership/login/Mobile?key=82c84a6b940a59e44705a8b9097036f5";

var xhr = new XMLHttpRequest();
xhr.open("POST", url);

xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.setRequestHeader("origin", "dsmartgo.phone.android");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

var data = "password=190797&mobile=5317419444&=";

xhr.send(data);
