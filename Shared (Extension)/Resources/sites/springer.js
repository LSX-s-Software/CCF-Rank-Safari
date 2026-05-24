const springer = {};

springer.rankingSpanProvider = [];

springer.start = function () {
  springer.addRankings();
};

springer.addRankings = function () {
  let results = document.querySelectorAll("#results-list > li > p.meta > span.enumeration > a");
  results.forEach(function (result) {
    let source = result.getAttribute("title").trim();
    if (source.length != 0) {
      let names = springer.parseNames(source);
      siteUtil.insertRankingSpans(result, names, springer.rankingSpanProvider, "beforebegin");
    }
  });
};

springer.parseNames = function (source) {
  let names = [];
  let abbr = "";
  let full;
  source = source.replace("–", "-").replace("--", "-");
  let index = source.lastIndexOf(" - ");
  if (index != -1) {
    abbr = source.substring(index + " – ".length).trim();
    if (!abbr.endsWith("11.9")) {
      abbr = abbr.replace(/'*\d+$/, "").trim();
    }
    full = source.substring(0, index);
  } else {
    full = source;
  }
  full = siteUtil.removeNumbers(full).trim();
  names.push({ full: full, abbr: abbr });
  return names;
};
