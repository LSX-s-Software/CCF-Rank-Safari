browser.runtime.onMessage.addListener(function (message) {
  if (message == null || message.type != "fetchDblpPublication") {
    return undefined;
  }

  const api = `https://dblp.org/search/publ/api?q=${encodeURIComponent(message.query)}&format=json`;
  return fetch(api).then(function (response) {
    if (!response.ok) {
      throw new Error(`DBLP request failed with status ${response.status}`);
    }
    return response.json();
  });
});
