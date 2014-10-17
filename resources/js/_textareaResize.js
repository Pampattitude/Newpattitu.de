(function() {
    $(document).ready(function() {
        $('textarea[data-resizable]').autosize({append: false});
        $('textarea[data-resizable]').trigger('autosize.resize');
    });
})();
