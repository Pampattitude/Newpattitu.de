var frontApp = angular.module('frontApp', []);

frontApp.controller('generalController', ['$scope', '$rootScope', function($scope, $rootScope) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $scope.globals = globals;
    $scope.apply = function() {
        if (!$scope.$$phase)
            $scope.$apply();
    };
}]);

/* Twitter */
frontApp.directive('pollTwitter', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            var pollTwitter = function(doneCallback) {
                var url = '/ajax/twitter/getLatest';
                return $.ajax(url).done(function(data) {
                    console.log('DONE', data);

                    $scope.twitterPosts = data;
                    $scope.apply();

                    return doneCallback(null, data);
                }).error(function(data) {
                    console.log('ERR', data);
                });
            };

            var loop = function() {
                return pollTwitter(function(err, data) {
                    if (err) {
                        console.log(err); // TMP, should display an error and send a report
                        return ;
                    }

                    return setTimeout(loop, 10000 /* ms, so 10s */);
                });
            };

            return loop();
        },
    };
});
/* !Twitter */
