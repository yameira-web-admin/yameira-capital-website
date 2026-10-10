/* BOOTSTRAP TAB SCRIPT */
$(document).ready(function() {

    // Definitive static list of valid tab/region values.
    // Update this array to match your actual data-bs-target region names.
    const VALID_REGIONS = ['americas', 'europe', 'middle-east', 'asia-pacific', 'global', 'americas-margin', 'japan-margin'];
    // Returns true if the given value is one of the allowed regions.
    function isValidRegion(value) {
        return VALID_REGIONS.includes(value);
    }
    let checkBootstrap = setInterval(tabNav, 50);
    const tabSelector = '#region-tabs > .nav-item > .nav-link';
    function tabNav() {
        // Bail out early until the tab markup actually exists in the DOM
        if ($('#region-tabs').length === 0 || $(tabSelector).length === 0) {
            return;
        }
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let region = urlParams.get('region');
        let tabExists = !!region && $(tabSelector + '[data-bs-target="#region-' + region + '"]').length > 0;
        let globalTabExists = $(tabSelector + '[data-bs-target="#region-global"]').length > 0;
        let tabToShow = region;
        if (!tabExists) {
            if (region && globalTabExists) {
                tabToShow = 'global';
                // Deliberately NOT calling updateParam here.
                // We keep the original param (e.g. apac) in the URL,
                // we just visually show the 'global' tab.
            } else {
                tabToShow = 'americas';
                if (region !== 'americas' && isValidRegion('americas')) {
                    updateParam('americas');
                }
            }
        }
        console.log('region param:', region, '| tab to show:', tabToShow,
                     '| tabExists:', tabExists, '| globalTabExists:', globalTabExists);

        let bootstrap_enabled = (typeof $().tab == 'function');
        if (bootstrap_enabled === true) {
            let $target = $(tabSelector + '[data-bs-target="#region-' + tabToShow + '"]');
            if ($target.length) {
                $target.tab('show');
                setTimeout(function() {
                    $(window).scrollTop(0);
                }, 400);
            }
            clearInterval(checkBootstrap);
            checkBootstrap = null;
        }
    }
    function updateParam(param) {
        // Defensive validation: refuse to update the URL with an unrecognized region.
        if (!isValidRegion(param)) {
            console.warn('updateParam blocked: "' + param + '" is not a valid region.', VALID_REGIONS);
            return false;
        }
        let url = new URL(document.location);
        let search_params = url.searchParams;
        search_params.set('region', param);
        url.search = search_params.toString();
        let new_url = url.toString();
        history.pushState(null, null, new_url);
        $('#nav_set a').each(function() {
            let link = new URL($(this).attr('href'), document.location);
            link.searchParams.set('region', param);
            $(this).attr('href', link.toString());
        });
        return false;
    }
    $('#region-tabs > .nav-item > .nav-link').click(function() {
        let newParam = $(this).attr('data-bs-target').toString();
        let cleanParam = newParam.replace('#region-', '');
        if (isValidRegion(cleanParam)) {
            updateParam(cleanParam);
        } else {
            console.warn('Click ignored: "' + cleanParam + '" is not in VALID_REGIONS.');
        }
    });
});