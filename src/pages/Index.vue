<template>
  <q-page class="flex flex-center">
    <!-- 10連勝大獎 overlay -->
    <transition name="perfect-fade">
      <div v-if="showPerfect" class="perfect-overlay" @click="showPerfect = false">
        <div ref="perfectCapture" class="perfect-box animated zoomIn" @click.stop>
          <div class="perfect-stars">★★★</div>
          <div class="perfect-text">{{ $t('perfect streak') }}</div>
          <div class="perfect-stars">★★★</div>
          <div class="perfect-time">{{ $t('elapsed time', { sec: elapsedTime }) }}</div>
          <div class="perfect-best" v-if="bestRecord !== null">{{ $t('best record', { sec: bestRecord }) }}</div>
          <q-btn
            class="perfect-download-btn perfect-download-skip"
            color="brown-8"
            outline
            rounded
            unelevated
            icon="download"
            :loading="perfectDownloadBusy"
            :label="$t('download perfect png')"
            @click="downloadPerfectPng"
          />
        </div>
      </div>
    </transition>

    <q-card id="main" :class="{ 'flashcard-bg': mode === 'flashcard', 'mc-card': mode === 'multiple-choice' }" padding v-touch-swipe.mouse="handleSwipe" @click="mode === 'flashcard' ? flip() : null">
      <q-card-section v-if="mode=='flashcard'" class="flex flex-center column full-height">
        <div class="face-label">{{ s === 0 ? $t('question') : $t('answer') }}</div>
        <transition-group appear enter-active-class="animated flipInY"
    leave-active-class="animated flipOutY" :duration="500">
          <h3 class="question-text" :key="1" v-show="s == 0 && op != '÷' && op != 'gcd'">{{ n1 }} {{ op }} {{ n2 }}</h3>
          <h3 class="question-text" :key="2" v-show="s == 0 && op == '÷'">{{ n1 * n2 }} {{ op }} {{ n2 }}</h3>
          <h3 class="question-text" :key="3" v-show="s == 0 && op == 'gcd'">gcd({{ n1 }}, {{ n2 }})</h3>
          <h1 class="answer-text" :key="4" v-show="s == 1">{{ ans }}</h1>
        </transition-group>
        <p v-if="s == 0" class="hint">{{ $t('tap to reveal') }}</p>
      </q-card-section>

      <q-card-section v-if="mode=='quiz'" class="quiz-section">
        <!-- Progress bar -->
        <div class="streak-progress-wrap">
          <q-linear-progress
            :value="winStreak / 10"
            color="orange"
            track-color="orange-1"
            rounded
            size="14px"
            class="streak-progress"
          />
          <div class="streak-progress-label">
            <q-icon name="local_fire_department" size="16px" color="orange" />
            {{ winStreak }} / 10
          </div>
        </div>

        <div class="quiz-layout">
          <div class="quiz-question">
            <h3 v-show="s == 0">
              <span v-if="op === '÷'">{{ n1 * n2 }} {{ op }} {{ n2 }}</span>
              <span v-else-if="op === 'gcd'">gcd({{ n1 }}, {{ n2 }})</span>
              <span v-else>{{ n1 }} {{ op }} {{ n2 }}</span>
            </h3>
            <h1 v-show="s == 1">{{ ans }}</h1>
            <p v-if="s == 1" class="swipe-hint">{{ $t('swipe hint') }}</p>
          </div>
          <div v-if="winStreak > 0" class="streak-badge">
            <q-icon name="local_fire_department" size="20px" />
            <span>{{ winStreak }}</span>
          </div>
          <div class="quiz-actions">
            <q-input
              ref="answerInput"
              class="quiz-input"
              v-show="s === 0"
              v-model="myAns"
              :label="$t('enter your answer')"
              outlined
              rounded
              @keyup.enter.native="test()"
            />
            <q-btn
              class="quiz-btn"
              :size="'xl'"
              color="primary"
              @click="test()"
              rounded
              unelevated
            >
              {{ s === 0 ? $t('test') : $t('next') }}
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- 選擇題模式 -->
      <q-card-section v-if="mode=='multiple-choice'" class="mc-section" @click.stop>
        <!-- Progress bar -->
        <div class="streak-progress-wrap">
          <q-linear-progress
            :value="winStreak / 10"
            color="deep-purple"
            track-color="deep-purple-1"
            rounded
            size="14px"
            class="streak-progress"
          />
          <div class="streak-progress-label mc-streak-label">
            <q-icon name="local_fire_department" size="16px" color="red" />
            {{ winStreak }} / 10
          </div>
        </div>

        <div class="mc-layout">
          <!-- 題目 -->
          <div class="mc-question">
            <h3>
              <span v-if="op === '÷'">{{ n1 * n2 }} {{ op }} {{ n2 }}</span>
              <span v-else-if="op === 'gcd'">gcd({{ n1 }}, {{ n2 }})</span>
              <span v-else>{{ n1 }} {{ op }} {{ n2 }}</span>
            </h3>
            <p class="mc-hint">{{ $t('choose your answer') }}</p>
          </div>

          <!-- 連勝徽章 -->
          <div v-if="winStreak > 0" class="streak-badge mc-badge">
            <q-icon name="local_fire_department" size="20px" color="red" />
            <span>{{ winStreak }}</span>
          </div>

          <!-- 四個選項 -->
          <div class="mc-choices">
            <q-btn
              v-for="(choice, idx) in mcChoices"
              :key="idx"
              class="mc-choice-btn"
              :color="mcAnswered ? (choice === ans ? 'positive' : (choice === mcSelected ? 'negative' : 'grey-4')) : 'white'"
              :text-color="mcAnswered ? (choice === ans ? 'white' : (choice === mcSelected ? 'white' : 'grey-8')) : 'grey-9'"
              :outline="!mcAnswered"
              unelevated
              rounded
              :disable="mcAnswered"
              @click="selectMcAnswer(choice)"
            >
              <span class="mc-choice-label">{{ choice }}</span>
              <q-icon v-if="mcAnswered && choice === ans" name="check_circle" class="q-ml-sm" />
              <q-icon v-if="mcAnswered && choice === mcSelected && choice !== ans" name="cancel" class="q-ml-sm" />
            </q-btn>
          </div>

          <!-- 答完之後的下一題按鈕 -->
          <q-btn
            v-if="mcAnswered"
            class="mc-next-btn"
            color="deep-purple"
            rounded
            unelevated
            size="lg"
            @click="mcNext()"
          >
            {{ $t('next') }}
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'PageIndex',
  props: ['op', 'max1', 'max2', 'mode', 'resetOnWrong'],
  data () {
    return {
      n1: 3,
      n2: 5,
      ans: null,
      s: 0,
      myAns: null,
      winStreak: 0,
      showPerfect: false,
      streakStartTime: null,
      elapsedTime: null,
      bestRecord: null,
      perfectDownloadBusy: false,
      // 選擇題相關
      mcChoices: [],
      mcSelected: null,
      mcAnswered: false
    }
  },
  mounted () {
    if (this.mode === 'quiz') {
      this.$nextTick(() => { this.$refs.answerInput && this.$refs.answerInput.focus() })
    }
    if (this.mode === 'multiple-choice') {
      this.initMc()
    }
    var stored = localStorage.getItem('q-flashcard-best-streak')
    if (stored !== null) this.bestRecord = parseFloat(stored)
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  watch: {
    mode (newMode) {
      if (newMode === 'multiple-choice') {
        this.winStreak = 0
        this.streakStartTime = null
        this.n1 = Math.floor(Math.random() * this.max1 + 1)
        this.n2 = Math.floor(Math.random() * this.max2 + 1)
        this.initMc()
      }
    }
  },
  methods: {
    async downloadPerfectPng () {
      const el = this.$refs.perfectCapture
      if (!el || this.perfectDownloadBusy) return
      this.perfectDownloadBusy = true
      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          ignoreElements: (node) => {
            return !!(node.classList && node.classList.contains('perfect-download-skip'))
          }
        })
        await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('toBlob failed'))
              return
            }
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            const sec = this.elapsedTime != null ? String(this.elapsedTime).replace(/\./g, 'p') : 'time'
            a.href = url
            a.download = `q-flashcard-perfect-10-${sec}s.png`
            a.click()
            URL.revokeObjectURL(url)
            resolve()
          }, 'image/png')
        })
        if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message: this.$t('download perfect png done')
          })
        }
      } catch (e) {
        if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'negative',
            position: 'top',
            message: this.$t('download perfect png fail')
          })
        }
      } finally {
        this.perfectDownloadBusy = false
      }
    },
    handleKeydown (e) {
      if (this.showPerfect) return
      if (this.mode === 'flashcard') {
        if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          if (e.key === ' ') e.preventDefault()
          this.flip()
        }
        return
      }
      if (this.mode === 'quiz' && this.s === 1) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault()
          this.test()
        }
      }
      if (this.mode === 'multiple-choice' && this.mcAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault()
          this.mcNext()
        }
      }
    },
    gcd (x, y) {
      if ((typeof x !== 'number') || (typeof y !== 'number')) {
        return false
      }
      x = Math.abs(x)
      y = Math.abs(y)
      while (y) {
        var t = y
        y = x % y
        x = t
      }
      return x
    },
    calcAns () {
      if (this.op === '+') return this.n1 + this.n2
      if (this.op === '-') return this.n1 - this.n2
      if (this.op === '×') return this.n1 * this.n2
      if (this.op === '÷') return this.n1
      if (this.op === 'gcd') return this.gcd(this.n1, this.n2)
      return 0
    },
    generateMcChoices (correctAns) {
      const choices = new Set()
      choices.add(correctAns)
      const spread = Math.max(3, Math.ceil(Math.abs(correctAns) * 0.4))
      let attempts = 0
      while (choices.size < 4 && attempts < 200) {
        attempts++
        const offset = Math.floor(Math.random() * spread * 2) - spread
        if (offset === 0) continue
        choices.add(correctAns + offset)
      }
      let extra = 1
      while (choices.size < 4) {
        if (!choices.has(correctAns + extra)) choices.add(correctAns + extra)
        else if (!choices.has(correctAns - extra)) choices.add(correctAns - extra)
        extra++
      }
      return Array.from(choices).sort(() => Math.random() - 0.5)
    },
    initMc () {
      this.ans = this.calcAns()
      this.mcChoices = this.generateMcChoices(this.ans)
      this.mcSelected = null
      this.mcAnswered = false
    },
    selectMcAnswer (choice) {
      if (this.mcAnswered) return
      this.mcSelected = choice
      this.mcAnswered = true
      if (choice === this.ans) {
        if (this.winStreak === 0) this.streakStartTime = Date.now()
        this.winStreak += 1
        if (this.winStreak >= 10) {
          var elapsed = parseFloat(((Date.now() - this.streakStartTime) / 1000).toFixed(1))
          this.elapsedTime = elapsed
          if (this.bestRecord === null || elapsed < this.bestRecord) {
            this.bestRecord = elapsed
            localStorage.setItem('q-flashcard-best-streak', elapsed)
          }
          this.showPerfect = true
          this.winStreak = 0
        } else if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            timeout: 500,
            message: this.$t('mc.correct'),
            caption: this.$t('quiz.streakCaption', { count: this.winStreak })
          })
        }
      } else {
        if (this.resetOnWrong) {
          this.winStreak = 0
          this.streakStartTime = null
        }
        if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'negative',
            position: 'top',
            timeout: 1500,
            message: this.$t('mc.wrong', { ans: this.ans })
          })
        }
      }
    },
    mcNext () {
      this.n1 = Math.floor(Math.random() * this.max1 + 1)
      this.n2 = Math.floor(Math.random() * this.max2 + 1)
      this.initMc()
    },
    test () {
      if (this.op === '+') {
        this.ans = this.n1 + this.n2
      }
      if (this.op === '-') {
        this.ans = this.n1 - this.n2
      }
      if (this.op === '×') {
        this.ans = this.n1 * this.n2
      }
      if (this.op === '÷') {
        this.ans = this.n1
      }
      if (this.op === 'gcd') {
        this.ans = this.gcd(this.n1, this.n2)
      }
      if (this.s === 0) {
        if (this.myAns === null || String(this.myAns).trim() === '') return
        console.log(this.ans)
        console.log(parseInt(this.myAns))
        if (parseInt(this.myAns) === this.ans) {
          this.s = 1
          this.myAns = null
          if (this.winStreak === 0) this.streakStartTime = Date.now()
          this.winStreak += 1
          if (this.winStreak >= 10) {
            var elapsed = parseFloat(((Date.now() - this.streakStartTime) / 1000).toFixed(1))
            this.elapsedTime = elapsed
            if (this.bestRecord === null || elapsed < this.bestRecord) {
              this.bestRecord = elapsed
              localStorage.setItem('q-flashcard-best-streak', elapsed)
            }
            this.showPerfect = true
            this.winStreak = 0
          } else if (this.$q && this.$q.notify) {
            this.$q.notify({
              type: 'positive',
              position: 'top',
              timeout: 500,
              message: this.$t('quiz.correctMessage'),
              caption: this.$t('quiz.streakCaption', { count: this.winStreak })
            })
          }
        } else {
          if (this.resetOnWrong) {
            this.winStreak = 0
            this.streakStartTime = null
          }
          this.myAns = null
          this.$q.notify({
            type: 'negative',
            position: 'top',
            message: this.$t('wrong')
          })
        }
      } else {
        this.s = 0
        this.n1 = Math.floor(Math.random() * this.max1 + 1)
        this.n2 = Math.floor(Math.random() * this.max2 + 1)
        this.$nextTick(() => { this.$refs.answerInput && this.$refs.answerInput.focus() })
      }
    },
    handleSwipe (details) {
      var dir = details.direction
      if (this.mode === 'quiz') {
        if (this.s === 1 && dir === 'left') {
          this.test()
        }
        return
      }
      if (this.mode === 'multiple-choice') {
        if (this.mcAnswered && dir === 'left') {
          this.mcNext()
        }
        return
      }
      if (this.s === 0 && (dir === 'left' || dir === 'up')) {
        this.flip()
      }
      if (this.s === 1 && (dir === 'right' || dir === 'down')) {
        this.flip()
      }
    },
    flip () {
      if (this.mode === 'quiz') {
        return
      }
      if (this.s === 0) {
        this.s += 1
        if (this.op === '+') {
          this.ans = this.n1 + this.n2
        }
        if (this.op === '-') {
          this.ans = this.n1 - this.n2
        }
        if (this.op === '×') {
          this.ans = this.n1 * this.n2
        }
        if (this.op === '÷') {
          this.ans = this.n1
        }
        if (this.op === 'gcd') {
          this.ans = this.gcd(this.n1, this.n2)
        }
      } else {
        this.s = 0
        this.n1 = Math.floor(Math.random() * this.max1 + 1)
        this.n2 = Math.floor(Math.random() * this.max2 + 1)
      }
    }
  }
}
</script>

