// 数据存储
let promptData = {};
let currentCategory = 'all';
let searchTerm = '';

// 工具函数：简易Markdown渲染器
function renderMarkdown(md) {
    // 处理代码块（优先处理）
    md = md.replace(/```([a-z]*)\n([\s\S]*?)\n```/gim, '<pre><code class="language-$1">$2</code></pre>');
    
    // 处理标题
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 处理粗体和斜体
    md = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理行内代码
    md = md.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // 处理列表
    md = md.replace(/^\- (.*$)/gm, '<li>$1</li>');
    md = md.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // 处理段落和换行
    md = md.replace(/\n\n/g, '</p><p>');
    md = md.replace(/\n/g, '<br>');
    md = '<p>' + md + '</p>';
    
    return md;
}

// 工具函数：复制到剪贴板
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // 显示复制成功提示
    const copyBtn = document.getElementById('copy-prompt');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i> 已复制';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
}

// 渲染分类Tab
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    tabsContainer.innerHTML = '';
    
    // 添加"全部"分类
    const allTab = document.createElement('button');
    allTab.className = `px-6 py-3 rounded-full font-poppins font-semibold transition-colors ${
        currentCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
    allTab.textContent = '全部';
    allTab.onclick = () => filterPrompts('all');
    tabsContainer.appendChild(allTab);
    
    // 添加其他分类
    promptData.categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = `px-6 py-3 rounded-full font-poppins font-semibold flex items-center transition-colors ${
            currentCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;
        tab.innerHTML = `<i class="fas ${category.icon} mr-2"></i> ${category.name}`;
        tab.onclick = () => filterPrompts(category.id);
        tabsContainer.appendChild(tab);
    });
}

// 渲染提示词卡片
function renderPromptCards() {
    const gridContainer = document.getElementById('prompts-grid');
    gridContainer.innerHTML = '';
    
    // 过滤提示词
    let filteredPrompts = currentCategory === 'all' 
        ? promptData.prompts 
        : promptData.prompts.filter(prompt => prompt.category === currentCategory);
    
    // 应用搜索过滤
    if (searchTerm) {
        filteredPrompts = filteredPrompts.filter(prompt => 
            prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // 对提示词进行排序
    filteredPrompts.sort((a, b) => {
        // 如果是"全部"分类，按分类中最新提示词的ID来排序分类
        if (currentCategory === 'all') {
            // 计算每个分类的最新提示词ID
            const categoryLatestIds = {};
            filteredPrompts.forEach(prompt => {
                if (!categoryLatestIds[prompt.category] || prompt.id > categoryLatestIds[prompt.category]) {
                    categoryLatestIds[prompt.category] = prompt.id;
                }
            });
            
            // 按分类中最新提示词的ID降序排序
            const latestIdDiff = categoryLatestIds[b.category] - categoryLatestIds[a.category];
            if (latestIdDiff !== 0) {
                return latestIdDiff;
            }
            
            // 同一分类内按ID降序排列
            if (a.category === b.category) {
                return b.id - a.id;
            }
        }
        
        // 具体分类下按ID降序排列（最新的在前）
        return b.id - a.id;
    });
    
    // 创建卡片
    filteredPrompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer';
        card.innerHTML = `
            <div class="p-6">
                <h3 class="text-2xl saturated-text mb-3">${prompt.title}</h3>
                <p class="text-gray-600 mb-4 font-poppins">${prompt.description}</p>
                <div class="flex flex-wrap gap-2">
                    ${getCategoryTag(prompt.category)}
                </div>
            </div>
        `;
        card.onclick = () => openPromptModal(prompt);
        gridContainer.appendChild(card);
    });
}

// 获取分类标签
function getCategoryTag(categoryId) {
    const category = promptData.categories.find(cat => cat.id === categoryId);
    if (category) {
        return `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-poppins text-sm flex items-center">
            <i class="fas ${category.icon} mr-1"></i> ${category.name}
        </span>`;
    }
    return '';
}

// 过滤提示词
function filterPrompts(categoryId) {
    currentCategory = categoryId;
    renderCategoryTabs();
    renderPromptCards();
}

