// ==UserScript==
// @name         Betaseries Torrented
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Find the best magnet links for your unwatched tvshow episodes
// @author       Eddydg
// @match        https://www.betaseries.com/membre/*/episodes
// @grant        GM_xmlhttpRequest
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    let providers = {
        "idope": {
            getUrl: (q) => `https://idope.se/torrent-list/${encodeURIComponent(q)}`,
            hashId: "#hideinfohash0"
        }
    };

    function getBtn(link, name) {
        return `<div class="markas"><a class="markas_img" href="${link}">${name}</a></div>`;
    }

    var observer = new MutationObserver(function(mutations) {
        observer.disconnect();
        let aEpisode = $("#episodes_container .episodes .episode");
        var episodes = document.querySelectorAll('#episodes_container .episode-titre');
        for (let i = 0; i < episodes.length; i++) {
            let position = 0;

            let showName = episodes[i].querySelector('a:nth-child(1)').firstChild.nodeValue;
            let showEpisode = episodes[i].querySelector('a:nth-child(2)').firstChild.nodeValue;
            let query = showName + " " + showEpisode + " x265";

            let provider = providers["idope"];
            GM_xmlhttpRequest({
                method: "GET",
                url: provider.getUrl(query),
                fetch: true,
                onreadystatechange: function(state) {
                    let dom = $(state.responseText);
                    let magnetHash = dom.find(provider.hashId).text();

                    if (!magnetHash) return;

                    let magnet = `magnet:?xt=urn:btih:${magnetHash}`;

                    let btn = getBtn(magnet, "1080p");
                    $(aEpisode[i]).find(".episode-side").prepend(btn);
                }
            });
        }
    });

    observer.observe(document.querySelector("#episodes_container"), {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
    });

})();