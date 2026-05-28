import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "偷影子的人",
  description: "你在，春华秋实夏蝉冬雪。",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