// 搜索提示词
function searchPrompts(term) {
    searchTerm = term;
    renderPromptCards();
}

// 提取核心提示词内容
function extractCorePromptContent(markdown) {
    // 查找"提示词内容"代码块
    const codeBlockRegex = /## 提示词内容\s*```[\s\S]*?\n([\s\S]*?)\n```/;
    const match = markdown.match(codeBlockRegex);
    
    // 如果找到代码块，返回其中的内容
    if (match && match[1]) {
        return match[1].trim();
    }
    
    // 如果没有找到代码块，返回整个Markdown内容（适用于新的只包含核心内容的文件）
    return markdown.trim();
}

// 打开模态窗口
function openPromptModal(prompt) {
    document.getElementById('modal-title').textContent = prompt.title;
    document.getElementById('prompt-image').src = prompt.image;
    
    // 检查是使用文件还是直接内容
    if (prompt.file) {
        // 从Markdown文件加载内容
        fetch(prompt.file)
            .then(response => response.text())
            .then(markdown => {
                document.getElementById('prompt-content').innerHTML = renderMarkdown(markdown);
                // 设置复制按钮功能（只复制核心提示词内容）
                const coreContent = extractCorePromptContent(markdown);
                document.getElementById('copy-prompt').onclick = () => copyToClipboard(coreContent);
            })
            .catch(error => {
                console.error('加载Markdown文件失败:', error);
                document.getElementById('prompt-content').innerHTML = '<p>内容加载失败</p>';
            });
    } else {
        // 使用直接内容
        document.getElementById('prompt-content').innerHTML = renderMarkdown(prompt.content);
        // 设置复制按钮功能
        document.getElementById('copy-prompt').onclick = () => copyToClipboard(prompt.content);
    }
    
    // 显示模态窗口
    document.getElementById('prompt-modal').classList.remove('hidden');
    document.getElementById('prompt-modal').classList.add('flex');
}

// 关闭模态窗口
function closeModal() {
    document.getElementById('prompt-modal').classList.add('hidden');
    document.getElementById('prompt-modal').classList.remove('flex');
}

// 图片查看器实例
let viewer = null;

// 打开图片放大模态窗口
function openImageModal(src) {
    // 创建临时图片元素用于Viewer.js
    const tempImage = document.createElement('img');
    tempImage.src = src;
    
    // 初始化Viewer.js
    if (viewer) {
        viewer.destroy();
    }
    viewer = new Viewer(tempImage, {
        inline: false,
        movable: true,
        zoomable: true,
        scalable: true,
        navbar: true,
        title: false,
        toolbar: {
            zoomIn: 1,
            zoomOut: 1,
            oneToOne: 1,
            reset: 1,
            prev: 0,
            play: 0,
            next: 0,
            rotateLeft: 0,
            rotateRight: 0,
            flipHorizontal: 0,
            flipVertical: 0,
        },
        viewed() {
            // 图片加载完成后的回调
        }
    });
    viewer.show();
}

// 关闭图片放大模态窗口
function closeImageModal() {
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }
}

// 初始化应用
function initApp() {
    // 加载数据
    fetch('data/prompts.json')
        .then(response => response.json())
        .then(data => {
            promptData = data;
            renderCategoryTabs();
            renderPromptCards();
        })
        .catch(error => {
            console.error('数据加载失败:', error);
        });
    
    // 绑定模态窗口关闭事件
    document.getElementById('close-modal').onclick = closeModal;
    
    // 点击模态窗口外部关闭
    document.getElementById('prompt-modal').onclick = function(event) {
        if (event.target === this) {
            closeModal();
        }
    };
    
    // ESC键关闭模态窗口
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // 搜索输入框事件监听
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchPrompts(this.value);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 移动端优化：处理Tab滚动
document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.getElementById('category-tabs');
    
    // 在移动端设备上添加触摸滚动支持
    if ('ontouchstart' in window) {
        let startX;
        let scrollLeft;
        
        tabsContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - tabsContainer.offsetLeft;
            scrollLeft = tabsContainer.scrollLeft;
        });
        
        tabsContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const x = e.touches[0].pageX - tabsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            tabsContainer.scrollLeft = scrollLeft - walk;
        });
    }
});