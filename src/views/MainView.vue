<template>
  <v-app>
    <v-container fluid style="height:auto;width:auto">

      <!-- 画面上側の各種ボタン＆イベント表示 start-->
      <v-row no-gutters style="width:1300px; ">

        <!-- ボタン群 start -->
        <v-card class="d-flex justify-start align-end" flat tile style="width:440px; height=100px">


          <v-btn @click="toAdd" fab depressed outlined class="primary"
            color="white"><v-icon>mdi-account-plus</v-icon></v-btn><!-- ユーザ登録画面への遷移ボタン -->

          <v-btn depressed fab class="blue-grey lighten-1 white--text" @click="prevWeek">←</v-btn><!-- 先週ボタン -->
          <v-btn depressed fab class="blue-grey lighten-1 white--text" @click="nextWeek">→</v-btn><!-- 来週ボタン -->

          <v-btn @click="toEvent">event</v-btn><!-- イベント登録画面への遷移ボタン -->


        </v-card>
        <!-- ボタン群 end-->

        <!-- イベント表示 start-->
        <v-card outlined tile class="u-square u-grid" v-for="b in 7" :key="b">
          <v-icon v-if="event_showing[getDateKey(b - 1)]">mdi-flag-checkered</v-icon>
          {{ event_showing[getDateKey(b - 1)] }}
        </v-card>
        <!-- イベント表示 end -->
      </v-row>
      <!-- 画面上側の各種ボタン＆イベント表示 end-->

      <!-- 日付表示 start -->
      <v-row no-gutters style="width:2000px;">

        <v-card flat tile style="width:440px; height:20px">現在の出社率：{{ attendRate }}%</v-card><!-- 行をそろえるための余白 -->

        <v-card class="u-grid d-flex justify-center align-center" style="width:120px;height:50px;" outlined tile
          v-for="l in 7" :key="l"><!-- 7日分のfor繰り返し定義 -->
          {{ insertSlash(getDateKey(l - 1)) }} {{ weekDay[l] }}<!-- 日付の表示 -->
        </v-card>

      </v-row>
      <!-- 日付表示 end -->

      <!-- DynamoDBより取得したユーザデータの全件表示 start -->
      <v-row no-gutters style="width:2000px; " v-for="m in valFromDB.length" :key="m">
        <!-- ↑のv-rowタグ内のv-for文によって、ユーザの件数だけv-rowタグ内の記述が繰り返し描写されます -->

        <!-- ユーザ1件ごとの情報 start -->
        <!-- 予定入力ボタン start -->
        <v-card outlined tile class="u-grid u-square d-flex justify-center align-center" style="width:100px;">
          <v-btn @click="toInput(m)" :id=valFromDB[m-1].ID color="primary" elevation="4" Primary rounded>
            予定入力</v-btn>
        </v-card>
        <!-- 予定入力ボタン end -->

        <!-- 出社ステータス切り替えボタン start -->
        <v-card class="u-grid u-square d-flex justify-center align-center" outlined tile style="width:100px;">
          <v-btn small depressed v-if="valFromDB[m - 1].state == '0'" color="gray" elevation="4" Primary rounded
            @click="changeAttend(m - 1)">退社/在宅</v-btn>
          <v-btn depressed v-if="valFromDB[m - 1].state == '1'" color="orange" elevation="4" Primary rounded
            @click="changeAttend(m - 1)">出社</v-btn>
        </v-card>
        <!-- 出社ステータス切り替えボタン end -->

        <!-- 所属＆チーム名 start -->
        <v-card class="u-grid u-square ma-0" :id="'user_' + (m - 1)" outlined tile>
          <v-list style="height:100%;width:100%;">
            <v-list-item-content class="pa-0 d-flex justify-center" style="min-height:50%;">
              {{
                valFromDB[m - 1].com
              }}
            </v-list-item-content>
            <v-divider class="u-grid"></v-divider>
            <v-list-item-content class=" pa-0 d-flex justify-center " style="min-height:50%;">

              {{
                valFromDB[m - 1].team
              }}

            </v-list-item-content>
          </v-list>
        </v-card>
        <!-- 所属＆チーム名 end -->

        <v-card class="u-grid u-square d-flex justify-center align-center" :id="'user_' + (m - 1)" outlined tile>{{
          valFromDB[m - 1].name
        }}</v-card><!-- ユーザ名 -->


        <!-- 1週間の予定 start -->
        <!-- 1日単位の正方形領域 start-->
        <div class="u-square"  v-for="n in 7" :key="n" style="position:relative">
          <!-- ↑のdivタグ内のv-for文によって、divタグ内の記述が7回繰り返し描写されます -->

          <v-card class="u-div" v-bind:class="isHoliday(new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()+(n-1)))" outlined tile style=" border:1px solid rgb(128 128 128) !important"></v-card><!-- マス目 -->

          <div v-if="valFromDB[m - 1].kansai_showing[getDateKey(n - 1)] == '1'"
            style="position:absolute; top:5px; width:100%">関西外です</div><!-- 関西外情報 -->

          <!-- 土日の色分け(旧式) -->
          <!--
            <div v-if="n == 7" class="u-div pink lighten-5" style="border:1px solid rgb(128 128 128) !important"></div>
          <div v-if="n == 6" class="u-div blue lighten-5" style="border:1px solid rgb(128 128 128) !important"></div>
          -->
          <!-- 予定データの表示 start -->
          <div class="u-div d-flex justify-center align-center">
            {{ getKeyStatus(m, n, 0) }}<br>
            {{ getKeyStatus(m, n, 1) }}
          </div>
          <!-- 予定データの表示 end -->

          <!-- コメントデータの表示 start -->
          <div class="u-square d-flex align-end justify-end"
            style="position:absolute; bottom:5px; height:20px; width:100%;">

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on" style="height:100%;">

                  <v-icon style="height:100%; right:5px;"
                    v-if="valFromDB[m - 1].comment_showing[getDateKey(n - 1)]">mdi-comment</v-icon>
                </div>
              </template>
              {{ valFromDB[m - 1].comment_showing[getDateKey(n - 1)] }}
            </v-tooltip>
          </div>
          <!-- コメントデータの表示 end-->
        </div>
        <!-- 1日単位の正方形領域 end-->

        <!-- 1週間の予定 end -->

        <!-- 表外右側の表示 start -->
        <div style="width:10px;"></div>
        <div style="width:120px; height:120px; position:relative;">

          <p style="top:20px; position:absolute;">休暇総日数:{{ valFromDB[m - 1].hol }}日</p><!-- 休暇総日数 -->

          <v-btn style="left:10px; bottom:5px; position:absolute" @click="deleteUser(m - 1)" class="pink lighten-4" fab
            x-small>
            <v-icon>mdi-trash-can</v-icon></v-btn><!-- 削除ボタン -->
        </div>
        <!-- 表外右側の表示 end -->

      </v-row>
      <!-- ユーザ1件ごとの情報 end -->

      <!-- DynamoDBより取得したユーザデータの全件表示 end-->
    </v-container>
  </v-app>
