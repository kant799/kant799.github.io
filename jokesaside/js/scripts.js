document.addEventListener('DOMContentLoaded', function() {
    
    // --- 全局变量 ---
    let isFirstScreenAnimated = false; // 跟踪第一屏动画是否已执行
    
    // --- 背景装饰图标逻辑 ---
    const bgIconsContainer = document.getElementById('bg-icons');
    const iconClasses = [
        'fa-solid fa-podcast',
        'fa-solid fa-microphone',
        'fa-solid fa-music',
        'fa-solid fa-headphones',
        'fa-solid fa-waveform',
        'fa-solid fa-radio',
        'fa-solid fa-volume-high',
        'fa-solid fa-circle-play',
        'fa-solid fa-circle-pause',
        'fa-solid fa-forward-step'
    ];
    
    // 创建50个随机位置的图标
    for (let i = 0; i < 50; i++) {
        const iconEl = document.createElement('i');
        const randomIconClass = iconClasses[Math.floor(Math.random() * iconClasses.length)];
        const randomSize = Math.floor(Math.random() * 24) + 16; // 16px to 40px
        const randomTop = Math.random() * 100; // 0% to 100%
        const randomLeft = Math.random() * 100; // 0% to 100%
        const randomOpacity = (Math.random() * 0.5) + 0.2; // 0.2 to 0.6
        const randomRotation = Math.random() * 360; // 0deg to 360deg
        
        iconEl.className = `${randomIconClass} text-[#FFE200] absolute`;
        iconEl.style.top = `${randomTop}%`;
        iconEl.style.left = `${randomLeft}%`;
        iconEl.style.fontSize = `${randomSize}px`;
        iconEl.style.opacity = randomOpacity;
        iconEl.style.transform = `rotate(${randomRotation}deg)`;
        
        bgIconsContainer.appendChild(iconEl);
    }
    
    // --- 0. 序幕加载动画逻辑 ---
    const preloader = document.getElementById('preloader');
    const preloaderLogo = document.getElementById('preloader-logo');
    const heroLogo = document.getElementById('hero-logo');
    const waveformFill = document.getElementById('waveform-fill');
    const progressCounter = document.getElementById('progress-counter');

    const tlPreloader = gsap.timeline({
        onComplete: () => {
            // 加载完成后初始化 fullPage.js
            initFullPage();
            // 隐藏 preloader
            gsap.to(preloader, { opacity: 0, duration: 0.8, onComplete: () => preloader.style.display = 'none' });
        }
    });

    tlPreloader
        .to(progressCounter, {
            textContent: 100,
            duration: 3,
            ease: "power1.inOut",
            roundProps: "textContent",
            onUpdate: function() {
                progressCounter.textContent = Math.round(this.progress() * 100) + '%';
            }
        })
        .to(waveformFill, { attr: { width: 300 }, duration: 3, ease: "power1.inOut" }, 0)
        .to([waveformFill, progressCounter], { opacity: 0, duration: 0.5 });

    // Logo 过渡动画
    // 等待DOM渲染完成以获取heroLogo的最终位置
    window.addEventListener('load', () => {
         const heroLogoRect = heroLogo.getBoundingClientRect();
         const preloaderLogoRect = preloaderLogo.getBoundingClientRect();
         
         tlPreloader.to(preloaderLogo, {
             x: heroLogoRect.left - preloaderLogoRect.left,
             y: heroLogoRect.top - preloaderLogoRect.top,
             width: heroLogoRect.width,
             height: heroLogoRect.height,
             duration: 1,
             ease: "power2.inOut"
         }, "-=0.8");
    });


    // --- 数据区 ---
    // 数据从独立的文件中加载到全局作用域


    // --- fullPage.js 初始化函数 ---
    function initFullPage() {
        new fullpage('#fullpage', {
            licenseKey: 'gplv3', // 使用GPLv3开源许可
            anchors: ['about', 'hosts', 'episodes', 'merch', 'platforms'],
            menu: '#menu',
            scrollingSpeed: 1000,
            fadingEffect: true, // 启用淡入淡出效果
            fadingEffectKey: 'YWx2YXJvdHJpZ28uY29tX01mU2MyVFhWZG1iR2x6WVhScFoyZDJhV1Iw', // fadingEffect插件许可证密钥
            css3: true, // 启用CSS3转换
            navigation: false,
            responsiveWidth: 768,
            autoScrolling: true, // 启用自动滚动
            fitToSection: true, // 滚动后适应最近的section
            scrollBar: false, // 禁用滚动条

            // 页面加载后触发的回调
            afterLoad: function(origin, destination, direction) {
                const activeSection = destination.item;
                
                // Header导航激活状态
                document.querySelectorAll('#menu a').forEach(el => el.classList.remove('text-[#FFE200]'));
                const activeLink = document.querySelector(`#menu a[href="#${destination.anchor}"]`);
                if (activeLink) activeLink.classList.add('text-[#FFE200]');

                // Section 1 的异步文字动画
                if (destination.anchor === 'about') {
                    // 第一屏动画只在首次加载时执行
                    if (isFirstScreenAnimated) {
                        // 如果是第一屏且动画已执行过，直接显示元素
                        gsap.set(activeSection.querySelectorAll('.anim-text'), { opacity: 1, y: -20 });
                        gsap.set('#hero-image-mask', { opacity: 1 });
                        gsap.set('#hero-logo', { opacity: 1 });
                    } else {
                        // 执行动画
                        gsap.to(activeSection.querySelectorAll('.anim-text'), {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            stagger: 0.2,
                            ease: 'power2.out',
                            delay: 0.2 // 等待页面切换动画完成
                        });
                        
                        gsap.to('#hero-image-mask', {
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                            delay: 0.2
                        });
                        gsap.to('#hero-logo', { opacity: 1, duration: 0.5, delay: 0.5 });
                        
                        // 标记第一屏动画已执行
                        isFirstScreenAnimated = true;
                    }
                }

                // Section 5 (Platforms) 的异步文字动画 (只执行一次)
                if (destination.anchor === 'platforms') {
                    const animTextElements = activeSection.querySelectorAll('.anim-text');
                    // 检查第一个元素是否已经有动画完成的标记样式 (opacity 为 1)
                    if (animTextElements.length > 0 && window.getComputedStyle(animTextElements[0]).opacity !== '1') {
                        // 执行动画
                        gsap.to(animTextElements, {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            stagger: 0.2,
                            ease: 'power2.out',
                            delay: 0 // 等待页面切换动画完成
                        });
                    } else {
                        // 如果动画已执行过，直接显示元素
                        gsap.set(animTextElements, { opacity: 1, y: 0 });
                    }
                }
            },
            onLeave: function(origin, destination, direction) {
                 // 没有需要在离开时重置的动画状态
            }
        });
    }
    
    // --- 各板块JS逻辑 ---

    // 4.1 Section 1: 视差效果 (已禁用)
    // const heroImage = document.getElementById('hero-image');
    // document.getElementById('section1').addEventListener('mousemove', (e) => {
    //     const { clientX, clientY, currentTarget } = e;
    //     const { clientWidth, clientHeight } = currentTarget;
    //     const x = (clientX / clientWidth - 0.5) * 30; // 移动幅度
    //     const y = (clientY / clientHeight - 0.5) * 30;
    //     gsap.to(heroImage, {
    //         x: -x,
    //         y: -y,
    //         duration: 1,
    //         ease: 'power2.out'
    //     });
    // });

    // 4.2 Section 2: 主播介绍
    const hostsContainer = document.getElementById('hosts-container');
    const hostModal = document.getElementById('host-modal');
    const hostCard = document.getElementById('host-card');
    const closeModalBtn = document.getElementById('close-modal-btn');

    hostsData.forEach(host => {
        const hostEl = document.createElement('div');
        hostEl.className = 'text-center cursor-pointer group';
        hostEl.innerHTML = `
            <img src="${host.avatar}" alt="${host.name}" class="w-16 h-16 md:w-32 md:h-32 rounded-full object-cover mx-auto transition-transform duration-300 group-hover:scale-110">
            <p class="mt-4 text-lg font-semibold">${host.name}</p>
        `;
        hostEl.addEventListener('click', () => openHostModal(host));
        hostsContainer.appendChild(hostEl);
    });

    // 设备检测函数
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    function openHostModal(host) {
        // 根据设备类型选择合适的图片
        const imageUrl = isMobile() && host.mobileImage ? host.mobileImage : host.image;
        document.getElementById('modal-host-img').src = imageUrl;
        document.getElementById('modal-host-name').textContent = host.name;
        const tagsContainer = document.getElementById('modal-tags-container');
        tagsContainer.innerHTML = '';
        
        host.tags.forEach(tag => {
            const tagEl = document.createElement('div');
            const randomBorder = `border-style-${Math.ceil(Math.random() * 4)}`;
            const randomTop = Math.random() * 70 + 5; // 5% to 75%
            const randomLeft = Math.random() * 60 + 5; // 5% to 65%
            const randomRotate = Math.random() * 30 - 15; // -15deg to 15deg
            
            tagEl.className = `absolute p-2 text-2xl text-gray-300 ${randomBorder}`;
            tagEl.style.top = `${randomTop}%`;
            tagEl.style.left = `${randomLeft}%`;
            tagEl.style.transform = `rotate(${randomRotate}deg)`;
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });

        // 显示modal
        hostModal.classList.remove('opacity-0', 'pointer-events-none');
        hostModal.classList.add('opacity-100', 'pointer-events-auto');
        
        // 使用GSAP动画显示卡片
        gsap.fromTo(hostCard, 
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
    }

    function closeHostModal() {
        // 使用GSAP动画隐藏卡片
        gsap.to(hostCard, { 
            scale: 0.95, 
            opacity: 0,
            duration: 0.3, 
            ease: 'power3.in', 
            onComplete: () => {
                // 隐藏modal
                hostModal.classList.add('opacity-0', 'pointer-events-none');
                hostModal.classList.remove('opacity-100', 'pointer-events-auto');
            }
        });
    }
    closeModalBtn.addEventListener('click', closeHostModal);
    hostModal.addEventListener('click', (e) => {
        if (e.target === hostModal) closeHostModal();
    });
    
    // 监听窗口大小变化，更新当前显示的主播图片
    let hostResizeTimeout;
    window.addEventListener('resize', () => {
        // 使用防抖动技术，避免频繁更新
        clearTimeout(hostResizeTimeout);
        hostResizeTimeout = setTimeout(() => {
            // 检查主播modal是否打开，如果是则更新图片
            if (hostModal && !hostModal.classList.contains('opacity-0')) {
                // 获取当前显示的主播信息
                const currentHostName = document.getElementById('modal-host-name').textContent;
                const currentHost = hostsData.find(host => host.name === currentHostName);
                if (currentHost) {
                    // 根据设备类型选择合适的图片
                    const imageUrl = isMobile() && currentHost.mobileImage ? currentHost.mobileImage : currentHost.image;
                    document.getElementById('modal-host-img').src = imageUrl;
                }
            }
        }, 250);
    });

    // 4.3 Section 3: 播客分集
    const episodeListEl = document.getElementById('episode-list');
    const featuredImg = document.getElementById('featured-episode-img');
    const featuredLink = document.getElementById('featured-episode-link');
    const paginationEl = document.getElementById('episode-pagination');
    let currentPage = 1;
    const itemsPerPage = 5;

    function updateFeatured(episode) {
        gsap.to(featuredImg, { opacity: 0, duration: 0.3, onComplete: () => {
            featuredImg.src = episode.cover;
            gsap.to(featuredImg, { opacity: 1, duration: 0.3 });
        }});
        featuredLink.href = episode.link;

        document.querySelectorAll('#episode-list li').forEach(li => li.classList.remove('border-l-[#FFE200]'));
        document.querySelector(`#episode-list li[data-id='${episode.id}']`).classList.add('border-l-[#FFE200]');
    }

    function renderEpisodes(page) {
        episodeListEl.innerHTML = '';
        // 创建一个逆序的数据副本用于渲染
        const reversedData = [...episodesData].reverse();
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = reversedData.slice(start, end);
        
        paginatedItems.forEach(ep => {
            const li = document.createElement('li');
            li.className = 'pl-4 cursor-pointer border-l-2 border-transparent hover:border-l-[#FFE200] transition-colors';
            li.dataset.id = ep.id;
            li.innerHTML = `
                <h4 class="font-bold text-lg text-white">${ep.title}</h4>
                <div class="flex justify-between">
                    <a class="text-sm text-gray-500 mt-1">${ep.hosts.join(', ')}</a>
                    <a class="text-xs text-[#ffe62a] mt-1">${ep.date}</a>
                </div>
            `;
            li.addEventListener('click', () => updateFeatured(ep));
            episodeListEl.appendChild(li);
        });
        updateFeatured(paginatedItems[0]);
    }
    
    function setupPagination() {
        // 使用逆序数据计算分页
        const reversedData = [...episodesData].reverse();
        const pageCount = Math.ceil(reversedData.length / itemsPerPage);
        paginationEl.innerHTML = `
            <button id="prev-page" class="px-3 py-1 rounded disabled:opacity-50"><i class="fas fa-chevron-left text-[#FFE200]"></i></button>
            <span id="page-indicator">${currentPage} of ${pageCount}</span>
            <button id="next-page" class="px-3 py-1 rounded disabled:opacity-50"><i class="fas fa-chevron-right text-[#FFE200]"></i></button>
        `;
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderEpisodes(currentPage);
                updatePaginationControls();
            }
        });
         nextBtn.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderEpisodes(currentPage);
                updatePaginationControls();
            }
        });
        updatePaginationControls();
    }

    function updatePaginationControls() {
        // 使用逆序数据计算分页
        const reversedData = [...episodesData].reverse();
        const pageCount = Math.ceil(reversedData.length / itemsPerPage);
        document.getElementById('page-indicator').textContent = `${currentPage} of ${pageCount}`;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === pageCount;
    }

    renderEpisodes(currentPage);
    setupPagination();

    // 4.4 Section 4: 周边产品
    const merchHotspotsContainer = document.getElementById('merch-hotspots');
    const merchModal = document.getElementById('merch-modal');
    const merchCard = document.getElementById('merch-card');
    const closeMerchModalBtn = document.getElementById('close-merch-modal-btn');
    
    // 设备检测函数
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // 更新热点位置的函数
    function updateMerchHotspots() {
        // 清空现有的热点
        merchHotspotsContainer.innerHTML = '';
        
        // 根据设备类型选择位置数据
        merchData.forEach(item => {
            const position = isMobile() && item.mobilePosition ? item.mobilePosition : item.position;
            
            const hotspot = document.createElement('div');
            hotspot.className = 'absolute w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-[#FFE200] cursor-pointer flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,226,4,0.5)] hover:shadow-[inset_0_0_8px_rgba(255,226,4,0.5)]';
            hotspot.style.top = position.top;
            hotspot.style.left = position.left;
            hotspot.innerHTML = `·`;
            
            hotspot.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('modal-merch-img').src = item.image;
                document.getElementById('modal-merch-name').textContent = item.name;
                document.getElementById('modal-merch-qr').src = item.qr;
                openMerchModal();
            });
            
            merchHotspotsContainer.appendChild(hotspot);
        });
    }
    
    // 初始化热点
    updateMerchHotspots();
    
    // 监听窗口大小变化，更新热点位置
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // 使用防抖动技术，避免频繁更新
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateMerchHotspots();
        }, 250);
    });
    
    function openMerchModal() {
        // 显示modal
        merchModal.classList.remove('opacity-0', 'pointer-events-none');
        merchModal.classList.add('opacity-100', 'pointer-events-auto');
        
        // 使用GSAP动画显示卡片
        gsap.fromTo(merchCard, 
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
    }

    function closeMerchModal() {
        // 使用GSAP动画隐藏卡片
        gsap.to(merchCard, { 
            scale: 0.95, 
            opacity: 0,
            duration: 0.3, 
            ease: 'power3.in', 
            onComplete: () => {
                // 隐藏modal
                merchModal.classList.add('opacity-0', 'pointer-events-none');
                merchModal.classList.remove('opacity-100', 'pointer-events-auto');
            }
        });
    }
    
    closeMerchModalBtn.addEventListener('click', closeMerchModal);
    merchModal.addEventListener('click', (e) => {
        if (e.target === merchModal) closeMerchModal();
    });

    // 4.5 Section 5: 页脚
    const platformLinksContainer = document.querySelector('.platform-links-list');
    platformLinks.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.href = link.url;
        linkEl.target = '_blank';
        linkEl.className = 'block hover:border-l-[#FFE200] border-l-2 border-l-[#1a1a1a] transition-colors opacity-0 anim-text';
        linkEl.innerHTML = `
            <div class="flex items-center pl-4">
                <i class="${link.icon} text-2xl w-12"></i>
                <div class=" text-left">
                    <h3 class="font-bold text-lg">${link.name}</h3>
                    <p class="text-sm text-gray-400 mt-1">${link.description}</p>
                </div>
            </div>
        `;
        platformLinksContainer.appendChild(linkEl);
    });

    const copyrightBtn = document.getElementById('copyright-btn');
    const copyrightCard = document.getElementById('copyright-card');
    const copyrightIcon = document.getElementById('copyright-icon');

    copyrightBtn.addEventListener('click', () => {
        const isOpen = copyrightBtn.classList.toggle('is-open');
        const cardHeight = copyrightCard.offsetHeight;

        gsap.to(copyrightCard, {
            y: isOpen ? -cardHeight : 0,
            duration: 0.5,
            ease: 'power3.out'
        });
        gsap.to(copyrightBtn, {
            y: isOpen ? -cardHeight : 0,
            duration: 0.5,
            ease: 'power3.out'
        });
        gsap.to(copyrightIcon, {
            rotate: isOpen ? 180 : 0,
            duration: 0.5,
            ease: 'power3.out'
        });
    });
});