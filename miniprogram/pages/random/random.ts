// random.ts

Page({
  data: {
    dishes: [] as Dish[],
    selectedDish: null as Dish | null,
    filters: {
      minRating: 0,
      onlyFavorites: false,
      tags: [] as string[],
    },
    allTags: [] as string[],
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
    const tags = new Set<string>();
    const app = getApp<IAppOption>();
    app.globalData.dishes.forEach((dish) => {
      if (dish.tags) {
        if (Array.isArray(dish.tags)) {
          dish.tags.forEach((tag) => tags.add(tag));
        } else if (typeof dish.tags === "string") {
          tags.add(dish.tags);
        }
      }
    });
    this.setData({
      allTags: Array.from(tags),
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

  toggleTagFilter(tag: string) {
    const tags = [...this.data.filters.tags]; // Create a copy to avoid direct modification
    const index = tags.indexOf(tag);

    if (index === -1) {
      tags.push(tag);
    } else {
      tags.splice(index, 1);
    }

    this.setData({
      "filters.tags": tags,
    });
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
