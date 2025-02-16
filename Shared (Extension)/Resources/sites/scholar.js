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

scholar.run = function () {
  let url = window.location.pathname;
  if (url == "/scholar") {
    scholar.appendRank();
  } else if (url == "/citations") {
    setInterval(function () {
      window.addEventListener("popstate", function () {
        scholar.appendRanks();
      });
      scholar.appendRanks();
    }, 2000);
  }
};

scholar.appendRank = function () {
  let elements = document.querySelectorAll("#gs_res_ccl_mid > div > div.gs_ri");
  elements.forEach(function (element) {
    let node = element.querySelector("h3 > a");
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
    if (!node.nextElementSibling || !node.nextElementSibling.classList.contains("ccf-ranking")) {
      let title = node.textContent.replace(/[^A-z]/g, " ");
      let author = element
        .querySelector("div.gs_gray")
        .textContent.replace(/[\,\…]/g, "")
        .split(" ")[1];
      let year = element.querySelector("td.gsc_a_y").textContent;
      fetchRank(node, title, author, year);
    }
  });
};

function fetchRank(node, title, author, year) {
  const api_format = `https://dblp.org/search/publ/api?q=${encodeURIComponent(title + " " + author)}&format=json`;
  fetch(api_format)
    .then(response => response.json())
    .then(data => {
      let dblp_url = "";
      const resp = data.result.hits;
      if (resp == undefined || resp["@total"] == 0) {
        dblp_url = "";
      } else if (resp["@total"] == 1) {
        const url = resp.hit[0].info.url;
        dblp_url = url.substring(url.indexOf("/rec/") + 5, url.lastIndexOf("/"));
      } else {
        for (let hit of resp.hit) {
          const info = hit.info;
          if (info.authors.author[0] == undefined) {
            continue;
          }
          const author_1st = info.authors.author[0].text;
          const year_fuzzy = info.year;
          let year_last_check = 0;
          if (
            Math.abs(Number(year) - year_fuzzy) <= 1 &&
            author_1st.toLowerCase().split(" ").indexOf(author.toLowerCase()) != -1 &&
            year_fuzzy != year_last_check
          ) {
            year_last_check = year_fuzzy;
            const url = info.url;
            const dblp_url_last_check = url.substring(url.indexOf("/rec/") + 5, url.lastIndexOf("/"));
            if (year_fuzzy == year + 1) {
              dblp_url = dblp_url_last_check;
            } else if (year_fuzzy == year) {
              dblp_url = dblp_url_last_check;
              break;
            } else {
              if (dblp_url == "") {
                dblp_url = dblp_url_last_check;
              }
            }
          }
        }
      }
      const names = [{ uri: dblp_url }];
      for (let getRankSpan of scholar.rankSpanList) {
        node.insertAdjacentElement("afterend", getRankSpan(names));
      }
    })
    .catch(error => console.error('Error fetching rank:', error));
}
