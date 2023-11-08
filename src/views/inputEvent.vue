<template>
  <v-app>
    <!--灰色の背景-->
    <v-container class="d-flex justify-center grey lighten-5" fluid>

      <v-card class="pa-3" outlined tile>
        <div class="text-center text-h4 pa-3">
          
          <v-btn @click=prevMonth>←</v-btn>
          
          {{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月のイベント

          <v-btn @click=nextMonth>→</v-btn>
        </div>
        

        <!--各日付のセル-->
        <v-row no-gutters class="justify-center" v-for="r in 16" :key="r">
          <v-col class="justify-center px-2 py-1"  v-for="n in 2" :key="n" cols="4">

            <v-card class="dayCell pa-3 " v-bind:class="isHoliday(r+(n-1)*15)" v-if="((r + (n - 1) * 15) < lastDate + 1) & !(n == 1 & r == 16)"
             style="border:1px solid black !important;">

             {{ r + (n - 1) * 15 }}日<br>

      <v-text-field background-color="white" v-model="$data.event_showing[(r+(n-1)*15)-1]" outlined style="height:auto;width:auto"></v-text-field>
              

            </v-card>
          </v-col>
        </v-row>
        <div style="height:50px"></div>
      </v-card>
    </v-container>
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
  </v-app>

</template>

<script>

export default {
  name: 'inputEvent',
  data: () => ({
    
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
     * 画面表示と入力兼用の、コメント用String配列。
     * 日毎のテキストボックスの内容が、この配列に格納される。
     * 
     * @type {String[]}
     */
    event_showing:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",],

    /**
     * ユーザの全コメント情報を一か月単位で保持するオブジェクト。
     * reloadDateメソッドで、comment_calenderから対応する月のコメント情報がcomment_showingにコピぺされる。
     */
    event_calender:{202301:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",]}


  }),

  computed: {
    /**
     * currentDateとして設定されている年月の最終日を返す。
     * @type {number}
     */
    lastDate: function () {
      var cd = this.currentDate
      var daysofMonth = new Date(cd.getFullYear(),cd.getMonth()+1,0).getDate()
      return daysofMonth
    },
  
  },


  methods: {

    /**
     * v-cardの色分けにこれを用いる。引数dとcurrentDateを合わせたDateオブジェクトのgetDayメソッドで曜日を取得し、
     * それに応じた色のString文字列を返却する。
     *  土曜日：blue lighten-5(水色)
     *  日曜日：pink lighten-5(薄いピンク)
     *  それ以外：transparent (無色)
     * 
     * @param {number} d 
     * @type {String}
     */
    isHoliday: function (d) {
      var s = this.currentDate
      var calDay = new Date(s.getFullYear(), s.getMonth(), d).getDay()
      if (calDay == 6) {
        return "blue lighten-5"
      } else if (calDay == 0) {
        return "pink lighten-5"
      } else {
        return "transparent"
      }
    },

    /**
     * ページ読み込み時や、「←」「→」ボタン押下時にこのメソッドを呼び出し、currentDateを更新する。
     * その後、event_calenderオブジェクト内のうち、currentDateと同じ年月をキーに持つプロパティを検索し、
     * その中身であるString配列をevent_showingに反映させる。
     * @type {void}
     */
    reloadDate: function () {
      var a = new Date(this.standardDate)
      this.currentDate = new Date(a.getFullYear(), a.getMonth() + (this.counter), 1)
      var ym = this.convertDateToYM(this.currentDate)
      console.log(ym)

      if(this.event_calender[ym]!= undefined){
        this.event_showing=this.event_calender[ym]
      }else{
        this.event_showing=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",]
      }
      
      console.log(this.event_calender)
      console.log(this.event_showing)
      
    },

    /**
     * 引数のDateオブジェクトを、年月を示す6桁のStringに変換して返す。
     * @param {Date} d 
     * @type {Stirng}
     */
    convertDateToYM:function(d){
      var month = new String(d.getMonth() + 1)
      if(month.length<2){
        month="0"+month
      }
      var ym = new String(d.getFullYear()+month)
      return ym
    },




    /**
     * 「登録」ボタン押下時、このメソッドを実行する。
     * 
     * 
     */
    submit: function () {
      var eventComment= Array.from(this.event_showing)
      var lastD = new Number(this.lastDate)
      //月末以降の日付を切り落とす。
      eventComment = eventComment.splice(0,lastD)

      //JSON形式に整える。
      var raw = JSON.stringify({
        "ID":"event",
        "name":"イベントデータ",
        "month": "#"+(this.convertDateToYM(this.currentDate)) ,
        "comments":eventComment
      })
      console.log(raw)

      
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
                
              
              },
    

    //clear:「クリア」ボタン押下時に呼び出される。
    //schedule内の各値を「"-"」にする。
    clear: function () {
      var a = new Array
      for(var i=1 ; i <= 62; i++){
      a.push("-")}
      this.schedule= Array.from(a)
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
  
  //初期表示時、reloadDateでcurrentDateの初期化とキー値の読み込みを行う。
  created() {
    this.event_calender=this.$route.params.event
    this.reloadDate()
   // this.getFlagsFromDB(this.convertFlagToSchedule)
   
  }

}
</script>
<style>
.dayCell{
  height:200px;
  width:500px;
}

</style>