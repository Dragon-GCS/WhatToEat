// random.ts

// 定义标签项接口
interface TagItem {
  name: string;
  selected: boolean;
}

Page({
  data: {
    dishes: [] as Dish[],
    selectedDish: null as Dish | null,
    filters: {
      minRating: 0,
      onlyFavorites: false,
      tags: [] as string[],
    },
    allTags: [] as TagItem[],
    isFlipping: false, // 控制卡片翻转动画
  },

  onLoad() {
    this.loadDishes();
    this.extractAllTags();
    // 页面加载时立即随机选择一个菜品
    this.randomSelect();
  },

  loadDishes() {
    const app = getApp<IAppOption>();
    this.setData({
      dishes: app.globalData.dishes,
    });
  },

  extractAllTags() {
    const tagsSet = new Set<string>();
    const app = getApp<IAppOption>();
    
    // 收集所有标签
    app.globalData.dishes.forEach((dish) => {
      dish.tags.forEach((tag) => tagsSet.add(tag));
    });
    
    // 将标签转换为TagItem对象数组
    const tagItems: TagItem[] = Array.from(tagsSet).map(tag => ({
      name: tag,
      selected: false
    }));
    
    this.setData({
      allTags: tagItems
    });
  },

  updateFilter(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;

    this.setData({
      [`filters.${field}`]: field === "minRating" ? parseInt(value) : value,
    });
  },

  toggleTagFilter(e: any) {
    const tagName = e.currentTarget.dataset.tag;
    
    // 找到当前标签在allTags中的索引
    const tagIndex = this.data.allTags.findIndex(item => item.name === tagName);
    if (tagIndex === -1) return;
    
    // 切换标签的选中状态
    const newAllTags = [...this.data.allTags];
    newAllTags[tagIndex].selected = !newAllTags[tagIndex].selected;
    
    // 更新filters.tags数组（只包含被选中的标签名称）
    const newFilterTags = newAllTags
      .filter(item => item.selected)
      .map(item => item.name);
    
    // 更新数据
    this.setData({
      'allTags': newAllTags,
      'filters.tags': newFilterTags
    });
    
    console.log("标签切换:", tagName, "当前选中标签:", newFilterTags);
  },

  randomSelect() {
    const { dishes, filters } = this.data;
    let pool = dishes.filter((dish) => {
      return (
        dish.userRating >= filters.minRating &&
        (!filters.onlyFavorites || dish.isFavorite) &&
        (filters.tags.length === 0 ||
          filters.tags.some((tag) => dish.tags.includes(tag)))
      );
    });

    if (pool.length === 0) {
      wx.showToast({
        title: "没有符合条件的菜品",
        icon: "none",
      });
      return;
    }

    // 随机选择一个菜品
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedDish = pool[randomIndex];

    // 开始翻转动画
    this.setData({ isFlipping: true });

    // 延迟更新菜品，营造翻转效果
    setTimeout(() => {
      this.setData({
        selectedDish: selectedDish,
      });
      
      // 延迟结束翻转动画
      setTimeout(() => {
        this.setData({ isFlipping: false });
        
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300,
        });
      }, 300);
    }, 300);
  },

  // 编辑当前菜品
  editDish() {
    if (!this.data.selectedDish) return;
    
    wx.navigateTo({
      url: `../edit/edit?id=${this.data.selectedDish.id}`,
    });
  },
  
  // 切换收藏状态
  toggleFavorite() {
    if (!this.data.selectedDish) return;
    
    const dish = { ...this.data.selectedDish, isFavorite: !this.data.selectedDish.isFavorite };
    this.setData({ selectedDish: dish });
    this.updateDish(dish);
  },
  
  // 评分
  rateDish(e: any) {
    if (!this.data.selectedDish) return;
    
    let { rating } = e.currentTarget.dataset;
    if (this.data.selectedDish.userRating === rating) {
      rating = 0;
    }
    
    const dish = {
      ...this.data.selectedDish,
      userRating: rating,
      lastRatedTime: Date.now(),
    };
    
    this.setData({ selectedDish: dish });
    this.updateDish(dish);
  },
  
  // 更新菜品数据
  updateDish(updatedDish: any) {
    const app = getApp<IAppOption>();
    const dishes = app.globalData.dishes.map((d: Dish) => {
      if (d.id === updatedDish.id) {
        return updatedDish;
      }
      return d;
    });
    
    app.globalData.dishes = dishes;
    wx.setStorageSync("dishes", dishes);
    
    // 更新本地数据
    this.setData({
      dishes: dishes
    });
  },
});
