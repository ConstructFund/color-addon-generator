import Vue from "vue";
import VueRouter from "vue-router";
import ReplaceColor from "../views/ReplaceColor.vue";
import ColorVariable from "../views/ColorVariable.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/replaceColor" },
  {
    path: "/replaceColor",
    name: "ReplaceColor",
    component: ReplaceColor,
  },
  {
    path: "/colorvariable",
    name: "ColorVariable",
    component: ColorVariable,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
