var backOfficeApp = angular.module('backOfficeApp', []);

backOfficeApp.controller('generalController', ['$scope', '$rootScope', function($scope, $rootScope) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $scope.globals = globals;
    $scope.refresh = function() {
        if (!$scope.$$phase)
            $scope.$apply();
    };
}]);

/* Filter for trusted HTML. Usage: ng-bind-html="var | trust" */
backOfficeApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);
