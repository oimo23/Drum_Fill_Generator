export const state = () => ({
  IsAuth: false,
  userData: null
});

export const mutations = {
  IsAuth(state, boolean) {
    state.IsAuth = boolean;
  },
  userData(state, data) {
    state.userData = data;
  }
};

export const actions = {
  mutateIsAuth(context, boolean) {
    context.commit("IsAuth", boolean);
  },
  mutateUserData(context, data) {
    context.commit("userData", data);
  }
};

export const getters = {
  getIsAuth(state) {
    return state.IsAuth;
  },
  getUserData(state) {
    return state.userData;
  }
};
