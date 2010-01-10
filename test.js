// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Common utils for extensions for Google Apps
var toField = "&to=";
var mailToOptions = {"gmail":"https://mail.google.com/mail/?view=cm&fs=1&tf=1","skinnycorp.com":"https://mail.google.com/a/skinnycorp.com/mail/?view=cm&fs=1&tf=1"};

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

	//put together the dialog...
	var strOptions =  '<div></div>';
	var dialog = $(document.createElement("div")).attr("id",anchor.attr('rel')).prependTo("body"); 
	dialog.css({'display': 'none'});
	dialog.attr('id', anchor.attr('rel'));
	dialog.attr('title', "MailToOptions");
	
	dialog.text('How would you like to send this message?');
	var optionsList = dialog.append(document.createElement('ul'));
	
	for (key in mailToOptions) {
		if (key) {
			var newLink = '<li><a target="_blank" rel="noreferrer" href="' + rewriteMailtoToGMailUrl(anchor.attr("href"), mailToOptions[key]) + '" title="via ' + key + '"> via ' + key + '</a></li> ';
			optionsList.append(newLink);
		}
	}
	var aClone = anchor.clone();
	aClone.attr('title', 'via the system mail tool');
	aClone.text('via the system mail tool');
	aClone.appendTo($(document.createElement('li')).appendTo(optionsList));

	//reset the anchor
	anchor.click(
		function() {
			var selector = $(this).attr('rel');
			$('head').append(
					$(document.createElement('link')).attr({
					rel : 'stylesheet',
					type : 'text/css',
					id : 'mailtofromme-style',
					href : 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.0/themes/dot-luv/jquery-ui.css'
					})
					);
			$('#' + selector).dialog({
				modal:true,
				draggable: false,
				maxHeight: 400,
				width: 'auto',
				resizable: false,
				bgiframe: true,
				close: function(){
					$('#mailtofromme-style').remove();
				}
				
			});
			return false;
		} 
	);
	anchor.attr('href', "#sendMail")
}

// Content Scripts
function rewriteMailtosOnPage() {
  // Find all the mailto links.
	console.log("Starting to rewrite mailtos");
	
	$("a[href^='mailto:']").each( function () {
		$(this).attr('rel', function(arr){
			return 'mailtofromme-' + arr;
		});
		replaceMailToAnchor(jQuery(this));
		});
}
		
if (window == top) {
    rewriteMailtosOnPage();
  
//  var bgPort = chrome.extension.connect({name: "GmailUrlConn"});
//  bgPort.postMessage({req: "GmailUrlPlease"});
//  bgPort.onMessage.addListener(
//  function(msg) {
//	console.log("Got message from bg page - " + msg.urls);
//    mailToOptions = JSON.parse(msg.urls);
//    rewriteMailtosOnPage();
//    // Not sending any response to ack.
//  });
}