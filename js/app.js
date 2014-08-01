"use strict";
// Remember: no jQuery
(function() {
    // Create Angular app
    var app = angular.module('app', ['ngAnimate']);

    // Define the controller for our app.
    app.controller('audioCtrl', function($scope, $http) {
        // Get the listening guide and score data.
        $scope.guideData = [];
        $scope.scoreData = [];
        $http.get("guide-data.json").success(function(data) {
            $scope.guideData = data;
        });
        $http.get("score-data.json").success(function(data) {
            $scope.scoreData = data;
        });

        $scope.time = 0;
        $scope.pdf = null;
        $scope.viewport = null;
        $scope.canvasContext = null;
        $scope.currentPage = 1;
        $scope.topOffset = $("#guide-container").offset().top;

        // Displays the current page as specified by $scope.currentPage
        // if recalc is set to true, then recalculates the dimensions
        // of the viewport before displaying.
        $scope.displayPage = function(recalc) {
            $scope.pdf.getPage($scope.currentPage).then(function(page) {
                if (recalc) {
                    var desiredWidth = $("#score").width() - parseInt($("#score").parent().css("padding-right"));
                    var viewport = page.getViewport(1);
                    var scale = desiredWidth / viewport.width;
                    var scaledViewport = page.getViewport(scale);
                    $scope.viewport = scaledViewport;
                    // Prepare canvas using PDF page dimensions
                    var canvas = document.getElementById("canvas");
                    var context = canvas.getContext('2d');
                    $scope.canvasContext = context;
                    canvas.height = scaledViewport.height;
                    canvas.width = scaledViewport.width;
                }
                page.render({
                    canvasContext: $scope.canvasContext,
                    viewport: $scope.viewport
                });
            });
        };

        // Returns the current page the view should be displaying
        // Uses binary search. Hence the score data must be a sorted array.
        // lo = lowest index inclusive
        // hi = highest index noninclusive
        $scope.findPage = function(lo, hi) {
            if (lo >= hi)
                return -1;
            var mid = Math.floor((lo + hi) / 2);
            if ($scope.time >= $scope.scoreData[mid].end)
                return $scope.findPage(mid, hi);
            if ($scope.time < $scope.scoreData[mid].start)
                return $scope.findPage(lo, mid);
            return $scope.scoreData[mid].page;
        }

        // Updates the page on the DOM, if and only if necessary.
        $scope.updatePage = function() {
            if ($scope.scoreData == [])
                return;
            // First check if the current page is correct.
            var data = $scope.scoreData[$scope.currentPage - 1];
            if ($scope.time >= data.start && $scope.time < data.end)
                return;

            // Current page isn't correct, so we compute the correct page.
            var computed = $scope.findPage(0, $scope.scoreData.length);
            $scope.currentPage = computed;
            $scope.displayPage(false);
        };
    });

    // Bind the HTML audio element so we can use it in our controller.
    app.directive("myAudio", function() {
        return {
            link: function(scope, element, attrs) {
                element.on("timeupdate", function() {
                    scope.time = element[0].currentTime;
                    scope.$apply();
                    scope.updatePage();
                });
            }
        };
    });

    app.directive("myScore", function() {
        return {
            link: function(scope, element, attrs) {
                var url = "score_beethoven.pdf";
                PDFJS.workerSrc = "pdfjs-1.0.68-dist/build/pdf.worker.js";
                PDFJS.getDocument(url).then(function(pdf) {
                    scope.pdf = pdf;
                    // Fetch first page
                    scope.displayPage(true);
                    var resizeID;
                    $(window).resize(function() {

                        clearTimeout(resizeID);
                        resizeID = setTimeout(function() {
                            scope.displayPage(true);
                        }, 500);
                    });
                });
            }
        };
    });

    app.directive("guideContainer", function() {
        return {
            link: function(scope, element, attrs) {
                var enabled = false;
                element.on("affix.bs.affix", function() {
                    $("#score-container").addClass("col-sm-offset-4");
                });

                element.on("affix-top.bs.affix", function() {
                    $("#score-container").removeClass("col-sm-offset-4");
                });
                if ($(window).width() >= 768) {
                    // Affix element.
                    element.affix({
                        offset: {
                            top: function() {
                                return scope.topOffset;
                            }
                        }
                    });
                    enabled = true;
                }
                var resizeID;
                $(window).resize(function() {
                    clearTimeout(resizeID);
                    resizeID = setTimeout(function() {
                        if ($(this).width() < 768 && enabled) {
                            $(this).off('.affix');
                            element.removeClass("affix affix-top").removeData("bs.affix");
                            enabled = false;
                        } else {
                            scope.topOffset = element.offset().top;
                            if (!enabled) {
                                element.affix({
                                    offset: {
                                        top: function() {
                                            return scope.topOffset;
                                        }
                                    }
                                });
                                enabled = true;
                            }

                        }
                    }, 500);
                });


            }
        }
    })
})();