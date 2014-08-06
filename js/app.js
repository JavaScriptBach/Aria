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

    // Renders and displays the page specified by currentPage.
    // If recalc is truthy, then will calculate viewport before rendering.
    // Recalc should be set the first time this function is called.
    // Afterwards, there is no need to set it until the viewport resizes.
    function displayCurrentPage(recalc) {
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
})();
    // // Create Angular app
    // var app = angular.module('app', ['ngAnimate']);

    // // Service vs factory vs provider vs ???
    // app.service('currentTime', )

    // app.controller('guideCtrl', function($scope, $http) {
    //     $scope.guideData = [];
    //     $http.get("guide-data.json").success(function(data) {
    //         $scope.guideData = data;
    //     });
    //     $scope.topOffset = $("#guide-container").offset().top;
    // });

    // app.controller('scoreCtrl', function($scope, $http) {
    //     $scope.scoreData = [];
    //     $http.get("score-data.json").success(function(data) {
    //         $scope.scoreData = data;
    //     });
    //     $scope.pdf = null;
    //     $scope.viewport = null;
    //     $scope.canvasContext = null;
    //     $scope.currentPage = 1;

    //     // Displays the current page as specified by $scope.currentPage
    //     // if recalc is set to true, then recalculates the dimensions
    //     // of the viewport before displaying.
    //     $scope.displayPage = function(recalc) {
    //         $scope.pdf.getPage($scope.currentPage).then(function(page) {
    //             if (recalc) {
    //                 var desiredWidth = $("#score").width() - parseInt($("#score").parent().css("padding-right"));
    //                 var viewport = page.getViewport(1);
    //                 var scale = desiredWidth / viewport.width;
    //                 var scaledViewport = page.getViewport(scale);
    //                 $scope.viewport = scaledViewport;
    //                 // Prepare canvas using PDF page dimensions
    //                 var canvas = document.getElementById("canvas");
    //                 var context = canvas.getContext('2d');
    //                 $scope.canvasContext = context;
    //                 canvas.height = scaledViewport.height;
    //                 canvas.width = scaledViewport.width;
    //             }
    //             page.render({
    //                 canvasContext: $scope.canvasContext,
    //                 viewport: $scope.viewport
    //             });
    //         });
    //     };

    //     // Returns the current page the view should be displaying
    //     // Uses binary search. Hence the score data must be a sorted array.
    //     // lo = lowest index inclusive
    //     // hi = highest index noninclusive
    //     $scope.findPage = function(lo, hi) {
    //         if (lo >= hi)
    //             return -1;
    //         var mid = Math.floor((lo + hi) / 2);
    //         if ($scope.time >= $scope.scoreData[mid].end)
    //             return $scope.findPage(mid, hi);
    //         if ($scope.time < $scope.scoreData[mid].start)
    //             return $scope.findPage(lo, mid);
    //         return $scope.scoreData[mid].page;
    //     }

    //     // Updates the page on the DOM, if and only if necessary.
    //     $scope.updatePage = function() {
    //         if ($scope.scoreData == [])
    //             return;
    //         // First check if the current page is correct.
    //         var data = $scope.scoreData[$scope.currentPage - 1];
    //         if ($scope.time >= data.start && $scope.time < data.end)
    //             return;

    //         // Current page isn't correct, so we compute the correct page.
    //         var computed = $scope.findPage(0, $scope.scoreData.length);
    //         $scope.currentPage = computed;
    //         $scope.displayPage();
    //     };
    // });

    // app.controller('audioCtrl', function($scope, $http) {
    //     // $scope.time = 0;
    //     // Both controllers need to access time.
    //     // Probably need to do something with rootScope?
    // });

    // // Bind the HTML audio element so we can use it in our controller.
    // app.directive("myAudio", function() {
    //     return {
    //         link: function(scope, element, attrs) {
    //             element.on("timeupdate", function() {
    //                 scope.time = element[0].currentTime;
    //                 scope.$apply();
    //                 scope.updatePage();
    //             });
    //         }
    //     };
    // });

    // app.directive("myScore", function() {
    //     return {
    //         link: function(scope, element, attrs) {
    //             var url = "score_beethoven.pdf";
    //             PDFJS.workerSrc = "pdfjs-1.0.68-dist/build/pdf.worker.js";
    //             PDFJS.getDocument(url).then(function(pdf) {
    //                 scope.pdf = pdf;
    //                 // Fetch first page
    //                 scope.displayPage(true);
    //                 var resizeID;
    //                 $(window).resize(function() {

    //                     clearTimeout(resizeID);
    //                     resizeID = setTimeout(function() {
    //                         scope.displayPage(true);
    //                     }, 500);
    //                 });
    //             });
    //         }
    //     };
    // });

    // app.directive("guideContainer", function() {
    //     return {
    //         link: function(scope, element, attrs) {
    //             var enabled = false;
    //             element.on("affix.bs.affix", function() {
    //                 $("#score-container").addClass("col-sm-offset-4");
    //             });

    //             element.on("affix-top.bs.affix", function() {
    //                 $("#score-container").removeClass("col-sm-offset-4");
    //             });
    //             if ($(window).width() >= 768) {
    //                 // Affix element.
    //                 element.affix({
    //                     offset: {
    //                         top: function() {
    //                             return scope.topOffset;
    //                         }
    //                     }
    //                 });
    //                 enabled = true;
    //             }
    //             var resizeID;
    //             $(window).resize(function() {
    //                 clearTimeout(resizeID);
    //                 resizeID = setTimeout(function() {
    //                     if ($(this).width() < 768 && enabled) {
    //                         $(this).off('.affix');
    //                         element.removeClass("affix affix-top").removeData("bs.affix");
    //                         enabled = false;
    //                     } else {
    //                         scope.topOffset = element.offset().top;
    //                         if (!enabled) {
    //                             element.affix({
    //                                 offset: {
    //                                     top: function() {
    //                                         return scope.topOffset;
    //                                     }
    //                                 }
    //                             });
    //                             enabled = true;
    //                         }

    //                     }
    //                 }, 500);
    //             });


    //         }
    //     }
    // })