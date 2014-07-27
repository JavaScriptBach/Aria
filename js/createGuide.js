"use strict";
(function() {
	$("input[type='text']").change(function() {
		console.log(this.value);
	});

	function escapeHTML(string) {
		// var pre = document.createElement('pre');
		// var text = document.createTextNode(string);
		// pre.appendChild(text);
		// return pre.innerHTML;
		// return $("<pre>").text(string).html();
		return string.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
	};

	$("#add-row-btn").click(function() {
		var rows = $("tr");
		var lastRow = rows.eq(rows.length - 1);
		var lastCols = lastRow.children();
		var nextRowPageNumber;
		if (rows.length == 2)
			nextRowPageNumber = parseInt(lastCols[0].innerHTML) + 1;
		else
			nextRowPageNumber = parseInt(lastCols.eq(0).children().val()) + 1;
		if (isNaN(nextRowPageNumber) || nextRowPageNumber < 1)
			nextRowPageNumber = 1;
		var nextRowStartTime = lastCols.eq(2).children().val();
		var html = '<tr><td><input type="text" value="' + nextRowPageNumber + '"></td><td>';
		html += '<input type="text" value="' + escapeHTML(nextRowStartTime) + '"></td>';
		html += '<td><input type="text" value="foo"></td>';
		$("tbody").append(html);
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