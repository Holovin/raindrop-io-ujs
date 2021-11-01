// ==UserScript==
// @name         RaindropIO Extended
// @namespace    https://holov.in/us/ra
// @version      0.2
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

    if (window.onurlchange === null) {
        window.addEventListener('urlchange', (info) => {
            parentIdFromUrl = getNumberFromUrl();

            if (parent && needHideGroup === 0) {
                console.log('HIDE GROUP')
                simulateMouseClick(parent);
            } else {
                console.log('SKIP HIDE', needHideGroup, parent);
            }

            needHideGroup--;
        });
    }

    document.addEventListener('click', (e) => {
        console.log('CLICK: ', e);

        if (e.target && e.target.href && e.target.href.includes('?full=true')) {
            console.log('FIND PARENT');

            parent = document.querySelector('a[href*="/my/' + parentIdFromUrl + '"]')
                ?.parentElement
                ?.querySelector('div[title="Collapse"]');

            needHideGroup = 1;
        }

        // Reset counter if click on sidebar child link
        if (e.target?.parentElement) {
            const parent = e.target.parentElement;

            if (parent.getAttribute('role') === 'listitem' && !parent.style?.cssText.includes('--level:0;')) {
                needHideGroup = 1;
                console.log('RESET!!!');
            }

            console.log('Papa: ', parent, parent.getAttribute('role'), parent.style?.cssText);
        }
    });

    // Helpers
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
    function simulateMouseClick(element){
        mouseClickEvents.forEach(mouseEventType =>
            element.dispatchEvent(
                new MouseEvent(mouseEventType, {
                    // view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1
                }),
            ),
        );
    }

})();
