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
