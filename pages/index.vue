<template>
  <div class="index">
    <Header :parentPageName="'index'"/>

    <section v-if="orchestration.length">
      <h3>
        Orchestration Example
        <span>-フィル例-</span>
      </h3>

      <div class="sequencer">
        <div class="sequencer__row">
          <span class="sequencer__part"></span>
          <span class="sequencer__part">HIHAT</span>
          <span class="sequencer__part">TOM</span>
          <span class="sequencer__part">SNARE</span>
          <span class="sequencer__part">FLOOR</span>
          <span class="sequencer__part">KICK</span>
        </div>
        <div class="sequencer__row" v-for="(row, i) in orchestration" :key="row.id">
          <span>{{ rawNotes[i] }}</span>
          <span class="sequencer__step" :class="orchestration[i].hihat ? 'on' : ''"></span>
          <span class="sequencer__step" :class="orchestration[i].tom ? 'on' : ''"></span>
          <span class="sequencer__step" :class="orchestration[i].snare ? 'on' : ''"></span>
          <span class="sequencer__step" :class="orchestration[i].floor ? 'on' : ''"></span>
          <span class="sequencer__step" :class="orchestration[i].kick  ? 'on' : ''"></span>
        </div>
      </div>
      <div class="sequencer__control">
        <button
          v-if="ongaqReady && !isPlaying"
          class="uk-button uk-button-primary"
          @click="ongaqStart()"
          id="button"
        >Start</button>
        <button
          v-if="ongaqReady && isPlaying"
          class="uk-button uk-button-danger"
          @click="ongaqPause()"
          id="button"
        >Pause</button>
        <button
          v-if="orchestration.length && this.$store.getters.getIsAuth"
          class="uk-button uk-button-default uk-margin-small-right"
          type="button"
          uk-toggle="target: #modal-center"
        >Save</button>
      </div>

      <div id="modal-center" class="saveModal uk-flex-top" uk-modal>
        <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
          <p>
            <input type="text" class="uk-input" placeholder="Input Title" v-model="title">
          </p>
          <p class="saveModal__ok">
            <button
              uk-toggle="target: #modal-center"
              @click="save()"
              class="uk-button uk-button-primary"
              type="button"
            >OK</button>
          </p>
        </div>
      </div>
    </section>

    <section v-if="orchestration.length">
      <h3>
        Pattern
        <span>-手順-</span>
      </h3>
      <p>{{ createdPattern }}</p>
    </section>

    <section>
      <p>
        <button class="uk-button uk-button-secondary" @click="generatePattern()">Generate</button>
      </p>
    </section>
    <div class="optionWrapper">
      <section class="uk-card uk-card-default">
        <h3>
          KEY PATTERNS
          <span>-使う手順-</span>
        </h3>
        <p>R=右手, L=左手, K=キック, _=休符,
          <br>それ以外は全て無視されます(全角は不可)
        </p>
        <p>
          <input
            class="uk-input"
            type="text"
            placeholder="RLRLKK"
            @change="changePattern()"
            v-model="pattern1"
          >
          
          <input
            class="uk-input"
            type="text"
            placeholder
            @change="changePattern()"
            v-model="pattern2"
            v-if="showedPatterns >= 2"
          >
          
          <input
            class="uk-input"
            type="text"
            placeholder
            @change="changePattern()"
            v-model="pattern3"
            v-if="showedPatterns >= 3"
          >
        </p>
        <p v-if="showedPatterns < 3">
          <button class="uk-button uk-button-primary" @click="incrementShowedPatterns()">＋</button>
        </p>
      </section>

      <section class="uk-card uk-card-default">
        <h3>
          Bars
          <span>-小節数-</span>
        </h3>
        <select class="uk-select" v-model="bars">
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </section>

      <section class="uk-card uk-card-default">
        <h3>
          BPM
          <span>-テンポ-</span>
        </h3>
        <input type="range" v-model="tempo" min="60" max="200">
        <p class="bpm">{{ tempo }}</p>
      </section>
    </div>
  </div>
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
    SixteenNotes() {
      if (!this.triplets) {
        return 16 * this.bars;
      } else {
        return 24 + this.bars;
      }
    },
    rawNotes() {
      return this.createdPattern.join("").split("");
    }
  },
  mounted: function() {
    if (this.$route.query.id) {
      this.loadData();
      this.ongaqPreparation();
    }
  },
  destroyed() {
    if (this.ongaq) {
      this.ongaq.pause();
      this.ongaq = null;
    }
  },
  data() {
    return {
      patterns: ["RLL", "", ""],
      pattern1: "RLL",
      pattern2: "",
      pattern3: "",
      bars: 1,
      showedPatterns: 1,
      comboGuide: [],
      createdPattern: [],
      notesLength: 0,
      orchestration: [],
      tempo: 100,
      isPlaying: false,
      ongaq: null,
      ongaqReady: false,
      title: null,
      owner: null
    };
  },
  created() {},
  methods: {
    save() {
      const db = firebase.firestore().collection("fills");

      db.doc()
        .set({
          title: this.title,
          keyPatterns: this.patterns,
          bars: this.bars,
          orchestration: this.orchestration,
          createdPattern: this.createdPattern,
          tempo: this.tempo,
          owner: this.$store.getters.getUserData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log("Document successfully written!");
          UIkit.notification({
            message: "保存されました",
            status: "success"
          });
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    },
    loadData() {
      const db = firebase.firestore().collection("fills");
      console.log(db.doc(this.$route.query.id).get());

      db.doc(this.$route.query.id)
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot.data());

          const data = querySnapshot.data();

          this.title = data.title;
          this.keyPatterns = data.keyPatterns;
          this.bars = data.bars;
          this.tempo = this.tempo;
          this.createdPattern = data.createdPattern;
          this.orchestration = data.orchestration;
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });
    },
    incrementShowedPatterns() {
      if (this.showedPatterns <= 3) {
        this.showedPatterns++;
      }
    },
    changePattern() {
      this.patterns[0] = this.pattern1
        .split("")
        .filter(n => n === "R" || n === "L" || n === "K" || n === "_")
        .join("");
      this.patterns[1] = this.pattern2
        .split("")
        .filter(n => n === "R" || n === "L" || n === "K" || n === "_")
        .join("");
      this.patterns[2] = this.pattern3
        .split("")
        .filter(n => n === "R" || n === "L" || n === "K" || n === "_")
        .join("");
    },
    ongaqPreparation() {
      const my_drums = new Part({
        sound: "my_band_drums",
        measure: 4 * this.bars
      });

      my_drums.add(
        new Filter({
          key: "kick",
          measure: 16,
          active: (beat, measure) => {
            const hit = 8 * Math.abs(this.bars * 2 - measure) + beat / 2;
            if (measure < 2 * this.bars) {
              return beat % 8 === 0;
            } else {
              return (beat / 2) % 1 === 0
                ? this.orchestration[hit].kick === 1
                : false;
            }
          }
        })
      );

      my_drums.add(
        new Filter({
          key: "snare",
          measure: 16,
          active: (beat, measure) => {
            const hit = 8 * Math.abs(this.bars * 2 - measure) + beat / 2;

            if (measure < 2 * this.bars) {
              return beat === 8;
            } else {
              return (beat / 2) % 1 === 0
                ? this.orchestration[hit].snare === 1
                : false;
            }
          }
        })
      );

      my_drums.add(
        new Filter({
          key: "hihat",
          measure: 16,
          active: (beat, measure) => {
            const hit = 8 * Math.abs(this.bars * 2 - measure) + beat / 2;

            if (measure < 2 * this.bars) {
              return beat % 4 === 0;
            } else {
              return (beat / 2) % 1 === 0
                ? this.orchestration[hit].hihat === 1
                : false;
            }
          }
        })
      );

      my_drums.add(
        new Filter({
          key: "tom",
          measure: 16,
          active: (beat, measure) => {
            const hit = 8 * Math.abs(this.bars * 2 - measure) + beat / 2;

            if (measure < 2 * this.bars) {
              return false;
            } else {
              return (beat / 2) % 1 === 0
                ? this.orchestration[hit].tom === 1
                : false;
            }
          }
        })
      );

      my_drums.add(
        new Filter({
          key: "tom2",
          measure: 16,
          active: (beat, measure) => {
            const hit = 8 * Math.abs(this.bars * 2 - measure) + beat / 2;

            if (measure < 2 * this.bars) {
              return false;
            } else {
              return (beat / 2) % 1 === 0
                ? this.orchestration[hit].floor === 1
                : false;
            }
          }
        })
      );

      my_drums.add(
        new Filter({
          key: "side",
          volume: 70,
          active: beat => {
            return beat % 8 === 0;
          }
        })
      );

      this.ongaq = new Ongaq({
        api_key: "a9b1f22e5745458ba250b5e00d0dc2d0",
        volume: 40,
        bpm: this.tempo,
        onReady: () => {
          this.ongaqReady = true;
        }
      });

      this.ongaq.add(my_drums);
    },
    ongaqStart() {
      this.ongaq.start();
      this.isPlaying = true;
    },
    ongaqPause() {
      this.ongaq.pause();
      this.isPlaying = false;
    },
    generatePattern() {
      this.comboGuide = [];
      this.notesLength = 0;

      while (this.notesLength < this.SixteenNotes) {
        let randomInt = getRandomInt(this.patterns.length);

        this.comboGuide.push(this.patterns[randomInt]);
        this.notesLength += this.patterns[randomInt].length;
      }

      this.comboGuide = this.comboGuide
        .join("")
        .slice(0, this.SixteenNotes * this.bars);

      let output = [];

      for (let i in this.comboGuide) {
        if (!this.triplets) {
          if ((~~i + 1) % 4 === 0 && i !== 0) {
            let temp = this.comboGuide.slice(i - 3, ~~i + 1);
            output.push(temp);
          }
        } else {
          if ((~~i + 1) % 6 === 0 && i !== 0) {
            let temp = this.comboGuide.slice(i - 5, ~~i + 1);
            output.push(temp);
          }
        }
      }

      this.createdPattern = output;

      this.makeOrchestration();
    },
    makeOrchestration() {
      if (this.ongaq && this.ongaq.params.isPlaying) {
        this.ongaq.pause();
        this.isPlaying = false;
      }

      this.orchestration = [];

      for (let i = 0; i < this.rawNotes.length; i++) {
        const initState = {
          hihat: 0,
          tom: 0,
          snare: 0,
          floor: 0,
          kick: 0
        };

        this.orchestration.push(initState);
      }

      for (let i = 0; i < this.rawNotes.length; i++) {
        if (this.rawNotes[i] === "K") {
          this.orchestration[i].kick = 1;
        } else if (this.rawNotes[i] === "R" || this.rawNotes[i] === "L") {
          // Diddleのとき、叩く場所を移動するのを禁止する
          if (i !== 0 && this.rawNotes[i] === this.rawNotes[i - 1]) {
            this.orchestration[i] = this.orchestration[i - 1];
            continue;
          }

          let randomInt = 0;

          // 右手スネアの直後、左手でフロアに行くのを禁止する
          if (
            i !== 0 &&
            this.orchestration[i - 1].snare === 1 &&
            this.rawNotes[i - 1] === "R" &&
            this.rawNotes[i] === "L"
          ) {
            randomInt = getRandomInt(4);
          } else {
            randomInt = getRandomInt(5);
          }

          if (randomInt === 0) {
            this.orchestration[i].hihat = 1;
          }

          if (randomInt === 1) {
            this.orchestration[i].tom = 1;
          }

          if (randomInt === 2 || randomInt === 3) {
            this.orchestration[i].snare = 1;
          }

          if (randomInt === 4) {
            this.orchestration[i].floor = 1;
          }
        }
      }

      this.ongaqPreparation();
    }
  }
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getUniqueStr(myStrong) {
  let strong = 1000;
  if (myStrong) strong = myStrong;
  return (
    new Date().getTime().toString(16) +
    Math.floor(strong * Math.random()).toString(16)
  );
}
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
  color: #fff;
  letter-spacing: 1px;
  font-size: 1.5em;
}

.index {
  text-align: center;
}

.subtitle {
  font-weight: 300;
  font-size: 3em;
  color: #2E495E;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.sequencer {
  display: inline-flex;
}

.sequencer__step {
  width: 20px;
  height: 20px;
  margin: 5px;
  display: block;
  background: #ccc;
}

.sequencer .on {
  background: #2E495E;
}

.sequencer__part {
  height: 20px;
  margin: 5px;
  display: block;
}

.uk-input {
  max-width: 300px;
}

.uk-select {
  max-width: 100px;
}

.sequencer__control {
  text-aligh: right;
}

section {
  margin: 20px auto;
}

.optionWrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-around;
}

.optionWrapper > section {
  margin: 0 10px;
  align-items: center;
  width: 30%;
  padding: 10px;
}

.container > section {
  width: 100%;
}

.saveModal .uk-input {
  width: 100%;
  max-width: 100%;
}

.saveModal button {
  margin: 0 auto;
}

.saveModal__ok {
  text-align: center;
}

.bpm {
  font-size: 38px;
  font-weight: bold;
}

h3 span {
  display: block;
  font-size: 13px;
}
</style>
