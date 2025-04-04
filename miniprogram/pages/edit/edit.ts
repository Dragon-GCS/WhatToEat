Page({
  data: {
    dish: {
      id: '',
      name: "",
      tags: [""],
      recipe: [""],
      image: "",
      createTime: 0,
      isFavorite: false,
      userRating: 0
    } as Dish
  },

  onLoad(options: { id?: string }) {
    const app = getApp<IAppOption>();
    if (options.id) {
      const dish = app.globalData.dishes.find((d: Dish) => d.id === options.id);
      if (dish) {
        this.setData({ dish });
      }
    } else {
      this.setData({
        dish: {
          ...this.data.dish,
          id: Date.now().toString(),
          createTime: Date.now()
        }
      });
    }
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: (res) => {
        this.setData({
          "dish.image": res.tempFiles[0].tempFilePath
        });
      },
    });
  },

  onSubmit(e: any) {
    const formData = e.detail.value;
    const updatedDish: Dish = {
      ...this.data.dish,
      name: formData.name,
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : [],
      recipe: formData.recipe ? formData.recipe.split("\n").map((recipe: string) => recipe.trim()) : [],
      image: this.data.dish.image,
      createTime: this.data.dish.createTime || Date.now()
    };

    const app = getApp<IAppOption>();
    const dishes = app.globalData.dishes.map((d: Dish) => 
      d.id === updatedDish.id ? updatedDish : d
    );
    if (!dishes.find(d => d.id === updatedDish.id)) {
      dishes.push(updatedDish);
    }
    app.globalData.dishes = dishes;
    wx.setStorageSync("dishes", dishes);
    wx.navigateBack();
  },

  onCancel() {
    wx.navigateBack();
  }
});