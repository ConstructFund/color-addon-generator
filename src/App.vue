<template>
  <v-app style="height: 100%; width: 100%">
    <v-toolbar color="primary" dark>
      <h1 v-if="$vuetify.breakpoint.mdAndUp" style="margin-left: 20px">
        Addon generator
      </h1>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn to="/replacecolor" text>Replace Color</v-btn>
        <v-btn to="/colorvariable" text>Color Variables</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main style="height: 100%; width: 100%">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {},
  data: () => ({}),
};
</script>

<style>
html {
  height: 100%;
  width: 100%;
  overflow: hidden !important;
}
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
