function displayResult(result) {
    const resultDiv = document.querySelector("#result");
    resultDiv.innerHTML = `<span>查询结果：</span>`;
    resultDiv.appendChild(result);
}

document.querySelector("#search").addEventListener("click", (e) => {
    e.preventDefault();
    const query = document.querySelector("#input").value;
    if (query) {
        displayResult(ccf.getRankingSpan([{ full: query, abbr: query }]));
    }
});
