// 数据管理类
class DataManager {
    constructor() {
        this.podcastSources = [
            { title: "不开玩笑", id: "681dc93cb7c8a9962c3fb0e6", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/681dc93cb7c8a9962c3fb0e6.json?id=681dc93cb7c8a9962c3fb0e6" },
            { title: "无聊斋", id: "682a0676a5412dad8cd29bcc", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/682a0676a5412dad8cd29bcc.json?id=682a0676a5412dad8cd29bcc" },
            { title: "基本无害", id: "6828c15d457b22ce0d318955", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/6828c15d457b22ce0d318955.json?id=6828c15d457b22ce0d318955" },
            { title: "三个火呛手", id: "6824bac11ced30a23159f50b", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/6824bac11ced30a23159f50b.json?id=6824bac11ced30a23159f50b" },
            { title: "正经叭叭", id: "682b4b04457b22ce0d807186", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/682b4b04457b22ce0d807186.json?id=682b4b04457b22ce0d807186" },
            { title: "谐星聊天会", id: "681b2a3ddb57cd35f7fe2463", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/681b2a3ddb57cd35f7fe2463.json?id=681b2a3ddb57cd35f7fe2463" },
            { title: "文化有限", id: "682bb8b1d231129fe32c3ba0", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/682bb8b1d231129fe32c3ba0.json?id=682bb8b1d231129fe32c3ba0" },
            { title: "屠龙之术", id: "682adff0457b22ce0d6baf3b", url: "https://www.xiaoyuzhoufm.com/_next/data/ukNZu6IpYNggYjnOGPzVW/episode/682adff0457b22ce0d6baf3b.json?id=682adff0457b22ce0d6baf3b" }
        ];
        
        this.PODCAST_MAPPING = Object.fromEntries(this.podcastSources.map(p => [p.title, p.id]));
        this.PODCAST_ID_TO_TITLE_MAPPING = Object.fromEntries(this.podcastSources.map(p => [p.id, p.title]));

        this.currentData = null;
        this.historyData = [];
        this.LS_KEY = 'podcast_subscription_history_v2'; // Use a new key for potentially new structure
        this.loadHistoryData(); // Load history on instantiation
    }

    async refreshData() {
        const fetchPromises = this.podcastSources.map(source =>
            fetch(source.url)
                .then(response => {
                    if (!response.ok) {
                        const error = new Error(`HTTP error! status: ${response.status} for ${source.title}`);
                        error.response = response; // Attach response for further inspection if needed
                        error.isHttpError = true; // Custom flag
                        throw error;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.pageProps && data.pageProps.episode &&
                        data.pageProps.episode.podcast && typeof data.pageProps.episode.podcast.subscriptionCount === 'number') {
                        return {
                            id: source.id,
                            title: source.title,
                            subscriptionCount: data.pageProps.episode.podcast.subscriptionCount
                        };
                    } else {
                        console.warn(`从 ${source.title} 的响应中找不到订阅数据或数据格式不正确。URL: ${source.url}`, data);
                        throw new Error(`数据格式不正确 for ${source.title}`);
                    }
                })
                .catch(error => {
                    console.error(`获取或处理 ${source.title} (${source.url}) 数据时出错:`, error);
                    let specificErrorType = "未知错误";
                    if (error.isHttpError) {
                        specificErrorType = `服务器响应错误 (状态: ${error.response.status})`;
                    } else if (error.message.includes("Failed to fetch") || error.name === 'TypeError') {
                        // TypeError often indicates CORS or network issue client-side
                        specificErrorType = "网络连接失败或CORS跨域限制";
                    } else if (error.message.includes("数据格式不正确")) {
                        specificErrorType = "响应数据格式不正确";
                    }
                    return { title: source.title, url: source.url, error: error.message, specificErrorType };
                })
        );

        const results = await Promise.all(fetchPromises);

        const fetchedPodcastsMap = new Map();
        const failedFetchesInfo = [];

        results.forEach(result => {
            if (result && !result.error) { // Successfully fetched and parsed
                fetchedPodcastsMap.set(result.id, result);
            } else if (result && result.error) { // Explicitly an error object from our catch
                failedFetchesInfo.push(result);
            }
            // If result is undefined or some other unexpected value, it's implicitly a failure too.
        });

        const newPodcastData = [];
        this.podcastSources.forEach(source => { // Iterate in defined order
            if (fetchedPodcastsMap.has(source.id)) {
                newPodcastData.push(fetchedPodcastsMap.get(source.id));
            }
        });

        if (newPodcastData.length > 0) {
            this.currentData = {
                timestamp: new Date().getTime(),
                podcasts: newPodcastData
            };
            this.saveToHistory();
            return { success: true, fetchedCount: newPodcastData.length, totalCount: this.podcastSources.length, errors: failedFetchesInfo };
        } else {
             // Even if some fetches "succeeded" but data was invalid, if newPodcastData is empty, it's a failure to get usable data.
            return { success: false, fetchedCount: 0, totalCount: this.podcastSources.length, errors: failedFetchesInfo };
        }
    }

    getCurrentData() {
        return this.currentData; // Can be null if no data ever fetched
    }

    getHistoryData() {
        return this.historyData;
    }

    getPreviousData() {
        // After a successful refreshData(), this.currentData holds the newest data,
        // and this.historyData has also been updated to include this newest data as its last element.
        // Therefore, the "previous" data record (the one just before the current one)
        // is at index historyData.length - 2.
        if (this.historyData.length >= 2) {
            return this.historyData[this.historyData.length - 2];
        }
        // If historyData.length is 0 or 1, there's no meaningful "previous" data
        // to compare against the current data for trend calculation.
        return null;
    }

    loadHistoryData() {
        try {
            const savedData = localStorage.getItem(this.LS_KEY);
            if (savedData) {
                this.historyData = JSON.parse(savedData);
                if (!Array.isArray(this.historyData)) {
                    this.historyData = [];
                }
            } else {
                this.historyData = [];
            }
        } catch (error) {
            console.error('加载历史数据时出错:', error);
            this.historyData = [];
        }
    }

    saveToHistory() {
        if (this.currentData && this.currentData.podcasts && this.currentData.podcasts.length > 0) {
            // Avoid duplicate entries if timestamp is the same (e.g. multiple quick refreshes with no actual data change)
            const lastHistoryEntry = this.historyData.length > 0 ? this.historyData[this.historyData.length -1] : null;
            if(lastHistoryEntry && lastHistoryEntry.timestamp === this.currentData.timestamp) {
                // Potentially update the last entry if content differs but timestamp is identical (unlikely with ms precision)
                // For simplicity, we'll just prevent exact duplicate pushes.
                // If we want to ensure latest version of data for a given timestamp, replace:
                // this.historyData[this.historyData.length -1] = this.currentData;
                return; 
            }

            this.historyData.push(this.currentData);
            if (this.historyData.length > 30) { // Keep last 30 records
                this.historyData = this.historyData.slice(-30);
            }
            try {
                localStorage.setItem(this.LS_KEY, JSON.stringify(this.historyData));
            } catch (error) {
                console.error('保存历史数据时出错:', error);
                if (error.name === 'QuotaExceededError') {
                     console.warn("localStorage is full. Cannot save history.");
                     // Consider a user notification if this is critical
                }
            }
        }
    }
}
