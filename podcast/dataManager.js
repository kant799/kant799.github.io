// 数据管理类
// 导入 podcastData.js 中的函数
class DataManager {
    constructor() {
        this.podcastSources = [
            { title: "不开玩笑", id: "61791d921989541784257779", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/61791d921989541784257779.json?id=61791d921989541784257779" },
            { title: "无聊斋", id: "5e280fac418a84a0461fb129", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/5e280fac418a84a0461fb129.json?id=5e280fac418a84a0461fb129" },
            { title: "基本无害", id: "5eae66d1418a84a046472b4d", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/5eae66d1418a84a046472b4d.json?id=5eae66d1418a84a046472b4d" },
            { title: "三个火呛手", id: "642ea4a1f54371d8b2d75168", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/642ea4a1f54371d8b2d75168.json?id=642ea4a1f54371d8b2d75168" },
            { title: "正经叭叭", id: "60e43cecc4e7c8188c2f92a4", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/60e43cecc4e7c8188c2f92a4.json?id=60e43cecc4e7c8188c2f92a4" },
            { title: "谐星聊天会", id: "5e280fa7418a84a0461f912b", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/5e280fa7418a84a0461f912b.json?id=5e280fa7418a84a0461f912b" },  
            { title: "文化有限", id: "5e4515bd418a84a046e2b11a", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/5e4515bd418a84a046e2b11a.json?id=5e4515bd418a84a046e2b11a" },
            { title: "屠龙之术", id: "6507bc165c88d2412626b401", url: "https://www.xiaoyuzhoufm.com/_next/data/5Pvt_oGntgdyBD_XgwBaB/podcast/6507bc165c88d2412626b401.json?id=6507bc165c88d2412626b401" }
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
                        // Create a custom error object to pass along HTTP status
                        const error = new Error(`HTTP error! status: ${response.status}`);
                        error.isHttpError = true;
                        error.response = response; // Attach the response for more details if needed
                        throw error;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.pageProps && data.pageProps.podcast) {
                        const podcastInfo = data.pageProps.podcast;
                        if (podcastInfo.subscriptionCount !== undefined && podcastInfo.pid) {
                            const subscriptionCount = podcastInfo.subscriptionCount;
                            // Ensure title consistency using the mapping first
                            const title = this.PODCAST_ID_TO_TITLE_MAPPING[source.id] || podcastInfo.title || "未知播客";
                            
                            let picUrl = null;
                            if (podcastInfo.image && podcastInfo.image.picUrl) {
                                picUrl = podcastInfo.image.picUrl;
                            }

                            // 获取集数和最新更新日期
                            const episodeCount = podcastInfo.episodeCount || 0;
                            const latestEpisodePubDate = podcastInfo.latestEpisodePubDate || null;

                            return {
                                id: source.id, // Use the ID from podcastSources for consistency
                                title: title,
                                subscriptionCount: subscriptionCount,
                                picUrl: picUrl, // Add the fetched picUrl
                                episodeCount: episodeCount, // 添加集数
                                latestEpisodePubDate: latestEpisodePubDate // 添加最新更新日期
                            };
                        } else {
                            console.warn(`从 ${source.title} 的响应中找不到订阅数据或pid。URL: ${source.url}`, data);
                            throw new Error(`数据格式不正确 (缺少 subscriptionCount 或 pid) for ${source.title}`);
                        }
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
    
    // getPodcastImageUrl(podcastId) { // REMOVE THIS METHOD
    //     try {
    //         // 确保 getOriginalJsonById 函数在全局作用域中可用
    //         if (typeof getOriginalJsonById !== 'function') {
    //             console.error('getOriginalJsonById 函数未定义，请确保 podcastData.js 已正确加载');
    //             return null;
    //         }
            
    //         // 从podcastData.js获取原始JSON数据
    //         const jsonData = getOriginalJsonById(podcastId);
    //         if (jsonData) {
    //             const data = JSON.parse(jsonData);
    //             if (data && data.pageProps && data.pageProps.podcast && 
    //                 data.pageProps.podcast.image && data.pageProps.podcast.image.picUrl) {
    //                 return data.pageProps.podcast.image.picUrl;
    //             }
    //         }
    //         return null; // 如果找不到图片URL，返回null
    //     } catch (error) {
    //         console.error(`获取播客图片URL时出错:`, error);
    //         return null;
    //     }
    // }
}
