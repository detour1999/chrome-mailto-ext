// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Common utils for extensions for Google Apps
var toField = "&to=";
var mailToOptions = "";

function rewriteMailtoToGMailUrl(inUrl, gmailDomain) {
  var retUrl = inUrl;
  retUrl = retUrl.replace("?", "&");
  retUrl = retUrl.replace(/subject=/i, "su=");
  retUrl = retUrl.replace(/CC=/i, "cc=");
  retUrl = retUrl.replace(/BCC=/i, "bcc=");
  retUrl = retUrl.replace(/Body=/i, "body=");
  var gmailUrl = gmailDomain + toField;
  retUrl = retUrl.replace("mailto:", gmailUrl);
  return retUrl;
}


function replaceMailToAnchor(anchor) {
	strOptions += anchor.html();
	anchor.wrap("<span></span>");
	anchor.attr('title', anchor.attr('title') + ' via the system mail tool');
	anchor.parent().hover(
		function() {
			$(this).children(".mailtofromme").show();
		},
		function () {
			$(this).children(".mailtofromme").hide();
		} 
	);
	
	var strOptions =  '<span style="display:none;" class="mailtofromme">';
	for (key in mailToOptions) {
		if (key) {
//			strOptions = strOptions + ' <a target="_blank" rel="noreferrer" href="' + rewriteMailtoToGMailUrl(anchor.attr("href"), mailToOptions[key]) + '" title="' + rewriteMailtoToGMailUrl(anchor.attr("href"), mailToOptions[key]) + '">' + anchor.text() + " via " + key + '</a> ';
			strOptions = strOptions + ' <a target="_blank" rel="noreferrer" href="' + rewriteMailtoToGMailUrl(anchor.attr("href"), mailToOptions[key]) + '" title="via ' + key + '"> via ' + key + '</a> ';
		}
	}
	strOptions += '</span>';
	anchor.after(strOptions);
	anchor.after('<img src="' + chrome.extension.getURL("images/mail.jpg") + '" alt="mail" />');
}

// Content Scripts
function rewriteMailtosOnPage() {
  // Find all the mailto links.
	console.log("Starting to rewrite mailtos");
	
	$("a[href^='mailto:']").each( function () {
		replaceMailToAnchor(jQuery(this));
		});
}
		
if (window == top) {
  if (mailToOptions != "") {
    rewriteMailtosOnPage();
    window.addEventListener("focus", rewriteMailtosOnPage);
  }
  
  var bgPort = chrome.extension.connect({name: "GmailUrlConn"});
  bgPort.postMessage({req: "GmailUrlPlease"});
  bgPort.onMessage.addListener(
  function(msg) {
	console.log("Got message from bg page - " + msg.urls);
    mailToOptions = JSON.parse(msg.urls);
    rewriteMailtosOnPage();
    // Not sending any response to ack.
  });
}
