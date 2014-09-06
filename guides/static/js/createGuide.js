(function() {
	"use strict";

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

	$("#submit-btn").click(function(e) {
		$(this).prop('disabled', true);
		if (validateData()) {
			// TODO: parse data into a JSON string and submit it
			var guide = {
				summary: $.trim($("#summary").val()),
				pageData: 
			};

			$("form").submit();
		} else {
			alert("You did not enter valid data");
			$(this).prop('disabled', false);
		}
	});

	// Returns true iff user inputted valid data.
	// A valid form is defined as the following:
	// - Summary field is nonempty
	// - Score and audio files are chosen
	// - All times are in mm:ss format or m:ss format
	// - Times in each table must be continuous and nonoverlapping
	// - Page numbers are positive integers
	// - Guide text is nonempty
	function validateData() {
		if ($.trim($("#summary").val()) == "")
			return false;
		// TODO: validate upload files

		var pageBoxes = $("#page-data input");
		if (pageBoxes.length % 3 != 0)
			return false;
		for (var i = 0; i < pageBoxes.length; i+=3) {
			var pageNum = parseInt(pageBoxes[i].value);
			var startTime = pageBoxes[i+1].value;
			var endTime = pageBoxes[i+2].value;
			if (pageNum != pageNum) // check for NaN
				return false;
			if (!validateTimes(startTime, endTime))
				return false;

		}
		return true;
	}

	// Returns true iff start and end are both valid time strings
	// and end is later than start
	function validateTimes(start, end) {
		var startTokens = start.split(":");
		var endTokens = end.split(":");
		if (startTokens.length != 2 || endTokens.length != 2)
			return false;
		var startMin = parseInt(startTokens[0]);
		var startSecs = parseInt(startTokens[1]);
		var endMin = parseInt(endTokens[0]);
		var endSecs = parseInt(endTokens[1]);
		// Check for NaN
		if (startMin != startMin || startSecs != startSecs
			|| endMin != endMin || endSecs != endSecs)
			return false;

		// Check non-negativity
		if (startMin < 0 || startSecs < 0 || endMin < 0 || endSecs < 0)
			return false;
		// Check end > start
		return (endMin * 60 + endSecs) > (startMin * 60 + startSecs);
	}


	// Appends a new row to the table, with intelligently filled in values
	// type = A string, either "page" or "guide", which describes
	// the table to append to.
	function addRow(type) {
		var rows = $("#" + type + "-data tbody tr");
		var lastRow = rows.eq(rows.length - 1);
		var lastCols = lastRow.children();
		
		var html = "";
		if (type === "page") {
			var nextRowPageNumber = parseInt(lastCols.eq(0).children().val()) + 1;
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