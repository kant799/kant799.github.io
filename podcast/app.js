document.addEventListener('DOMContentLoaded', async () => {
    const dataManager = new DataManager(); // Instantiated once
    window.dataManager = dataManager; // 使dataManager全局可访问

    const refreshButton = document.getElementById('refreshButton');
    const refreshButtonText = document.getElementById('refreshButtonText');
    const refreshIcon = document.getElementById('refreshIcon');
    const refreshSpinner = document.getElementById('refreshSpinner');

    function setRefreshButtonLoading(isLoading) {
        if (isLoading) {
            refreshButton.disabled = true;
            refreshButtonText.textContent = '刷新中...';
            refreshIcon.classList.add('hidden');
            refreshSpinner.classList.remove('hidden');
            refreshButton.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            refreshButton.disabled = false;
            refreshButtonText.textContent = '刷新数据';
            refreshIcon.classList.remove('hidden');
            refreshSpinner.classList.add('hidden');
            refreshButton.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }

    async function fetchDataAndUpdateViews(isInitialLoad = false) {
        if (!isInitialLoad) { // For manual refresh
            setRefreshButtonLoading(true);
            showNotification('正在尝试刷新数据...', 0);
        } else { // For initial load
            showNotification('正在加载初始数据...', 0);
            // Skeleton loaders are visible via HTML default
        }

        const refreshResult = await dataManager.refreshData();

        if (refreshResult.success) {
            updateAllViews(dataManager); // Update views with potentially partial data
            if (refreshResult.fetchedCount === refreshResult.totalCount) {
                showNotification('数据刷新成功！', 3000);
            } else {
                let errorSummary = refreshResult.errors.map(e => `${e.title}: ${e.specificErrorType || '获取失败'}`).join(', ');
                showNotification(`部分数据刷新成功 (${refreshResult.fetchedCount}/${refreshResult.totalCount})。失败详情: ${errorSummary}`, 7000);
            }
        } else {
            // Complete failure or no data fetched
            let errorSummary = refreshResult.errors.map(e => `${e.title}: ${e.specificErrorType || '获取失败'}`).join(', ');
            if (refreshResult.errors.length === 0) { // Should not happen if success is false, but safeguard
                errorSummary = "未能获取任何数据，请检查网络连接。";
            }
            showNotification(`刷新失败：无法获取最新数据。详情: ${errorSummary}。请检查浏览器控制台获取更多技术信息。`, 10000);
            
            if (isInitialLoad) {
                // On initial load failure, views are already showing skeleton/loading.
                // dataManager.loadHistoryData() was already called in constructor.
                // We should update views to show history or "no data" message.
                updateAllViews(dataManager); // This will use history or show empty state
                if (dataManager.getHistoryData().length > 0) {
                    showNotification('实时数据获取失败，已加载本地历史记录。', 5000);
                } else {
                     showNotification('实时数据获取失败，且无本地历史记录。', 5000);
                }
            } else {
                // On manual refresh failure, current view (possibly old data or history) remains.
                // No need to call updateAllViews unless we want to clear it to an error state.
            }
        }

        if (!isInitialLoad) {
            setRefreshButtonLoading(false);
        }
    }

    // Initial data load
    await fetchDataAndUpdateViews(true);

    // Refresh button event listener
    refreshButton.addEventListener('click', () => fetchDataAndUpdateViews(false));
});

function updateAllViews(dataManager) {
    const currentData = dataManager.getCurrentData();
    
    if (currentData && currentData.podcasts && currentData.podcasts.length > 0) {
        updateLastUpdatedTime(currentData.timestamp);
        updatePodcastTable(currentData.podcasts, dataManager.getPreviousData(), dataManager.PODCAST_MAPPING);
        updateSubscriptionChart(currentData.podcasts, dataManager); // Pass dataManager for consistent title mapping
    } else {
        // No current data, display empty/error states
        document.getElementById('lastUpdated').textContent = '上次更新时间: 暂无实时数据';
        document.getElementById('podcastTable').innerHTML =
            `<tr><td colspan="3" class="py-4 px-4 text-center text-gray-500">未能加载播客数据。请检查网络连接或CORS设置，或稍后重试。</td></tr>`;
        updateSubscriptionChart([], dataManager); // Clear chart or show 'no data'
    }

    // History data is always updated, regardless of currentData success
    const historyData = dataManager.getHistoryData();
    updateHistoryChart(historyData, dataManager); // Pass dataManager for consistent title mapping
    updateHistoryTable(historyData, dataManager.PODCAST_MAPPING);
}


function updateLastUpdatedTime(timestamp) {
    const date = new Date(timestamp);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    document.getElementById('lastUpdated').textContent = `上次更新时间: ${formattedDate}`;
}

function updatePodcastTable(podcasts, previousData, podcastMapping) {
    let tableHTML = '';

    if (!podcasts || podcasts.length === 0) {
        tableHTML = `<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500">暂无当前播客数据</td></tr>`;
    } else {
        // 创建播客数组并按订阅数量降序排序
        const sortedPodcasts = [...podcasts].sort((a, b) => b.subscriptionCount - a.subscriptionCount);
        
        // 使用排序后的播客数组生成表格
        sortedPodcasts.forEach(podcast => {
            let trendText = '<span class="trend-neutral">0</span>'; // Default to neutral, showing 0 change
            let trendClass = 'trend-neutral';

            if (previousData && previousData.podcasts) {
                const prevPodcast = previousData.podcasts.find(p => p.id === podcast.id);
                if (prevPodcast) {
                    const diff = podcast.subscriptionCount - prevPodcast.subscriptionCount;
                    if (diff > 0) {
                        trendText = `<span class="trend-up">+${diff.toLocaleString('zh-CN')}</span>`;
                        trendClass = 'trend-up';
                    } else if (diff < 0) {
                        trendText = `<span class="trend-down">${diff.toLocaleString('zh-CN')}</span>`; // Negative sign is already included
                        trendClass = 'trend-down';
                    } else {
                        trendText = `<span class="trend-neutral">0</span>`;
                        trendClass = 'trend-neutral';
                    }
                } else {
                    trendText = '<span class="text-gray-400">-</span>'; // No previous data for this podcast
                    trendClass = 'text-gray-400';
                }
            } else {
                trendText = '<span class="text-gray-400">-</span>'; // No previous data at all
                trendClass = 'text-gray-400';
            }

            // 获取播客图片URL - 直接从 podcast 对象获取
            const imageUrl = podcast.picUrl;
            const imageHtml = imageUrl ? 
                `<img src="${imageUrl}" alt="${podcast.title}" class="podcast-image mr-2 inline-block align-middle rounded-full">` : 
                '';
                
            // 格式化最新更新日期
            let formattedDate = '<span class="text-gray-400">-</span>';
            if (podcast.latestEpisodePubDate) {
                const date = new Date(podcast.latestEpisodePubDate);
                if (!isNaN(date.getTime())) {
                    // 基本日期格式 MM-DD
                    const basicDate = `${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                    
                    // 计算与当前日期的差距（天数）
                    const now = new Date();
                    const diffTime = now.getTime() - date.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    // 根据天数差距显示不同的文本
                    let relativeText = '';
                    if (diffDays === 0) {
                        relativeText = '<span class="text-xs text-lime-400">（今天）</span>';
                    } else if (diffDays === 1) {
                        relativeText = '<span class="text-xs text-sky-400">（1天前）</span>';
                    } else if (diffDays < 30) {
                        relativeText = `<span class="text-xs text-gray-400">（${diffDays}天前）</span>`;
                    } else {
                        // 超过30天显示"已鸽X天"，并将天数设置为红色
                        relativeText = `<span class="text-xs text-rose-400">（已鸽${diffDays}天）</span>`;
                    }
                    
                    formattedDate = `${basicDate}${relativeText}`;
                }
            }

            // 创建播客名称的超链接，并添加图标
            const podcastUrl = `https://www.xiaoyuzhoufm.com/podcast/${podcast.id}`;
            const podcastLinkHtml = `<a href="${podcastUrl}" target="_blank" class="text-gray-800 hover:text-highlight transition-colors group inline-flex items-center">
                                       ${podcast.title}
                                       <i class="fa-solid fa-arrow-up-right-from-square fa-xs ml-1.5 text-gray-400 group-hover:text-highlight transition-colors duration-150"></i>
                                   </a>`;

            tableHTML += `
                <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                    <td class="py-3 px-4 text-sm">${imageHtml}<span class="align-middle">${podcastLinkHtml}</span></td>
                    <td class="py-3 px-4 text-center text-sm font-medium text-gray-800">${podcast.subscriptionCount.toLocaleString('zh-CN')}</td>
                    <td class="py-3 px-4 text-center text-sm font-medium ${trendClass}">${trendText}</td>
                    <td class="py-3 px-4 text-center text-sm font-medium text-gray-800">${formattedDate}</td>
                    <td class="py-3 px-4 text-center text-sm font-medium text-gray-800">${podcast.episodeCount || '<span class="text-gray-400">-</span>'}</td>
                </tr>
            `;
        });
    }
    document.getElementById('podcastTable').innerHTML = tableHTML;
}

function updateHistoryTable(historyData, podcastMapping) {
    const historyTableBody = document.getElementById('historyTable');
    if (!historyData || historyData.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="10" class="py-4 px-4 text-center text-gray-500">暂无历史数据</td></tr>`;
        return;
    }

    const recentHistory = historyData.slice(-9).reverse(); // 显示最近9条记录，最新的在前
    const podcastTitles = Object.keys(podcastMapping); // 获取所有播客标题
    
    // 创建一个数组，包含播客标题和最新的订阅数
    const podcastsWithLatestData = [];
    podcastTitles.forEach(title => {
        const id = podcastMapping[title];
        // 获取最新的数据记录（如果存在）
        const latestRecord = recentHistory[0]; // This is the most recent historical snapshot
        if (latestRecord && latestRecord.podcasts) {
            const podcast = latestRecord.podcasts.find(p => p.id === id);
            podcastsWithLatestData.push({
                title: title,
                id: id,
                latestCount: podcast ? podcast.subscriptionCount : 0
            });
        } else {
            podcastsWithLatestData.push({
                title: title,
                id: id,
                latestCount: 0
            });
        }
    });
    
    // 按最新订阅数降序排序
    podcastsWithLatestData.sort((a, b) => b.latestCount - a.latestCount);
    
    let tableHTML = '';
    const currentDataManagerData = window.dataManager.getCurrentData(); // Get current data once

    // 为每个播客创建一行（已排序）
    podcastsWithLatestData.forEach(podcastEntry => { // Renamed from podcastData to avoid confusion
        const title = podcastEntry.title;
        const id = podcastEntry.id;
        
        // 获取播客图片URL - 从当前最新数据中查找
        let imageUrl = null;
        if (currentDataManagerData && currentDataManagerData.podcasts) {
            const currentPodcastInfo = currentDataManagerData.podcasts.find(p => p.id === id);
            if (currentPodcastInfo && currentPodcastInfo.picUrl) {
                imageUrl = currentPodcastInfo.picUrl;
            }
        }
        const imageHtml = imageUrl ? 
            `<img src="${imageUrl}" alt="${title}" class="podcast-image mr-2 inline-block align-middle rounded-full">` : 
            '';
            
        tableHTML += `<tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <td class="py-3 px-4 text-sm text-gray-800">${imageHtml}<span class="align-middle">${title}</span></td>`;
        
        // 为每个历史记录（列）填充数据
        for (let i = 0; i < 9; i++) {
            let cellData = '<span class="text-gray-400">-</span>';
            if (i < recentHistory.length) {
                const record = recentHistory[i]; // recentHistory is reversed, so 0 is latest
                if (record && record.podcasts) {
                    const podcastInRecord = record.podcasts.find(p => p.id === id);
                    if (podcastInRecord) {
                        cellData = podcastInRecord.subscriptionCount.toLocaleString('zh-CN');
                    }
                }
            }
            tableHTML += `<td class="py-3 px-4 text-center text-sm text-gray-700">${cellData}</td>`;
        }
        tableHTML += `</tr>`;
    });

    historyTableBody.innerHTML = tableHTML;
}

let notificationHideTimer = null;
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    if (notificationHideTimer) {
        clearTimeout(notificationHideTimer);
    }

    notificationText.textContent = message;
    notification.classList.remove('hidden', 'translate-y-20', 'opacity-0');
    notification.classList.add('translate-y-0', 'opacity-100');

    if (duration > 0) {
        notificationHideTimer = setTimeout(() => {
            notification.classList.remove('translate-y-0', 'opacity-100');
            notification.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => notification.classList.add('hidden'), 300); // Match CSS transition
        }, duration);
    }
    // If duration is 0, notification stays until next call or manual hide
}
