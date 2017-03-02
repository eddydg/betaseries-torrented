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

    let provider = providers["skytorrents"];
    let keywords = ["1080p", "x265"];

    function getBtn(episodeId) {
        let btn = document.createElement('div');

        let img = document.createElement('img');
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsElEQVQ4T23QbUhTYRQH8P+9dvMtcznYLHWkU6cLArtNm2FaFEWZRkSkUYq2jBANti+BiVDSF5OMjJQZiLQiYiRpEEVpI5e2pcbUjTWNqdMNW2m+dLN248oac+yB58Phf86P5zkEAk4nEMUAx1ngMAEkcTELjBPAy1DgeSHw03+E8C86gK0USTaI5PSeJHmmIDKaF8HlS/M/lsf1Ay673vhh1eNRnQNm/s/5gDYgKpQkW3adLjwgTBAJfzm/r3tbmHALnJN256cnnW8Yj6ei3PsSH9AOFCfK6etiWWbSwpTTMzI66piw292ckigSxeyQSrdtjheSto8D4xN647USQMNlPuAB0J5zqeTk0rR706jZPGWxWh9RQBPXtApUS1JSiqRpafGRcTGLuvvt2jKgZB2gBnR5l8uzXZavZG9f3+e/KytHa4BprukGEBcSHv4iNzt7p0Cy3dNzr63vApCzDmgBDPsU5+kZkxXv9HpjHbDbfwl1XC6X07HSZOjaOowV3tz3hbuAIbf4FD07ZsP7wcGgwN6MDDo2XYxezVNjZSBwGzAcPHGM/jb2BW8tlqDAfomE5qcn4/WzbuOVQKABMBQeyqPnzTZ0TU4GBfITEujoNDE6X/UYVYHATcBwNkdOL1tseOxyBQXOCAR0hESMhzq98WogIJPJFGq1utVsdqGxsUbV399/y3+JWVlZF5ubm1scjhXU16t8uW+JYrFYodVq14Da2spqi8Vyxx9ITU1VaDSaVg5QKsuqrVbrWu4DeDxelclkahoasqO0tEA5NzfX6A/w+fyq4eHhppERB4qKjijdbvdazgE8AFEUReWzLCskSZIgCGKWYZhuAIsA/gCIpCiqgGXZWJIkQwiCmGEYpgvAAgeEAQj13g0APN6hVQC/vfVGANylAJDenAHA/AMeSRE3vrDTDwAAAABJRU5ErkJggg==";

        btn.appendChild(img);
        btn.onclick = () => {
            let magnetBox = document.querySelector(`#${episodeId}`);
            if (magnetBox.style.display === "none") {
                magnetBox.style.display = "";
            } else {
                magnetBox.style.display = "none";
            }
        };

        return btn;
    }

    function createMagnetBox(dom, episodeId, results) {

        let box = document.createElement('div');
        box.className = "box top srt";
        box.id = episodeId;
        box.style.display = "none";

        let content = document.createElement('content');

        let ul = document.createElement('ul');
        ul.className = "srt";

        results.map(result => appendResultToMagnetBox(result, ul));
        content.appendChild(ul);
        box.appendChild(content);
        dom.appendChild(box);
    }

    function appendResultToMagnetBox(result, ul) {
      let span = document.createElement('span');
      span.innerHTML = `${result.title} (${result.size})`;

      let a = document.createElement('a');
      a.href = result.link;
      a.appendChild(span);

      let li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
    }

    let domParser = new DOMParser();
    var observer = new MutationObserver(function(mutations) {
        var episodes = document.querySelectorAll('#episodes_container .episode');
        episodes.forEach(episode => {
            let showName = episode.querySelector('.episode-titre a:nth-child(1)').firstChild.nodeValue;
            let showEpisode = episode.querySelector('.episode-titre a:nth-child(2)').firstChild.nodeValue;
            let query = showName + " " + showEpisode + " " + keywords.join(" ");

            GM_xmlhttpRequest({
                method: "GET",
                url: provider.getUrl(query),
                fetch: true,
                onreadystatechange: function(state) {
                    let dom = domParser.parseFromString(state.responseText, "text/html");
                    let results = provider.getLinks(dom);
                    if (results.length < 1) return;

                    let episodeId = (showName + showEpisode).replace(/[^a-z0-9]/gi,'');
                    let targetHtml = episode.querySelector(".episode-side");
                    targetHtml.prepend(getBtn(episodeId));
                    createMagnetBox(targetHtml, episodeId, results);
                }
            });
        });
    });

    observer.observe(document.querySelector("#episodes_container"), {
        childList: false,
        subtree: false,
        attributes: true,
        characterData: false,
    });

})();
