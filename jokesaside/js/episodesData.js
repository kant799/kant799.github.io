// episodesData数据
const episodesData = [
  {
    "title": "1. 一千零一个社死瞬间",
    "date": "2021-10-27",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L0ZoSjg5UENIS3daNE9uUUJkR2JRRS1vdlJCZWgucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/617920bfb69226ed16a3ed75",
    "hosts": [
      "史炎",
      "韦若琛",
      "啊鑫"
    ],
    "id": 1
  },
  {
    "title": "2. 当我们讨论东北时我们再误解什么",
    "date": "2021-11-03",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xpa1pOMHJwLUJ3YTczdTRwQU50U0lhSmhTakEucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/618287b57dda6235dcb73aa7",
    "hosts": [
      "史炎",
      "梁彦增",
      "迟斌"
    ],
    "id": 2
  },
  {
    "title": "3. 那些年没错过的智商税",
    "date": "2021-11-12",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2x0bEtmVXYxY2hWN2duU1pnQVFmV2h4eXVkQ3UucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/618e5cbb07ed34de8983fda0",
    "hosts": [
      "史炎",
      "书恒",
      "孤沽"
    ],
    "id": 3
  },
  {
    "title": "4. 不务正业也不误正业：三位跨专业、跨行业者的漫谈",
    "date": "2021-11-19",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L0ZyQURPbXowcFdOVm5fZmg5SGJWTVduc2JmTTQucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/6197a9dc9be3e0f25948cc75",
    "hosts": [
      "史炎",
      "余有矿",
      "马远"
    ],
    "id": 4
  },
  {
    "title": "5. 音乐就该看现场",
    "date": "2021-11-26",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xtblVTbllOVHVSRUEyZXhzR00xWDFKeS1mZU8ucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61a0ed4e90e462aca0ea11f9",
    "hosts": [
      "史炎",
      "卡卡",
      "鸽子",
      "迟斌"
    ],
    "id": 5
  },
  {
    "title": "6. 爱，死亡和社交网络",
    "date": "2021-12-03",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2x2enFjcmN3bWxSSkJweTAxVjZrWkZwQXBuTW8ucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61aa1f4eca6141933d1a1c6b",
    "hosts": [
      "史炎",
      "曲玮玮",
      "生菜"
    ],
    "id": 6
  },
  {
    "title": "7. 都在酒里了：断片、花式劝酒、酒品与人品…",
    "date": "2021-12-10",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xwV2pPa2paX1pxaTlUc3A5UlJ5V1I0b3hGZE0ucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61b353ce3d9bddc4e2cd2ba3",
    "hosts": [
      "史炎",
      "梁彦增",
      "Marley"
    ],
    "id": 7
  },
  {
    "title": "8. 文艺青年开店物语",
    "date": "2021-12-17",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xqa0VTb253VzdpY0dNNGJoaVJqMkU3bFdFMm4ucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61bc8cc1898eaed596507450",
    "hosts": [
      "史炎",
      "Aki",
      "KT"
    ],
    "id": 8
  },
  {
    "title": "9. 看闲书才是正经事",
    "date": "2021-12-24",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xod2U5NXVaUTRsWlRIQ3lhMFg0R3FjLTRwc1YucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61c5b32a8548ba3136092dc9",
    "hosts": [
      "史炎",
      "沈清",
      "徐力"
    ],
    "id": 9
  },
  {
    "title": "10. 谈笑风生：脱口秀、即兴喜剧、金广发宇宙，喜剧创作者闲聊",
    "date": "2021-12-31",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xzLVhMWm9WSEx0TVV5M2xWQ1Jjanh3NjlxNHgucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61cedbc8cb0f5d7d1b7ccb70",
    "hosts": [
      "史炎",
      "大雄",
      "王煜鑫",
      "凯文"
    ],
    "id": 10
  },
  {
    "title": "11. 星座、MBTI人格测试…真能快速了解一个人吗？",
    "date": "2022-01-07",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xqNlVkejJBajRaeVJITWZLQUk1V05pTlpZR0oucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61d7fea8a400c116afea3e4f",
    "hosts": [
      "史炎",
      "韦若琛",
      "黑灯"
    ],
    "id": 11
  },
  {
    "title": "12. 脱口秀演员才不会老老实实做年终总结",
    "date": "2022-02-14",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xwUFVMalhqeHFmY3pPUjlQdjl1RGFPSUx3QVoucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61e1375032bc8c17b2190066",
    "hosts": [
      "史炎",
      "田多多",
      "韦若琛",
      "郭星"
    ],
    "id": 12
  },
  {
    "title": "13. 几乎是一场“先锋戏剧”的喜剧人、戏剧人碰撞现场",
    "date": "2022-01-21",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L0ZxcVlUcmYwcGtnUHh2SzQ4dmcyT0Jfd21YYXYucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61ea88d121c23a45ed5d64c0",
    "hosts": [
      "史炎",
      "大雄",
      "安妮"
    ],
    "id": 13
  },
  {
    "title": "14. 这一年年儿的",
    "date": "2022-01-28",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2x2VldkUlJvWTJFdm1KcW1DbjJXbHZ4b1haUk4ucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61f401f34675a08411f51758",
    "hosts": [
      "史炎",
      "韦若琛",
      "卡卡"
    ],
    "id": 14
  },
  {
    "title": "15. 这是一期1:00上线的“熬夜”主题唠嗑",
    "date": "2022-02-05",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xoMS1jd290d3hHaTlOYklnYTNGd0pKZGg3ZEsucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/61fd72030c35c9f95dca1744",
    "hosts": [
      "史炎",
      "大雄",
      "韦若琛"
    ],
    "id": 15
  },
  {
    "title": "16. 情人节不谈恋爱，谈“谈恋爱”",
    "date": "2022-02-11",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2xocDZFLWJnWUQ4WUZGN01kT3JONFV4X2RueUwucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/62067bd5c307d534dc6d5324",
    "hosts": [
      "史炎",
      "韦若琛",
      "小郭"
    ],
    "id": 16
  },
  {
    "title": "17. 向左咖啡向右茶，中间的我该喝啥？（酒？）",
    "date": "2022-02-18",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2x1eXlFVjZLYVVUTkg3VlFQanZVUkZIQ3JscEcucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/620f789530fca3133c0f8006",
    "hosts": [
      "史炎",
      "大雄",
      "倪午阳"
    ],
    "id": 17
  },
  {
    "title": "18. 人生啊，就是从鸡血到躺平",
    "date": "2022-02-25",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L2x1QTF5WG1xM3dqR0RtNEhHUDVqaW05TXBUYzYucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/6218941e30fca3133c0f82e1",
    "hosts": [
      "史炎",
      "大雄",
      "韦若琛",
      "周鱼"
    ],
    "id": 18
  },
  {
    "title": "19. 猫猫狗狗真可爱，蜥蜴狐蛇也不赖（深夜特供版）",
    "date": "2022-03-04",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L0ZqNEZxYTNsSEU5NnhySUpJSW1Ba0szMlM3RnMucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/622203d927719a00806f1c4e",
    "hosts": [
      "史炎",
      "大雄",
      "王梓涵",
      "小杜"
    ],
    "id": 19
  },
  {
    "title": "20. 和考古工作者唠嗑儿：特朗普推特有考古价值吗？",
    "date": "2022-03-11",
    "cover": "https://bts-image.xyzcdn.net/aHR0cHM6Ly9pbWFnZS54eXpjZG4ubmV0L0ZnUUpRU05NdUEtaEJpc0ljRWFBNW1rMENVMVkucG5n.png@small",
    "link": "https://www.xiaoyuzhoufm.com/episode/622af55a9eb22e46ffe6c36e",
    "hosts": [
      "史炎",
      "大雄",
      "奚牧凉"
    ],
    "id": 20
  }
];

// 将数据添加到全局作用域
window.episodesData = episodesData;
