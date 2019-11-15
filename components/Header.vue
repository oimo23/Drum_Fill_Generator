<template>
  <header>
    <h1 class="title">Drum Fills & Chops Generater</h1>

    <div class="links">
      <nuxt-link
        to="/list"
        v-if="this.$store.getters.getIsAuth && parentPageName === 'index'"
        class="button--green"
      >Your Fills</nuxt-link>
      <nuxt-link
        to="/"
        v-if="this.$store.getters.getIsAuth && parentPageName === 'list'"
        class="button--green"
      >Home</nuxt-link>
      <a
        v-if="!this.$store.getters.getIsAuth"
        @click="signIn()"
        class="button--green"
      >signIn To Save</a>
      <a v-if="this.$store.getters.getIsAuth" @click="signOut()" class="button--grey">signOut</a>
    </div>
  </header>
</template>

<script>
import firebase from "firebase";

export default {
  props: {
    parentPageName: {
      type: String,
      required: true
    }
  },
  mounted() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("chenged")
        const { uid, displayName } = user;

        this.$store.dispatch("mutateIsAuth", !!uid);
        this.$store.dispatch("mutateUserData", uid);
      } else {
        this.$store.dispatch("mutateIsAuth", false);
        this.$store.dispatch("mutateUserData", null);
      }
    });
  },
  methods: {
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    signOut() {
      console.log("あ");
      firebase.auth().signOut();
      console.log("logouted");
    }
  }
};
</script>
