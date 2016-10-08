/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = { "providers" :
  [
    {
      "name" : "Amazon",
      "base" : "https://www.amazon.com",
      "image" : "https://www.amazon.com/favicon.ico",
      "search" : "https://www.amazon.com/exec/obidos/external-search/?field-keywords={searchTerms}&mode=blended",
      "autocomplete" : "https://completion.amazon.com/search/complete?method=completion&q={searchTerms}&search-alias=aps&client=amazon-search-ui&mkt=1",
      "shortcut" : ":a"
    },
    {
      "name" : "Bing",
      "base" : "https://www.bing.com",
      "image" : "https://www.bing.com/favicon.ico",
      "search" : "https://www.bing.com/search?q={searchTerms}",
      "autocomplete" : "https://api.bing.com/osjson.aspx?query={searchTerms}&language={language}&form=OSDJAS",
      "shortcut" : ":b"
    },
    {
      "name" : "DuckDuckGo",
      "base" : "https://duckduckgo.com",
      "image" : "https://duckduckgo.com/favicon.ico",
      "search" : "https://duckduckgo.com/?q={searchTerms}&t=brave",
      "autocomplete" : "https://ac.duckduckgo.com/ac/?q={searchTerms}&type=list",
      "shortcut" : ":d"
    },
    {
      "name" : "GitHub",
      "image" : "https://assets-cdn.github.com/favicon.ico",
      "search" : "https://github.com/search?q={searchTerms}",
      "shortcut" : ":gh"
    },
    {
      "name" : "Google",
      "base" : "https://www.google.com",
      "image" : "https://www.google.com/favicon.ico",
      "search" : "https://www.google.com/search?q={searchTerms}",
      "autocomplete" : "https://suggestqueries.google.com/complete/search?client=chrome&q={searchTerms}",
      "shortcut" : ":g"
    },
    {
      "name" : "Stack Overflow",
      "image" : "https://cdn.sstatic.net/sites/stackoverflow/img/favicon.ico",
      "search" : "https://stackoverflow.com/search?q={searchTerms}",
      "shortcut" : ":s"
    },
    {
      "name" : "Mozilla Developer Network (MDN)",
      "image" : "https://developer.cdn.mozilla.net/static/img/favicon32.png",
      "search" : "https://developer.mozilla.org/search?q={searchTerms}",
      "shortcut" : ":m"
    },
    {
      "name" : "Twitter",
      "base" : "https://twitter.com",
      "image" : "https://twitter.com/favicon.ico",
      "search" : "https://twitter.com/search?q={searchTerms}&source=desktop-search",
      "shortcut" : ":t"
    },
    {
      "name" : "Wikipedia",
      "base" : "https://en.wikipedia.org",
      "image" : "https://en.wikipedia.org/favicon.ico",
      "search" : "https://en.wikipedia.org/wiki/Special:Search?search={searchTerms}",
      "shortcut" : ":w"
    },
    {
      "name" : "Yahoo",
      "base" : "https://search.yahoo.com",
      "image" : "https://search.yahoo.com/favicon.ico",
      "search" : "https://search.yahoo.com/search?p={searchTerms}&fr=opensearch",
      "autocomplete": "https://search.yahoo.com/sugg/os?command={searchTerms}&output=fxjson&fr=opensearch",
      "shortcut" : ":y"
    },
    {
      "name" : "Youtube",
      "base" : "https://www.youtube.com",
      "image" : "https://www.youtube.com/favicon.ico",
      "search" : "https://www.youtube.com/results?search_type=search_videos&search_query={searchTerms}&search_sort=relevance&search_category=0&page=",
      "autocomplete": "https://suggestqueries.google.com/complete/search?output=chrome&client=chrome&hl=it&q={searchTerms}&ds=yt",
      "shortcut" : ":yt"
    },
    {
      "name" : "StartPage",
      "image" : "https://www.startpage.com/graphics/favicon/sp-favicon-16x16.png",
      "search" : "https://www.startpage.com/do/dsearch?query={searchTerms}&cat=web&pl=opensearch",
      "autocomplete": "https://www.startpage.com/cgi-bin/csuggest?query={searchTerms}&limit=10&format=json",
      "shortcut" : ":sp"
    }
  ]
}
