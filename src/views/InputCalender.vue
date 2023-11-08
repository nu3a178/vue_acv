<template>
  <v-app>
    <!--灰色の背景-->
    <v-container class="d-flex justify-center grey lighten-5" fluid>

      <v-card class="pa-3" outlined tile style="height:max-content; width:max-content">

        <!-- 画面トップのユーザ名表示＆入力年月表示部分 start-->
        <div class="text-center text-h4 pa-3">
          [{{ $route.params.name }}]さんの予定を入力します<br>
          <v-btn @click=prevMonth>←</v-btn>

          予定入力：{{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月

          <v-btn @click=nextMonth>→</v-btn>
        </div>
        <!-- 画面トップのユーザ名表示＆入力年月表示部分 end-->


        
        <v-row no-gutters class="justify-center" v-for="r in 16" :key="r">
          <!-- ↑の行で、縦方向のfor繰り返しを定義しており、ここより下の記述が16回繰り返される。-->
          
          <v-col class="justify-center px-2" v-for="n in 2" :key="n" cols="4">
            <!-- ↑の行で、横方向のfor繰り返しを定義しており、ここより下の記述が2回繰り返される。。-->

            <!-- 1日単位のv-card表示部分 start-->
            <v-card style="height:250px; position:relative" class="dayCell text-center pt-1 mb-3" outlined tile
              v-if="((r + (n - 1) * 15) < lastDate + 1) & !(n == 1 & r == 16)">

              <v-card style="height:10px" flat v-bind:color="isHoliday(r + (n - 1) * 15)"></v-card>

              <div class="calender-day pa-2">
                {{ r + (n - 1) * 15 }}日

              </div>
              <div class="d-flex">
                <div class="ma-2" :id="(r + (n - 1) * 15) + '_am'">
                  午前の予定<br>
                  <v-select v-model="$data.schedule_showing[2 * ((r - 1) + ((n - 1) * 15))]" :items="status" dense
                    outlined></v-select>
                </div>

                <div class="ma-2" :id="(r + (n - 1) * 15) + '_pm'">
                  午後の予定<br>
                  <v-select v-model="$data.schedule_showing[2 * ((r - 1) + ((n - 1) * 15)) + 1]" :items="status" dense
                    outlined></v-select>
                </div>
              </div>

              <v-container style="width:100%;">
                <v-row class="d-flex" no-gutters>
                  <v-col class="justify-start align-start">
                    <v-checkbox dense v-model="$data.kansai_showing[(r + (n - 1) * 15) - 1]" label="関西外"></v-checkbox>
                  </v-col>
                  <v-col class="justify-end align-start">
                    <v-menu offset-y :close-on-content-click=false>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn fab small color="grey" dark v-bind="attrs" v-on="on">
                          <v-icon>mdi-comment</v-icon>
                        </v-btn>
                      </template>

                      <div style="background:white">
                        {{ r + (n - 1) * 15 }}日のコメント<br>

                        <v-text-field v-model="$data.comment_showing[(r + (n - 1) * 15) - 1]" outlined
                          dense></v-text-field>

                      </div>
                    </v-menu>
                  </v-col>
                </v-row>
                <div v-if="event_showing[(r + (n - 1) * 15) - 1]" style='position:absolute'>
                 <v-icon>mdi-flag-checkered</v-icon> 
                {{ event_showing[(r + (n - 1) * 15) - 1] }}
                </div>
              </v-container>


            </v-card>
            <!-- 1日単位のv-card表示部分 end-->
            
          </v-col>
          <!-- 横方向の繰り返し end -->
        </v-row>
        <!-- 縦方向の繰り返し end -->

        <!-- フッター表示のための余白 start-->
        <v-row class="pa-4">
        </v-row>
        <!-- フッター表示のための余白 end -->

      </v-card>
    </v-container>

    <!-- フッター start -->
    <v-footer fixed>
      <v-container>
        <v-row class="flex">
          <v-col class="pa-2">
            <v-btn @click=clear x-large elevetion="2">
              クリア
            </v-btn></v-col>


          <v-col class="pa-2">
            <v-btn @click=submit x-large elevetion="2">
              登録する
            </v-btn>
          </v-col>

        </v-row>
      </v-container>
    </v-footer>
    <!-- フッター end -->
  </v-app>

</template>

<script>

/*
表示の仕組み

メイン画面からカレンダー画面に遷移する際、引数でschedule_calenderを渡している。
セレクトボックスは表示用の配列変数「schedule」に紐づいており、ページ読み込み時や年月を変更した際に
schedule_calenderから該当する年月のキー値を読み取り、scheduleに反映している。

例：2023年1月にこのページを読み込んだ時、schedule_calenderからキー名が「202301」のものを抜き出し、
    for文でschedule_showing配列に格納する。
    2023年2月に月を変えた場合、キー名が「202302」のものを抜き出して、schedule_showingに格納する。
    キーが存在しなかった場合は、代わりに"-"をschedule_showingに格納する。
*/
export default {
  name: 'InputCalender',
  data: () => ({

    /**
     * メイン画面から渡されるユーザID。
     * lambda関数を呼ぶ際の引数の一つとして使用する。
     */
    id: new String,

    /**
     * メイン画面から渡されるユーザ名。
     * 画面表示と、lambda関数を呼ぶ際の引数の一つとして使用する。
     */
    name: new String,

    /**
     * 基準年月日。定数として用いる。年月は現在のもの、日は「1」で固定。
     * @type {Date}
     */
    standardDate: new Date().setDate(1),


    /**
     * 現在年月日。初期値はstandardDateと等しい。「←」「→」ボタン押下によって、一か月単位で増減する。
     * @type {Date}
     */
    currentDate: new Date().setDate(1),

    /**
     * 月増減に用いるカウンター。「←」「→」ボタンの押下によって増減する。
     * @type {number}
     */
    counter: 0,


    /**
     * 画面表示と入力兼用のコメント用String配列。
     * 日毎の「コメント」テキストボックスの内容が、この配列に格納される。
     * 
     * @type {String[]}
     */
    comment_showing: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",],

    /**
     * ユーザの全コメント情報を一か月単位で保持するオブジェクト。
     * reloadDateメソッドで、comment_calenderから対応する月のコメント情報がcomment_showingにコピぺされる。
     */
    comment_calender: { 202301: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",] },



    /**
     * 画面表示と入力兼用の予定用String配列。
     * 日毎の「午前/午後の予定」セレクトボックスの内容が、この配列に格納される。
     * 
     * @type {String[]}
     * 
     */
    schedule_showing: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
      "-", "-"],

    /**
     * ユーザの全予定情報を一か月単位で保持するオブジェクト。
     * reloadDateメソッドで、schedule_calenderから対応する月のコメント情報がschedule_showingにコピぺされる。
     */
    schedule_calender: {
      202301: "000000000000000000000000000000000000000000000000000000000000000000000000000"
    },


    /**
     * 画面表示と入力兼用の予定用boolean配列。
     * 日毎の「関西外」チェックボックスの内容が、この配列に格納される。
     * 
     * @type {boolean[]}
     * 
     */
    kansai_showing: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false, false, false],

    /**
    * ユーザの全関西外情報を一か月単位で保持するオブジェクト。
    * reloadDateメソッドで、kansai_calenderから対応する月のコメント情報がkansai_showingにコピぺされる。
    * 
    */
    kansai_calender: { 202301: "0000000000000000000000000000000" },

     /**
     * 画面表示と入力兼用の予定用String配列。
     * 日毎のイベント情報が、この配列に格納される。
     * 
     * @type {String[]}
     * 
     */
    event_showing: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],

        /**
    * イベント情報を一か月単位で保持するオブジェクト。
    * reloadDateメソッドで、event_calenderから対応する月のイベント情報がevent_showingにコピぺされる。
    * 
    */
    event_calender: { 202301: ["1", "2", "3", "4", "5", "6", "7"] },


    /**
     * 「午前/午後の予定」セレクトボックスの内容を定義している配列。
     * 「submit」メソッド内で、予定の文字列を数字一桁に変換する際も、この配列が用いられている。
     */
    status: [
      "-",
      "在宅",
      "有給",
      "社外",
      "休日出勤",
    "多摩"
    ],

    /**
     * 「status」配列をオブジェクトで表したもの。「午前/午後の予定」セレクトボックスには紐づいていない。
     *  convertFlagToSheduleメソッドで、数字一桁から予定の文字列に変換する際に、これを用いる。
     */
    statusMap: {
      0: "-",
      1: "在宅",
      2: "有給",
      3: "社外",
      4:"休日出勤",
      5:"多摩"
    }


  }),

  computed: {
    //lastDate:currentDateの年月の最終日を取得する。
    lastDate: function () {
      var d = this.currentDate
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    },

  },


  methods: {

    isHoliday: function (d) {
      var s = this.currentDate
      var calDay = new Date(s.getFullYear(), s.getMonth(), d).getDay()
      if (calDay == 6) {
        return "blue"
      } else if (calDay == 0) {
        return "red"
      } else {
        return "transparent"
      }
    },

    /**
     * ページ読み込み時や、「←」「→」ボタン押下時にこのメソッドを呼び出し、currentDateを更新する。
     * その後、schedule_calenderオブジェクト内のうち、currentDateと同じ年月をキーに持つプロパティを検索し、
     * その中身であるString配列をschedule_showingに反映させる。
     * comment_calenderとkansai_calenderも、同様の処理をcomment_showingとkansai_showingに行う。
     * @type {void}
     */
    reloadDate: function () {
      var a = new Date(this.standardDate)
      this.currentDate = new Date(a.getFullYear(), a.getMonth() + (this.counter), a.getDate())
      var ym = this.convertDateToYM(this.currentDate)
      console.log(ym)
      this.convertFlagToSchedule(ym)
      if (this.comment_calender[ym] != undefined) {
        this.comment_showing = this.comment_calender[ym]
      } else {
        this.comment_showing = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",]
      }
      if (this.kansai_calender[ym] != undefined) {
        for (var i = 0; i < this.kansai_calender[ym].length; i++) {
          this.kansai_showing[i] = (this.kansai_calender[ym].charAt(i) == "1" ? true : false)
        }
      } else {
        this.kansai_showing = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false, false]
      }
      if (this.event_calender[ym] != undefined) {
        this.event_showing = this.event_calender[ym]
      } else {
        this.event_showing = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",]
      }

      console.log(this.comment_calender)
      console.log(this.comment_showing)

    },

    convertDateToYM: function (d) {
      var month = new String(d.getMonth() + 1)
      if (month.length < 2) {
        month = "0" + month
      }
      var ym = new String(d.getFullYear() + month)
      return ym
    },

    /**
     * schedule_calenderオブジェクトから引数の年月をキーとする要素を抜き出し、schedule_showingに反映させる。
     * @param {string} ym
     */
    convertFlagToSchedule: function (ym) {
      var s = this.schedule_showing
      var val = this.schedule_calender[ym]
      console.log(val)//確認用

      //month_val_calenderに対象のキー名が存在しなかった場合は、62桁の"0"を並べたStringをvalに設定。
      if (val == undefined) {
        val = "00000000000000000000000000000000000000000000000000000000000000"
      }
      //valの各桁の値に応じて、対応したScheduleのパラメータを変更する。
      for (var i = 0; i < val.length; i++) {
        var j = new Number(val.charAt(i))
        s[i] = this.status[j]
      }
    },


    //submit:「登録」ボタン押下時に呼び出される。
    //schedule内の登録情報をひとつの文字列に成形する。
    submit: function () {
      var arr = new Array
      var s = this.schedule_showing
      var scheduleP = new String
      var comment = this.comment_showing
      var kansai = new Array
      var statusMap = this.statusMap

      for (var i = 0; i < this.kansai_showing.length; i++) {
        kansai[i] = (this.kansai_showing[i] ? "1" : "0");
      }
      kansai = kansai.join("",)
      console.log(kansai)
      //月末以降の日付を切り落とす。
      if (this.lastDate == 28) {
        delete s[56]
        delete s[57]
        delete s[58]
        delete s[59]
        delete s[60]
        delete s[61]

      } else if (this.lastDate == 30) {
        delete s[58]
        delete s[59]
        delete s[60]
        delete s[61]
      }
      //schedule配列の各値を数字に変換してarr配列に格納。
      for (i = 0; i < s.length; i++) {
        Object.keys(statusMap).forEach(function (key) {
          if (statusMap[key] == s[i]) {
            arr.push(key)
          }
        })
      }
      //arr配列をjoinでStringにする。
      scheduleP = arr.join("",)

      //JSON形式に整える。
      var raw = JSON.stringify({
        "ID": this.id,
        "name": this.name,
        "month": "#" + (this.convertDateToYM(this.currentDate)),
        "schedule": scheduleP,
        "comments": comment,
        "kansai": kansai
      })
      console.log(raw)

      /*
      // ヘッダーオブジェクト生成
      var myHeaders = new Headers();
      // APIゲートウェイたたく時のお決まり文
      myHeaders.append("Content-Type", "application/json");

      // リクエスト情報
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      // フェッチ（API起動）
      
        fetch("https://667g1rjbe1.execute-api.ap-northeast-1.amazonaws.com/prod/prod/calender_registration", requestOptions)
        .then(response => console.log(response.text()))
        //.then(result => alert(JSON.parse(result).body))
        .then(() => this.$router.push('/'))
        .catch(error => console.log('error', error));
      */


    },


    //clear:「クリア」ボタン押下時に呼び出される。
    //schedule内の各値を「"-"」にする。
    clear: function () {
      var a = new Array
      for (var i = 1; i <= 62; i++) {
        a.push("-")
      }
      this.schedule = Array.from(a)
    },


    allAbsent: function () {
      var a = new Array
      for (var i = 1; i <= 62; i++) {
        a.push("在宅")
      }
      this.schedule = Array.from(a)
    },

    nextMonth: function () {
      this.counter++
      this.reloadDate()
    },

    prevMonth: function () {
      this.counter--
      this.reloadDate()
    }
  },

  //InputCalenderページの読み込み完了時、created内の関数が自動的に呼び出される。
  created() {
    this.id = this.$route.params.id
    this.schedule_calender = this.$route.params.schedule_calender
    this.comment_calender = this.$route.params.comment_calender
    this.kansai_calender = this.$route.params.kansai_calender
    this.event_calender = this.$route.params.event_calender
    console.log(this.comment_calender)
    console.log(this.schedule_calender)
    this.reloadDate()
    // this.getFlagsFromDB(this.convertFlagToSchedule)
  }

}
</script>
<style>

</style>
