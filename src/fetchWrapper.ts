export class FetchWrapper {
    static async fetch(urlStr: string, timeout = 55000) {
        const url = new URL(urlStr);
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        // Does not call FetchWrapper.fetch
        const res = await fetch(url, { signal: controller.signal }).catch(
            (error) => {
                console.error({ url: FetchWrapper.filterURL(url).href });
                throw error;
            }
        );
        if (!res.ok) {
            console.error({
                url: FetchWrapper.filterURL(url).href,
                status: res.status,
                statusText: res.statusText,
                text: await res.text().catch((rej) => console.error(rej)),
            });
            throw new Error("Unsuccessful Status Response");
        }
        const json = await res.json().catch((error) => {
            // Should be hopefully caught in if (!res.ok) {...}
            console.error({
                url: FetchWrapper.filterURL(url).href,
                status: res.status,
                statusText: res.statusText,
            });
            console.error("Unsuccessful Json Parse");
            throw error;
        });
        // Should be caught in if (!res.ok) {...}
        if (json.success === false) {
            console.error({
                url: FetchWrapper.filterURL(url).href,
                status: res.status,
                statusText: res.statusText,
                json: json,
            });
            throw new Error("Unsuccessful Json Response");
        }
        return json;
    }

    static filterURL(url: URL) {
        const url2 = new URL(url);
        if (url2.searchParams.has("key")) {
            url2.searchParams.set("key", "HYPIXEL_API_KEY");
        }
        return url;
    }
}
