<?php

	// Proxy to grab Flickr data (format is sent via GET)
	// error_reporting(0);
	define ('HOSTNAME', 'https://secure.flickr.com/services/feeds/photos_public.gne?format=');

		$url = HOSTNAME.$_GET['format'];
		$session = curl_init($url);
		curl_setopt($session, CURLOPT_HEADER, false);
		curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

		// Disable SSL verification
		curl_setopt($session, CURLOPT_SSL_VERIFYPEER, false);

	$json = curl_exec($session);

	header("Content-Type: application/json");
	echo $json;

	curl_close($session);
?>
