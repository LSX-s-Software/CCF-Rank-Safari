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
      for (let getRankingSpan of springer.rankingSpanProvider) {
        result.insertAdjacentElement('beforebegin', getRankingSpan(names));
      }
    }
  });
};

springer.parseNames = function (source) {
  let names = [];
  let abbr = "";
  let full;
  source = source.replace("–", "-").replace("--", "-");
  let index = source.lastIndexOf(" - ");
  console.log("s = " + source + ", index = " + index);
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
