// 周边产品数据
const merchData = [
    { 
        id: 'sticker', 
        name: '冰箱贴', 
        image: 'images/merch/sticker.png', 
        qr: 'images/merch/saleqrccode.png', 
        link: '#',
        position: { top: '24%', left: '22%' },
        mobilePosition: { top: '37%', left: '27%' }
    },
    { 
        id: 'case', 
        name: '箱子', 
        image: 'images/merch/case.png', 
        qr: 'images/merch/saleqrccode.png', 
        link: '#',
        position: { top: '46%', left: '44%' },
        mobilePosition: { top: '49%', left: '44%' }
    },
    { 
        id: 'tshirt', 
        name: 'T恤', 
        image: 'images/merch/tshirt.png', 
        qr: 'images/merch/saleqrccode.png', 
        link: '#',
        position: { top: '52%', left: '84%' },
        mobilePosition: { top: '51%', left: '80%' }
    },
    { 
        id: 'bag', 
        name: '手提袋', 
        image: 'images/merch/bag.png', 
        qr: 'images/merch/saleqrccode.png', 
        link: '#',
        position: { top: '42%', left: '61%' },
        mobilePosition: { top: '48%', left: '59%' }
    },
];

// 将数据添加到全局作用域
window.merchData = merchData;