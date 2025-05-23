// 定义全局颜色映射，确保所有图表使用相同的颜色
const PODCAST_COLORS = {
    backgroundColor: [
        'rgba(54, 162, 235, 0.7)', // 蓝色
        'rgba(255, 99, 132, 0.7)',  // 红色
        'rgba(255, 206, 86, 0.7)',  // 黄色
        'rgba(75, 192, 192, 0.7)',   // 青色
        'rgba(153, 102, 255, 0.7)', // 紫色
        'rgba(255, 159, 64, 0.7)',   // 橙色
        'rgba(201, 203, 207, 0.7)',  // 灰色
        'rgba(54, 235, 162, 0.7)'    // 绿色
    ],
    borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(54, 235, 162, 1)'
    ],
    // 为历史图表定义对应的线条颜色
    lineColors: [
        {bg: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)'},
        {bg: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)'},
        {bg: 'rgba(255, 206, 86, 0.2)', border: 'rgb(255, 206, 86)'},
        {bg: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)'},
        {bg: 'rgba(153, 102, 255, 0.2)', border: 'rgb(153, 102, 255)'},
        {bg: 'rgba(255, 159, 64, 0.2)', border: 'rgb(255, 159, 64)'},
        {bg: 'rgba(201, 203, 207, 0.2)', border: 'rgb(201, 203, 207)'},
        {bg: 'rgba(54, 235, 162, 0.2)', border: 'rgb(54, 235, 162)'}
    ]
};

// 为特定播客定义特殊颜色
const SPECIAL_PODCAST_COLORS = {
    "不开玩笑": {
        backgroundColor: 'rgba(255, 225, 3, 0.7)', // 用于柱状图背景
        borderColor: 'rgba(255, 225, 3, 1)',     // 用于柱状图边框
        lineColor: {                             // 用于折线图
            bg: 'rgba(255, 225, 3, 0.2)',        // 折线图填充背景
            border: 'rgb(255, 225, 3)'           // 折线图线条颜色
        }
    },
    "文化有限": {
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // 用于柱状图背景
        borderColor: 'rgb(0, 0, 0)',     // 用于柱状图边框
        lineColor: {                             // 用于折线图
            bg: 'rgba(0, 0, 0, 0.2)',        // 折线图填充背景
            border: 'rgb(0, 0, 0)'           // 折线图线条颜色
        }
    }
    // 如果需要，可以在这里为其他播客添加特殊颜色
};

// 获取播客的颜色索引
function getPodcastColorIndex(podcastTitle, dataManager) {
    // 获取所有播客标题的有序列表
    const podcastTitles = Object.keys(dataManager.PODCAST_MAPPING);
    // 返回播客在列表中的索引（用于颜色映射）
    return podcastTitles.indexOf(podcastTitle);
}

// 更新当前订阅对比图表
function updateSubscriptionChart(podcasts, dataManager) {
    const ctx = document.getElementById('subscriptionChart').getContext('2d');
    const loader = document.getElementById('subscriptionChartLoader');

    if (window.subscriptionChart instanceof Chart) {
        window.subscriptionChart.destroy();
    }

    if (!podcasts || podcasts.length === 0) {
        loader.textContent = '无数据显示';
        loader.style.display = 'flex';
        // Clear canvas explicitly if needed, though destroying chart usually suffices
        ctx.clearRect(0, 0, document.getElementById('subscriptionChart').width, document.getElementById('subscriptionChart').height);
        return;
    }
    
    loader.style.display = 'none';

    // Ensure podcasts are sorted by subscription count for the chart
    const sortedPodcasts = [...podcasts].sort((a, b) => b.subscriptionCount - a.subscriptionCount);

    const labels = sortedPodcasts.map(podcast => podcast.title);
    const data = sortedPodcasts.map(podcast => podcast.subscriptionCount);
    
    // 为每个播客分配一致的颜色
    const backgroundColors = sortedPodcasts.map(podcast => {
        if (SPECIAL_PODCAST_COLORS[podcast.title]) {
            return SPECIAL_PODCAST_COLORS[podcast.title].backgroundColor;
        }
        const colorIndex = getPodcastColorIndex(podcast.title, dataManager) % PODCAST_COLORS.backgroundColor.length;
        return PODCAST_COLORS.backgroundColor[colorIndex];
    });
    
    const borderColors = sortedPodcasts.map(podcast => {
        if (SPECIAL_PODCAST_COLORS[podcast.title]) {
            return SPECIAL_PODCAST_COLORS[podcast.title].borderColor;
        }
        const colorIndex = getPodcastColorIndex(podcast.title, dataManager) % PODCAST_COLORS.borderColor.length;
        return PODCAST_COLORS.borderColor[colorIndex];
    });

    window.subscriptionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '订阅数',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // For horizontal bar chart, better for long labels
            scales: {
                x: { // Switched from y for horizontal bar
                    beginAtZero: true,
                    ticks: {
                        callback: value => value.toLocaleString('zh-CN')
                    }
                }
            },
            plugins: {
                legend: { display: false }, // Horizontal bar usually doesn't need legend for single dataset
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label || ''}: ${context.parsed.x.toLocaleString('zh-CN')}`
                    }
                }
            }
        }
    });
}

// 更新历史数据图表
function updateHistoryChart(historyData, dataManager) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const loader = document.getElementById('historyChartLoader');

    if (window.historyChart instanceof Chart) {
        window.historyChart.destroy();
    }
    
    if (!historyData || historyData.length === 0) {
        loader.textContent = '无历史数据显示';
        loader.style.display = 'flex';
        ctx.clearRect(0, 0, document.getElementById('historyChart').width, document.getElementById('historyChart').height);
        return;
    }

    loader.style.display = 'none';

    const recentHistory = historyData.slice(-10); // Max 10 latest records
    const labels = recentHistory.map(record => {
        const date = new Date(record.timestamp);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    const datasets = [];
    const podcastTitlesInOrder = Object.keys(dataManager.PODCAST_MAPPING); // Titles in defined order
    const podcastIdMap = dataManager.PODCAST_MAPPING; // Title -> ID

    podcastTitlesInOrder.forEach(title => {
        const id = podcastIdMap[title];
        const podcastDataPoints = recentHistory.map(record => {
            const podcastEntry = record.podcasts.find(p => p.id === id);
            return podcastEntry ? podcastEntry.subscriptionCount : null; // Use null for missing data points in line chart
        });

        // Only add dataset if there is some data for this podcast in the history slice
        if (podcastDataPoints.some(value => value !== null)) {
            let color;
            if (SPECIAL_PODCAST_COLORS[title]) {
                color = SPECIAL_PODCAST_COLORS[title].lineColor;
            } else {
                // 使用与订阅对比图表相同的颜色索引
                const colorIndex = getPodcastColorIndex(title, dataManager) % PODCAST_COLORS.lineColors.length;
                color = PODCAST_COLORS.lineColors[colorIndex];
            }
            
            datasets.push({
                label: title,
                data: podcastDataPoints,
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: false,
                tension: 0.1,
                borderWidth: 2
            });
        }
    });
    
    if (datasets.length === 0) { // No valid datasets could be formed
        loader.textContent = '无有效历史数据显示';
        loader.style.display = 'flex';
        return;
    }

    window.historyChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false, // Subscription counts usually don't start at 0 in history
                    ticks: { callback: value => value.toLocaleString('zh-CN') }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index', // Show tooltip for all datasets at that index
                    intersect: false,
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.parsed.y.toLocaleString('zh-CN')}`
                    }
                }
            },
            interaction: { // For better hover interactions
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}
