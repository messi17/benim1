<?php

$url = "https://crm-ticket.ercdn.com/ticket/session/cdn?PublicKey=82c84a6b940a59e44705a8b9097036f5&ProductId=297&Source=https://dsmartgo-live.ercdn.net/smartspor/smartspor.m3u8";

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$headers = array();
$headers["Token"] = "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0.wdIrrvYQNEwj7JZMcZQyGUMdydZzJVDlm0xvcVni5ajbo1UbICYIow.vgkuZWehd2enWF0HoYSdIQ.Eb_1_HKSTF8YiU4ORB2tOB7-dndIPSbH6gOjbIN_agH62DB_3w_Kfv7i-gJm6SfsgODhz7C-CHQWP7c7g9N9CTqftrxfMzAvFLmHWdmtZg28dPRYsCtrqk_TGXU6fdWAMGno1rN2zaFCfRf2YDr87aajLJ1zhMqo9SPoS6B_F8rAft7vaKq-DkwqvY1oG1WWHuo_SW8HzXng_A2qfy69IPck_8Z6QIIbAUVGkjMOUC97Hshi5Lq4CNmYKWTHGguV1fLTGskaEuk9IM_SlfauLtl4a-tTHVazkAeSgVc-JupL8ikDGqCCugFyfpIPt5UWTJy49vMAJ4uSEua-H7X27bpvB5jvvAxCx427y2fp_vjPo3KacWGh5d_mQzepaxHGB83mhQI72I-dbfkfFVdAL0G1-FkzzrHj4ZeMV5ePmn5ocBunwEjs4C1Rbu6dsAzN8-rySL6xPoeNJ0I50IOgPxnidN114cTYrlqWOTFwww_vjEh9Cv7opR8h5bc2T4k1JbiB2sWqeeS-Lv5x5QlagnmmtEQ83oFQfNqkVOe_2ld8qwCeV9j-2-TdHX-FXSNAjanK3p1KE57BsZtQLbT0walxwAyETFO9FNiBDmluRYqsfciJ7Y02x3Rf-yxlte7xPhFr5k78ZS9BhZe0_aHIGjHtdz8RBbmj0xNJDpwZZrARFM8tHe40uivcCYSfUjQh.b648Bdp52ovhdbw75yaDHw";
$headers["origin"] = "dsmartgo.phone.android";
$headers["accept-encoding"] = "gzip";
$headers["user-agent"] = "okhttp/3.12.0";

curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
//for debug only!
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

$resp = curl_exec($curl);
curl_close($curl);
var_dump($resp);

?>

