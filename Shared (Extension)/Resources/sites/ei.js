const ei = {};

ei.rankingSpanProvider = [];
ei.pageNavInited = false;

ei.start = function () {
  let interval = setInterval(function () {
    if (!ei.isLoading()) {
      clearInterval(interval);
      // for desktop page select
      if (!ei.pageNavInited) {
        let pageNav = document.querySelector("#page-nav");
        if (pageNav != null) {
          pageNav.addEventListener("click", function () {
            ei.start();
          });
          ei.pageNavInited = true;
        }
      }
      ei.addRankings();
    }
  }, 1000);
};

ei.isLoading = function () {
  let evLoading = document.querySelector("#ev-loading");
  let loadingResults = document.querySelector("#loading-results");
  return (
    siteUtil.isVisible(evLoading) ||
    siteUtil.isVisible(loadingResults)
  );
};

ei.addRankings = function () {
  document.querySelectorAll(".source-info").forEach(function (element) {
    ei.addRanking(element);
  });
};

ei.addRanking = function (result) {
  let source = result.textContent.trim();
  if (source.length !== 0) {
    let names = ei.parseNames(source);
    siteUtil.insertRankingSpans(result, names, ei.rankingSpanProvider, "beforebegin");
  }
};

ei.parseNames = function (source) {
  let names = [];
  let abbr = "";
  let full = "";

  // 删除年限、第几届
  source = source.replace(/(3rd)|([0-9]{4})/g, "");
  // 删除所有的次序

  source = source.replace(/.*[0-9]+th/g, "");
  source = source.trim();

  // processdings
  if (source.match(",.+-") !== null) {
    abbr = source.match(",.+-")[0].replace(/,|-/g, "").trim();
    full = source.match(".*,")[0].replace(/,/g, "").trim();
  } else if (source.match(",") !== null) {
    abbr = source;
    full = source.substr(source.match(".*,")[0].length);
  } else {
    abbr = source;
    full = source;
  }

  names.push({
    full: full,
    abbr: abbr,
  });
  return names;
};
