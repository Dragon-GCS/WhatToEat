Page({
  data: {
    dishes: [] as Dish[],
  },

  onShow() {
    this.loadDishes();
  },

  loadDishes() {
    const app = getApp<IAppOption>();
    this.setData({
      dishes: app.globalData.dishes,
    });
  },

  toggleFavorite(e: any) {
    const { id } = e.currentTarget.dataset;
    const app = getApp<IAppOption>();
    this.data.dishes.map((dish) => {
      if (dish.id === id) {
        dish.isFavorite = !dish.isFavorite;
        app.saveDish(dish);
      }
    });
  },

  rateDish(e: any) {
    const { id, rating } = e.currentTarget.dataset;
    const app = getApp<IAppOption>();
    const dishes = this.data.dishes.map((dish) => {
      if (dish.id === id) {
        dish.userRating = dish.userRating === rating ? 0 : rating;
        dish.lastRatedTime = Date.now();
        app.saveDish(dish);
      }
      return dish;
    });
    this.setData({ dishes });
    app.globalData.dishes = dishes;
  },

  navigateToRandom() {
    wx.navigateTo({
      url: "../random/random",
    });
  },

  navigateToAdd(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../edit/edit?id=${id}`,
    });
  },

  navigateToDetail(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    });
  },

  deleteDish(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个菜品吗？",
      success: (res) => {
        if (res.confirm) {
          const app = getApp<IAppOption>();
          const targetDish = this.data.dishes.find((dish) => dish.id === id);
          if (targetDish) {
            app.deleteDish(targetDish);
          }
          const dishes = this.data.dishes.filter((dish) => dish.id !== id);
          this.setData({ dishes });
          app.globalData.dishes = dishes;
        }
      },
    });
  },
});
