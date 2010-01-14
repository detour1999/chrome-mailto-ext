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

function rewriteMailtoToYahooUrl(inUrl, yahooDomain) {
	var retUrl = yahooDomain + escape(inUrl);
	return retUrl;
}
function rewriteMailtoToHotmailUrl(inUrl, hotmailDomain) {
	var retUrl = hotmailDomain + escape(inUrl);
	return retUrl;
}

function replaceMailToAnchor(anchor) {
	//put together the dialog...
	var strOptions =  '<div></div>';
	var dialog = $(document.createElement("div")).attr("id",anchor.attr('rel')).prependTo("body"); 
	dialog.css({'display': 'none'});
	dialog.attr('id', anchor.attr('rel'));
	dialog.attr('title', "SendThru Options");
	
	dialog.append($(document.createElement('h3')).text('How would you like to send this message?'));
//	anchor.after('<img src="' + chrome.extension.getURL("images/mail.jpg") + '" alt="mail" />');
	var optionsList = $(document.createElement('ul')).appendTo(dialog);
	
	for (key in mailToOptions) {
		if (key) {
			var newLink = $(document.createElement('a')).appendTo($(document.createElement('li')).appendTo(optionsList));
			newLink.attr({
				target: '_blank',
				rel: 'noreferrer',
				title: 'via ' + key,
				rev: anchor.attr('rel'),
				href: rewriteMailtoToGMailUrl(anchor.attr("href"), mailToOptions[key])
			});
			if (key == 'yahoo'){
				newLink.attr({
					href: rewriteMailtoToYahooUrl(anchor.attr("href"), mailToOptions[key])
				});
			}
			if (key == 'hotmail'){
				newLink.attr({
					href: rewriteMailtoToHotmailUrl(anchor.attr("href"), mailToOptions[key])
				});
			}
			newLink.click (
				function() {
					$('#' + $(this).attr('rev')).dialog('close');
				}
					);
			newLink.text('via ' + key);
		}
	}
	var aClone = anchor.clone();
	aClone.attr('title', 'via the system mail tool');
	aClone.text('via the system mail tool');
	aClone.click (
			function() {
				$('#' + $(this).attr('rev')).dialog('close');
			}
			);
	aClone.appendTo($(document.createElement('li')).appendTo(optionsList));

	dialog.dialog({
		modal:true,
		draggable: false,
		maxHeight: 400,
		width: 'auto',
		resizable: false,
		close: function(){
			$('#SendThru-style').remove();
		},
		autoOpen: false,
	});

	//reset the anchor
	anchor.click(
		function() {
			var selector = $(this).attr('rel');
			$('head').append(
					$(document.createElement('link')).attr({
					rel : 'stylesheet',
					type : 'text/css',
					id : 'SendThru-style',
					href : 'http://ajax.googleapis.com/ajax/libs/jqueryui/' + $.ui.version + '/themes/' + mailToTheme + '/jquery-ui.css'
					})
					);
			$('#' + selector).dialog('open');
			return false;
		} 
	);
}

// Content Scripts
function rewriteMailtosOnPage() {
  // Find all the mailto links.
	console.log("Starting to rewrite mailtos");
	
	$("a[href^='mailto:']").each( function () {
		$(this).attr('rel', function(arr){
			return 'SendThru-' + arr;
		});
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
    mailToTheme = msg.theme;
    rewriteMailtosOnPage();
    
	$('head').append(
			$(document.createElement('link')).attr({
			rel : 'stylesheet',
			type : 'text/css',
			href : chrome.extension.getURL("tweak.css")
			})
			);
    
    
    // Not sending any response to ack.
  });
}
