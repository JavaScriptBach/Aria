"use strict";
(function() {
	// Fetch and render first page
	var url = "score_beethoven.pdf";
	PDFJS.workerSrc = "pdfjs-1.0.68-dist/build/pdf.worker.js";
	PDFJS.getDocument(url).then(function(pdf) {
		var currentPage = null;
		var displayPage = function(pageNumber) {
			pdf.getPage(pageNumber).then(function(page) {
				currentPage = page;
				var desiredWidth = $("#score").width() - parseInt($("#score").parent().css("padding-right"));
				var viewport = page.getViewport(1);
				var scale = desiredWidth / viewport.width;
				var scaledViewport = page.getViewport(scale);
				// Prepare canvas using PDF page dimensions
				var canvas = document.getElementById("canvas");
				var context = canvas.getContext('2d');
				canvas.height = scaledViewport.height;
				canvas.width = scaledViewport.width;
				page.render({
					canvasContext: context,
					viewport: scaledViewport
				});
			});

		};

		displayPage(1);

		$("#prev-btn").click(function() {
			var pageNum = currentPage.pageNumber;
			if (pageNum > 1) {
				displayPage(pageNum - 1);
			}
		});

		$("#next-btn").click(function() {
			var pageNum = currentPage.pageNumber;
			if (pageNum < pdf.numPages) {
				displayPage(pageNum + 1);
			}
		});

		$("#go-btn").click(function() {
			var pageNum = parseInt($("#go-page-number").val());
			if (pageNum >= 1 && pageNum <= pdf.numPages) {
				displayPage(pageNum);
			}
		});
	});

	// Create a new table row for page data, with intelligently filled in values
	$("#page-add-row-btn").click(function() {
		var rows = $("#page-data tbody tr");
		var lastRow = rows.eq(rows.length - 1);
		var lastCols = lastRow.children();
		var nextRowPageNumber;
		if (rows.length == 1)
			nextRowPageNumber = parseInt(lastCols[0].innerHTML) + 1;
		else
			nextRowPageNumber = parseInt(lastCols.eq(0).children().val()) + 1;
		if (isNaN(nextRowPageNumber) || nextRowPageNumber < 1)
			nextRowPageNumber = 1;
		var nextRowStartTime = lastCols.eq(2).children().val();
		var html = '<tr><td><input type="text" value="' + nextRowPageNumber + '"></td><td>';
		html += '<input type="text" value="' + escapeHTML(nextRowStartTime) + '"></td>';
		html += '<td><input type="text" value="foo"></td>';
		$("#page-data tbody").append(html);
	});

	// Removes the bottom-most table row for page data after confirmation
	$("#page-remove-row-btn").click(function() {
		removeRow("page");
	});

	// Removes the bottom-most table row for guide data after confirmation
	$("#guide-remove-row-btn").click(function() {
		removeRow("guide");
	});

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
})();