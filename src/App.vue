<template>
  <div id="app">
    <v-app-bar app height="60px">
    
      <v-btn style="height:100%;" rounded @click="home"><v-icon>mdi-home</v-icon></v-btn>
      予定管理システム
    
    </v-app-bar>
    <div style="height:60px"></div>
    <router-view/>
  </div>
</template>

<script>
export default{
  methods:{
    home:function(){
      this.$router.push("/")
    }
  }
}

</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
  margin-left:auto;
  margin-right:auto;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

</style>
