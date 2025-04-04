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
    const dishes = this.data.dishes.map((dish) => {
      if (dish.id === id) {
        return { ...dish, isFavorite: !dish.isFavorite };
      }
      return dish;
    });
    this.updateDishes(dishes);
  },

  rateDish(e: any) {
    var { id, rating } = e.currentTarget.dataset;
    const dishes = this.data.dishes.map((dish) => {
      if (dish.id !== id) {
        return dish;
      }
      if (dish.userRating === rating) {
        rating = 0;
      }
      return {
        ...dish,
        userRating: rating,
        lastRatedTime: Date.now(),
      };
    });
    this.updateDishes(dishes);
  },

  updateDishes(dishes: Dish[]) {
    this.setData({ dishes });
    const app = getApp<IAppOption>();
    app.globalData.dishes = dishes;
    wx.setStorageSync("dishes", dishes);
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
          const dishes = this.data.dishes.filter((dish) => dish.id !== id);
          this.updateDishes(dishes);
        }
      },
    });
  },
});
