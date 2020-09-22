var url = "https://crm-ticket.ercdn.com/ticket/session/cdn?PublicKey=82c84a6b940a59e44705a8b9097036f5&ProductId=297&Source=https://dsmartgo-live.ercdn.net/smartspor/smartspor.m3u8";

var xhr = new XMLHttpRequest();
xhr.open("GET", url);

xhr.setRequestHeader("Token", "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0.cESZIi3Wx0wADgxipUnLPyOtITSpO80d9kVSkt_glgJ97I2GcG8P_g.dPxM6u1sZ2ys3j5qu04AVA.oNBbhstBh2Mmq_l0elQcHuTY8Hw2fsolGKfXF8XjlwzDFsZhtH-utYd4xt8Aw521lkkV6QiHwNcnEzAzWhroKJvzfPRE5-1pKfcaB-isWIkLqvsfzR_xrZDSsYfoB4v6jrp4oMGMzQsUuYYl-vr3QSixQVBHJ6P7oycmmh1YPl0Wh5eu7DGGIxJ9PijR9BCAwtMqKeBq2yZP1Whs63F7dbnhkadHIghQB6oxUTAotlPVP5CRSSDZgp-0z_C2QO89g4ZIvH89ojjk745eVkzbRz77cCiB_kLybwAnZGDgHCHEhmDDLYp5LZUjeeb6vPZKaRWAsN0wWtJDErhQPZUvVPd91Ei_G4Mlm2BRFmEP1dVkgMreQXsusUFXg_ZXpuAbT1sXsf9wba71qkOLbNlGOuKO6CPpW2RwC5iwTWq_TWu1w-Hto1w_2MQl47Sgz8iD5mwuv3xDncHNJh0JeCerDBvXn0xBUIKnG3JP8YBU26WFQbk3D2hkl0Gx-UaxIqEE8FuyyoH01XKTch3u09hm-5o5jSOQVH2LynX8VotipRwfI8cV_LcOuxe4GITPtBOSRy4cNmDMl6tJpHCIAPhLLRCIxc3LAiMbsS7WwOUzJceOUOIaZxUHDUhXCUnRnC-gfjjjCKcWhA8EIezxuxo73VaUuDfcJOAR-SHkSFLNVRMnoxnxTPwhRIKN_kPl4Y2m.K-Y-4PXwinQ1h0OZfA3gnA");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

xhr.send();
