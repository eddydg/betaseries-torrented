// ==UserScript==
// @name         Betaseries Torrented
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Find the best magnet links for your unwatched tvshow episodes
// @author       Eddydg
// @match        https://www.betaseries.com/membre/*/episodes
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const providers = {
        "idope": {
            getUrl: (q) => `https://idope.se/torrent-list/${encodeURIComponent(q)}/?&c=3`,
            getLinks: (dom) => (
                [...dom.querySelectorAll(".resultdiv")]
                    .map(e => ({
                        title: e.querySelector(".resultdivtopname").innerHTML.trim(),
                        link: `magnet:?xt=urn:btih:${e.querySelector("div[id^='hideinfohash']").innerHTML}`,
                        size: e.querySelector(".resultdivbottonlength").innerHTML.trim()
                    })
                )
            )
        },
        "skytorrents": {
            getUrl: (q) => `https://www.skytorrents.in/search/all/ed/1/?l=en-us&q=${encodeURIComponent(q)}`,
            getLinks: (dom) => (
                [...dom.querySelectorAll("tbody tr")]
                    .map(tr => ({
                        title: tr.querySelector("a").innerHTML.trim(),
                        link: tr.querySelector("a[href^='magnet']").href,
                        size: tr.querySelector("td:nth-child(2)").innerHTML.trim()
                    })
                )
            )
        }
    };

    const CACHE_NAME = "cached_result_";
    const provider = providers["skytorrents"];
    const keywords = ["1080p", "x265"];
    const magnetIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsElEQVQ4T23QbUhTYRQH8P+9dvMtcznYLHWkU6cLArtNm2FaFEWZRkSkUYq2jBANti+BiVDSF5OMjJQZiLQiYiRpEEVpI5e2pcbUjTWNqdMNW2m+dLN248oac+yB58Phf86P5zkEAk4nEMUAx1ngMAEkcTELjBPAy1DgeSHw03+E8C86gK0USTaI5PSeJHmmIDKaF8HlS/M/lsf1Ay673vhh1eNRnQNm/s/5gDYgKpQkW3adLjwgTBAJfzm/r3tbmHALnJN256cnnW8Yj6ei3PsSH9AOFCfK6etiWWbSwpTTMzI66piw292ckigSxeyQSrdtjheSto8D4xN647USQMNlPuAB0J5zqeTk0rR706jZPGWxWh9RQBPXtApUS1JSiqRpafGRcTGLuvvt2jKgZB2gBnR5l8uzXZavZG9f3+e/KytHa4BprukGEBcSHv4iNzt7p0Cy3dNzr63vApCzDmgBDPsU5+kZkxXv9HpjHbDbfwl1XC6X07HSZOjaOowV3tz3hbuAIbf4FD07ZsP7wcGgwN6MDDo2XYxezVNjZSBwGzAcPHGM/jb2BW8tlqDAfomE5qcn4/WzbuOVQKABMBQeyqPnzTZ0TU4GBfITEujoNDE6X/UYVYHATcBwNkdOL1tseOxyBQXOCAR0hESMhzq98WogIJPJFGq1utVsdqGxsUbV399/y3+JWVlZF5ubm1scjhXU16t8uW+JYrFYodVq14Da2spqi8Vyxx9ITU1VaDSaVg5QKsuqrVbrWu4DeDxelclkahoasqO0tEA5NzfX6A/w+fyq4eHhppERB4qKjijdbvdazgE8AFEUReWzLCskSZIgCGKWYZhuAIsA/gCIpCiqgGXZWJIkQwiCmGEYpgvAAgeEAQj13g0APN6hVQC/vfVGANylAJDenAHA/AMeSRE3vrDTDwAAAABJRU5ErkJggg==";

    let openedMagnetBox = null;
    function getBtn(episodeId) {
        const btn = document.createElement('div');
        btn.style.cursor = "pointer";

        const img = document.createElement('img');
        img.src = magnetIcon;

        btn.appendChild(img);
        btn.onclick = () => {
            const magnetBox = document.querySelector(`#${episodeId}`);
            if (magnetBox.style.display === "none") {
                magnetBox.style.display = "";
                if (openedMagnetBox) {
                    document.querySelector(`#${openedMagnetBox}`).style.display = "none";
                }
                openedMagnetBox = episodeId;
            } else {
                magnetBox.style.display = "none";
                openedMagnetBox = null;
            }
        };

        return btn;
    }

    function getMagnetBox(episodeId, results) {
        const box = document.createElement('div');
        box.className = "box top srt";
        box.id = episodeId;
        box.style.display = "none";

        const content = document.createElement('content');

        const ul = document.createElement('ul');
        ul.className = "srt";

        results.map(result => appendResultToMagnetBox(result, ul));
        content.appendChild(ul);
        box.appendChild(content);

        return box;
    }

    function appendResultToMagnetBox(result, ul) {
        const span = document.createElement('span');
        span.innerHTML = `${result.title} (${result.size})`;

        const a = document.createElement('a');
        a.href = result.link;
        a.appendChild(span);

        const li = document.createElement('li');
        li.appendChild(a);
        ul.appendChild(li);
    }

    function getResults(state) {
        const dom = domParser.parseFromString(state.responseText, "text/html");
        const results = provider.getLinks(dom);
        return results;
    }

    function onFetchedProviderResults(results, episode, episodeId) {
        if (results.length > 0) {
            const magnetBox = getMagnetBox(episodeId, results);
            const episodeSideHtml = episode.querySelector(".episode-side");
            const episodeTitleHtml = episode.querySelector(".episode-titre");

            episodeSideHtml.prepend(getBtn(episodeId));
            episodeTitleHtml.appendChild(magnetBox);
        }
    }

    function getCleanedQuery(q) {
        return q.replace(/ \([1-2][0-9]{3}\)/gi, ''); // Remove years " (1000)" to " (2999)"
    }


    const domParser = new DOMParser();
    const observer = new MutationObserver(function(mutations) {
        var episodes = document.querySelectorAll('#episodes_container .episode');
        episodes.forEach(episode => {
            const showName = episode.querySelector('.episode-titre a:nth-child(1)').firstChild.nodeValue;
            const showEpisode = episode.querySelector('.episode-titre a:nth-child(2)').firstChild.nodeValue;
            const query = `${showName} ${showEpisode} ${keywords.join(" ")}`;
            const episodeId = (showName + showEpisode).replace(/[^a-z0-9]/gi,'');

            const cachedResults = GM_getValue(CACHE_NAME + episodeId);
            if (cachedResults) {
                const results = JSON.parse(cachedResults);
                console.log("Using cached results: ");
                console.log(results);
                onFetchedProviderResults(results, episode, episodeId);
            } else {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: provider.getUrl(getCleanedQuery(query)),
                    fetch: true,
                    onreadystatechange: state => {
                        const results = getResults(state);
                        onFetchedProviderResults(results, episode, episodeId);
                        GM_setValue(CACHE_NAME + episodeId, JSON.stringify(results));
                    }
                });
            }

        });
    });

    observer.observe(document.querySelector("#episodes_container"), {
        childList: false,
        subtree: false,
        attributes: true,
        characterData: false
    });

})();
