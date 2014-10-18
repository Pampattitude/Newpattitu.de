var frontApp = angular.module('frontApp', []);

frontApp.controller('generalController', ['$scope', '$rootScope', function($scope, $rootScope) {
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
frontApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

/* Twitter */
frontApp.directive('pollTwitter', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            var linkify = function(inputText) { // By cloud8421 on StackOverflow
                var replacedText, replacePattern1, replacePattern2, replacePattern3;

                //URLs starting with http://, https://, or ftp://
                replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
                replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

                //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

                //Change email addresses to mailto:: links.
                replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
                replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

                return replacedText;
            };

            var pollTwitter = function(doneCallback) {
                var url = '/ajax/twitter/getLatest';
                return $.ajax(url).done(function(data) {
                    console.log('DONE', data);

                    $scope.twitterPosts = data.map(function(elem) {
                        elem.text = linkify(
                            elem.text
                                .replace(/(@[A-Za-z0-9\-_]+)/g, '<span class="user">$1</span>')  // Users
                                .replace(/(#[A-Za-z0-9\-_]+)/g, '<span class="hashtag">$1</span>')
                        ); // Hashtags
                        return elem;
                    });
                    $scope.refresh();

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
