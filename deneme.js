var url = "https://crm-ticket.ercdn.com/ticket/session/cdn?PublicKey=82c84a6b940a59e44705a8b9097036f5&ProductId=297&Source=https://dsmartgo-live.ercdn.net/smartspor/smartspor.m3u8";

var xhr = new XMLHttpRequest();
xhr.open("GET", url);

xhr.setRequestHeader("Token", "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0.J8eDwRMFUMmew-iN7tc1dIm8D-5Wbau4xl614frlCxwOwgGXSRWJnQ.wzTNUS9jl15DsjmBF20dqw.7CuN4nn9m01jWuaZ8LnvzBc18_zrpajNy6GxK0u4xblWDhg2RxNH14YiR5w_Sd_yX01XFQv5BdPHlKtzlf9i82qecEbblXbq6xLeofzxqYJ9z-dZ9AZyjVR7M7wDgPQ8p1yxdc-ZbGM71rIKg0mn0KTkKWoIh_Xkw4J7zfj1CZvU0zsItVQ_8HPCReRIsvy09A0sRqpSlFLswspAu75s0YkZI8XIdtnzUpk5senALLJAxD8HPIq-l_Lk2Qa9s44Hc57zjlBgq6Sds0CKufnGKmxbS7lhN4AtcDSvrWFhDsRMTCl2x_pykHmZl0VyeEYHacXPvrn2kTAvRJfrRluxVsktgTE1ppWT2oecQddIG1Ox7DjTLOTpFJw4wpPLhp6uAfOdSNEe5aO-1AV_dPNJFn5Ng85Ts4iRppu1qI4IFY8bAFfROEYky6ViNUgpwCGcrzRK1x89dtqwrVdfbGATUo7petU6GjPQSzneb8EkK2d3g7BMg40ESOH4GuM-DiUl0ywmGRlQZ01EMkQ5nxf_B9Z_L1u3TuJKgbUxCheL3G40PHurVurM9F7c02d6XIPzBBUkc-FThfiSD6ARYqD0vegCsIjm21pNSK_DVt0TEAz2OHAGj08edgEoA4m4NM4xDwh0iOGPyRFmZqYPZGnb8cx147upMCpv0J4WJJUIJZnJJkEMlgYQTfSxkIFJG5NT.pW16K2RivIfajpvnT39q_Q");
xhr.setRequestHeader("origin", "dsmartgo.phone.android");
xhr.setRequestHeader("accept-encoding", "gzip");
xhr.setRequestHeader("user-agent", "okhttp/3.12.0");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

xhr.send();
