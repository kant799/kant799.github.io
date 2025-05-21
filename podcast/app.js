document.addEventListener('DOMContentLoaded', async () => {
    const dataManager = new DataManager(); // Instantiated once

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
        document.getElementById('lastUpdated').textContent = '最后更新时间: 暂无实时数据';
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
    document.getElementById('lastUpdated').textContent = `最后更新时间: ${formattedDate}`;
}

function updatePodcastTable(podcasts, previousData, podcastMapping) {
    let tableHTML = '';

    if (!podcasts || podcasts.length === 0) {
        tableHTML = `<tr><td colspan="3" class="py-4 px-4 text-center text-gray-500">暂无当前播客数据</td></tr>`;
    } else {
        // 创建播客数组并按订阅数量降序排序
        const sortedPodcasts = [...podcasts].sort((a, b) => b.subscriptionCount - a.subscriptionCount);
        
        // 使用排序后的播客数组生成表格
        sortedPodcasts.forEach(podcast => {
            let trendIcon = '<span class="trend-neutral">→</span>'; // Default to neutral
            let trendClass = 'trend-neutral';

            if (previousData && previousData.podcasts) {
                const prevPodcast = previousData.podcasts.find(p => p.id === podcast.id);
                if (prevPodcast) {
                    if (podcast.subscriptionCount > prevPodcast.subscriptionCount) {
                        trendIcon = '<span class="trend-up">↑</span>';
                        trendClass = 'trend-up';
                    } else if (podcast.subscriptionCount < prevPodcast.subscriptionCount) {
                        trendIcon = '<span class="trend-down">↓</span>';
                        trendClass = 'trend-down';
                    }
                }
            }

            tableHTML += `
                <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                    <td class="py-3 px-4 text-sm text-gray-800">${podcast.title}</td>
                    <td class="py-3 px-4 text-right text-sm font-medium text-gray-800">${podcast.subscriptionCount.toLocaleString('zh-CN')}</td>
                    <td class="py-3 px-4 text-right text-sm font-medium ${trendClass}">${trendIcon}</td>
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
        const latestRecord = recentHistory[0];
        if (latestRecord) {
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

    // 为每个播客创建一行（已排序）
    podcastsWithLatestData.forEach(podcastData => {
        const title = podcastData.title;
        const id = podcastData.id;
        tableHTML += `<tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <td class="py-3 px-4 text-sm text-gray-800">${title}</td>`;
        
        // 添加每个时间点的数据
        recentHistory.forEach(record => {
            const podcast = record.podcasts.find(p => p.id === id);
            if (podcast) {
                tableHTML += `<td class="py-3 px-4 text-sm text-gray-800 text-right">${podcast.subscriptionCount.toLocaleString('zh-CN')}</td>`;
            } else {
                tableHTML += `<td class="py-3 px-4 text-sm text-gray-400 text-right">-</td>`;
            }
        });

        // 补充空列，确保每行都有10列
        const remainingCols = 9 - recentHistory.length;
        for (let i = 0; i < remainingCols; i++) {
            tableHTML += `<td class="py-3 px-4 text-sm text-gray-400 text-right">-</td>`;
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
