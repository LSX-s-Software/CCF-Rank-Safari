const ieee = {};

ieee.rankingSpanProvider = [];
ieee.loadMoreInited = false;
ieee.desktopLastIndex = -1;
ieee.mobileLastIndex = -1;

ieee.start = function () {
  let interval = setInterval(function () {
    if (!ieee.isLoading()) {
      clearInterval(interval);
      // for desktop page select
      document.querySelectorAll("#xplMainContent > div.ng-SearchResults.row > div.main-section > xpl-paginator a").forEach(function (element) {
        element.addEventListener('click', function () {
          ieee.desktopLastIndex = -1;
          ieee.mobileLastIndex = -1;
          ieee.start();
        });
      });
      // for mobile loadmore
      if (!ieee.loadMoreInited) {
        ieee.loadMoreInited = true;
        document.querySelectorAll(".loadMore-btn").forEach(function (element) {
          element.addEventListener('click', ieee.start);
        });
      }
      ieee.addRankings();
    }
  }, 1000);
};

ieee.addRankings = function () {
  // for desktop
  document.querySelectorAll(".description > a").forEach(function (element, index) {
    if (index > ieee.desktopLastIndex) {
      ieee.desktopLastIndex = index;
      ieee.addRanking(element);
    }
  });
  // for mobile
  document.querySelectorAll(".description > div:nth-child(1) > a").forEach(function (element, index) {
    if (index > ieee.mobileLastIndex) {
      ieee.mobileLastIndex = index;
      ieee.addRanking(element);
    }
  });
};

ieee.isLoading = function () {
  return (
    document.querySelector(".List-results-message")?.textContent.trim() == "Getting results..." ||
    document.querySelector("xpl-progress-spinner")?.textContent.trim() == "Getting results..." ||
    document.querySelector(".loadMore-btn > span.fa-spinner") != null
  );
};

ieee.addRanking = function (result) {
  let source = result.textContent.trim();
  if (source.length != 0) {
    let names = ieee.parseNames(source);
    for (let getRankingSpan of ieee.rankingSpanProvider) {
      if (result.nextElementSibling && result.nextElementSibling.classList.contains("ccf-ranking")) {
        continue;
      }
      result.insertAdjacentElement('afterend', getRankingSpan(names));
    }
  }
};

ieee.parseNames = function (source) {
  let names = [];
  let index = source.lastIndexOf("(");
  let full;
  let abbr;
  if (index != -1) {
    full = source.substring(0, index);
    abbr = source.substring(index + 1, source.length - 1);
  } else {
    full = source;
    abbr = "";
  }
  full = siteUtil.removeNumbers(full).split(";");
  abbr = abbr.split("/");
  for (let i = 0; i < Math.max(full.length, abbr.length); ++i) {
    let name = {};
    name.full = (full[i] || "").trim();
    name.abbr = (abbr[i] || "").trim();
    names.push(name);
  }
  return names;
};
