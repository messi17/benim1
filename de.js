var url = "https://api.sm.vdf.ott.ddptr.com/api/Channel/GetById?DeviceTypeId=1&Msisdn=905425982106&ChannelId=120";

var xhr = new XMLHttpRequest();
xhr.open("GET", url);

xhr.setRequestHeader("CONTENT-TYPE", "application/json; charset=utf-8");
xhr.setRequestHeader("TOKEN", "eyJWYWxpZFRpbWVTdGFtcCI6MTU4OTM0NjQzMiwiRGF0YSI6eyJNc2lzZG4iOiI5MDU0MjU5ODIxMDYiLCJDdXN0b21lcklkIjo0LCJMYW5ndWFnZSI6IlRSIiwiSXNDaGlsZHJlbiI6ZmFsc2UsIkRldmljZUlkIjoiNWFlMDU4ZjAwMTRlZDZiNyJ9fQ.qZLp8qvnpIzGKjf3iJVgzyFc6an12R5rxEMi1-OVX48");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

xhr.send();
