#!/bin/sh

WEB_SERVER_PATH='/home/pampa/Newpattitu.de'
STAT_SERVER_PATH='/home/pampa/Stattitu.de'
LOGS_PATH='/data/log'

generate_scss() {
        # SCSS generation
        scss -C --sourcemap=none --style compressed $WEB_SERVER_PATH/resources/scss/pmp.scss $WEB_SERVER_PATH/resources/css/pmp.css && scss -C --sourcemap=none --style compressed $WEB_SERVER_PATH/resources/scss/pmp-back.scss $WEB_SERVER_PATH/resources/css/pmp-back.css

        return $?
}

case "$1" in
    start)
        # TZ=UTC because stats use time as separator
        generate_scss && \
            NODE_ENV=production TZ=UTC forever start --minUptime 1     --spinSleepTime 1     -a -l $LOGS_PATH/websiteServer.log  $WEB_SERVER_PATH/app.js && \
            NODE_ENV=production TZ=UTC forever start --minUptime 1     --spinSleepTime 1     -a -l $LOGS_PATH/statsServer.log    $STAT_SERVER_PATH/server/app.js && \
            NODE_ENV=production TZ=UTC forever start --minUptime 10000 --spinSleepTime 15000 -a -l $LOGS_PATH/statsProcessor.log $STAT_SERVER_PATH/processor/app.js
        ;;

    stop)
        forever stopall --killSignal=SIGINT
        ;;

    reload|force-reload)
        cd $WEB_SERVER_PATH
        git fetch && git stash && git rebase && git stash pop
        npm install

        cd $STAT_SERVER_PATH
        git fetch && git stash && git rebase && git stash pop
        npm install
        ;;

    restart)
        generate_scss && forever restartall --killSignal=SIGINT
        ;;

    status)
        forever list
        ;;
esac

exit $?
