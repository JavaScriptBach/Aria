(function() {
	"use strict";
	// Fetch and render first page
	// var url = "score_beethoven.pdf";
	// PDFJS.workerSrc = "pdfjs-1.0.68-dist/build/pdf.worker.js";
	// PDFJS.getDocument(url).then(function(pdf) {
	// 	var currentPage = null;
	// 	$("#pdf-num-pages").text(pdf.numPages);
	// 	var displayPage = function(pageNumber) {
	// 		pdf.getPage(pageNumber).then(function(page) {
	// 			currentPage = page;
	// 			var desiredWidth = $("#score").width() - parseInt($("#score").parent().css("padding-right"));
	// 			var viewport = page.getViewport(1);
	// 			var scale = desiredWidth / viewport.width;
	// 			var scaledViewport = page.getViewport(scale);
	// 			// Prepare canvas using PDF page dimensions
	// 			var canvas = document.getElementById("canvas");
	// 			var context = canvas.getContext('2d');
	// 			canvas.height = scaledViewport.height;
	// 			canvas.width = scaledViewport.width;
	// 			page.render({
	// 				canvasContext: context,
	// 				viewport: scaledViewport
	// 			});
	// 		});

	// 	};

	// 	displayPage(1);

	// 	$("#prev-btn").click(function() {
	// 		var pageNum = currentPage.pageNumber;
	// 		if (pageNum > 1) {
	// 			displayPage(pageNum - 1);
	// 		}
	// 	});

	// 	$("#next-btn").click(function() {
	// 		var pageNum = currentPage.pageNumber;
	// 		if (pageNum < pdf.numPages) {
	// 			displayPage(pageNum + 1);
	// 		}
	// 	});

	// 	$("#go-btn").click(function() {
	// 		var pageNum = parseInt($("#go-page-number").val());
	// 		if (pageNum >= 1 && pageNum <= pdf.numPages) {
	// 			displayPage(pageNum);
	// 		}
	// 	});
	// });

	// Create a new table row for page data, with intelligently filled in values
	$("#page-add-row-btn").click(function() {
		addRow("page");
	});

	// Removes the bottom-most table row for page data after confirmation
	$("#page-remove-row-btn").click(function() {
		removeRow("page");
	});

	$("#guide-add-row-btn").click(function() {
		addRow("guide");
	});

	// Removes the bottom-most table row for guide data after confirmation
	$("#guide-remove-row-btn").click(function() {
		removeRow("guide");
	});

	// $("#guide-data").hide();
	// $(".nav-tabs li").click(function() {
	// 	var active = $(this).hasClass("active");
	// 	if (!active) {
	// 		$(".nav-tabs li").toggleClass("active");
	// 		$("#guide-data").add("#page-data").toggle();
	// 	}
	// });

	// Appends a new row to the table, with intelligently filled in values
	// type = A string, either "page" or "guide", which describes
	// the table to append to.
	function addRow(type) {
		var rows = $("#" + type + "-data tbody tr");
		var lastRow = rows.eq(rows.length - 1);
		var lastCols = lastRow.children();
		
		var html = "";
		if (type === "page") {
			var nextRowPageNumber;
			if (rows.length == 1)
				nextRowPageNumber = parseInt(lastCols[0].innerHTML) + 1;
			else
				nextRowPageNumber = parseInt(lastCols.eq(0).children().val()) + 1;
			if (!nextRowPageNumber || nextRowPageNumber < 1)
				nextRowPageNumber = 1;
			
			html += '<tr><td><input type="text" value="' + nextRowPageNumber + '"></td>';
			// $("#page-data tbody").append(html);
		} else {
			html += '<tr><td><textarea autocomplete="off" spellcheck="true"';
			html += 'placeholder="Tell us what\'s going on during this interval!" required>';
			html += '</textarea></td>';
			// $("#guide-data tbody").append(html);
		}
		var nextRowStartTime = lastCols.eq(2).children().val();
		html += '<td><input type="text" value="' + escapeHTML(nextRowStartTime) + '"></td>';
		html += '<td><input type="text" value="' + escapeHTML(nextTime(nextRowStartTime)) + '"</td></tr>';
		$("#" + type + "-data tbody").append(html);
	}

	// Removes the last row from the table, after prompting the user for confirmation.
	function removeRow(type) {
		var rows = $("#" + type + "-data tbody tr");
		if (rows.length == 1)
			return;
		if (confirm("Are you sure you want to delete the last row?"))
			rows.eq(rows.length - 1).remove();
	}

	function escapeHTML(string) {
		return string.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}


	// Returns a time 1 second after the one passed in.
	// time = A string in mm:ss format
	// The leading zero in the minutes field may be omitted.
	function nextTime(time) {
		var colonIdx = time.indexOf(":");
		if (colonIdx == -1)
			return time;
		var minutes = time.substring(0, colonIdx);
		var seconds = time.substring(colonIdx + 1);
		if (seconds === "59")
			return +minutes + 1 + ":00";
		else if (+seconds < 9)
			return minutes + ":0" + (+seconds + 1);
		return minutes + ":" + (+seconds + 1); 
	}
})();