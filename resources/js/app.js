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

    /* Alerts */
    $scope.alertList = [];
    $scope.alertIdx_ = 0;

    $scope.addAlert = function(state, message) {
        var alert = {
            idx_: ($scope.alertIdx_)++,
            state: state,
            message: message,
            disappear: false
        };
        $scope.alertList.push(alert);
        $scope.refresh();

        if ('error' == state)
            return ; // Do not set automatic close on error

        return setTimeout(function() {
            for (var i = 0 ; $scope.alertList.length > i ; ++i) {
                if ($scope.alertList[i].idx_ == alert.idx_)
                    break ;
            }
            if ($scope.alertList.length == i)
                return $scope.removeAlert(alert);

            $($('.pmp-alert')[i]).slideUp(200 /*ms*/, function() {
                $scope.removeAlert(alert);
            });
        }, 5000 /*ms*/);
    };

    $scope.removeAlert = function(alert) {
        $scope.alertList = $scope.alertList.filter(function(elem) {
            return elem.idx_ != alert.idx_;
        });
        $scope.refresh();
    };

    if ($scope.globals.alertList) {
        for (var i = 0 ; $scope.globals.alertList.length > i ; ++i) {
            var alert = $scope.globals.alertList[i];
            $scope.addAlert(alert.state, alert.message);
        }
    }
    /* !Alerts */
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
                    if (data) {
                        $scope.twitterPosts = data.map(function(elem) {
                            elem.text = linkify(
                                elem.text
                                    .replace(/(@[A-Za-z0-9\-_]+)/g, '<span class="user">$1</span>')  // Users
                                    .replace(/(#[A-Za-z0-9\-_]+)/g, '<span class="hashtag">$1</span>')
                            ); // Hashtags
                            return elem;
                        });
                        $scope.refresh();
                    }

                    return doneCallback(null, data);
                }).error(function(data) {
                    $scope.addAlert('error', 'Could not retrieve tweets from Twitter');

                    return doneCallback(err);
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

frontApp.controller('articleCommentsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.postComment = function() {
        if (!$scope.newComment)
            return $scope.addAlert('error', 'An error occured with the comment form, please <a href="/report">report it</a>');

        if (!$scope.newComment.author ||
            2 >= $scope.newComment.author.length)
            return $scope.addAlert('error', 'Name too short, refusing to send such a useless comment!');

        if (!$scope.newComment.text ||
            10 >= $scope.newComment.text.length)
            return $scope.addAlert('error', 'Comment content too short, refusing to send such a useless comment!');

        var postCommentUrl = '/ajax/article/' + $scope.globals.article.technicalName + '/comment';
        return $http.post(postCommentUrl, {
            author: $scope.newComment.author,
            text: $scope.newComment.text,
        }).then(function(response) { // Success
            $scope.addAlert('success', 'Comment successfully posted, thank you for the feedback!');
            delete $scope.newComment;
            $scope.newCommentPosted = true;

            var getCommentsUrl = '/ajax/article/' + $scope.globals.article.technicalName + '/getComments';
            return $http.get(getCommentsUrl, {}).then(function(response) { // Success
                $scope.globals.commentList = response.data.commentList;
                $scope.refresh();
            }, function(response) { // Error
                return $scope.addAlert('error', 'An error occured while retrieving comment list, please <a href="/report">report it</a>. Error data: "' + JSON.stringify(response.data) + '"');
            });
        }, function(response) { // Error
            $scope.addAlert('error', 'Could not save comment because: "' + JSON.stringify(response.data) + '"');
        });
    };
}]);
