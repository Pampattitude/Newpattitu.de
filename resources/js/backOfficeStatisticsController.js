backOfficeApp.controller('statisticsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    /* Comment */
    $scope.getGeneralCommentStatistics = function(callback) {
        var generalCommentStatisticsUrl = '/back-office/stats/comments/general';
        return $http.get(generalCommentStatisticsUrl, {}).then(function(response) {
            if (response.data.generalCommentStatistics)
                $scope.generalCommentStatistics = response.data.generalCommentStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getGeneralCommentStatisticsLoop = function() {
        return $scope.getGeneralCommentStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get general comment statistics because: ' + err);

            return setTimeout($scope.getGeneralCommentStatisticsLoop, 10 * 1000); // Get stats every 10 seconds
        });
    };
    $scope.getGeneralCommentStatisticsLoop();
    /* !Comment */

    /* Unique sessions - general */
    $scope.getGeneralUniqueSessionStatistics = function(callback) {
        var generalUniqueSessionStatisticsUrl = '/back-office/stats/uniqueSessions/general';
        return $http.get(generalUniqueSessionStatisticsUrl, {}).then(function(response) {
            if (response.data.generalUniqueSessionStatistics)
                $scope.generalUniqueSessionStatistics = response.data.generalUniqueSessionStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getGeneralUniqueSessionStatisticsLoop = function() {
        return $scope.getGeneralUniqueSessionStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get general unique session statistics because: ' + err);

            return setTimeout($scope.getGeneralUniqueSessionStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getGeneralUniqueSessionStatisticsLoop();
    /* !Unique sessions - general */

    /* Unique sessions - page view */
    $scope.getUniqueSessionRouteStatistics = function(callback) {
        var uniqueSessionStatisticsUrl = '/back-office/stats/uniqueSessions/routes';
        return $http.get(uniqueSessionStatisticsUrl, {}).then(function(response) {
            if (response.data.uniqueSessionRouteStatistics)
                $scope.uniqueSessionRouteStatistics = response.data.uniqueSessionRouteStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getUniqueSessionRouteStatisticsLoop = function() {
        return $scope.getUniqueSessionRouteStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get unique session route statistics because: ' + err);

            return setTimeout($scope.getUniqueSessionRouteStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getUniqueSessionRouteStatisticsLoop();
    /* !Unique sessions - page view */

    /* Referrer */
    $scope.getUniqueSessionReferrerStatistics = function(callback) {
        var uniqueSessionStatisticsUrl = '/back-office/stats/uniqueSessions/referrer';
        $http.get(uniqueSessionStatisticsUrl, {}).then(function(response) {
            if (response.data.uniqueSessionReferrerStatistics)
                $scope.uniqueSessionReferrerStatistics = response.data.uniqueSessionReferrerStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getUniqueSessionReferrerStatisticsLoop = function() {
        return $scope.getUniqueSessionReferrerStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get unique sessionreferrer statistics because: ' + err);

            return setTimeout($scope.getUniqueSessionReferrerStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getUniqueSessionReferrerStatisticsLoop();
    /* !Referrer */

    /* Page views - general */
    $scope.getGeneralPageViewStatistics = function(callback) {
        var generalPageViewStatisticsUrl = '/back-office/stats/pageViews/general';
        return $http.get(generalPageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.generalPageViewStatistics)
                $scope.generalPageViewStatistics = response.data.generalPageViewStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getGeneralPageViewStatisticsLoop = function() {
        return $scope.getGeneralPageViewStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get general page view statistics because: ' + err);

            return setTimeout($scope.getGeneralPageViewStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getGeneralPageViewStatisticsLoop();
    /* !Page views - general */

    /* Page views */
    $scope.getPageViewRouteStatistics = function(callback) {
        var pageViewStatisticsUrl = '/back-office/stats/pageViews/routes';
        return $http.get(pageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.pageViewRouteStatistics)
                $scope.pageViewRouteStatistics = response.data.pageViewRouteStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getPageViewRouteStatisticsLoop = function() {
        return $scope.getPageViewRouteStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get page view route statistics because: ' + err);

            return setTimeout($scope.getPageViewRouteStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getPageViewRouteStatisticsLoop();
    /* !Page views */

    /* Referrer */
    $scope.getPageViewReferrerStatistics = function(callback) {
        var pageViewStatisticsUrl = '/back-office/stats/pageViews/referrer';
        $http.get(pageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.pageViewReferrerStatistics)
                $scope.pageViewReferrerStatistics = response.data.pageViewReferrerStatistics;
            return callback();
        }, function(response) {
            return callback(response.data.message);
        });
    };
    $scope.getPageViewReferrerStatisticsLoop = function() {
        return $scope.getPageViewReferrerStatistics(function(err) {
            if (err)
                return $scope.addAlert('error', 'Could not get referrer statistics because: ' + err);

            return setTimeout($scope.getPageViewReferrerStatisticsLoop, 10 * 1000);
        });
    };
    $scope.getPageViewReferrerStatisticsLoop();
    /* !Referrer */
}]);

backOfficeApp.directive('linechart', function($parse) {
    return {
        restrict: 'EA',
        template: '<div></div>',
        replace: true,
        link: function($scope, $elem, $attrs) {
            var generateChart = function() {
                var data = $parse($attrs.data)($scope);
                var xkey = $parse($attrs.xkey)($scope);
                var ykeys = $parse($attrs.ykeys)($scope);
                var labels = $parse($attrs.labels)($scope);
                var resize = $parse($attrs.resize)($scope) || false;

                $elem.empty();
                return Morris.Line({
                    element: $elem,
                    data: data,
                    xkey: xkey,
                    ykeys: ykeys,
                    labels: labels,
                    resize: resize,
                    smooth: true,
                    parseTime: false,
                    gridTextFamily: 'Lato',
                });
            };

            $scope.$watch($attrs.data, function() {
                if ($attrs.data && $attrs.data.length)
                    generateChart();
            });
        },
    };
});

backOfficeApp.directive('areachart', function($parse) {
    return {
        restrict: 'EA',
        template: '<div></div>',
        replace: true,
        link: function($scope, $elem, $attrs) {
            var generateChart = function() {
                var data = $parse($attrs.data)($scope);
                var xkey = $parse($attrs.xkey)($scope);
                var ykeys = $parse($attrs.ykeys)($scope);
                var labels = $parse($attrs.labels)($scope);
                var resize = $parse($attrs.resize)($scope) || false;

                $elem.empty();
                return Morris.Area({
                    element: $elem,
                    data: data,
                    xkey: xkey,
                    ykeys: ykeys,
                    labels: labels,
                    resize: resize,
                    smooth: true,
                    parseTime: false,
                    gridTextFamily: 'Lato',
                });
            };

            $scope.$watch($attrs.data, function() {
                if ($attrs.data && $attrs.data.length)
                    generateChart();
            });
        },
    };
});

backOfficeApp.directive('barchart', function($parse) {
    return {
        restrict: 'EA',
        template: '<div></div>',
        replace: true,
        link: function($scope, $elem, $attrs) {
            var generateChart = function() {
                var data = $parse($attrs.data)($scope);
                var xkey = $parse($attrs.xkey)($scope);
                var ykeys = $parse($attrs.ykeys)($scope);
                var labels = $parse($attrs.labels)($scope);
                var resize = $parse($attrs.resize)($scope) || false;

                $elem.empty();
                return Morris.Bar({
                    element: $elem,
                    data: data,
                    xkey: xkey,
                    ykeys: ykeys,
                    labels: labels,
                    resize: resize,
                    smooth: true,
                    parseTime: false,
                    gridTextFamily: 'Lato',
                });
            };

            $scope.$watch($attrs.data, function() {
                if ($attrs.data && $attrs.data.length)
                    generateChart();
            });
        },
    };
});