<style type="text/css" scoped="">
  #main {
    cursor: pointer;
    width: 66vw;
    text-align: center;
    max-width: 960px;
    min-height: 360px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    transition: box-shadow 0.2s, transform 0.1s;
  }

  #main:active {
    transform: scale(0.985);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  }

  #main:hover {
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  }

  .flashcard-bg {
    background: linear-gradient(135deg, #e8f4fd 0%, #ffffff 100%);
  }

  .mc-card {
    background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%);
    cursor: default;
  }

  .face-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(0,0,0,0.35);
    margin-bottom: 8px;
  }

  .question-text {
    font-weight: 700;
    font-size: 2.2rem;
  }

  .answer-text {
    color: #2e7d32;
    font-size: 3.5rem;
    font-weight: 700;
  }

  @keyframes pulse-hint {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  .hint {
    font-size: 1.1rem;
    color: rgba(0,0,0,0.4);
    margin-top: 16px;
    animation: pulse-hint 2.5s ease-in-out infinite;
  }

  .swipe-hint {
    font-size: 0.85rem;
    color: rgba(0,0,0,0.35);
    margin-top: 10px;
    animation: pulse-hint 2.5s ease-in-out infinite;
  }

  /* Quiz */
  .quiz-section {
    width: 100%;
  }

  .streak-progress-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .streak-progress {
    flex: 1;
  }

  .streak-progress-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e65100;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .mc-streak-label {
    color: #6a1b9a;
  }

  .quiz-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 100%;
  }

  .quiz-question {
    min-width: 140px;
    text-align: center;
  }

  .streak-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff3e0;
    color: #e65100;
    font-weight: 700;
    font-size: 1rem;
    padding: 4px 14px;
    border-radius: 20px;
    border: 1px solid #ffe0b2;
  }

  .mc-badge {
    background: #f3e5f5;
    color: #6a1b9a;
    border-color: #e1bee7;
  }

  .quiz-actions {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 16px;
    width: 100%;
  }

  .quiz-input {
    flex: 1;
  }

  .quiz-btn {
    min-width: 120px;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .quiz-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }

  .quiz-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }

  /* 選擇題模式 */
  .mc-section {
    width: 100%;
    cursor: default;
  }

  .mc-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .mc-question {
    text-align: center;
  }

  .mc-question h3 {
    font-weight: 700;
    font-size: 2.2rem;
    margin: 0;
  }

  .mc-hint {
    font-size: 0.9rem;
    color: rgba(0,0,0,0.4);
    margin-top: 6px;
    animation: pulse-hint 2.5s ease-in-out infinite;
  }

  .mc-choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    width: 100%;
    max-width: 480px;
  }

  .mc-choice-btn {
    width: 100%;
    font-size: 1.4rem;
    font-weight: 700;
    min-height: 64px;
    border: 2px solid #ce93d8;
    transition: transform 0.12s, box-shadow 0.12s, background 0.2s;
  }

  .mc-choice-btn:not([disabled]):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(106, 27, 154, 0.2);
    border-color: #ab47bc;
  }

  .mc-choice-btn:not([disabled]):active {
    transform: translateY(0);
    box-shadow: none;
  }

  .mc-choice-label {
    font-size: 1.4rem;
    font-weight: 700;
  }

  .mc-next-btn {
    margin-top: 4px;
    min-width: 160px;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .mc-next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(106, 27, 154, 0.3);
  }

  /* 10連勝 overlay */
  .perfect-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
  }

  @keyframes shimmer {
    0%, 100% { text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700; }
    50% { text-shadow: 0 0 40px #ff6f00, 0 0 80px #ff6f00; }
  }

  .perfect-box {
    background: linear-gradient(135deg, #fff9c4, #ffe082, #fff9c4);
    border: 4px solid #ffd700;
    border-radius: 24px;
    padding: 40px 56px;
    text-align: center;
    box-shadow: 0 8px 48px rgba(255, 180, 0, 0.6);
  }

  .perfect-text {
    font-size: 2.4rem;
    font-weight: 900;
    color: #e65100;
    animation: shimmer 1.2s ease-in-out infinite;
    margin: 12px 0;
  }

  .perfect-stars {
    font-size: 2rem;
    color: #ffd700;
    letter-spacing: 8px;
  }

  .perfect-fade-enter-active,
  .perfect-fade-leave-active {
    transition: opacity 0.4s;
  }
  .perfect-fade-enter,
  .perfect-fade-leave-to {
    opacity: 0;
  }

  .perfect-time {
    font-size: 1.2rem;
    color: #5d4037;
    margin-top: 16px;
    font-weight: 600;
  }

  .perfect-best {
    font-size: 1rem;
    color: #795548;
    margin-top: 6px;
  }

  .perfect-download-btn {
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    #main {
      width: 90vw;
      min-height: 260px;
    }

    .quiz-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .quiz-btn {
      width: 100%;
    }

    .perfect-text {
      font-size: 1.8rem;
    }

    .perfect-box {
      padding: 28px 32px;
    }

    .mc-choices {
      gap: 10px;
    }

    .mc-choice-btn {
      min-height: 52px;
    }

    .mc-choice-label {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 480px) {
    #main {
      width: 96vw;
      border-radius: 10px;
    }

    .mc-question h3 {
      font-size: 1.7rem;
    }
  }
</style>
