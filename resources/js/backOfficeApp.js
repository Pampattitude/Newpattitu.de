var backOfficeApp = angular.module('backOfficeApp', []);

backOfficeApp.controller('generalController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    // Big hack here:
    // globals are defined by EJS. When it renders the page, it prints "var global = ..."
    // with '...' being the full res.locals object
    $rootScope.globals = $scope.globals = globals;

    $rootScope.refresh = $scope.refresh = function() {
        if (!$scope.$$phase)
            $scope.$apply();
    };

    /* Confirm box */
    /* Confirm box options:
       - title: String
       - text: HTML string
       - refuseText: String, defaults to "Refuse"
       - refuseCallback: Function(), defaults to $scope.closeConfirmBox
       - acceptText: String, defaults to "Accept"
       - acceptCallback: Function(), defaults to $scope.closeConfirmBox */
    $rootScope.openConfirmBox = $scope.openConfirmBox = function(confirmBox) {
        $('#page-hider').addClass('active');

        if (!confirmBox.refuseText)
            confirmBox.refuseText = 'Refuse';
        if (!confirmBox.refuseCallback)
            confirmBox.refuseCallback = $scope.closeConfirmBox;
        if (!confirmBox.acceptText)
            confirmBox.acceptText = 'Accept';
        if (!confirmBox.acceptCallback)
            confirmBox.acceptCallback = $scope.closeConfirmBox;

        $scope.confirmBox = confirmBox;
        $scope.confirmBoxOpened = true;
        $scope.refresh();
    };

    $rootScope.closeConfirmBox = $scope.closeConfirmBox = function(confirmBox) {
        $('#page-hider').removeClass('active');
        if ($scope.confirmBox)
            delete $scope.confirmBox;

        $scope.confirmBoxOpened = false;
    };
    /* !Confirm box */

    /* Alerts */
    $scope.alertList = [];
    $scope.alertIdx_ = 0;

    $rootScope.addAlert = $scope.addAlert = function(state, message) {
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

    $rootScope.removeAlert = $scope.removeAlert = function(alert) {
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

    /* Login */
    $scope.login = function() {
        if (!$scope.loginData.username ||
            2 >= $scope.loginData.username.length) {
            $scope.addAlert('error', 'Username too short, not logging you in!');
            return ;
        }

        if (!$scope.loginData.password ||
            2 >= $scope.loginData.password.length) {
            $scope.addAlert('error', 'Password too short, not logging you in!');
            return ;
        }

        var url = '/back-office/login';
        return $http.post(url, {
            username: $scope.loginData.username,
            password: $scope.loginData.password,
        }).then(function(response) {
            window.location = '/back-office'; // Redirect to home page
        }, function(response) {
            $scope.addAlert('error', response.data.message + '! Could not log you in.');
        });
    };

    $scope.logout = function() {
        if (!$scope.globals.logged)
            return ;

        var url = '/back-office/logout';
        return $http.post(url, {}).then(function(response) {
            window.location = '/back-office'; // Redirect to front
        }, function(response) {
            $scope.addAlert('error', response.data.message + '! Could not log you out.');
        });
    };
    /* !Login */

    /* Articles */
    $scope.changeArticleStatus_ = function(article, activate) {
        var url = null;

        if (activate)
            url = '/back-office/article/' + article._id + '/activate';
        else
            url = '/back-office/article/' + article._id + '/deactivate';

        return $http.post(url, {}).then(function(response) {
            article.activated = activate;
            if (article.activated)
                $scope.addAlert('success', 'Article "' + article.title + '" is now public!');
            else
                $scope.addAlert('success', 'Article "' + article.title + '" is now private.');
        }, function(response) {
            $scope.addAlert('error', 'Could not change article availability because: ' + response.data.message);
        });
    };

    $scope.activateArticle = function(article) {
        var confirmBox = {
            title: 'Activate article?',
            text: 'Do you really want to make the article "' + article.title + '" visible to anyone?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                return $scope.changeArticleStatus_(article, true);
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
    $scope.deactivateArticle = function(article) {
        var confirmBox = {
            title: 'Deactivate article?',
            text: 'Do you really want to make the article "' + article.title + '" invisible?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                return $scope.changeArticleStatus_(article, false);
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.deleteArticleFromList = function(article) {
        var confirmBox = {
            title: 'Delete article?',
            text: 'Do you really want to delete the article "' + article.title + '"? This operation is not reversible.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + article._id + '/delete';
                $http.post(url, {}).then(function(response) {
                    window.location = '/back-office/articles';
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
    /* !Articles */

    /* Notifications */
    /* Comments */
    $scope.newComments = [];
    $scope.getNewComments = function(callback) {
        var getNewCommentsUrl = '/back-office/notifications/comments/new';
        return $http.get(getNewCommentsUrl, {}).then(function(response) {
            $scope.newComments = response.data;
            return callback();
        }, function(response) {
            console.log(response);
            return callback(new Error(response.data.message));
        });
    };

    var cronGetNewComments = function() {
        return $scope.getNewComments(function(err) {
            if (err) {
                $scope.addAlert('error', 'An error occured while getting comment notifications: ' + err);
                return ;
            }
            return setTimeout(cronGetNewComments, 15 * 1000);
        });
    };
    cronGetNewComments();
    /* !Comments */

    /* Reports */
    $scope.newReports = [];
    $scope.getNewReports = function(callback) {
        var getNewReportsUrl = '/back-office/notifications/reports/new';
        return $http.get(getNewReportsUrl, {}).then(function(response) {
            $scope.newReports = response.data;
            return callback();
        }, function(response) {
            console.log(response);
            return callback(new Error(response.data.message));
        });
    };

    var cronGetNewReports = function() {
        return $scope.getNewReports(function(err) {
            if (err) {
                $scope.addAlert('error', 'An error occured while getting report notifications: ' + err);
                return ;
            }
            return setTimeout(cronGetNewReports, 15 * 1000);
        });
    };
    cronGetNewReports();
    /* !Reports */
    /* !Notifications */
}]);

/* Filter for trusted HTML. Usage: ng-bind-html="var | trust" */
backOfficeApp.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

backOfficeApp.controller('editArticleController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    var htmlDecode = function(value) {
        return $('<div/>').html(value).text();
    };

    $rootScope.article = $scope.article = globals.article || {
        title: '',
        technicalName: '',
        text: '',
        tags: [],
        type: null,
    };
    $scope.articleExists = undefined != globals.article;

    $scope.article.text = $scope.article.text;

    $scope.saveArticle_ = function(callback) {
        var url = '/back-office/article/' + $scope.article._id + '/save';
        $http.post(url, $scope.article).then(function(response) {
            if (response.data.articleId) { // Redirect to new article edition page '/back-office/article/:_id/edit'?
                $scope.article._id = response.data.articleId;
                $scope.articleExists = true;
            }

            $scope.addAlert('success', 'Article saved!');

            if (callback)
                return callback();
        }, function(response) {
            $scope.addAlert('error', 'Could not save article because: ' + response.data.message);
            if (callback)
                return callback(response.data);
        });
    };

    /* Article */
    $scope.deleteArticle = function() {
        var confirmBox = {
            title: 'Delete article?',
            text: 'Do you really want to delete the article "' + $scope.article.title + '"? This operation is not reversible.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + $scope.article._id + '/delete';
                $http.post(url, {}).then(function(response) {
                    window.location = '/back-office/articles';
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.previewArticle = function() {
        var confirmBox = {
            title: 'Save article?',
            text: 'Do you really want to save the article "' + $scope.article.title + '"? The article must be saved in order to preview it.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + $scope.article._id + '/save';
                $http.post(url, $scope.article).then(function(response) {
                    $scope.addAlert('success', 'Article saved!');

                    var previewUrl = '/article/preview/' + $scope.article.technicalName;
                    window.open(previewUrl, '_blank').focus();
                }, function(response) {
                    $scope.addAlert('error', 'Could not save article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };

    $scope.saveArticle = function() {
        var confirmBox = {
            title: 'Save article?',
            text: 'Do you really want to save the article "' + $scope.article.title + '"?',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                $scope.saveArticle_(function() {});
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
    /* !Article */
}]).directive('controlTags', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            $($elem).on('keyup', function(e) {
                var newTag = $scope.newTag.trim();

                if (13 == e.which && newTag.length) { // Enter
                    if (-1 == $scope.article.tags.indexOf(newTag))
                        $scope.article.tags.push(newTag);
                    $scope.newTag = '';
                    $scope.refresh();
                }
                else if (8 == e.which && !$scope.newTag.length) {
                    $scope.newTag = $scope.article.tags.pop();
                    $scope.refresh();
                }
            });
        },
    };
}).directive('updateTechnicalName', ['$http', function($http) {
    return {
        restrict: 'A',
        link: function($scope, $elem) {
            $elem.on('change', function() {
                if (!$scope.article.title.length)
                    return ;

                var generateTechnicalNameUrl = '/back-office/article/generateTechnicalName?id=' + ($scope.article._id || '') + '&title=' + $scope.article.title;
                return $http.get(generateTechnicalNameUrl, {}).then(function(response) {
                    $scope.article.technicalName = response.data;
                }, function(response) {
                    $scope.addAlert('error', 'Could not generate a technical name because: ' + response.data.message);
                });
            });
        },
    };
}]);

backOfficeApp.controller('commentsModerationController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.changeCommentStatus = function(comment, newStatus) {
        var changeCommentStatusUrl = '/back-office/article/' + comment.article + '/comment/' + comment._id + '/setStatus';
        return $http.post(changeCommentStatusUrl, {status: newStatus}).then(function(response) {
            $scope.addAlert('success', 'Comment status changed!');
            comment.status = newStatus;
            $scope.refresh();
        }, function(response) {
            $scope.addAlert('error', 'Could not update comment status because: ' + response.data.message);
        });
    };

    $scope.deleteComment = function(comment) {
        var confirmBox = {
            title: 'Delete comment?',
            text: 'Do you really want to delete this comment? This operation is not reversible.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/article/' + comment.article + '/comment/' + comment._id + '/delete';
                $http.post(url, {}).then(function(response) {
                    $scope.addAlert('success', 'Comment deleted!');
                    $scope.globals.commentList = $scope.globals.commentList.filter(function(elem) {
                        return comment._id != elem._id;
                    });
                    $scope.refresh();
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete comment because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
}]);

backOfficeApp.controller('reportsController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
    $scope.changeReportStatus = function(report, newStatus) {
        var changeReportStatusUrl = '/back-office/report/' + report._id + '/setStatus';
        return $http.post(changeReportStatusUrl, {status: newStatus}).then(function(response) {
            $scope.addAlert('success', 'Report status changed!');
            report.status = newStatus;
            $scope.refresh();
        }, function(response) {
            $scope.addAlert('error', 'Could not update report status because: ' + response.data.message);
        });
    };

    $scope.deleteReport = function(report) {
        var confirmBox = {
            title: 'Delete report?',
            text: 'Do you really want to delete this report? This operation is not reversible.',
            acceptCallback: function() {
                $scope.closeConfirmBox();
                var url = '/back-office/report/' + report._id + '/delete';
                $http.post(url, {}).then(function(response) {
                    $scope.addAlert('success', 'Report deleted!');
                    $scope.globals.reportList = $scope.globals.reportList.filter(function(elem) {
                        return report._id != elem._id;
                    });
                    $scope.refresh();
                }, function(response) {
                    $scope.addAlert('error', 'Could not delete article because: ' + response.data.message);
                });
            },
        };

        return $rootScope.openConfirmBox(confirmBox);
    };
}]);

/* Markdown text box */
backOfficeApp.factory('markdownitupSettings', [
    function() {
        var markset = [
            /* Title */
            {
                name: '',
                closeWith: function(data) {
                    var hasNewLine = '\n' === data.selection[data.selection.length - 1];
                    return (hasNewLine ? '' : '\n') + (Array(data.selection.length + (hasNewLine ? 0 : 1)).join('=')) + (hasNewLine ? '\n' : '');
                },
                className: 'pmp-md-control pmp-md-title',
            },
            /* !Title */
            /* Subtitle */
            {
                name: '',
                closeWith: function(data) {
                    var hasNewLine = '\n' === data.selection[data.selection.length - 1];
                    return (hasNewLine ? '' : '\n') + (Array(data.selection.length + (hasNewLine ? 0 : 1)).join('-')) + (hasNewLine ? '\n' : '');
                },
                className: 'pmp-md-control pmp-md-subtitle',
            },
            /* !Subtitle */

            { separator: '', className: 'pmp-md-separator' },

            /* Bold */
            {
                name: '',
                key: 'B',
                multiline: true,
                openWith: '**',
                closeWith: '**',
                className: 'pmp-md-control pmp-md-bold',
            },
            /* !Bold */
            /* Italic */
            { name: '',
              key: 'I',
              multiline: true,
              openWith: '_',
              closeWith: '_',
              className: 'pmp-md-control pmp-md-italic',
            },
            /* !Italic */
            /* Strikethrough */
            {
                name: '',
                key: 'S',
                multiline: true,
                openWith: '~~',
                closeWith: '~~',
                className: 'pmp-md-control pmp-md-strikethrough',
            },
            /* !Strikethrough */
            /* Underline */
            {
                name: '',
                key: 'U',
                multiline: true,
                openWith: '<u>',
                closeWith: '</u>',
                className: 'pmp-md-control pmp-md-underline',
            },
            /* !Underline */

            { separator: '', className: 'pmp-md-separator pmp-md-separator-desktop' },

            /* Frame */
            {
                name: '',
                openWith: '<div class="frame">\n',
                closeWith: function(data) {
                    var hasNewLine = '\n' === data.selection[data.selection.length - 1];
                    return (hasNewLine ? '' : '\n') + ('</div>') + (hasNewLine ? '\n' : '');
                },
                className: 'pmp-md-control pmp-md-frame',
            },
            /* !Frame */
            /* Picture */
            {
                name: '',
                key: 'P',
                replaceWith: '![[![Title:]!]]([![URL:]!] "")',
                className: 'pmp-md-control pmp-md-picture',
            },
            /* !Picture */
            /* Small picture */
            { name: '',
              replaceWith: '<img class="img-small" alt="[![Title:]!]" src="[![URL:]!]" />',
              className: 'pmp-md-control pmp-md-picture-small',
            },
            /* !Small picture */
            /* Link */
            { 
                name: '',
                key: 'L',
                replaceWith: '[[![Link name:]!]]([![URL:]!])',
                className: 'pmp-md-control pmp-md-link',
            },
            /* !Link */

            { separator: '', className: 'pmp-md-separator' },
            { separator: '', className: 'pmp-md-separator pmp-md-separator-mobile' },

            /* Blockquote */
            {
                name: '',
                key: 'Q',
                openWith: '> ',
                multiline: true,
                className: 'pmp-md-control pmp-md-quote',
            },
            /* !Blockquote */
            /* Code block */
            {
                name: '',
                openWith: '```\n',
                closeWith: function(data) {
                    var hasNewLine = '\n' === data.selection[data.selection.length - 1];
                    return (hasNewLine ? '' : '\n') + ('```') + (hasNewLine ? '\n' : '');
                },
                className: 'pmp-md-control pmp-md-code',
            },
            /* !Code block */
            /* Comment */
            {
                name: '',
                openWith: '<span class="comment">',
                closeWith: '</span>',
                className: 'pmp-md-control pmp-md-comment',
            },
            /* !Comment */
            /* tl;dr */
            {
                name: '',
                openWith: '<p class="tldr">',
                closeWith: '</p>',
                className: 'pmp-md-control pmp-md-tldr',
            },
            /* !tl;dr */

            /* Align left */
            {
                name: '',
                key: '',
                openWith: '<div class="align-left">',
                closeWith: '</div>',
                className: 'pmp-md-control pmp-md-align-left',
            },
            /* !Align left */
            /* Align center */
            {
                name: '',
                key: '',
                openWith: '<div class="align-center">',
                closeWith: '</div>',
                className: 'pmp-md-control pmp-md-align-center',
            },
            /* !Align center */
            /* Align right */
            {
                name: '',
                key: '',
                openWith: '<div class="align-right">',
                closeWith: '</div>',
                className: 'pmp-md-control pmp-md-align-right',
            },
            /* !Align right */
            /* Align justify */
            {
                name: '',
                key: '',
                openWith: '<div class="align-justify">',
                closeWith: '</div>',
                className: 'pmp-md-control pmp-md-align-justify',
            },
            /* !Align justify */

            /* Smileys */
            {
                name: '',
                key: '',
                dropMenu: [
                    {
                        replaceWith: '<span class="smiley smiley-happy"></span>',
                        className: 'pmp-md-smiley smiley',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-sad"></span>',
                        className: 'smiley smiley-sad',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-neutral"></span>',
                        className: 'smiley smiley-neutral',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-happy2"></span>',
                        className: 'smiley smiley-happy2',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-neutral2"></span>',
                        className: 'smiley smiley-neutral2',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-happy3"></span>',
                        className: 'smiley smiley-happy3',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-teasing"></span>',
                        className: 'smiley smiley-teasing',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-devil"></span>',
                        className: 'smiley smiley-devil',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-angry"></span>',
                        className: 'smiley smiley-angry',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-happy4"></span>',
                        className: 'smiley smiley-happy4',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-sick"></span>',
                        className: 'smiley smiley-sick',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-angry2"></span>',
                        className: 'smiley smiley-angry2',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-sad2"></span>',
                        className: 'smiley smiley-sad2',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-happy5"></span>',
                        className: 'smiley smiley-happy5',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-cool"></span>',
                        className: 'smiley smiley-cool',
                    },

                    {
                        replaceWith: '<span class="smiley smiley-cool2"></span>',
                        className: 'smiley smiley-cool2',
                    },
                ],
                className: 'pmp-md-control pmp-md-smiley',
            },
            /* !Smileys */
        ];

        var factory = {
            create: function(callback) {
                return {
                    nameSpace: 'pmp-md',
                    afterInsert: callback,
                    previewParserPath: '',
                    markupSet: markset,
                };
            },
        };

        return factory;
    }
]);

backOfficeApp.directive('markdownItUp', ['markdownitupSettings', function(markitupSettings) {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function(scope, element, attrs) {
            var settings;
            settings = markitupSettings.create(function(event) {
                scope.$apply(function() {
                    scope.ngModel = event.textarea.value;
                });
            });
            angular.element(element).markItUp(settings);
        }
    };
}]);
/* !Markdown text box */
