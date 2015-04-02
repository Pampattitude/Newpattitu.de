'use strict';

var padding = {v:0, h:0}; // px

var modeList = [
    {
        media: '@media all',
        suffix: '',
    },
    {
        media: '@media only screen and (max-width: 991px)',
        suffix: '-mobile',
    }
];

for (var modeIdx in modeList) {
    if (!modeList.hasOwnProperty(modeIdx))
        continue ;

    var mode = modeList[modeIdx];

    console.log(mode.media + ' {');

    var gridSizeList = [2, 3, 4, 5, 6, 8, 10, 12, 16];

    console.log('  [class*="grid-"] {');
    console.log('    width: 100%;');
    console.log('    margin: 0;');
    console.log('  }');

    for (var gridSizeIdx in gridSizeList) {
        if (!gridSizeList.hasOwnProperty(gridSizeIdx))
            continue ;

        console.log();

        var gridSize = gridSizeList[gridSizeIdx];

        console.log('  .grid-' + gridSize + ':after {');
        console.log('    content: "";');
        console.log('    display: block;');
        console.log('    height: 0;');
        console.log('    clear: both;');
        console.log('    visibility: hidden;');
        console.log('  }');

        console.log();

        console.log('  .grid-' + gridSize + ' > [class*="cell' + mode.suffix + '"] {');
        console.log('    width: 0%;');
        console.log('    min-height: 1px;');
        console.log('    display: inline-block;');
        console.log('    box-sizing: border-box;');
        console.log('    float: left;');
        console.log('    margin: 0 auto;');
        console.log('    padding: ' + padding.v + 'px ' + padding.h + 'px;');
        console.log('  }');

        for (var n = 1 ; gridSize >= n ; ++n) {
            console.log('  .grid-' + gridSize + ' > .cell' + mode.suffix + '-' + n + ' {');
            console.log('    width: ' + ((parseInt(100 * n / gridSize * 100).toFixed(2)) / 100) + '%;');
            console.log('  }');
        }
    }

    console.log('}');
}
