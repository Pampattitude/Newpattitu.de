backOfficeApp.controller('statisticsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    /* Article */
    $scope.getGeneralArticleStatistics = function() {
        var generalArticleStatisticsUrl = '/back-office/stats/articles/general';
        $http.get(generalArticleStatisticsUrl, {}).then(function(response) {
            if (response.data.generalArticleStatistics)
                $scope.generalArticleStatistics = response.data.generalArticleStatistics;
        }, function(response) {
            $scope.addAlert('error', 'Could not get general article statistics because: ' + response.data.message);
        });
    };
    $scope.getGeneralArticleStatistics();
    /* !Article */

    /* Comment */
    $scope.getGeneralCommentStatistics = function() {
        var generalCommentStatisticsUrl = '/back-office/stats/comments/general';
        $http.get(generalCommentStatisticsUrl, {}).then(function(response) {
            if (response.data.generalCommentStatistics)
                $scope.generalCommentStatistics = response.data.generalCommentStatistics;
        }, function(response) {
            $scope.addAlert('error', 'Could not get general comment statistics because: ' + response.data.message);
        });
    };
    $scope.getGeneralCommentStatistics();
    /* !Comment */

    /* Page views - general */
    $scope.getGeneralPageViewStatistics = function() {
        var generalPageViewStatisticsUrl = '/back-office/stats/pageViews/general';
        $http.get(generalPageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.generalPageViewStatistics)
                $scope.generalPageViewStatistics = response.data.generalPageViewStatistics;
        }, function(response) {
            $scope.addAlert('error', 'Could not get general page view statistics because: ' + response.data.message);
        });
    };
    $scope.getGeneralPageViewStatistics();
    /* !Page views - general */

    /* Page views */
    $scope.getPageViewRouteStatistics = function() {
        var pageViewStatisticsUrl = '/back-office/stats/pageViews/routes';
        $http.get(pageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.pageViewRouteStatistics)
                $scope.pageViewRouteStatistics = response.data.pageViewRouteStatistics;
        }, function(response) {
            $scope.addAlert('error', 'Could not get page view route statistics because: ' + response.data.message);
        });
    };
    $scope.getPageViewRouteStatistics();
    /* !Page views */

    /* Referrer */
    $scope.getPageViewReferrerStatistics = function() {
        var pageViewStatisticsUrl = '/back-office/stats/pageViews/referrer';
        $http.get(pageViewStatisticsUrl, {}).then(function(response) {
            if (response.data.pageViewReferrerStatistics)
                $scope.pageViewReferrerStatistics = response.data.pageViewReferrerStatistics;
        }, function(response) {
            $scope.addAlert('error', 'Could not get referrer statistics because: ' + response.data.message);
        });
    };
    $scope.getPageViewReferrerStatistics();
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
