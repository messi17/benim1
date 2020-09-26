var url = "https://mobileservice-v2.beinconnect.com.tr/api/v2/live/channels/ticket";

var xhr = new XMLHttpRequest();
xhr.open("POST", url);

xhr.setRequestHeader("Cookie", "uc=init=%22H4sIAAAAAAAEAGWRUW%2bCMBDHvwvPkzixlu0NZSqJglGzPS5HObRJaU2hLNuy7752mhKzx%2f5%2b1%2fZ%2fd99Bij1nmFXBc1A%2fUSA1oXE0oXVV0uDhZnNo0PokT%2fdFlr7v1kX%2b4uXx8%2bLk7qwkejjXIN2T4jSwrapQWLZZjdKYEM%2bL9hV1y5W0bhaOPV9y3XyAxsFOIi%2fXoKt7efov7%2bkWpKmBdUaj%2fovhesjavVKdax5E67IemEaUB%2f7lbpPwcWbZ4mKSktsz6Aah5KOegseTgTumpETW2Ui3ubxly8zyok00O19LeyosGZJPwyicliRyA18IjrLzThohfOnccFHlpild%2fqtZodooBu4%2ft0IyjqOfX%2fN7ekbUAQAA%22&uinf=14Qt%2bp2gCEihZVwiUZ3QKtJ7%2futoA91JTnayBLuGSV0M9T7HFj5al6h5v0YIi7yzo7e9%2fGfs0e0mMOb4U%2fQUxVz6z6jKovkMffHtoFuJAlieHCtVZoBoae4H6O2OEOSp9ERo%2f4%2brIX0nOEuaBoZU0OqucDWnbhS%2bH%2biu%2bhse1HZFsbqhsX6Yd5qvJ3OOYOJc3Ggwl1WaaWeWjhKRXxXPWhuks2QsZRPxn1PSaunjv6cKVQLNvR2uft9%2bJkWekgHdbOevCGrzXU06fUipnAu84g%3d%3d; TS01aaf543=011d35fd7bce9d396a17f55a502af392fcb4060482634cd57bc0b74a1b1b1d98dc485ebec7960bd2155ca19bd746087b3662985535b8ba5e2c76aa924dfc86a9678e520c6e; TSa3aecf25029="08a7fcea39ab280039fe3ba57e6a6e54c5ad54bfde5793de20392fb1d89a537ca26232e6643632b21d4d53ca796a85db";$Path="/";$Domain="mobileservice-v2.beinconnect.com.tr"");
xhr.setRequestHeader("Content-Length", "685");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
   }};

var data = '{"cdn_type":3,"channel_id":125600,"stream_format":"HLS","cdn_uri":"https:\/\/bein-tr-live.ercdn.com\/connect\/bein\/bein_sports_news_bo\/bein_sports_news.isml\/(500%7C1100%7C1800).m3u8","has_drm":false,"event_data":"HCWEPxQM3YWyz12Q6P68eAvuPZn0Ai5eKg8x5/cN0A6/SEcSUTBsmu94aMvGoDq5Hx4IDctG5933nDrGWztPj16iMhrS8e0sNQ1jIRyL9iHXrM2OdijMbQ1VhsWxoGpTzN8h0Sn4ITdg2KSq9ltrkZRTRWOS5zamAQhXAM2FuYjhgNPO0zowMes7tgizmUWe6jmurc4g/oHRG7R35iESSlbtcrJqBK9M3oTLSrmAVz81ybUuy1pgMAlw+PsVWbUH0wSDC/i7IWZYN0xPISgjqE5praIHP1gA+GCOfeZAzUJ9ukERl36Az3Liqf9EOgzKMgQN4xh9ZEWZgSVpatdgezWUwWnhz2krO9fSWCGFOqnWSGkA6vb3HgnuXAAZoWk9SMhNcigWs0Z6TM11KZxpPL28Nv32uYY/8ekGg+nS/vxV2m/Oem9Zj930Iszapd7y"}';

xhr.send(data);
