<template>
  <div v-if="!loading">
    <div class="header">
      <div class="left">Packet tool</div>
      <form @submit="setInterceptor">
        <select v-model="current.ip">
          <option v-for="(desc, ip) in interfaces" :key="ip" :value="ip">
            [{{ ip }}] {{ desc }}
          </option>
        </select>

        <div class="input">
          <input type="text"
            placeholder="Filter"
            v-model="current.filter">
          <input class="green_btn" type="submit" value="Set">
        </div>
      </form>
    </div>

    <div class="page"
      v-if="buffers.length > 0"
      :class="{ bottomComp: options.dockBottom }"
    >
      <div class="lines">
        <div class="line" v-for="(buf, i) in buffers" :key="i">
          <div class="bufTitle">
            <div class="leftPart">
              <svg viewBox="0 0 100 100"
                @click="toggleSave(buf.UID)"
                v-if="savedList.find((x) => x.UID === buf.UID)">
                <!-- eslint-disable-next-line -->
                <path d="M88,12H62.7V8.8c0-3.5-2.8-6.3-6.3-6.3H43.7c-3.5,0-6.3,2.8-6.3,6.3V12H12c-3.5,0-6.3,2.8-6.3,6.3s2.8,6.3,6.3,6.3h76c3.5,0,6.3-2.8,6.3-6.3S91.5,12,88,12z"/><path d="M17.8,91.8c0.3,3.3,3,5.7,6.3,5.7h51.8c3.3,0,6-2.5,6.3-5.7L88,31H12L17.8,91.8z M62.7,50c0-1.7,1.4-3.2,3.2-3.2c1.7,0,3.2,1.4,3.2,3.2v28.5c0,1.7-1.4,3.2-3.2,3.2c-1.7,0-3.2-1.4-3.2-3.2V50z M46.8,50c0-1.7,1.4-3.2,3.2-3.2c1.7,0,3.2,1.4,3.2,3.2v28.5c0,1.7-1.4,3.2-3.2,3.2c-1.7,0-3.2-1.4-3.2-3.2V50z M31,50c0-1.7,1.4-3.2,3.2-3.2c1.7,0,3.2,1.4,3.2,3.2v28.5c0,1.7-1.4,3.2-3.2,3.2c-1.7,0-3.2-1.4-3.2-3.2V50z"/>
              </svg>
              <svg viewBox="0 0 100 100"
                @click="toggleSave(buf.UID)"
                v-else>
                <!-- eslint-disable-next-line -->
                <path d="M42.65491,13.301H53.20117a.44464.44464,0,0,1,.44464.44464V30.01257a.4447.4447,0,0,1-.4447.4447H42.655a.4447.4447,0,0,1-.4447-.4447V13.74567A.44464.44464,0,0,1,42.65491,13.301Z"/><path d="M9.85773,95H90.14227A4.85772,4.85772,0,0,0,95,90.14227V30.49432a4.85773,4.85773,0,0,0-1.42279-3.43493L72.94067,6.42279A4.85752,4.85752,0,0,0,69.50574,5H9.85773A4.85772,4.85772,0,0,0,5,9.85773V90.14227A4.85772,4.85772,0,0,0,9.85773,95ZM79.74579,47.75836a2.5166,2.5166,0,0,1,2.51666,2.5166V83.83044a2.51665,2.51665,0,0,1-2.51666,2.51667H20.25415a2.51664,2.51664,0,0,1-2.5166-2.51667V50.275a2.51659,2.51659,0,0,1,2.5166-2.5166ZM17.55005,10.93475A1.93474,1.93474,0,0,1,19.4848,9H60.5152A1.93474,1.93474,0,0,1,62.45,10.93475V32.82361a1.93474,1.93474,0,0,1-1.93475,1.93475H19.4848a1.93474,1.93474,0,0,1-1.93475-1.93475Z"/>
              </svg>

              <input type="text"
                v-model="buf.title"
                placeholder="Titre"
                @input="savedList = savedList.filter((x) => x.UID !== buf.UID);"
              >
            </div>
            <div class="selector">
              <div @click="setComp(buf, 0)" :class="{
                disabled: comp[0] === buf
              }">Set A</div>
              <div @click="setComp(buf, 1)" :class="{
                disabled: comp[1] === buf
              }">Set B</div>
            </div>
          </div>
          <div class="char"
            v-for="(char, i) in buf.chars"
            :key="char"
            :class="{
              marked: markedI && markedI.includes(i),
            }"
            @click="toggleMark(i)"
          >
            <div class="charIndex">{{ i }}</div>
            <div>{{ char[0] }}</div>
            <div>{{ char[1] }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page bigText" :class="{ bottomComp: options.dockBottom }" v-else>
      Waiting for events...
    </div>

    <div class="compPage" :class="{ bottom: options.dockBottom }">
      <div class="topPage">
        <div class="text">
          Comparing "{{ comp[0] && comp[0].title ? comp[0].title : 'A' }}"
          and "{{ comp[1] && comp[1].title ? comp[1].title : 'B' }}"
        </div>
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 100 100" @click="toggleDock"><path d="M70,19H30A11,11,0,0,0,19,30V70A11,11,0,0,0,30,81H70A11,11,0,0,0,81,70V30A11,11,0,0,0,70,19Zm5,51a5,5,0,0,1-5,5H30a5,5,0,0,1-5-5V30a5,5,0,0,1,5-5H70a5,5,0,0,1,5,5Z"/><circle cx="64" cy="36" r="3" transform="translate(-6.71 55.8) rotate(-45)"/><circle cx="64" cy="50" r="3" transform="translate(-16.61 59.9) rotate(-45)"/><circle cx="64" cy="64" r="3" transform="translate(-26.51 64) rotate(-45)"/></svg>
      </div>
      <div class="line" v-if="comp[0] && comp[1]">
        <div class="charComp"
          v-for="(char, i) in comp[0].chars"
          :key="char"
          :class="{
            changes: (
              !comp[1].chars[i] ||
              char[0] !== comp[1].chars[i][0]
            ),
            marked: markedI && markedI.includes(i),
          }"
          @click="toggleMark(i)"
        >
          <div class="charIndex">{{ i }}</div>
          <div>{{ char[0] }}</div>
          <div>{{ char[1] }}</div>
          <div v-if="comp[1].chars[i]">{{ comp[1].chars[i][0] }}</div>
          <div v-if="comp[1].chars[i]">{{ comp[1].chars[i][1] }}</div>
        </div>
      </div>
    </div>
  </div>

  <loader :animated="true" v-else/>
