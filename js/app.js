"use strict";
(function() {
    var guideData = null;
    var scoreData = null;
    var pdf = null;
    var pdfViewport = null;
    var canvasContext = null;
    var currentPage = 1;
    var currentBulletNumber = 1;
    var $audio = $("audio");
    var $guideBullet = $("#guide-bullet");
    var affixConstructed = false;
    var affixTopOffset = 0;

    // Load guide data.
    $.getJSON("guide-data.json", function(data) {
        guideData = data;

        // Listen to audio timeupdate
        $audio.on("timeupdate", function() {
            updateDOM("guide", this.currentTime);
        });
    });

    // Load score data.
    $.getJSON("score-data.json", function(data) {
        scoreData = data;

        // Listen to audio timeupdate
        $audio.on("timeupdate", function() {
            updateDOM("score", this.currentTime);
        });
    });

    // Load PDF and display first page.
    PDFJS.workerSrc = "pdfjs-1.0.68-dist/build/pdf.worker.js";
    PDFJS.getDocument("score_beethoven.pdf").then(function(data) {
        pdf = data;
        displayCurrentPage(true);
    });

    // Set the affix listeners to apply the proper classes
    $("#guide-container").on("affix.bs.affix", function() {
        $("#score-container").addClass("col-sm-offset-4");
    })
    .on("affix-top.bs.affix", function() {
        $("#score-container").removeClass("col-sm-offset-4");
    });

    // Set affix
    updateAffix();

    var resizeID;
    $(window).resize(function() {
        clearTimeout(resizeID);
        resizeID = setTimeout(function() {
            // Re-render PDF in proper dimensions
            displayCurrentPage(true);

            // Update affix
            updateAffix();
        }, 500);
    });

    // Renders and displays the page specified by currentPage.
    // If recalc is truthy, then will calculate viewport before rendering.
    // Recalc should be set the first time this function is called.
    // Afterwards, there is no need to set it until the viewport resizes.
    function displayCurrentPage(recalc) {
        if (!pdf)
            return;
        pdf.getPage(currentPage).then(function(page) {
            if (recalc) {
                var desiredWidth = $("#score").width() - parseInt($("#score").parent().css("padding-right"));
                var tempViewport = page.getViewport(1);
                var scale = desiredWidth / tempViewport.width;
                pdfViewport = page.getViewport(scale);
                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById("canvas");
                var context = canvas.getContext('2d');
                canvasContext = context;
                canvas.height = pdfViewport.height;
                canvas.width = pdfViewport.width;
            }
            page.render({
                canvasContext: canvasContext,
                viewport: pdfViewport
            });
        });
            
    }

    // Updates the DOM if and only if necessary.
    // type = A string, either "score" or "guide"
    // time = The current time of the audio
    function updateDOM(type, time) {
        if (type === "score") {
            if (!scoreData)
                return;
            // First check if the current page is correct.
            var data = scoreData[currentPage - 1];
            if (time >= data.start && time < data.end)
                return;
            currentPage = scoreData[findIndex(type, time)].page;
            displayCurrentPage();
        } else {
            if (!guideData)
                return;
            var data = guideData[currentBulletNumber - 1];
            if (time >= data.start && time < data.end)
                return;
            var idx = findIndex(type, time);
            currentBulletNumber = idx + 1;
            $guideBullet.hide().text(guideData[idx].text).fadeIn(300);
        }
    }

    // Returns the index of a sorted data array whose object contains time
    // in its interval.
    // type = A string, either "score" or "guide", specifying the array
    // to search
    // time = the current time of audio
    function findIndex(type, time) {
        if (type === "score")
            return findDataIndex(scoreData, time, 0, scoreData.length);
        else
            return findDataIndex(guideData, time, 0, guideData.length);
    }

    // Returns the index of a sorted array of interval objects,
    // each containing start and end fields, such that
    // arr[index] = the interval object containing time.
    // arr = sorted array of interval objects
    // time = current time of audio
    // lo = lower bound of index to search, inclusive
    // hi = upper bound of index to search, exclusive
    function findDataIndex(arr, time, lo, hi) {
        if (lo >= hi)
            return -1;
        var mid = Math.floor(lo + (hi - lo) / 2);
        if (time >= arr[mid].end)
            return findData(data, time, mid, hi);
        if (time < arr[mid].start)
            return findData(data, time, lo, mid);
        return mid;
    }

    // Updates the affix attributes, according to the following behavior:
    // Affix is disabled on xs viewports, and enabled otherwise.
    // If affix is enabled, will also correctly update the top offset setting.
    function updateAffix() {
        if ($(window).width() < 768 && affixConstructed) {
            // Destroy affix
            $(window).off('.affix');
            $("#guide-container").removeClass("affix affix-top").removeData("bs.affix");
            affixConstructed = false;
        } else {
            if (!affixConstructed) {
                // Construct affix
                $("#guide-container").affix({
                    offset: {
                        top: function() {
                            return affixTopOffset;
                        }
                    }
                });
                affixConstructed = true;
            }

            // Update affix offset
            affixTopOffset = $("#guide-container").offset().top;
        }
    }
})();
