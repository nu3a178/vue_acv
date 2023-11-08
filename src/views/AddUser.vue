<template>
  <v-app>

    <v-container class="d-flex grey lighten-5" flucom>
      <v-row class="justify-center"><v-col cols="7">
          <v-form>
            <v-card outlined>
              
              
              
              <v-container>
                
                
                <div class="d-flex text-left">氏名</div>
                <v-row class="d-flex align-center"><v-col>
                  <span  class="red--text"  v-if="!nameValidation" >氏名を入力してください。</span>
                    <v-text-field
                    v-model="userInfo.name" outlined dense placeholder="検証 太郎"
                      class="text1"></v-text-field></v-col></v-row>
                <div class="d-flex text-left">所属</div>
                <span class="red--text" v-if="!comValidation" >所属を入力してください。</span>
                <v-select 
                v-model="userInfo.com" :items="comOption" dense
                    outlined></v-select>
                    <div class="textbox" v-if="userInfo.com=='その他(自由入力)'">
                      所属を入力してください。
                      <v-text-field v-model="userInfo.com_input" outlined dense style="width:auto;"></v-text-field>
                    </div>
                  
                    <div class="d-flex text-left">チーム</div>
                <span class="red--text" v-if="!teamValidation" >チームを入力してください。</span>
                <v-select 
                v-model="userInfo.team" :items="teamOption" dense
                    outlined></v-select>
                    <div class="textbox" v-if="userInfo.team=='その他(自由入力)'">
                      チームを入力してください。
                      <v-text-field v-model="userInfo.team_input" outlined dense style="width:auto;"></v-text-field>
                    </div>

                    <v-row class="pa-3" justify="space-around">
          <v-btn x-large elevetion="2">
            クリア
          </v-btn>
          <v-btn @click="callAPI()" x-large elevetion="2">
            登録する
          </v-btn>

          
        </v-row>
              </v-container>
            </v-card></v-form>
        </v-col>
      </v-row>
    </v-container>

  </v-app>
</template>


<script>



export default {
  name: 'AddUser',
  data() {
    return {
      cDate:new Date(),
      uniqueNum:0,
      userInfo: {
        name: new String,
        com: "-",
        com_input:"",
        team :"-",
        team_input:""
      },

      comValidation
       : true,
      nameValidation: true,
      teamValidation: true,
      

      comOption:[
        "-","A社","B社","その他(自由入力)"
    ],
      teamOption:[
        "-",
      "第1チーム",
        "第2チーム",
        "第3チーム",
        "その他(自由入力)"
      ]
    }
  },

  methods: {
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


     callAPI:function(){
                //各入力フォームの入力値を、半角、全角スペースを消してローカル変数に格納する。
                let com = this.userInfo.com.toString().replace(/[\u3000]/g," ").replace(/ /g,"")
                let name= this.userInfo.name.toString().replace(/[\u3000]/g," ").replace(/ /g,"")
                let team = this.userInfo.team
                let team_input = this.userInfo.team_input.toString().replace(/[\u3000]/g," ").replace(/ /g,"")
                let com_input = this.userInfo.com_input.toString().replace(/[\u3000]/g," ").replace(/ /g,"")
                

                if(com=="-"||com==""){
                  this.comValidation= false
                  this.userInfo.com=""
                }else{
                  this.comValidation= true
                }

                if(name==""){
                  this.nameValidation = false
                  this.userInfo.name=""
                }else{
                  this.nameValidation = true
                }

                if(team=="-"||team==""){
                  this.teamValidation = false
                  this.userInfo.team =""
                }else{
                  this.teamValidation = true
                }
                
                //20230131追加：所属、チームの自由入力欄追加に伴う検証ロジック
                if(team=="その他(自由入力)"){
                  if(team_input==""){
                    this.teamValidation = false
                }else{
                  team = team_input
                }
              }
                  
              if(com=="その他(自由入力)"){
                  if(com_input==""){
                    this.comValidation = false
                }else{
                  com = com_input
                }
              }

                console.log(this.comValidation
                +this.nameValidation+this.teamValidation)

                if(!(this.comValidation
                &&this.nameValidation&&this.teamValidation)){
                  alert("未入力項目があります。")
                  return
                }
                
                var date = this.convertDateToYMD(this.cDate)
                var ID  = date +"_" +(new Date().getTime() % 10000000).toString(16)

                // ヘッダーオブジェクト生成
                var myHeaders = new Headers();
                // APIゲートウェイたたく時のお決まり文
                myHeaders.append("Content-Type", "application/json");
                // JSONセット用データ
                //var raw = JSON.stringify({"com":com,"firstName":firstName,"lastName":lastName});
                //lambdaに渡すオブジェクトデータは必ずJSON.stringify()を通さないといけない
                var raw = JSON.stringify({"ID":ID,"com":com,"name":name,"team":team});
                console.log(raw);
                
                // // リクエスト情報
                
                // var t = this
                // var requestOptions = {
                //     method: 'POST',
                //     headers: myHeaders,
                //     body: raw,
                //     redirect: 'follow'
                // };

                // console.log(requestOptions)
                // // フェッチ（API起動）
                // fetch("", requestOptions)
                // .then(function(response){
                //   alert("ユーザ登録が完了しました。")
                //   console.log(response)
                //   return 
                // }
                //   ).then(function(){
                //     t.$router.push('/')
                    
                //   })
    
                // .catch(error => console.log('error', error))

                
            }
            

},
mounted(){
this.uniqueNum = this.$route.params.uniqueNum
}

}
</script>

<style>
.card {
  height: 100px;
  width: 100px
}
</style>