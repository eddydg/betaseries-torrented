// ==UserScript==
// @name         Betaseries Torrented
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Find the best magnet links for your unwatched tvshow episodes
// @author       Eddydg
// @match        https://www.betaseries.com/membre/eddydg/episodes
// @grant        GM_xmlhttpRequest
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

setTimeout((function() {
    'use strict';

    let baseUrl = "https://idope.se/torrent-list/";
    let position = 0;

    let aEpisode = $("#episodes_container .episodes .episode");
    var episodes = document.querySelectorAll('#episodes_container .episode-titre');
    for (let i = 0; i < episodes.length; i++) {
        let showName = episodes[i].querySelector('a:nth-child(1)').firstChild.nodeValue;
        let showEpisode = episodes[i].querySelector('a:nth-child(2)').firstChild.nodeValue;
        let query = showName + " " + showEpisode + " x265";
        let url = baseUrl + encodeURIComponent(query);

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            fetch: true,
            onreadystatechange: function(state) {
                let res = state.responseText;
                let dom = $(res);
                let hidehash = dom.find(`#hideinfohash${position}`).text();
                //let hidename = dom.find(`#hidename${position}`).text();
                //let hidetrack = dom.find(`#hidetrack${position}`).text();

                if (!hidehash) return;

                //let magnet = `magnet:?xt=urn:btih:${hidehash}&dn=${hidename}${hidetrack}`;
                let magnet = `magnet:?xt=urn:btih:${hidehash}`;

                let btn = `<div class="markas"><a class="markas_img" href="${magnet}">1080p</a></div>`;
                $(aEpisode[i]).find(".episode-side").prepend(btn);
            }
        });
    }

}), 3000);