</template>

<script>
import io from 'socket.io-client';
import loader from './els/loader.vue';

const socket = io('http://localhost:3030');

export default {
  name: 'App',

  components: { loader },

  data: () => ({
    loading: true,

    options: {
      dockBottom: localStorage.getItem('dockBottom') === 'true',
    },

    current: {
      ip: '',
      filter: '',
      started: false,
    },

    markedI: [],

    interfaces: [],
    buffers: [],
    savedList: [],

    comp: [null, null],
  }),

  methods: {
    setInterceptor(e) {
      e.preventDefault();
      localStorage.setItem('lastIp', this.current.ip);
      localStorage.setItem('lastFilter', this.current.filter);
      socket.emit('setInterceptor', this.current.ip, this.current.filter, (rs) => {
        console.log(rs);
      });
    },

    setComp(buf, index) {
      this.comp[index] = buf;
    },

    toggleDock() {
      this.options.dockBottom = !this.options.dockBottom;
      localStorage.setItem('dockBottom', this.options.dockBottom);
    },

    toggleMark(i) {
      if (this.markedI.includes(i)) this.markedI = this.markedI.filter((x) => x !== i);
      else this.markedI.push(i);

      localStorage.setItem('markedIList', JSON.stringify(this.markedI));
    },

    toggleSave(UID) {
      if (this.savedList.find((x) => x.UID === UID)) {
        this.savedList = this.savedList.filter((x) => x.UID !== UID);
      } else this.savedList.unshift(this.buffers.find((x) => x.UID === UID));

      localStorage.setItem('savedList', JSON.stringify(this.savedList));
    },
  },

  mounted() {
    socket.on('current', (current) => {
      this.current = current;
      if (!this.current.ip) this.current.ip = localStorage.getItem('lastIp');
      if (!this.current.filter) this.current.filter = localStorage.getItem('lastFilter');
      this.loading = false;
    });

    socket.on('onData', (data) => {
      this.buffers.unshift({
        UID: (Math.random() * 10 ** 18).toString(36),
        title: '',
        chars: [
          ...Buffer.from(data, 'base64')
            .toString('hex')
            .toUpperCase()
            .match(/.{2}/g)
            .map((m) => ([
              m,
              Buffer.from(m, 'hex')
                .toString('utf8')
                .replace(/[^0-z]/gi, '.'),
            ])),
        ],
      });
      if (this.buffers.length > 50) this.buffers.pop();
    });

    socket.emit('getInterfaces', (rs) => {
      this.interfaces = {};
      rs.forEach((i) => {
        i.addresses.forEach((a) => {
          if (!this.current.ip) this.current.ip = a.addr;
          this.interfaces[a.addr] = i.description;
        });
      });
    });

    try {
      this.markedI = JSON.parse(localStorage.getItem('markedIList'));
    } catch (e) {
      localStorage.setItem('markedIList', '[]');
    }

    try {
      this.savedList = JSON.parse(localStorage.getItem('savedList'));
      this.buffers = [...this.savedList];
    } catch (e) {
      localStorage.setItem('savedList', '[]');
    }

    if (!this.savedList) this.savedList = [];
    if (!this.markedI) this.markedI = [];
    if (!this.buffers) this.buffers = [];
  },
};
</script>

