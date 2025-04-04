Page({
  data: {
    dish: {} as Dish,
  },

  onLoad(options: { id: string }) {
    const app = getApp<IAppOption>();
    const dish = app.globalData.dishes.find((d: Dish) => d.id === options.id);
    if (dish) {
      this.setData({ dish });
    }
  },
  onShow() {
    if (!this.data.dish) {
      return;
    }
    const app = getApp<IAppOption>();
    const dish = app.globalData.dishes.find(
      (d: Dish) => d.id === this.data.dish.id
    );
    if (dish) {
      this.setData({ dish });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onEdit() {
    wx.navigateTo({
      url: `../edit/edit?id=${this.data.dish.id}`,
    });
  },

  onDelete() {
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个菜品吗？",
      success: (res) => {
        if (res.confirm) {
          const app = getApp<IAppOption>();
          const fs = wx.getFileSystemManager();
          // Delete the image file
          fs.unlink({ filePath: this.data.dish.image });
          const dishes = app.globalData.dishes.filter(
            (d: Dish) => d.id !== this.data.dish.id
          );
          app.globalData.dishes = dishes;
          wx.setStorageSync("dishes", dishes);
          wx.navigateBack();
        }
      },
    });
  },

  toggleFavorite() {
    const dish = { ...this.data.dish, isFavorite: !this.data.dish.isFavorite };
    this.setData({ dish });
    this.updateDish(dish);
  },

  rateDish(e: any) {
    let { rating } = e.currentTarget.dataset;
    if (this.data.dish.userRating === rating) {
      rating = 0;
    }
    const dish = {
      ...this.data.dish,
      userRating: rating,
      lastRatedTime: Date.now(),
    };
    this.setData({ dish });
    this.updateDish(dish);
  },

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
  },
});
