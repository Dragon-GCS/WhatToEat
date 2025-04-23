Page({
  data: {
    dish: {
      id: "",
      name: "",
      tags: [],
      recipe: [""],
      image: "",
      createTime: 0,
      isFavorite: false,
      userRating: 0,
    } as Dish,
    originalDish: {} as Dish, // 用于保存原始菜品数据
    recipeText: "", // 用于存储换行符分隔的菜谱文本
    allTags: [] as string[], // 存储所有已有的标签
    currentTags: [] as string[], // 当前选择的标签
    newTag: "", // 新输入的标签
  },

  onShow() {
    const app = getApp<IAppOption>();
    // 获取所有已有的标签
    const allTags = this.getAllTags(app.globalData.dishes);
    this.setData({ allTags });
  },

  onLoad(options: { id?: string }) {
    const app = getApp<IAppOption>();

    if (options.id !== "undefined") {
      const dish = app.globalData.dishes.find((d: Dish) => d.id === options.id);
      if (dish) {
        // 将菜谱步骤数组转换为换行符分隔的字符串
        const recipeText = dish.recipe.join("\n");
        // 确保标签是数组而不是空字符串
        const dishTags = Array.isArray(dish.tags)
          ? dish.tags.filter((tag) => tag.trim() !== "")
          : [];

        this.setData({
          dish,
          originalDish: JSON.parse(JSON.stringify(dish)), // 深拷贝保存原始数据
          recipeText,
          currentTags: dishTags, // 复制当前菜品的有效标签
        });
      }
    } else {
      // 创建新菜品，确保标签是空数组
      const newDish = {
        ...this.data.dish,
        id: Date.now().toString(),
        createTime: Date.now(),
        tags: [], // 确保新菜品的标签是空数组
      };
      this.setData({
        dish: newDish,
        originalDish: JSON.parse(JSON.stringify(newDish)), // 深拷贝保存原始数据
        currentTags: [],
      });
    }
  },

  // 从所有菜品中提取不重复的标签
  getAllTags(dishes: Dish[]): string[] {
    const tagSet = new Set<string>();

    // 确保dishes是数组且不为空
    if (Array.isArray(dishes) && dishes.length > 0) {
      dishes.forEach((dish) => {
        // 确保dish.tags是数组
        if (Array.isArray(dish.tags)) {
          dish.tags.forEach((tag) => {
            if (tag && tag.trim() !== "") {
              tagSet.add(tag.trim());
            }
          });
        }
      });
    }

    // 如果没有找到任何标签，添加一些默认标签
    if (tagSet.size === 0) {
      const defaultTags = [
        "家常",
        "快手",
        "下饭菜",
        "硬菜",
        "素菜",
        "荤菜",
        "甜点",
        "汤",
      ];
      defaultTags.forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet);
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: (res) => {
        const app = getApp<IAppOption>();
        const fs = app.globalData.fs;
        const tmpFilePath = res.tempFiles[0].tempFilePath;
        const fileName = tmpFilePath.split("/").pop() || `${Date.now()}.jpg`;
        const filePath = `${app.globalData.dataDir}/${fileName}`;
        const originImage = this.data.dish.image;
        console.log(this.data, tmpFilePath, filePath);
        if (originImage) {
          fs.unlink({ filePath: originImage });
        }
        fs.copyFileSync(tmpFilePath, filePath);
        this.setData({ "dish.image": filePath });
      },
    });
  },

  onSubmit(e: any) {
    const formData = e.detail.value;
    const app = getApp<IAppOption>();

    const updatedDish: Dish = {
      ...this.data.dish,
      name: formData.name,
      tags: this.data.currentTags.length > 0 ? [...this.data.currentTags] : [],
      recipe: formData.recipe
        ? formData.recipe
            .split("\n")
            .filter((step: string) => step.trim() !== "")
            .map((step: string) => step.trim())
        : [],
      image: this.data.dish.image,
      createTime: this.data.dish.createTime || Date.now(),
    };

    const dishes = app.globalData.dishes.map((d: Dish) =>
      d.id === updatedDish.id ? updatedDish : d
    );
    if (!dishes.find((d) => d.id === updatedDish.id)) {
      dishes.push(updatedDish);
    }
    app.globalData.dishes = dishes;
    // 保存到文件系统
    app.saveDish(updatedDish);
    wx.navigateBack();
  },

  onCancel() {
    // 恢复原始数据
    this.setData({
      dish: this.data.originalDish,
    });
    wx.navigateBack();
  },

  // 处理标签输入
  onTagInput(e: any) {
    this.setData({
      newTag: e.detail.value,
    });
  },

  // 添加新标签
  addTag() {
    const { newTag, currentTags } = this.data;
    if (newTag && newTag.trim() !== "") {
      // 检查标签是否已存在
      if (!currentTags.includes(newTag.trim())) {
        this.setData({
          currentTags: [...currentTags, newTag.trim()],
          newTag: "",
        });
      }
    }
  },

  // 从已有标签中选择
  selectTag(e: any) {
    const { tag } = e.currentTarget.dataset;
    const { currentTags } = this.data;

    // 检查标签是否已被选择
    if (!currentTags.includes(tag)) {
      this.setData({
        currentTags: [...currentTags, tag],
      });
    }
  },

  // 删除已选标签
  removeTag(e: any) {
    const { index } = e.currentTarget.dataset;
    const currentTags = [...this.data.currentTags];
    currentTags.splice(index, 1);
    this.setData({
      currentTags,
    });
  },
});
