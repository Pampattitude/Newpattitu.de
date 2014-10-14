var frontApp = angular.module('frontApp', []);

frontApp.controller('generalController', ['$scope', '$rootScope', function($scope, $rootScope) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $scope.globals = globals;
}]);