</template>


<script>

export default {
  name: 'MainView',

  /*スケジュール格納方法
    valFromDB内のmonth_valオブジェクト内に、年月日の8桁をキーとして、午前、午後の予定パラメータ配列を設定する。ex.20230101:[0,0]
  
    スケジュール表示方法
    必要な関数
    getDateKey(m):currentYMDからm日後の年月日8桁を返す関数。
    mは0以上の整数。 

    矢印ボタンを押下することで、currendDateを7日ずつずらす。
  */
  data() {
    return {
      attendRate: 0,

      /**
      * 基準年月日。定数として用いる。現在の日付を初期値とする。
      * @type {Date}
      */
      standardDate: new Date(),


      /**
       * 現在年月日。初期値はstandardDateと等しい。「←」「→」ボタン押下によって、一か月単位で増減する。
       * @type {Date}
       */
      currentDate: new Date(),

      /**
       * イベント
       */
      event_showing: { 20230101: "0" },
      event_calender: { 202301: ["1", "2", "3", "4", "5", "6", "7"] },

      /**
       * オブジェクト型の配列。初期読み込み時、DynamoDBより取得したデータはすべてここに格納される。
       * 配列の一要素ごとにユーザ一人の情報（ユーザＩＤ、氏名、チーム名、所属、スケジュール、コメント、関西外情報、出社情報）
       * が定義されている。
       * そのうち、スケジュール、コメント、関西外情報は、表示用の_showingと、
       * inputCalender画面へ渡す用の_calenderの2種類に分かれている。
       */
      valFromDB: [{

        /**
         * ユーザID。
         */
        ID: "000",

        /**
         * ユーザの氏名。
         */
        name: "test",
        team: "1",
        com: "1",

        /**
         * 表示用のユーザ予定。
         * 予定が一日単位で格納されている。
         * 平文で記述されているプロパティは初期値であり、DBからのデータ読み込み時に上書きされる。
         * @type {Object}
         */
        schedule_showing: {
          20230101: [0, 0], 20230102: [0, 0], 20230103: [0, 0], 20230104: [0, 0], 20230105: [0, 0],
          20230106: [0, 0], 20230107: [0, 0], 20230108: [0, 0], 20230109: [0, 0], 20230110: [0, 0],
          20230111: [0, 0], 20230112: [0, 0], 20230113: [0, 0], 20230114: [0, 0], 20230115: [0, 0],
          20230116: [0, 0], 20230117: [0, 0], 20230118: [0, 0], 20230119: [0, 0], 20230120: [0, 0],
          20230121: [0, 0], 20230122: [0, 0], 20230123: [0, 0], 20230124: [0, 0], 20230125: [0, 0],
          20230126: [0, 0], 20230127: [0, 0], 20230128: [0, 0], 20230129: [0, 0], 20230130: [0, 0],
          20230131: [0, 0],
        },
        schedule_calender: { 202301: "00000000000000000000000000000000000000000000000000000000000000000000000000" },
        
        
        //コメントはデータベースに配列の形で格納する。
        //コメントとスケジュールを１つのプロパティに統合する。
        comment_showing: {
          20230101: "", 20230102: "", 20230103: "", 20230104: "", 20230105: "",
          20230106: "", 20230107: "", 20230108: "", 20230109: "", 20230110: "",
          20230111: "", 20230112: "", 20230113: "", 20230114: "", 20230115: "",
          20230116: "", 20230117: "", 20230118: "", 20230119: "", 20230120: "",
          20230121: "", 20230122: "", 20230123: "", 20230124: "", 20230125: "",
          20230126: "", 20230127: "", 20230128: "", 20230129: "", 20230130: "",
          20230131: "",
        },

        /**
         * inputCalender受け渡し用のユーザコメント。
         * コメントが月単位で格納されている。
         * 平文で記述されているプロパティは初期値であり、DBからのデータ読み込み時に上書きされる。
         */
        comment_calender: { 202301: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] },

        /**
         * ユーザの出社ステータス。
         * 0は在宅/休暇、1は出社を表す。
         */
        state: "0",

        /**
         * 表示用のユーザ関西外情報。
         * 関西外情報が一日単位で格納されている。
         * 平文で記述されているプロパティは初期値であり、DBからのデータ読み込み時に上書きされる。
         */
        kansai_showing: {
          20230101: "0", 20230102: "0", 20230103: "0", 20230104: "0", 20230105: "0",
          20230106: "0", 20230107: "0", 20230108: "0", 20230109: "0", 20230110: "0",
          20230111: "0", 20230112: "0", 20230113: "0", 20230114: "0", 20230115: "0",
          20230116: "0", 20230117: "0", 20230118: "0", 20230119: "0", 20230120: "0",
          20230121: "0", 20230122: "0", 20230123: "0", 20230124: "0", 20230125: "0",
          20230126: "0", 20230127: "0", 20230128: "0", 20230129: "0", 20230130: "0",
          20230131: "0",
        },

        /**
         * inputCalender受け渡し用のユーザ関西外情報。
         * 関西外情報が月単位で格納されている。
         * 平文で記述されているプロパティは初期値であり、DBからのデータ読み込み時に上書きされる。
         */
        kansai_calender: { 202301: "0000000000000000000000000000000" },

        hol: 0
      }],

      status: {
      0: "-",
      1: "在宅",
      2: "有給",
      3: "社外",
      4:"休日出勤",
      5:"多摩"
    },
      weekDay: {
        1: "（月）",
        2: "（火）",
        3: "（水）",
        4: "（木）",
        5: "（金）",
        6: "（土）",
        7: "（日）",
      }

    }
  },

  methods: {

    isHoliday: function (d) {
      console.log(d)
      var calDay = d.getDay()
      if (calDay == 6) {
        return "blue lighten-5"
      } else if (calDay == 0) {
        return "pink lighten-5"
      } else {
        return "transparent"
      }
    },

    insertSlash: function (dateKey) {
      var slashedDate = dateKey.substring(0, 4) + "/" + dateKey.substring(4, 6) + "/" + dateKey.substring(6, 8)
      return slashedDate
    },

    deleteUser: function (m) {
      var userName = this.valFromDB[m].name
      var ID = this.valFromDB[m].ID
      var t = this

      if (window.confirm(userName + "さんの情報を削除します。よろしいですか？")) {
        var myHeaders = new Headers()
        var raw = JSON.stringify({
          "ID": ID
        })
        myHeaders.append("Content-Type", "application/json")
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        }
        fetch("https://667g1rjbe1.execute-api.ap-northeast-1.amazonaws.com/prod/prod/member_delete", requestOptions)
          .then(function () {
            if (!alert("削除が完了しました。")) {
              t.getValFromDB()

            }

          }).catch(function (e) {
            alert("エラーが発生しました。" + e)
          })
      }
    },


    /**
     * @method 
     * 
     * 
     */
    toAdd: function () {
      this.$router.push({
        name: 'add',
        props: true,
      })
    },

    toEvent: function () {
      this.$router.push({
        name: 'event',
        params: {
          "event": this.event_calender
        },
        props: true,

      })
    },
    /**
     * 
     * 引数mでvalFromDB配列内のユーザを指定し、
     * 引数nとgetDateKeyメソッドでそのユーザの持つスケジュール群から任意の日付キーを指定し、
     * 引数oで午前or午後の予定を指定して、その値（数字一桁）を取得する。
     * このようにして取得した数字一桁を予定の文字列に変換し、返り値とする。
     * 予定が存在しなかった場合は、"-"を返す。 
     * @return {String}
     * @param {Number} m 
     * @param {Number} n 
     * @param {Number} o 
     */
    getKeyStatus: function (m, n, o) {
      var t = this
      var keyStatus
      if (t.valFromDB[m - 1].schedule_showing[t.getDateKey(n - 1)] != undefined) {
        keyStatus = t.status[t.valFromDB[m - 1].schedule_showing[t.getDateKey(n - 1)][o]]
      } else {
        keyStatus = "-"
      }
      return keyStatus
    },

    /**
     * currentDateの日付を7日プラスする。
     */
    nextWeek: function () {
      var cd = this.currentDate
      this.currentDate = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate() + 7)
      console.log(cd)
    },

    /**
     * currentDateの日付を7日マイナスする。
     */
    prevWeek: function () {
      var cd = this.currentDate
      this.currentDate = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate() - 7)
      console.log(cd)
    },
    /**
     * currentDate(現在日時)からm日後の日付を引数とした
     * convertDateToYMDメソッドを呼び出し、8桁の文字列(YYYYMMDD)にして返す。
     * 
     * @return {String} 
     * @param {Number} m 
     */
    getDateKey: function (m) {
      var t = this
      var cDate = t.currentDate
      var c = new Date(cDate.getFullYear(), cDate.getMonth(), cDate.getDate() + m)
      var key = t.convertDateToYMD(c)
      // console.log("getDateKeyで以下の文字列を出力しました。",key)

      return key
    },

    /**
     * 引数として渡されたDateオブジェクトを、8桁の文字列(YYYYMMDD)にして返す。
     * @return {String}
     * @param {Date} d 
     */
    convertDateToYMD: function (d) {
      var month = new String(d.getMonth() + 1)
      var day = new String(d.getDate())
      if (month.length < 2) {
        month = "0" + month
      }
      if (day.length < 2) {
        day = "0" + day
      }
      var s = new String(d.getFullYear() + month + day)
      return s
    },


    

    /**
     * dynamoDBのテーブルを全件取得する。
     * こうして取得したデータをユーザごとに分割、オブジェクトとして整形し、それぞれvalFromDB配列に格納する。
     */
    getValFromDB: function () {
      var t = this
      var obj
      var s
      var myHeaders = new Headers()
      myHeaders.append("Content-Type", "application/json")
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      }
      fetch("https://667g1rjbe1.execute-api.ap-northeast-1.amazonaws.com/prod/prod/main_get", requestOptions)
        .then(function (data) {
          console.log("DynamoDBからdataを受け取りました。", data)
          return data.json(); // 読み込むデータをJSONに設定
        })
        .then(function (json) {
          console.log("dataをjsonに変換しました。", json)
          t.valFromDB = new Array()
          console.log("受け取ったデータをローカルに保持します。")
          t.uniqueNum = json.length
          t.attendRate = json[json.length - 1].rate


          //以下、for文でユーザ一人ごとの各種データを整形、valFromDBへ格納する。
          for (var i = 0; i < json.length - 1; i++) {

            //配列の（オブジェクトでない）場合、スキップする。
            if (json[i] instanceof Array) { continue; }

            //ユーザIDが「event」の場合、イベント用の変数のため、ユーザとは別枠で格納する。
            if (json[i].ID.S == "event") {
              /*
              json[i]の持つキーのうち、"C#"で始まるもののみを抜き出し、一日単位でStringをイベント用配列に格納する。
              */
              Object.keys(json[i]).forEach(function (key) {
                if (json[i][key].S != undefined) {
                  if (key.charAt(0) == "C") {
                    var ym = key.replace("C#", "")
                    var arrComment = json[i][key].S.split(",")

                    t.event_calender[ym] = arrComment

                    for (var d = 0; d < arrComment.length; d++) {
                      var date2 = String(d + 1)
                      if (date2.length < 2) {
                        date2 = "0" + date2
                      }
                      var ymd2 = new String(ym + (date2))
                      t.event_showing[ymd2] = arrComment[d]
                    }
                  }
                }
              })
              console.log()
              continue;
            }

            //ユーザ一人分のオブジェクトを、以下の初期値で定義する。
            obj = {
              ID: "00000",
              name: "[未入力]",
              team: "-",
              schedule_showing: { [t.getDateKey(0)]: [0, 0] },
              schedule_calender: {},
              comment_showing: {},
              comment_calender: {},
              state: "0",
              com: "-",
              kansai_showing: {},
              kansai_calender: {},
              hol: 0,
            }


            console.log((i + 1) + "人目の個人データを読み込みます。", JSON.stringify((json[i])))

            /*
            総休暇日数を格納。
            */
            if (json[i].hol != undefined) {
              obj.hol = json[i].hol.N
              delete json[i].hol
            }

            Object.keys(json[i]).forEach(function (key) {


              /*
              一文字目が「#」の項目はスケジュールであるため、schedule_showingとschedule_calenderに整形、格納を行う。
              */
              if (key.charAt(0) == "#") {

                var ym = key.replace("#", "")
                obj.schedule_calender[ym] = json[i][key].S
                console.log("登録済のスケジュールがあります。:" + ym)
                for (var c = 0; 2 * c < json[i][key].S.length; c++) {
                  var date = String(c + 1)
                  if (date.length < 2) {
                    date = "0" + date
                  }
                  var ymd = new String(ym + (date))
                  obj.schedule_showing[ymd] = [json[i][key].S.charAt(2 * c), json[i][key].S.charAt(2 * c + 1)]

                }
                 /*
                一文字目が「C」の項目はコメントであるため、comment_showingとcomment_calenderに整形、格納する。
                 */
                } else if (key.charAt(0) == "C") {
                ym = key.replace("C#", "")
                console.log("登録済のコメントがあります。:" + ym)
                var arrComment = json[i][key].S.split(",")
                obj.comment_calender[ym] = arrComment
                for (var d = 0; d < arrComment.length; d++) {

                  var date2 = String(d + 1)
                  if (date2.length < 2) {
                    date2 = "0" + date2
                  }
                  var ymd2 = new String(ym + (date2))
                  obj.comment_showing[ymd2] = arrComment[d]

                }
                /*
                一文字目が「K」の項目は関西外情報であるため、kansai_showingとkansai_calenderに整形、格納する。
                 */
              } else if (key.charAt(0) == "K") {
                ym = key.replace("K#", "")
                console.log("登録済の関西外情報があります。")
                var strKansai = json[i][key].S
                obj.kansai_calender[ym] = strKansai

                for (d = 0; d < strKansai.length; d++) {

                  date2 = String(d + 1)
                  if (date2.length < 2) {
                    date2 = "0" + date2
                  }
                  ymd2 = new String(ym + (date2))
                  obj.kansai_showing[ymd2] = strKansai.charAt(d)

                }

              } else {

                //その他（氏名など）の項目を格納する。
                s = String(json[i][key].S)
                obj[key] = s
              }
            })

            //上記の上書きを行ったobjをvalFromDB配列にユーザとして追加する。
            console.log("以下の個人データをvalFromDBに格納します。", obj)
            t.valFromDB.push(obj)
          }
          console.log("-----処理終了（以下結果）-----", t.valFromDB)
          return t.valFromDB
        })
        .catch(function (e) {
          alert("予定の取得に失敗しました。log:" + e.message)
        })
    },

    getUserId: function (n) {
      var value = new String
      value = this.valFromDB[n].userId
      return value
    },
    changeAttend: function (n) {
      var state
      this.valFromDB[n].state == "0" ? this.valFromDB[n].state = "1" : this.valFromDB[n].state = "0"
      state = this.valFromDB[n].state
      var myHeaders = new Headers()
      var raw = JSON.stringify({
        "ID": this.valFromDB[n].ID,
        "state": state
      })
      myHeaders.append("Content-Type", "application/json")
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      }
      fetch("https://667g1rjbe1.execute-api.ap-northeast-1.amazonaws.com/prod/prod/state_update", requestOptions)
        .then(function (data) {
          console.log("SUCCESS:ステータスの更新に成功しました。", data)
        })
        .catch(function (e) {
          console.log("FAILED:ステータスの更新に失敗しました。", e.message)
        })
    },
    

    toInput: function (m) {
      var userData = this.valFromDB[m - 1]

      var id = userData.ID
      var name = userData.name
      var schedule_calender = userData.schedule_calender
      var comment_calender = userData.comment_calender
      var kansai_calender = userData.kansai_calender
      var event_calender = this.event_calender

      this.$router.push({
        name: 'input',
        params: {
          'id': id, 'name': name, 'schedule_calender': schedule_calender, 'comment_calender': comment_calender,
          "kansai_calender": kansai_calender,"event_calender":event_calender
        },
        props: true,
      })
    },
    
    testGet: function(){
      var result
      var myHeaders = new Headers()
      myHeaders.append("Content-Type", "application/json")
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      }
      fetch("https://qg05ob5o64.execute-api.ap-northeast-1.amazonaws.com/items", requestOptions)
        .then(function (data) {
          result =data
          console.log("SUCCESS:取得に成功しました。")
          return result.json()
        }).then(function (data){
          console.log(data[0])
          
        })
        .catch(function (e) {
          console.log("FAILED:取得に失敗しました。", e.message)
        })
    },


  },
  mounted() {
    console.log("-----mounted処理開始-----")
    this.testGet()
    //会社のAWS環境がリセットされたため、いったん取得処理はオフ。
    //this.getValFromDB()

    //曜日の調整
    var standardDate = this.standardDate
    this.currentDate = new Date(standardDate.getFullYear(), standardDate.getMonth(), standardDate.getDate() - standardDate.getDay() + 1)
  }



}
</script>

<style>
.u-square {
  height: 120px;
  width: 120px;
}

.u-div {
  height: 100%;
  width: 100%;
  position: absolute;
}

.u-grid {
  border: 1px solid rgb(128 128 128) !important;
}
</style>