// ==UserScript==
// @name         RaindropIO Extended
// @namespace    https://holov.in/us/ra
// @version      0.4
// @description  Some features for raindrop
// @author       Alex Holovin
// @match        https://app.raindrop.io/*
// @icon         https://www.google.com/s2/favicons?domain=raindrop.io
// @grant        window.onurlchange
// ==/UserScript==

(function() {
    let parentIdFromUrl = getNumberFromUrl();
    let parent = null;
    let needHideGroup = -1;

    document.head.insertAdjacentHTML('beforeend', '<style>' +
        'div[class*="bookmarks-"] div[class*="scroll-"]' +
        '{ display: none; }' +
        '</style>'
    );

    setTimeout(() => {
        const hiddenElements = hideAllOnFirstLoad();
        const hiddenAds = hideProPromo();

        log(`init done: collapsed = ${hiddenElements}, ads hided = ${hiddenAds}`);
    }, 500);

    if (window.onurlchange === null) {
        window.addEventListener('urlchange', (info) => {
            parentIdFromUrl = getNumberFromUrl();

            if (parentIdFromUrl) {
                checkAndForceGridViewMode().then();
            }

            if (parent && needHideGroup === 0) {
                simulateMouseClick(parent);
            }

            needHideGroup--;
        });
    }

    document.addEventListener('click', (e) => {
        let parent = e.target?.parentElement;

        // Hide sidebar subfolders
        if (e.target && e.target.href && e.target.href.includes('?full=true')) {
            parent = document.querySelector('a[href*="/my/' + parentIdFromUrl + '"]')
                ?.parentElement
                ?.querySelector('div[title="Collapse"]');

            needHideGroup = 1;
            return true;
        }

        // Reset counter if click on sidebar child link
        if (parent && parent.getAttribute('role') === 'listitem' && !parent.style?.cssText.includes('--level:0;')) {
            needHideGroup = 1;
            return true;
        }
    });

    // Helpers
    async function checkAndForceGridViewMode() {
        const className = document.querySelector('div[class*="content-"] div[class*="scroll"]').firstElementChild.className;
        const badModes = ['list', 'simple', 'masonry'];

        if (!badModes.some(mode => className.includes(mode))) {
            return;
        }

        simulateMouseClick(document.querySelectorAll('div[class*="content-"] div[class*="header"] div[title][data-variant="default"]')[1]);
        await new Promise(r => setTimeout(r, 200));
        simulateMouseClick(document.querySelector('input[data-view="grid"]'));
        simulateMouseClick(document.body);
    }

    function hideAllOnFirstLoad() {
        let elements = [...document.querySelectorAll('div[title="Collapse"]')];
        let i = 0;

        while (elements && i < elements.length) {
            if (getComputedStyle(elements[i]).visibility === 'visible') {
                simulateMouseClick(elements[i]);
                elements = [...document.querySelectorAll('div[title="Collapse"]')];
                i = 0;
                continue;
            }

            i++;
        }

        return i;
    }

    function getNumberFromUrl() {
        const url = document.location;
        if (url && url.pathname) {
            const match = url.pathname.match(/\d+/);
            if (match && match[0]) {
                return match[0];
            }
        }

        return null;
    }

    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    function simulateMouseClick(element) {
        mouseClickEvents.forEach(mouseEventType =>
            element.dispatchEvent(
                new MouseEvent(mouseEventType, {
                    bubbles: true,
                    cancelable: true,
                    buttons: 1,
                }),
            ),
        );
    }

    function hideProPromo() {
        const el = document.querySelector('a[class*="upgrade-"]');
        if (!el) {
            return;
        }

        el.style.visibility = 'hidden';
        el.style.height = '1px';

        return true;
    }

    function log(...args) {
        console.log('[raindrop-io-js] ', ...args);
    }

})();
