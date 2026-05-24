/**
 * Based on https://github.com/WenyanLiu/CCFrank4dblp/blob/704960f95393fdcacdd5f71864f3768518a9fb2a/js/scholar.js
 *
 * MIT License
 *
 * Copyright (c) 2019 wyliu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const scholar = {};

scholar.rankSpanList = [];
scholar.popstateInited = false;
scholar.rankCache = {};

scholar.run = function () {
  let url = window.location.pathname;
  if (url == "/scholar") {
    scholar.appendRank();
  } else if (url == "/citations") {
    if (!scholar.popstateInited) {
      window.addEventListener("popstate", function () {
        scholar.appendRanks();
      });
      scholar.popstateInited = true;
    }
    setInterval(function () {
      scholar.appendRanks();
    }, 2000);
  }
};

scholar.appendRank = function () {
  let elements = document.querySelectorAll("#gs_res_ccl_mid > div > div.gs_ri");
  elements.forEach(function (element) {
    let node = element.querySelector("h3 > a");
    if (node == null || siteUtil.hasRankingSibling(node)) {
      return;
    }
    let title = node.textContent.replace(/[^A-z]/g, " ");
    let data = element
      .querySelector("div.gs_a")
      .textContent.replace(/[\,\-\…]/g, "")
      .split(" ");
    let author = data[1];
    let year = data.slice(-3)[0];
    fetchRank(node, title, author, year);
  });
};

scholar.appendRanks = function () {
  let elements = document.querySelectorAll("tr.gsc_a_tr");
  elements.forEach(function (element) {
    let node = element.querySelector("td.gsc_a_t > a");
    if (node == null || siteUtil.hasRankingSibling(node)) {
      return;
    }
    let title = node.textContent.replace(/[^A-z]/g, " ");
    let author = element
      .querySelector("div.gs_gray")
      .textContent.replace(/[\,\…]/g, "")
      .split(" ")[1];
    let year = element.querySelector("td.gsc_a_y").textContent;
    fetchRank(node, title, author, year);
  });
};

function fetchRank(node, title, author, year) {
  const query = `${title.trim()} ${author || ""}`.trim();
  const cacheKey = `${query}|${year || ""}`.toLowerCase();

  if (siteUtil.hasRankingSibling(node) || node.dataset.ccfRankStatus == "loading") {
    return;
  }

  if (scholar.rankCache[cacheKey] != undefined) {
    scholar.insertRank(node, scholar.rankCache[cacheKey]);
    return;
  }

  node.dataset.ccfRankStatus = "loading";
  scholar.fetchDblpUri(query, author, year)
    .then(function (dblpUri) {
      scholar.rankCache[cacheKey] = dblpUri;
      scholar.insertRank(node, dblpUri);
    })
    .catch(function () {
      scholar.rankCache[cacheKey] = "";
      scholar.insertRank(node, "");
    });
}

scholar.fetchDblpUri = function (query, author, year) {
  return browser.runtime
    .sendMessage({ type: "fetchDblpPublication", query: query })
    .then(function (data) {
      return scholar.findDblpUri(data, author, year);
    });
};

scholar.findDblpUri = function (data, author, year) {
  const resp = data.result.hits;
  const authorText = (author || "").toLowerCase();
  const targetYear = Number(year);
  if (resp == undefined || resp["@total"] == 0) {
    return "";
  }
  if (resp["@total"] == 1) {
    return scholar.extractDblpUri(resp.hit[0].info.url);
  }

  let fallbackUri = "";
  let yearLastCheck = 0;
  for (let hit of resp.hit) {
    const info = hit.info;
    if (info.authors.author[0] == undefined) {
      continue;
    }
    const author_1st = info.authors.author[0].text;
    const year_fuzzy = Number(info.year);
    if (
      Math.abs(targetYear - year_fuzzy) <= 1 &&
      authorText.length != 0 &&
      author_1st.toLowerCase().split(" ").indexOf(authorText) != -1 &&
      year_fuzzy != yearLastCheck
    ) {
      yearLastCheck = year_fuzzy;
      const uri = scholar.extractDblpUri(info.url);
      if (year_fuzzy == targetYear + 1) {
        fallbackUri = uri;
      } else if (year_fuzzy == targetYear) {
        return uri;
      } else if (fallbackUri == "") {
        fallbackUri = uri;
      }
    }
  }
  return fallbackUri;
};

scholar.extractDblpUri = function (url) {
  return url.substring(url.indexOf("/rec/") + 5, url.lastIndexOf("/"));
};

scholar.insertRank = function (node, dblpUri) {
  delete node.dataset.ccfRankStatus;
  siteUtil.insertRankingSpans(node, [{ uri: dblpUri }], scholar.rankSpanList);
};
