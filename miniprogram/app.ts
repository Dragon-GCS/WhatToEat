// app.ts
interface Dish {
  id: string;
  name: string;
  tags: string[];
  recipe: string[];
  image: string;
  createTime: number;
  isFavorite: boolean;
  userRating: 0|1|2|3|4|5;
  lastRatedTime?: number;
}

interface IAppOption {
  globalData: {
    dishes: Dish[];
  };
}

App<IAppOption>({
  globalData: {
    dishes: [
      {
        id: '1',
        name: '番茄炒蛋',
        tags: ['家常', '快手'],
        recipe: ['番茄2个', '鸡蛋3个', '盐适量'],
        image: "",
        createTime: Date.now(),
        isFavorite: true,
        userRating: 4,
      },
      {
        id: '2',
        name: '红烧肉',
        tags: ['硬菜', '下饭菜'],
        recipe: ['五花肉500g', '冰糖30g', '生抽老抽各2勺'],
        image: "",
        createTime: Date.now(),
        isFavorite: false,
        userRating: 5,
      }
    ]
  },
  onLaunch() {
    // 初始化时尝试从本地存储加载数据
    const storedDishes = wx.getStorageSync('dishes');
    if (storedDishes) {
      this.globalData.dishes = storedDishes;
    }

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})