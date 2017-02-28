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
    let keywords = ["1080p", "x265"];

    let providers = {
        "idope": {
            getUrl: (q) => `https://idope.se/torrent-list/${encodeURIComponent(q)}`,
            getLinks: (dom) => {
                return [...dom.querySelectorAll("div[id^='hideinfohash']")]
                    .map(e => `magnet:?xt=urn:btih:${e.innerHTML}`);
            }
        },
        "skytorrents": {
            getUrl: (q) => `https://www.skytorrents.in/search/all/ed/1/?l=en-us&q=${encodeURIComponent(q)}`,
            getLinks: (dom) => {
                return [...dom.querySelectorAll("tbody tr a[href^='magnet']")]
                    .map(a => a.href);
            }
        }
    };

    function getBtn(link, name, episodeId) {
        let btn = document.createElement('div');

        let a = document.createElement('a');
        a.className = "markas_img";
        a.href = link;

        let img = document.createElement('img');
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsElEQVQ4T23QbUhTYRQH8P+9dvMtcznYLHWkU6cLArtNm2FaFEWZRkSkUYq2jBANti+BiVDSF5OMjJQZiLQiYiRpEEVpI5e2pcbUjTWNqdMNW2m+dLN248oac+yB58Phf86P5zkEAk4nEMUAx1ngMAEkcTELjBPAy1DgeSHw03+E8C86gK0USTaI5PSeJHmmIDKaF8HlS/M/lsf1Ay673vhh1eNRnQNm/s/5gDYgKpQkW3adLjwgTBAJfzm/r3tbmHALnJN256cnnW8Yj6ei3PsSH9AOFCfK6etiWWbSwpTTMzI66piw292ckigSxeyQSrdtjheSto8D4xN647USQMNlPuAB0J5zqeTk0rR706jZPGWxWh9RQBPXtApUS1JSiqRpafGRcTGLuvvt2jKgZB2gBnR5l8uzXZavZG9f3+e/KytHa4BprukGEBcSHv4iNzt7p0Cy3dNzr63vApCzDmgBDPsU5+kZkxXv9HpjHbDbfwl1XC6X07HSZOjaOowV3tz3hbuAIbf4FD07ZsP7wcGgwN6MDDo2XYxezVNjZSBwGzAcPHGM/jb2BW8tlqDAfomE5qcn4/WzbuOVQKABMBQeyqPnzTZ0TU4GBfITEujoNDE6X/UYVYHATcBwNkdOL1tseOxyBQXOCAR0hESMhzq98WogIJPJFGq1utVsdqGxsUbV399/y3+JWVlZF5ubm1scjhXU16t8uW+JYrFYodVq14Da2spqi8Vyxx9ITU1VaDSaVg5QKsuqrVbrWu4DeDxelclkahoasqO0tEA5NzfX6A/w+fyq4eHhppERB4qKjijdbvdazgE8AFEUReWzLCskSZIgCGKWYZhuAIsA/gCIpCiqgGXZWJIkQwiCmGEYpgvAAgeEAQj13g0APN6hVQC/vfVGANylAJDenAHA/AMeSRE3vrDTDwAAAABJRU5ErkJggg==";

        a.appendChild(img);
        btn.appendChild(a);
        //btn.appendChild(img);

        btn.onclick = ()  => {
            let magnetBox = document.querySelector(`#${episodeId}`);
            if (magnetBox.style.display === "none")
                magnetBox.style.display = "";
            else
                magnetBox.style.display = "none";
        };

        return btn;
    }

    function createMagnetBox(dom, episodeId, results = []) {
        let box = document.createElement('div');
        box.className = "box top srt";
        box.id = episodeId;
        box.style.display = "none";
        let content = document.createElement('content');
        let ul = document.createElement('ul');
        ul.className = "srt";
        for (let i = 0; i < 3; i++) {
            let li = document.createElement('li');
            let span = document.createElement('span');
            span.innerHTML = "blablabla S02E03";
            li.appendChild(document.createElement('a').appendChild(span));
            ul.appendChild(li);
        }
        content.appendChild(ul);
        box.appendChild(content);

        dom.appendChild(box);
    }

    var observer = new MutationObserver(function(mutations) {
        observer.disconnect();

        var episodes = document.querySelectorAll('#episodes_container .episode');
        for (let i = 0; i < episodes.length; i++) {
            let position = 0;

            let showName = episodes[i].querySelector('.episode-titre a:nth-child(1)').firstChild.nodeValue;
            let showEpisode = episodes[i].querySelector('.episode-titre a:nth-child(2)').firstChild.nodeValue;
            let query = showName + " " + showEpisode + " " + keywords.join(" ");

            let provider = providers["skytorrents"];
            GM_xmlhttpRequest({
                method: "GET",
                url: provider.getUrl(query),
                fetch: true,
                onreadystatechange: function(state) {
                    let parser = new DOMParser();
                    let dom = parser.parseFromString(state.responseText, "text/html");

                    let link = provider.getLinks(dom)[0];
                    if (!link) return;

                    let episodeId = (showName + showEpisode).replace(/[^a-z0-9]/gi,'');
                    let btn = getBtn(link, "magnet", episodeId);
                    let episodeSideHtml = episodes[i].querySelector(".episode-side");
                    episodeSideHtml.prepend(btn);
                    createMagnetBox(episodeSideHtml, episodeId, null);
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