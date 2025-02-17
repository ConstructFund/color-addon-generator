<template>
  <div style="height: 100%; width: 100%; display: flex; ">
    <v-layout
      column
      wrap
      align-center
      justify-center
      style="align-self: center; padding-bottom: 250px"
    >
      <h1 style="text-align: center; z-index: 1">
        Color Replace Effect Generator
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
          color="primary"
          dark
          @click="downloadC2Addon"
        >
          Download C2addon
        </v-btn>
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
        src="@/assets/colorReplacer.png"
        contain
        style="width: 290px; height: 433px; position: absolute; align-self: center; justify-self: center; z-index: 0; transform: translate(0, 310px);
        -webkit-mask-image:-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
        mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.85) 40%, rgba(0,0,0,0) 85%);"
      ></v-img>
      <video
        autoplay
        muted
        loop
        style="width: 350px; height: 433px; position: absolute; align-self: center; justify-self: center; z-index: 0; transform: translate(0, -190px);"
      >
        <source src="@/assets/paletteswap.mp4" type="video/mp4" />
      </video>
    </v-layout>
  </div>
</template>

<script>
import JSZip from "jszip";
import saveAs from "../FileSaver";
export default {
  name: "ReplaceColor",
  components: {},
  data: () => ({
    nbColors: 16,
  }),
  methods: {
    generateC2Files() {
      let variables = "";
      let ifelsif = "";
      let params = "";
      const NB_COLORS = this.nbColors;

      for (let i = 0; i < NB_COLORS; i++) {
        variables += `uniform lowp float rsource${i + 1};
uniform lowp float gsource${i + 1};
uniform lowp float bsource${i + 1};
uniform lowp float rdest${i + 1};
uniform lowp float gdest${i + 1};
uniform lowp float bdest${i + 1};
`;
        ifelsif += `if (length(front.rgb - vec3(rsource${i + 1}, gsource${i +
          1}, bsource${i + 1}) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest${i + 1}, gdest${i + 1}, bdest${i + 1}) / 255.0;
	}
	else `;

        params += `
		<param>
			<name>R${i + 1} Source</name>
			<description>Red color to replace, from 0 to 255.</description>
			<type>float</type>
			<initial>0</initial>
			<uniform>rsource${i + 1}</uniform>
		</param>
		<param>
			<name>G${i + 1} Source</name>
			<description>Green color to replace, from 0 to 255.</description>
			<type>float</type>
			<initial>0</initial>
			<uniform>gsource${i + 1}</uniform>
		</param>
		<param>
			<name>B${i + 1} Source</name>
			<description>Blue color to replace, from 0 to 255.</description>
			<type>float</type>
			<initial>0</initial>
			<uniform>bsource${i + 1}</uniform>
		</param>	
		<param>
			<name>R${i + 1} Replace</name>
			<description>Red color to replace with, from 0 to 255.</description>
			<type>float</type>
			<initial>255</initial>
			<uniform>rdest${i + 1}</uniform>
		</param>
		<param>
			<name>G${i + 1} Replace</name>
			<description>Green color to replace with, from 0 to 255.</description>
			<type>float</type>
			<initial>255</initial>
			<uniform>gdest${i + 1}</uniform>
		</param>
		<param>
			<name>B${i + 1} Replace</name>
			<description>Blue color to replace with, from 0 to 255.</description>
			<type>float</type>
			<initial>255</initial>
			<uniform>bdest${i + 1}</uniform>
		</param>`;
      }

      let fx = `/////////////////////////////////////////////////////////
// Replace color effect
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

${variables}
uniform lowp float tolerance;
uniform lowp float intensity;

void main(void)
{
	lowp vec4 front = texture2D(samplerFront, vTex);
    lowp vec4 newColor;
	
	${ifelsif} // no color correspondence
	{
		newColor.rgb = front.rgb;
	}
	newColor.a = front.a;
	
	gl_FragColor = mix(front, newColor, intensity);
}
`;

      let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<c2effect>
	<!-- About -->
	<id>${NB_COLORS}-color-replacer</id>			<!-- Never change the ID.  Change the name instead -->
	<name>${NB_COLORS} color replacer</name>
	<category>Color</category>
	<description>Replace up to ${NB_COLORS} colors in the image.</description>
	<author>Andre Silva (@andreyin) and skymen</author>
	<!-- Settings -->
	<!-- Extend the bounding box for effect processing by a number of pixels to show the edges
		 of effects which go beyond the object edges, e.g. blur and warp. -->
	<extend-box-horizontal>0</extend-box-horizontal>
	<extend-box-vertical>0</extend-box-vertical>
	<!-- Set to true if the background is sampled (samplerBack is referenced at all in the shader) -->
	<blends-background>false</blends-background>
	<!-- Set to true if the background is not sampled at 1:1 with the foreground (e.g. the
		 background texture co-ordinates are modified in some way by the shader, as done
		 by Glass and Lens) -->
	<cross-sampling>false</cross-sampling>
	<!-- Set to true if the shader does not modify the opaque areas of the foreground. In other words
		 any opaque pixels in the original image are output in the same position and still fully opaque.
		 This is used to optimise the front-to-back renderer's depth pass, since it can still write depth
		 and skip overdraw for any objects using only shaders which preserve opaqueness. -->
	<preserves-opaqueness>true</preserves-opaqueness>
	<!-- Set to true if the effect changes over time, e.g. Noise or Warp effects. -->
	<animated>false</animated>

	<!-- Parameters -->
	<parameters>
		<param>
			<name>Intensity</name>
			<description>How much of the effect to apply, from 0 (none) to 1 (all) or beyond.</description>
			<type>percent</type>
			<initial>1</initial>
			<uniform>intensity</uniform>
		</param>
		<param>
			<name>Tolerance</name>
			<description>From 0 to 100. Increase to also replace colors close to the source color.</description>
			<type>percent</type>
			<initial>0.01</initial>
			<uniform>tolerance</uniform>
		</param>
    ${params}
	</parameters>

</c2effect>
`;
      let info = `<?xml version="1.0" encoding="UTF-8"?>
<c2addon>
	<!-- One of: plugin, behavior, effect -->
	<type>effect</type>
	<name>${NB_COLORS}-color-replacer</name>
	<version>1.0</version>
	<author>Andre Silva (@andreyin) and skymen</author>
	<website>https://www.construct.net</website>
	<documentation>https://www.construct.net</documentation>
	<description>Replace up to ${NB_COLORS} colors in the image.</description>
</c2addon>`;
      return { fx, xml, name: `${NB_COLORS}-color-replacer`, info };
    },
    downloadC2Addon() {
      var zip = new JSZip();
      let files = this.generateC2Files();
      let filesFolder = zip.folder("files");
      filesFolder.file(`${files.name}.fx`, files.fx);
      filesFolder.file(`${files.name}.xml`, files.xml);
      zip.file("info.xml", files.info);
      zip.generateAsync({ type: "blob" }).then(function(content) {
        // see FileSaver.js
        saveAs(content, `${files.name}.c2addon`);
      });
    },
    generateC3Files() {
      let variables = "";
      let ifelsif = "";
      let params = "";
      let langParams = "";
      const NB_COLORS = this.nbColors;

      let webGPUVariables = "";
      let webGPUIfElseIf = "";

      for (let i = 0; i < NB_COLORS; i++) {
        variables += `uniform lowp vec3 source${i + 1};
uniform lowp vec3 dest${i + 1};
`;
        ifelsif += `if (length(front.rgb - source${i + 1}) <= tolerance)
	{
		newColor.rgb = dest${i + 1};
	}
	else `;

        webGPUVariables += `source${i + 1} : vec3<f32>,
dest${i + 1} : vec3<f32>,\n`;

        webGPUIfElseIf += `if (length(front.rgb - shaderParams.source${i +
          1}) <= shaderParams.tolerance)
	{
		newColor = shaderParams.dest${i + 1};
	}
	else `;

        params += `,
        {
            "id":"source${i + 1}",
            "type": "color",
            "initial-value":[0,0,0],
            "uniform": "source${i + 1}",
            "c2id": "rsource${i + 1},gsource${i + 1},bsource${i + 1}"
        },
        {
            "id":"dest${i + 1}",
            "type": "color",
            "initial-value":[1,1,1],
            "uniform": "dest${i + 1}",
            "c2id": "rdest${i + 1},gdest${i + 1},bdest${i + 1}"
        }`;
        langParams += `,
        "source${i + 1}": {
          "name": "Source ${i + 1}",
          "desc": "Color to replace."
        },
        "dest${i + 1}": {
          "name": "Replace ${i + 1}",
          "desc": "Color to replace with."
        }`;
      }

      let fx = `/////////////////////////////////////////////////////////
// Replace color effect
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

${variables}
uniform lowp float tolerance;
uniform lowp float intensity;

void main(void)
{
	lowp vec4 front = texture2D(samplerFront, vTex);
    lowp vec4 newColor;
	
	${ifelsif} // no color correspondence
	{
		newColor.rgb = front.rgb;
	}
	newColor.a = front.a;
	
	gl_FragColor = mix(front, newColor, intensity);
}
`;

      let webgl2fx = `#version 300 es
/////////////////////////////////////////////////////////
// Replace color effect
in mediump vec2 vTex;
out lowp vec4 outColor;
uniform lowp sampler2D samplerFront;

${variables}
uniform lowp float tolerance;
uniform lowp float intensity;

void main(void)
{
	lowp vec4 front = texture(samplerFront, vTex);
    lowp vec4 newColor;
	
	${ifelsif} // no color correspondence
	{
		newColor.rgb = front.rgb;
	}
	newColor.a = front.a;
	
	outColor = mix(front, newColor, intensity);
}
`;

      let webgpufx = `
%%FRAGMENTINPUT_STRUCT%%
%%FRAGMENTOUTPUT_STRUCT%%
%%SAMPLERFRONT_BINDING%% var samplerFront : sampler;
%%TEXTUREFRONT_BINDING%% var textureFront : texture_2d<f32>;
struct ShaderParams {
intensity : f32,
tolerance : f32,
${webGPUVariables}
};
%%SHADERPARAMS_BINDING%% var<uniform> shaderParams : ShaderParams;
%%C3_UTILITY_FUNCTIONS%%
@fragment
fn main(input : FragmentInput) -> FragmentOutput
{
var front : vec4<f32> = textureSample(textureFront, samplerFront, input.fragUV);
var newColor : vec3<f32> = vec3(0.0, 0.0, 0.0);
${webGPUIfElseIf} // no color correspondence
{
  newColor = front.rgb;
}
var output : FragmentOutput;
output.color = mix(front, vec4(newColor, front.a), shaderParams.intensity);
return output;
}`;

      let json = `{
	"is-c3-addon": true,
  "sdk-version": 2,
	"type": "effect",
	"name": "${NB_COLORS} color replacer",
	"id": "${NB_COLORS}-color-replacer",
	"version": "2.0.0.0",
	"author": "Andre Silva (@andreyin) and skymen",
	"website": "https://www.construct.net",
	"documentation": "https://www.construct.net",
	"description": "Replace up to ${NB_COLORS} colors in the image.",
  "supported-renderers": ["webgl", "webgl2", "webgpu"],
	"file-list": [
		"lang/en-US.json",
		"addon.json",
		"effect.fx",
    "effect.webgl2.fx",
    "effect.wgsl"
	],
	"category": "color",
	"blends-background": false,
	"cross-sampling": false,
	"preserves-opaqueness": false,
	"animated": false,
	"must-predraw" : false,

	"extend-box": {
		"horizontal": 0,
		"vertical": 0
	},
	
	"parameters": [
        {
            "id":"intensity",
            "type": "percent",
            "initial-value":1,
            "uniform": "intensity",
            "interpolatable": true
        },
        {
            "id":"tolerance",
            "type": "percent",
            "initial-value":0.01,
            "uniform": "tolerance",
            "interpolatable": true
        }${params}
	]
}`;

      let lang = `{
  "languageTag": "en-US",
  "fileDescription": "Strings for the '${NB_COLORS} color replacer' effect.",
  "text": {
    "effects": {
      "${NB_COLORS}-color-replacer": {
        "name": "${NB_COLORS} color replacer",
        "description": "Replace up to ${NB_COLORS} colors in the image.",
        "parameters": {
          "intensity": {
            "name": "Intensity",
            "desc": "How much of the effect to apply, from 0 (none) to 1 (all) or beyond."
          },
          "tolerance": {
            "name": "Tolerance",
            "desc": "From 0 to 100. Increase to also replace colors close to the source color."
          }${langParams}
        }
      }
    }
  }
}`;
      return {
        fx,
        json,
        name: `${NB_COLORS}-color-replacer`,
        lang,
        webgl2fx,
        webgpufx,
      };
    },
    downloadC3Addon() {
      var zip = new JSZip();
      let files = this.generateC3Files();
      let langFolder = zip.folder("lang");
      langFolder.file(`en-US.json`, files.lang);
      zip.file("effect.fx", files.fx);
      zip.file("effect.webgl2.fx", files.webgl2fx);
      zip.file("effect.wgsl", files.webgpufx);
      zip.file("addon.json", files.json);
      zip.generateAsync({ type: "blob" }).then(function(content) {
        // see FileSaver.js
        saveAs(content, `${files.name}.c3addon`);
      });
    },
  },
};
</script>
