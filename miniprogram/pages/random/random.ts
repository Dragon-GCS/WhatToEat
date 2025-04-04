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
    showFilters: false,
  },

  onLoad() {
    this.loadDishes();
    this.extractAllTags();
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

  toggleFilters() {
    this.setData({
      showFilters: !this.data.showFilters,
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

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.setData(
      {
        selectedDish: pool[0],
      },
      () => {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300,
        });
      }
    );
  },

  navigateBack() {
    wx.navigateBack();
  },
});
