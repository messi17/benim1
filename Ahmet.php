Altunkral Altunkral çevrimdışı
Yeni Üye

Altunkral - ait Kullanıcı Resmi (Avatar)

Üye Bilgileri
Standart Tv8 sitesinden yayın oynatma
<?php
$link = "https://www.tv8.com.tr/canli-yayin";
$veri = file_get_contents($link);
preg_match_all('#"hls", file: "(.*?)"#',$veri,$tv8);
?>

<head>
<script type="text/javascript"
src="https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js">
</script>
<style> html,body{ background: #000; width: 100%; height: 100%; margin: 0; padding: 0; } #player{ height: 100% !important; }</style>
</head>

<body>
<div id="player"></div>
<script>
var player = new Clappr.Player({
source: "<?php echo $tv8[1][0]; ?>",
parentId: "#player",
width: '100%',
height: '100%',
mute: false,
mediacontrol: {seekbar: "white", buttons: "red"}
});
</script>
</body>
