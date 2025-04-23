// app.ts
interface Dish {
  id: string;
  name: string;
  tags: string[];
  recipe: string[];
  image: string;
  createTime: number;
  isFavorite: boolean;
  userRating: 0 | 1 | 2 | 3 | 4 | 5;
  lastRatedTime?: number;
}

interface IAppOption {
  globalData: {
    dishes: Dish[];
    fs: WechatMiniprogram.FileSystemManager;
    dataDir: string,
  };
  saveDish: (dish: Dish) => void;
  deleteDish: (dish: Dish) => void;
}

App<IAppOption>({
  globalData: {
    dishes: [
      // {
      //   id: "1",
      //   name: "番茄炒蛋",
      //   tags: ["家常", "快手"],
      //   recipe: ["番茄2个", "鸡蛋3个", "盐适量"],
      //   image: "",
      //   createTime: Date.now(),
      //   isFavorite: true,
      //   userRating: 4,
      // },
      // {
      //   id: "2",
      //   name: "红烧肉",
      //   tags: ["硬菜", "下饭菜"],
      //   recipe: ["五花肉500g", "冰糖30g", "生抽老抽各2勺"],
      //   image: "",
      //   createTime: Date.now(),
      //   isFavorite: false,
      //   userRating: 5,
      // },
    ],
    fs: wx.getFileSystemManager(),
    dataDir: `${wx.env.USER_DATA_PATH}/dishes`,
  },
  async onLaunch() {
    // 获取用户文件目录
    const dishesDir = this.globalData.dataDir;
    const fs = this.globalData.fs;

    // 确保dishes目录存在
    try {
      fs.accessSync(dishesDir);
    } catch (e) {
      // 目录不存在，创建它
      try {
        fs.mkdirSync(dishesDir, true);
        console.log("Created dishes directory");
        // 新创建的目录是空的，使用默认菜品
        return;
      } catch (mkdirErr) {
        wx.showToast({ title: "菜品读取失败", icon: "error" });
        return;
      }
    }

    // 获取目录中的所有文件
    const fileList = fs.readdirSync(dishesDir);
    for (const fileName of fileList) {
      if (fileName.endsWith(".json")) {
        const filePath = `${dishesDir}/${fileName}`;
        const data = fs.readFileSync(filePath, "utf-8");
        const dish = JSON.parse(data as string) as Dish;
        this.globalData.dishes.push(dish);
      }
    }
    console.log(this.globalData)
  },

  // 将菜品保存为文件
  saveDish(dish: Dish) {
    const fileName = `${dish.id}.json`;
    const filePath = `${this.globalData.dataDir}/${fileName}`;
    const data = JSON.stringify(dish, null);
    this.globalData.fs.writeFileSync(filePath, data, "utf-8");
  },
  deleteDish(dish: Dish) {
    const fileName = `${dish.id}.json`;
    const filePath = `${this.globalData.dataDir}/${fileName}`;
    if (dish.image) {
      this.globalData.fs.unlinkSync(dish.image);
    }
    this.globalData.fs.unlinkSync(filePath);
  }
});
