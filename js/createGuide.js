"use strict";
(function() {
	$("#add-row-btn").click(function() {
		var rows = $("tr");
		var lastRow = rows.eq(rows.length - 1);
		var lastCols = lastRow.children();
		var nextRowPageNumber;
		if (rows.length == 2)
			nextRowPageNumber = parseInt(lastCols[0].innerHTML) + 1;
		else
			nextRowPageNumber = parseInt(lastCols.eq(0).children().val()) + 1;
		var nextRowStartTime = lastCols.eq(2).children().val();
		var html = "<tr><td><input type='text' value='" + nextRowPageNumber + "'></td><td>";
		html += "<input type='text' value='" + nextRowStartTime + "'></td>";
		html += "<td><input type='text' value='foo'></td>";
		document.querySelector("tbody").innerHTML += html;
	});

	$("#remove-row-btn").click(function() {
		var rows = $("tr");
		if (rows.length == 2)
			return;
		if (confirm("Are you sure you want to delete the last row?")) {
			rows.eq(rows.length - 1).remove();
		}
	});
})();