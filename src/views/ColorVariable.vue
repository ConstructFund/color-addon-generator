<template>
  <div style="height: 100%; width: 100%; display: flex;">
    <v-layout
      column
      wrap
      align-center
      justify-center
      style="align-self: center; padding-bottom: 250px; z-index: 1"
    >
      <h1 style="text-align: center; z-index: 1">
        Color Variable Behavior Generator
      </h1>
      <v-text-field
        name="Number of Colors"
        label="Number of Colors"
        v-model="nbColors"
        type="number"
        outlined
        style="width: 200px; z-index: 1"
      ></v-text-field>
      <v-layout
        row
        wrap
        justify-space-around
        align-center
        style="align-items: center; width: 35%; z-index: 1"
      >
        <v-btn
          style="margin-bottom: 10px"
          color="error"
          dark
          @click="downloadC3Addon"
        >
          Download C3addon
        </v-btn>
      </v-layout>
      <v-img
        src="@/assets/colorVariable.png"
        contain
        style="width: 290px; height: 196px; position: absolute; align-self: center; justify-self: center; z-index: 0; transform: translate(0, 195px);"
      ></v-img>
    </v-layout>
  </div>
</template>

<script>
import JSZip from "jszip";
import saveAs from "../FileSaver";
export default {
  name: "ColorVariable",
  components: {},
  data: () => ({
    nbColors: 4,
  }),
  methods: {
    replaceContent(content, replaceMap) {
      replaceMap.forEach((token) => {
        content = content.replaceAll(token.name, token.value);
      });
      return content;
    },
    createZipFileRecursive(zip, files, replaceMap) {
      Object.keys(files).forEach((fileKey) => {
        let file = files[fileKey];
        if (file.type === "file") {
          zip.file(file.name, this.replaceContent(file.content, replaceMap));
        } else if (file.type === "folder") {
          let folder = zip.folder(file.name);
          this.createZipFileRecursive(folder, file.children, replaceMap);
        }
      });
    },
    generateC3Files() {
      let jsonParams = "";
      const NB_COLORS = this.nbColors;

      for (let i = 0; i < NB_COLORS; i++) {
        jsonParams += `
          "p_col${i}": {
            "name": "Color ${i}",
            "desc": "Color variable #${i}"
          }`;
        if (i + 1 < NB_COLORS) jsonParams += ",";
      }

      let files = {
        aces: {
          type: "file",
          name: "aces.json",
          content: require("../addon/colorVariable/aces.txt").default,
        },
        addon: {
          type: "file",
          name: "addon.json",
          content: require("../addon/colorVariable/addon.txt").default,
        },
        behavior: {
          type: "file",
          name: "behavior.js",
          content: require("../addon/colorVariable/behavior.txt").default,
        },
        icon: {
          type: "file",
          name: "icon.svg",
          content: require("../addon/colorVariable/icon.txt").default,
        },
        instance: {
          type: "file",
          name: "instance.js",
          content: require("../addon/colorVariable/instance.txt").default,
        },
        type: {
          type: "file",
          name: "type.js",
          content: require("../addon/colorVariable/type.txt").default,
        },
        lang: {
          type: "folder",
          name: "lang",
          children: {
            type: {
              type: "file",
              name: "en-US.json",
              content: require("../addon/colorVariable/lang/en-US.txt").default,
            },
          },
        },
        c3runtime: {
          type: "folder",
          name: "c3runtime",
          children: {
            actions: {
              type: "file",
              name: "actions.js",
              content: require("../addon/colorVariable/c3runtime/actions.txt")
                .default,
            },
            behavior: {
              type: "file",
              name: "behavior.js",
              content: require("../addon/colorVariable/c3runtime/behavior.txt")
                .default,
            },
            conditions: {
              type: "file",
              name: "conditions.js",
              content: require("../addon/colorVariable/c3runtime/conditions.txt")
                .default,
            },
            expressions: {
              type: "file",
              name: "expressions.js",
              content: require("../addon/colorVariable/c3runtime/expressions.txt")
                .default,
            },
            instance: {
              type: "file",
              name: "instance.js",
              content: require("../addon/colorVariable/c3runtime/instance.txt")
                .default,
            },
            type: {
              type: "file",
              name: "type.js",
              content: require("../addon/colorVariable/c3runtime/type.txt")
                .default,
            },
          },
        },
      };

      var zip = new JSZip();
      console.log(files);
      this.createZipFileRecursive(zip, files, [
        {
          name: "%%NB_COLORS%%",
          value: NB_COLORS,
        },
        {
          name: "%%PROPERTIES_JSON%%",
          value: jsonParams,
        },
      ]);
      return zip;
    },
    downloadC3Addon() {
      var zip = this.generateC3Files();
      zip.generateAsync({ type: "blob" }).then((content) => {
        // see FileSaver.js
        saveAs(content, `Mitsuhashish_${this.nbColors}ColorVariable.c3addon`);
      });
    },
  },
};
</script>
