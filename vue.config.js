const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    proxy: {
      "/api/": {
        target: " https://667g1rjbe1.execute-api.ap-northeast-1.amazonaws.com"
        //https://d1en3085f9.execute-api.ap-northeast-1.amazonaws.com, ←テスト用
      }
    }
  }
})
