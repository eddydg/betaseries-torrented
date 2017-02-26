// ==UserScript==
// @name         Betaseries Torrented
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Find the best magnet links for your unwatched tvshow episodes
// @author       Eddydg
// @match        https://www.betaseries.com/membre/*/episodes
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let providers = {
        "idope": {
            getUrl: (q) => `https://idope.se/torrent-list/${encodeURIComponent(q)}`,
            getHash: (dom) => {
                return dom.find("#hideinfohash0").text();
            }
        },
        "skytorrents": {
            getUrl: (q) => `https://www.skytorrents.in/search/all/ed/1/?l=en-us&q=${encodeURIComponent(q)}`,
            getHash: (dom) => {
                return dom.querySelector("tbody tr a[href^='magnet']").href;
            }
        }
    };

    function getBtn(link, name) {
        let btn = document.createElement('div');
        btn.className = "markas";

        let a = document.createElement('a');
        a.className = "markas_img";
        a.href = link;
        a.innerHTML = name;

        btn.appendChild(a);

        return btn;
    }

    var observer = new MutationObserver(function(mutations) {
        observer.disconnect();
        var episodes = document.querySelectorAll('#episodes_container .episode');
        for (let i = 0; i < episodes.length; i++) {
            let position = 0;

            let showName = episodes[i].querySelector('.episode-titre a:nth-child(1)').firstChild.nodeValue;
            let showEpisode = episodes[i].querySelector('.episode-titre a:nth-child(2)').firstChild.nodeValue;
            let query = showName + " " + showEpisode + " x265";

            let provider = providers["skytorrents"];
            GM_xmlhttpRequest({
                method: "GET",
                url: provider.getUrl(query),
                fetch: true,
                onreadystatechange: function(state) {
                    let parser = new DOMParser();
                    let dom = parser.parseFromString(state.responseText, "text/html");

                    let magnetHash = provider.getHash(dom);
                    if (!magnetHash) return;

                    let magnet = `magnet:?xt=urn:btih:${magnetHash}`;

                    let btn = getBtn(magnet, "1080p");
                    episodes[i].querySelector(".episode-side").prepend(btn);
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