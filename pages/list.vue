<template>
  <section>
    <Header :parentPageName="'list'"/>

    <h3>
      Your Fills
      <span>-あなたの作ったフィル一覧-</span>
    </h3>
    <ul class="fillList">
      <li
        class="fillList__listCard uk-card uk-card-default"
        v-for="data in this.datas"
        :key="data.id"
      >
        <nuxt-link :to="'/?id=' + data.id">
          <p class="fillList__title">{{ data.title }}</p>
          <p>{{ data.updatedAt.toDate() }}</p>
          <p>BPM:{{ data.tempo }} 小節数:{{ data.bars }}</p>
        </nuxt-link>
      </li>
    </ul>
  </section>
</template>

<script>
import firebase from "firebase";
import "~/assets/ongaq";
import Header from "~/components/Header.vue";

export default {
  components: {
    Header
  },
  computed: {
    isAuth() {
      return this.$store.getters.isAuth;
    },
    userData() {
      return this.$store.getters.userData;
    }
  },
  data() {
    return {
      datas: []
    };
  },
  created() {},
  mounted() {
    // if (!this.$store.getters.getIsAuth) {
    //   this.$router.push({ path: "/" });
    //   return;
    // }

    // this.loadDatas();
    console.log(this.$store.getters.getIsAuth);
    console.log(this.$store.getters.getUserData);
    this.loadDatas();
  },
  methods: {
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    signOut() {
      firebase.auth().signOut();
    },
    loadDatas() {
      const db = firebase.firestore().collection("fills");

      db.where("owner", "==", this.$store.getters.getUserData)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            const res = doc.data();
            res.id = doc.id;

            this.datas.push(res);
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });
    }
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 400;
  font-size: 100px;
  color: #2E495E;
  letter-spacing: 1px;
  font-size: 2em;
}

.subtitle {
  font-weight: 300;
  font-size: 3em;
  color: #2E495E;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

.green {
  color: #00C48D;
}

.fillList__listCard {
  padding: 20px;
  margin: 20px auto;
  text-align: left;
  width: 300px;
}

.fillList__listCard a {
  color: #000;
  text-decoration: none;
}

.fillList {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.fillList__title {
  font-size: 17px;
  font-weight: bold;
}

h3 {
  text-align: center;
}

h3 span {
  display: block;
  font-size: 13px;
}
</style>