<style>
:root {
  --color1: #34a764;
  --color2: #007cde;
  --red: #e63b3b;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;
  margin: 0;
  background-color: var(--color2);
}

body * {
  color: #e6e6e6;
  font-family: Questrial, Arial, sans-serif;
  transition-duration: 0.1s;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  text-shadow: 0 0 2px #0000002e;
}

::placeholder { color: #d0d0d0 }

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;
  background-color: #1a354d;
}

.header > .left {
  font-size: 27px;
  padding: 0 20px;
  line-height: 150%;
}

.page {
  margin-top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  width: 50%;
}

.page.bottomComp {
  height: calc(100vh - 460px);
  width: 100%;
}

form {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  width: 80%;
}

input, select {
  outline: none;
  background-color: #ffffff1c;
  border-radius: 20px;
  height: 40px;
  padding: 0 15px;
  border: solid 2px #e6e6e6;
  font-size: 16px;
  max-width: 400px;
}

input:focus, select:focus {
  border: solid 2px var(--color1);
}

option {
  color: #3a3d3f;
}

.button,
input[type=submit] {
  background-color: var(--color1);
  cursor: pointer;
  padding: 0 20px;
}

input[type=text] {
  min-width: 200px;
}

.input { display: flex }
.input > * { border-radius: 0 }
.input > *:first-child {
  flex: 1 1 auto;
  width: 100%;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  border-right: 0;
}

.input > *:last-child {
  flex: 0 0 auto;
  padding-left: 15px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.line {
  display: flex;
  column-gap: 2px;
  flex-wrap: wrap;
  row-gap: 10px;
  margin: 10px;
  padding: 15px;
  background-color: #1359c2c2;
  border-radius: 5px;
  box-shadow: 1px 2px 2px #00000015;
}

.bufTitle {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.char, .charComp {
  cursor: pointer;
  width: 20px;
}

.charIndex {
  color: #9b9b9b;
  font-size: 12px;
}

.char:nth-child(1n) * { color: #ffa0fa }
.char:nth-child(2n) * { color: #afb7ff }

.char:nth-child(1n):hover * { color: #00ff55 }
.char:nth-child(2n):hover * { color: #f2ff00 }

.charComp.changes:nth-child(1n) * { color: #00ff55 }
.charComp.changes:nth-child(2n) * { color: #f2ff00 }

.leftPart {
  display: flex;
}

.leftPart > svg {
  fill: #46fffd;
  width: 25px;
  margin: 0 15px 0 5px;
  cursor: pointer;
}

.selector {
  display: flex;
  column-gap: 5px;
}

.selector > * {
  padding: 0 20px;
  line-height: 40px;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 2px 2px 2px #00000021;
}

.selector > :not(.disabled):nth-child(1) { background-color: var(--red) }
.selector > :not(.disabled):nth-child(2) { background-color: var(--color1) }

.selector > :not(.disabled):nth-child(1):hover { background-color: #ff1a1a }
.selector > :not(.disabled):nth-child(2):hover { background-color: #36c270 }

.selector > .disabled {
  background-color: #aaaaaa;
  cursor: not-allowed;
}

.marked {
  background-color: #ffffff1f;
}

.compPage {
  position: fixed;
  z-index: 10;
  background-color: #015496;

  top: 60px;
  left: 50%;
  right: 0;
  bottom: 0;

  border-left: 3px solid #02345e;
}

.compPage.bottom {
  top: calc(100% - 400px);
  left: 0;
  border-left: 0;
}

.topPage {
  background-color: #02345e;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.topPage > .text {
  padding: 10px 20px;
}

.compPage:not(.bottom) > .topPage > svg { transform: rotate(90deg); }
.topPage > svg {
  height: 30px;
  fill: #e5e5e5;
  margin: 4px;
  cursor: pointer;
}

.bigText {
  padding: calc(50vh - 80px) 0;
  font-size: 20px;
}

.bigText.bottomComp {
  padding: calc(25vh - 20px) 0 !important;
}

</style>
