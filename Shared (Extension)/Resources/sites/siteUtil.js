const siteUtil = {};

siteUtil.removeNumbers = function (raw) {
  let words = raw.split(" ");
  for (let i = 0; i < words.length; ++i) {
    if (words[i] == "" || ("0" <= words[i][0] && words[i][0] <= "9" && words[i] != "11.9")) {
      words.splice(i, 1);
      --i;
    }
  }
  return words.join(" ");
};

siteUtil.hasRankingSibling = function (element, direction = "next") {
  const sibling = direction == "previous" ? element.previousElementSibling : element.nextElementSibling;
  return sibling != null && sibling.classList.contains("ccf-ranking");
};

siteUtil.insertRankingSpans = function (anchor, names, providers, position = "afterend") {
  if (siteUtil.hasRankingSibling(anchor, position == "beforebegin" ? "previous" : "next")) {
    return;
  }
  for (let getRankingSpan of providers) {
    anchor.insertAdjacentElement(position, getRankingSpan(names));
  }
};

siteUtil.isVisible = function (element) {
  if (element == null) {
    return false;
  }
  const style = getComputedStyle(element);
  return style.display != "none" && style.visibility != "hidden";
};
