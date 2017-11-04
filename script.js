// ==UserScript==
// @name         Betaseries Torrented
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Find the best magnet links for your unwatched tvshow episodes
// @author       Eddydg
// @match        https://www.betaseries.com/membre/*/episodes
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

!function(t){'use strict';function e(){console.log.apply(console,arguments)}function s(t,e){var s;this.list=t,this.options=e=e||{};for(s in r)r.hasOwnProperty(s)&&("boolean"==typeof r[s]?this.options[s]=s in e?e[s]:r[s]:this.options[s]=e[s]||r[s])}function n(t,e,s){var o,r,h,a,c,p;if(e){if(h=e.indexOf("."),-1!==h?(o=e.slice(0,h),r=e.slice(h+1)):o=e,a=t[o],null!==a&&void 0!==a)if(r||"string"!=typeof a&&"number"!=typeof a)if(i(a))for(c=0,p=a.length;p>c;c++)n(a[c],r,s);else r&&n(a,r,s);else s.push(a)}else s.push(t);return s}function i(t){return"[object Array]"===Object.prototype.toString.call(t)}function o(t,e){e=e||{},this.options=e,this.options.location=e.location||o.defaultOptions.location,this.options.distance="distance"in e?e.distance:o.defaultOptions.distance,this.options.threshold="threshold"in e?e.threshold:o.defaultOptions.threshold,this.options.maxPatternLength=e.maxPatternLength||o.defaultOptions.maxPatternLength,this.pattern=e.caseSensitive?t:t.toLowerCase(),this.patternLen=t.length,this.patternLen<=this.options.maxPatternLength&&(this.matchmask=1<<this.patternLen-1,this.patternAlphabet=this._calculatePatternAlphabet())}var r={id:null,caseSensitive:!1,include:[],shouldSort:!0,searchFn:o,sortFn:function(t,e){return t.score-e.score},getFn:n,keys:[],verbose:!1,tokenize:!1,matchAllTokens:!1,tokenSeparator:/ +/g,minMatchCharLength:1,findAllMatches:!1};s.VERSION="2.6.2",s.prototype.set=function(t){return this.list=t,t},s.prototype.search=function(t){this.options.verbose&&e("\nSearch term:",t,"\n"),this.pattern=t,this.results=[],this.resultMap={},this._keyMap=null,this._prepareSearchers(),this._startSearch(),this._computeScore(),this._sort();var s=this._format();return s},s.prototype._prepareSearchers=function(){var t=this.options,e=this.pattern,s=t.searchFn,n=e.split(t.tokenSeparator),i=0,o=n.length;if(this.options.tokenize)for(this.tokenSearchers=[];o>i;i++)this.tokenSearchers.push(new s(n[i],t));this.fullSeacher=new s(e,t)},s.prototype._startSearch=function(){var t,e,s,n,i=this.options,o=i.getFn,r=this.list,h=r.length,a=this.options.keys,c=a.length,p=null;if("string"==typeof r[0])for(s=0;h>s;s++)this._analyze("",r[s],s,s);else for(this._keyMap={},s=0;h>s;s++)for(p=r[s],n=0;c>n;n++){if(t=a[n],"string"!=typeof t){if(e=1-t.weight||1,this._keyMap[t.name]={weight:e},t.weight<=0||t.weight>1)throw new Error("Key weight has to be > 0 and <= 1");t=t.name}else this._keyMap[t]={weight:1};this._analyze(t,o(p,t,[]),p,s)}},s.prototype._analyze=function(t,s,n,o){var r,h,a,c,p,l,u,f,d,g,m,y,v,k,S,b=this.options,M=!1;if(void 0!==s&&null!==s){h=[];var _=0;if("string"==typeof s){if(r=s.split(b.tokenSeparator),b.verbose&&e("---------\nKey:",t),this.options.tokenize){for(k=0;k<this.tokenSearchers.length;k++){for(f=this.tokenSearchers[k],b.verbose&&e("Pattern:",f.pattern),d=[],y=!1,S=0;S<r.length;S++){g=r[S],m=f.search(g);var L={};m.isMatch?(L[g]=m.score,M=!0,y=!0,h.push(m.score)):(L[g]=1,this.options.matchAllTokens||h.push(1)),d.push(L)}y&&_++,b.verbose&&e("Token scores:",d)}for(c=h[0],l=h.length,k=1;l>k;k++)c+=h[k];c/=l,b.verbose&&e("Token score average:",c)}u=this.fullSeacher.search(s),b.verbose&&e("Full text score:",u.score),p=u.score,void 0!==c&&(p=(p+c)/2),b.verbose&&e("Score average:",p),v=this.options.tokenize&&this.options.matchAllTokens?_>=this.tokenSearchers.length:!0,b.verbose&&e("Check Matches",v),(M||u.isMatch)&&v&&(a=this.resultMap[o],a?a.output.push({key:t,score:p,matchedIndices:u.matchedIndices}):(this.resultMap[o]={item:n,output:[{key:t,score:p,matchedIndices:u.matchedIndices}]},this.results.push(this.resultMap[o])))}else if(i(s))for(k=0;k<s.length;k++)this._analyze(t,s[k],n,o)}},s.prototype._computeScore=function(){var t,s,n,i,o,r,h,a,c,p=this._keyMap,l=this.results;for(this.options.verbose&&e("\n\nComputing score:\n"),t=0;t<l.length;t++){for(n=0,i=l[t].output,o=i.length,a=1,s=0;o>s;s++)r=i[s].score,h=p?p[i[s].key].weight:1,c=r*h,1!==h?a=Math.min(a,c):(n+=c,i[s].nScore=c);1===a?l[t].score=n/o:l[t].score=a,this.options.verbose&&e(l[t])}},s.prototype._sort=function(){var t=this.options;t.shouldSort&&(t.verbose&&e("\n\nSorting...."),this.results.sort(t.sortFn))},s.prototype._format=function(){var t,s,n,i,o,r=this.options,h=r.getFn,a=[],c=this.results,p=r.include;for(r.verbose&&e("\n\nOutput:\n\n",c),i=r.id?function(t){c[t].item=h(c[t].item,r.id,[])[0]}:function(){},o=function(t){var e,s,n,i,o,r=c[t];if(p.length>0){if(e={item:r.item},-1!==p.indexOf("matches"))for(n=r.output,e.matches=[],s=0;s<n.length;s++)i=n[s],o={indices:i.matchedIndices},i.key&&(o.key=i.key),e.matches.push(o);-1!==p.indexOf("score")&&(e.score=c[t].score)}else e=r.item;return e},s=0,n=c.length;n>s;s++)i(s),t=o(s),a.push(t);return a},o.defaultOptions={location:0,distance:100,threshold:.6,maxPatternLength:32},o.prototype._calculatePatternAlphabet=function(){var t={},e=0;for(e=0;e<this.patternLen;e++)t[this.pattern.charAt(e)]=0;for(e=0;e<this.patternLen;e++)t[this.pattern.charAt(e)]|=1<<this.pattern.length-e-1;return t},o.prototype._bitapScore=function(t,e){var s=t/this.patternLen,n=Math.abs(this.options.location-e);return this.options.distance?s+n/this.options.distance:n?1:s},o.prototype.search=function(t){var e,s,n,i,o,r,h,a,c,p,l,u,f,d,g,m,y,v,k,S,b,M,_,L=this.options;if(t=L.caseSensitive?t:t.toLowerCase(),this.pattern===t)return{isMatch:!0,score:0,matchedIndices:[[0,t.length-1]]};if(this.patternLen>L.maxPatternLength){if(v=t.match(new RegExp(this.pattern.replace(L.tokenSeparator,"|"))),k=!!v)for(b=[],e=0,M=v.length;M>e;e++)_=v[e],b.push([t.indexOf(_),_.length-1]);return{isMatch:k,score:k?.5:1,matchedIndices:b}}for(i=L.findAllMatches,o=L.location,n=t.length,r=L.threshold,h=t.indexOf(this.pattern,o),S=[],e=0;n>e;e++)S[e]=0;for(-1!=h&&(r=Math.min(this._bitapScore(0,h),r),h=t.lastIndexOf(this.pattern,o+this.patternLen),-1!=h&&(r=Math.min(this._bitapScore(0,h),r))),h=-1,m=1,y=[],p=this.patternLen+n,e=0;e<this.patternLen;e++){for(a=0,c=p;c>a;)this._bitapScore(e,o+c)<=r?a=c:p=c,c=Math.floor((p-a)/2+a);for(p=c,l=Math.max(1,o-c+1),u=i?n:Math.min(o+c,n)+this.patternLen,f=Array(u+2),f[u+1]=(1<<e)-1,s=u;s>=l;s--)if(g=this.patternAlphabet[t.charAt(s-1)],g&&(S[s-1]=1),0===e?f[s]=(f[s+1]<<1|1)&g:f[s]=(f[s+1]<<1|1)&g|((d[s+1]|d[s])<<1|1)|d[s+1],f[s]&this.matchmask&&(m=this._bitapScore(e,s-1),r>=m)){if(r=m,h=s-1,y.push(h),!(h>o))break;l=Math.max(1,2*o-h)}if(this._bitapScore(e+1,o)>r)break;d=f}return b=this._getMatchedIndices(S),{isMatch:h>=0,score:0===m?.001:m,matchedIndices:b}},o.prototype._getMatchedIndices=function(t){for(var e,s=[],n=-1,i=-1,o=0,r=t.length;r>o;o++)e=t[o],e&&-1===n?n=o:e||-1===n||(i=o-1,i-n+1>=this.options.minMatchCharLength&&s.push([n,i]),n=-1);return t[o-1]&&o-1-n+1>=this.options.minMatchCharLength&&s.push([n,o-1]),s},"object"==typeof exports?module.exports=s:"function"==typeof define&&define.amd?define(function(){return s}):t.Fuse=s}(this);
(function() {
    'use strict';
    console.log(GM_listValues());

    const FUSE_OPTIONS = {
        keys: ['title'],
        include: ["score","matches"],
        shouldSort: true,
        threshold: 0.6,
        maxPatternLength: 32,
        minMatchCharLength: 2,
    };

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
        },
        "zooqle": {
            getUrl: (q) => `https://zooqle.com/search?q=${encodeURIComponent(q)}+category%3ATV%2CAnime`,
            getLinks: (dom) => (
                [...dom.querySelectorAll('tbody tr')]
                    .map(tr => ({
                        title: tr.children[1].querySelector('a').textContent,
                        link: tr.children[2].children[0].children[1].children[0].href,
                        size: tr.children[3].children[0].children[0].textContent
                    })
                )
            )
        }
    };

    const CACHE_NAME = "cached_result_";
    const CACHE_DAY_LIFESPAN = 1;
    const today = new Date();
    cleanCachedEpisodeResults();
    const provider = providers["zooqle"];
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
	a.title = `${result.title} (${result.size})`;
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

            const cachedResults = JSON.parse(GM_getValue(CACHE_NAME + episodeId) || null);
            if (cachedResults && !isCacheTooOld(new Date(cachedResults.date))) {
                console.log("Using cached results: ");
                console.log(cachedResults);
                onFetchedProviderResults(cachedResults.results, episode, episodeId);
            } else {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: provider.getUrl(getCleanedQuery(query)),
                    fetch: true,
                    onreadystatechange: state => {
                        let results = getResults(state);
                        results = getPertinentResults(query, results);
                        onFetchedProviderResults(results, episode, episodeId);
                        let resultsToCache = {
                            results: results,
                            date: new Date()
                        };
                        GM_setValue(CACHE_NAME + episodeId, JSON.stringify(resultsToCache));
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

    function getPertinentResults(query, results) {
        const fuse = new Fuse(results, FUSE_OPTIONS);
        const pertinentResults = fuse.search(query).map(r => r.item);
        console.log(pertinentResults);
        return pertinentResults;
    }

    function cleanCachedEpisodeResults() {
        GM_listValues()
            .filter(e => e.startsWith(CACHE_NAME))
            .map(e => GM_deleteValue(e));
    }

    function isCacheTooOld(cacheDate) {
        return cacheDate.getTime() > new Date(new Date().setDate(today.getDate() + CACHE_DAY_LIFESPAN)).getTime();
    }

})();
