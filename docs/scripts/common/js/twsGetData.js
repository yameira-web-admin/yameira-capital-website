$(document).ready(function() {
    getStableTwsData();
    getLatestTwsData();
    getBetaTwsData();
});
function getLatestOfflineTwsData() {
    var info = 'N/A';
    var url = 'https://interactivebrokers.com/installers/tws/latest-standalone/version.json';
    $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'twslatest_callback',
    success: function(r) {
    info = r["buildVersion"];
    $('span.latestOfflineBuildVersion').text(info);
    }
    });
}
function getStableOfflineTwsData() {
    var info = 'N/A';
    var url = 'https://interactivebrokers.com/installers/tws/stable-standalone/version.json';
    $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'twsstable_callback',
    success: function(r) {
    info = r["buildVersion"];
    $('span.stableOfflineBuildVersion').text(info);
    }
    });
}
$(function() {
    getLatestOfflineTwsData();
    getStableOfflineTwsData();
});