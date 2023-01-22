const b = (ms) => new Promise((res) => setTimeout(res, ms));
const a = () =>
    fetch("https://api.hypixel.net/skyblock/auctions")
        .then((res) => res.json())
        .then((json) => {
            const d1 = new Date();
            const d2 = new Date(json.lastUpdated);
            console.log(d1 - d2, d1, d2);
            b(500).then(a);
        });

a();
