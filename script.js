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
            getLink: (dom) => {
                let hash = dom.querySelector("#hideinfohash0").innerHTML;
                if (!hash) return "";
                return `magnet:?xt=urn:btih:${hash}`;
            }
        },
        "skytorrents": {
            getUrl: (q) => `https://www.skytorrents.in/search/all/ed/1/?l=en-us&q=${encodeURIComponent(q)}`,
            getLink: (dom) => {
                return dom.querySelector("tbody tr a[href^='magnet']").href;
            }
        }
    };

    function getBtn(link, name) {
        let btn = document.createElement('div');

        let a = document.createElement('a');
        a.className = "markas_img";
        a.href = link;

        let img = document.createElement('img');
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsElEQVQ4T23QbUhTYRQH8P+9dvMtcznYLHWkU6cLArtNm2FaFEWZRkSkUYq2jBANti+BiVDSF5OMjJQZiLQiYiRpEEVpI5e2pcbUjTWNqdMNW2m+dLN248oac+yB58Phf86P5zkEAk4nEMUAx1ngMAEkcTELjBPAy1DgeSHw03+E8C86gK0USTaI5PSeJHmmIDKaF8HlS/M/lsf1Ay673vhh1eNRnQNm/s/5gDYgKpQkW3adLjwgTBAJfzm/r3tbmHALnJN256cnnW8Yj6ei3PsSH9AOFCfK6etiWWbSwpTTMzI66piw292ckigSxeyQSrdtjheSto8D4xN647USQMNlPuAB0J5zqeTk0rR706jZPGWxWh9RQBPXtApUS1JSiqRpafGRcTGLuvvt2jKgZB2gBnR5l8uzXZavZG9f3+e/KytHa4BprukGEBcSHv4iNzt7p0Cy3dNzr63vApCzDmgBDPsU5+kZkxXv9HpjHbDbfwl1XC6X07HSZOjaOowV3tz3hbuAIbf4FD07ZsP7wcGgwN6MDDo2XYxezVNjZSBwGzAcPHGM/jb2BW8tlqDAfomE5qcn4/WzbuOVQKABMBQeyqPnzTZ0TU4GBfITEujoNDE6X/UYVYHATcBwNkdOL1tseOxyBQXOCAR0hESMhzq98WogIJPJFGq1utVsdqGxsUbV399/y3+JWVlZF5ubm1scjhXU16t8uW+JYrFYodVq14Da2spqi8Vyxx9ITU1VaDSaVg5QKsuqrVbrWu4DeDxelclkahoasqO0tEA5NzfX6A/w+fyq4eHhppERB4qKjijdbvdazgE8AFEUReWzLCskSZIgCGKWYZhuAIsA/gCIpCiqgGXZWJIkQwiCmGEYpgvAAgeEAQj13g0APN6hVQC/vfVGANylAJDenAHA/AMeSRE3vrDTDwAAAABJRU5ErkJggg==";

        a.appendChild(img);
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
            let query = showName + " " + showEpisode + " 1080p";

            let provider = providers["skytorrents"];
            GM_xmlhttpRequest({
                method: "GET",
                url: provider.getUrl(query),
                fetch: true,
                onreadystatechange: function(state) {
                    let parser = new DOMParser();
                    let dom = parser.parseFromString(state.responseText, "text/html");

                    let link = provider.getLink(dom);
                    if (!link) return;

                    let btn = getBtn(link, "magnet");
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