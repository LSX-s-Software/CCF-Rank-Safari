const dblp = {};

dblp.rankingSpanProvider = [];

dblp.start = function () {
  let pathname = window.location.pathname;
  let title = document.querySelector("head > title").textContent;
  if (pathname.startsWith("/search?") || title.indexOf("Search for") != -1) {
    setInterval(function () {
      let message = document.querySelector("#completesearch-publs > div > p.waiting");
      if (message.style.display == "none") {
        window.addEventListener("popstate", function () {
          dblp.addRankings();
        });
        dblp.addRankings();
      }
    }, 1000);
  } else if (pathname.startsWith("/pid/")) {
    dblp.addRankings();
  } else if (pathname.startsWith("/db/conf/") || pathname.startsWith("/db/journals/")) {
    let uri = dblp.getUriFromPathname(pathname);
    if (pathname.endsWith(".html") && !pathname.endsWith("index.html")) {
      dblp.addRanking("#breadcrumbs > ul > li > span:nth-child(3) > a > span", uri);
    } else {
      dblp.addRanking("h1", uri);
    }
  }
};

dblp.getUriFromPathname = function (pathname) {
  if (pathname.indexOf("/conf/uss/hotsec") != -1) {
    return "conf/uss/hotsec"; //唯一的三级uri
  } else if (pathname.startsWith("/db/")) {
    const uriStart = "/db/".length;
    const searchStart = pathname.indexOf("/", uriStart) + 1;
    return pathname.substring(uriStart, pathname.indexOf("/", searchStart)).toLowerCase();
  }
  return undefined;
};

dblp.addRankings = function () {
  let results = document.querySelectorAll("cite > a > span:nth-child(1) > span:nth-child(1)"); //获取期刊或会议名称
  if (dblp.resultsCount == results.length) {
    return;
  }
  const lastResultCount = dblp.resultsCount == undefined ? 0 : dblp.resultsCount;
  dblp.resultsCount = results.length;

  results.forEach(function (result, index) {
    if (index >= lastResultCount) {
      let source = result.textContent.trim().replace(/\(\d+\)/, "");
      let url = result.parentElement.parentElement.getAttribute("href");
      let pathname = url.substring(url.indexOf(location.hostname) + location.hostname.length);
      let uri = dblp.getUriFromPathname(pathname);
      if (source.length != 0 && (!result.nextElementSibling || !result.nextElementSibling.classList.contains("ccf-ranking"))) {
        for (let getRankingSpan of dblp.rankingSpanProvider) {
          let names = dblp.parseNames(source, uri);
          result.insertAdjacentElement('afterend', getRankingSpan(names));
        }
      }
    }
  });
};

dblp.addRanking = function (selector, uri) {
  let result = document.querySelector(selector);
  let source = result.textContent.trim();
  if (source.length != 0) {
    for (let getRankingSpan of dblp.rankingSpanProvider) {
      let names = dblp.parseNames(source, uri);
      result.insertAdjacentElement('afterend', getRankingSpan(names));
    }
  }
};

dblp.parseNames = function (source, uri) {
  let names = [];
  let index = source.lastIndexOf("(");
  let full;
  let abbr;
  if (index != -1) {
    full = source.substring(0, index);
    abbr = source.substring(index + 1, source.length - 1);
  } else {
    if (source.length <= 12) {
      abbr = source;
      full = "";
    } else {
      full = source;
      abbr = "";
    }
  }
  full = siteUtil.removeNumbers(full).split(";");
  abbr = abbr.split("/");
  for (let i = 0; i < Math.max(full.length, abbr.length); ++i) {
    let name = {};
    name.full = (full[i] || "").trim();
    name.abbr = (abbr[i] || "").trim();
    name.uri = uri;
    names.push(name);
  }
  return names;
};

dblp.uri2rank = function (name) {
  let index = ccf.dblp_uri2index[name.uri];
  if (index != undefined) {
    name.full = ccf.rank[index][0];
    return ccf.rank[index][1];
  }
  return undefined;
};
