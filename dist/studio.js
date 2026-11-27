import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { getContext } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import * as v from "valibot";
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/utils/defaultAttributes.js
/**
* @file
* @license @lucide/svelte v1.80.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
};
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/utils/mergeClasses.js
/**
* @file
* @license @lucide/svelte v1.80.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* Merges classes into a single string
*
* @param {array} classes
* @returns {string} A string of classes
*/
const mergeClasses = (...classes) => {
	const tokens = /* @__PURE__ */ new Set();
	for (const cls of classes) {
		if (typeof cls !== "string") continue;
		for (const token of cls.split(/\s+/)) if (token) tokens.add(token);
	}
	return [...tokens].join(" ");
};
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/utils/buildLucideIconNode.js
/**
* @file
* @license @lucide/svelte v1.80.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
function isDefined(value) {
	return value !== null && value !== void 0;
}
/**
* Creates a Lucide icon node (an svgson-like format) from a Lucide icon object.
*
* @param icon The icon to build.
* @param params Additional build parameters.
*/
function buildLucideIconNode(icon, params = {}) {
	const attributeNames = params.attributeNames ?? {};
	const getAttributeName = (attributeName) => attributeNames[attributeName] ?? attributeName;
	const viewBoxWidth = icon.size ?? icon.width ?? defaultAttributes["width"];
	const viewBoxHeight = icon.size ?? icon.height ?? defaultAttributes["height"];
	const aliasClassNames = icon.aliases?.filter((alias) => typeof alias === "string" && alias.trim() !== "").map((alias) => `lucide-${alias}`) ?? [];
	const iconClassNames = [...icon.name ? [`lucide-${icon.name}`] : [], ...aliasClassNames];
	const classNamesFromClassName = params.className?.split(" ").filter(Boolean) ?? [];
	const className = params.includeDefaultClasses === false ? mergeClasses(...classNamesFromClassName) : mergeClasses("lucide", ...iconClassNames, ...classNamesFromClassName);
	let calculatedStrokeWidth = params.strokeWidth ?? defaultAttributes["stroke-width"];
	if (params.absoluteStrokeWidth) {
		const scaled = Number(calculatedStrokeWidth) * Number(icon.size ?? icon.width ?? defaultAttributes["width"]) / Number(params.size ?? params.width ?? defaultAttributes["width"]);
		if (Number.isFinite(scaled)) calculatedStrokeWidth = scaled;
	}
	return [
		"svg",
		{
			...Object.entries(defaultAttributes).reduce((attrs, [attrName, value]) => {
				attrs[getAttributeName(attrName)] = value;
				return attrs;
			}, {}),
			..."color" in params && params.color && { [getAttributeName("stroke")]: params.color },
			..."size" in params && isDefined(params.size) && {
				[getAttributeName("width")]: params.size,
				[getAttributeName("height")]: params.size
			},
			..."width" in params && isDefined(params.width) && { [getAttributeName("width")]: params.width },
			..."height" in params && isDefined(params.height) && { [getAttributeName("height")]: params.height },
			[getAttributeName("stroke-width")]: calculatedStrokeWidth,
			...className && { [getAttributeName("class")]: className },
			[getAttributeName("viewBox")]: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
			...params.hasA11yProp === false ? { [getAttributeName("aria-hidden")]: "true" } : {},
			..."attributes" in params && params.attributes
		},
		icon.node.map((child) => {
			const [name, attrs, children] = child;
			const nextAttrs = params.nonScalingStroke ? {
				[getAttributeName("vector-effect")]: "non-scaling-stroke",
				...attrs
			} : attrs;
			return children ? [
				name,
				nextAttrs,
				children
			] : [name, nextAttrs];
		})
	];
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/utils/hasA11yProp.js
/**
* @file
* @license @lucide/svelte v1.80.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* Check if a component has an accessibility prop
*
* @param {object} [props]
* @returns {boolean} Whether the component has an accessibility prop
*/
const hasA11yProp = (props) => {
	if (props == null || typeof props !== "object") return false;
	for (const prop in props) if (Object.prototype.hasOwnProperty.call(props, prop) && (prop.startsWith("aria-") || prop === "role" || prop === "title") && props[prop] != null) return true;
	return false;
};
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/context.js
/**
* @file
* @license @lucide/svelte v1.80.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const LucideContext = Symbol("lucide-context");
const getLucideContext = () => getContext(LucideContext);
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/Icon.svelte
var rest_excludes$34 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"color",
	"size",
	"width",
	"height",
	"strokeWidth",
	"absoluteStrokeWidth",
	"nonScalingStroke",
	"iconNode",
	"icon",
	"class",
	"children"
]);
var root$5 = $.from_svg(`<svg><!><!></svg>`);
function Icon($$anchor, $$props) {
	$.push($$props, true);
	const globalProps = getLucideContext() ?? {};
	const color = $.prop($$props, "color", 19, () => globalProps.color ?? "currentColor"), size = $.prop($$props, "size", 19, () => globalProps.size ?? 24), width = $.prop($$props, "width", 19, size), height = $.prop($$props, "height", 19, size), strokeWidth = $.prop($$props, "strokeWidth", 19, () => globalProps.strokeWidth ?? 2), absoluteStrokeWidth = $.prop($$props, "absoluteStrokeWidth", 19, () => globalProps.absoluteStrokeWidth ?? false), nonScalingStroke = $.prop($$props, "nonScalingStroke", 19, () => globalProps.nonScalingStroke ?? false), iconNode = $.prop($$props, "iconNode", 19, () => []), icon = $.prop($$props, "icon", 19, () => ({
		node: iconNode(),
		aliases: [],
		size: 24
	})), props = $.rest_props($$props, rest_excludes$34);
	const hasAccessibleProp = $.derived(() => Boolean($$props.children) || hasA11yProp(props));
	const $$d = $.derived(() => buildLucideIconNode(icon(), {
		color: color(),
		width: width(),
		height: height(),
		strokeWidth: strokeWidth(),
		absoluteStrokeWidth: absoluteStrokeWidth(),
		nonScalingStroke: nonScalingStroke(),
		className: mergeClasses("lucide-icon", globalProps.class),
		hasA11yProp: $.get(hasAccessibleProp),
		attributes: props
	})), $$array = $.derived(() => $.to_array($.get($$d), 3)), svgAttributes = $.derived(() => $.get($$array)[1]), builtIconNode = $.derived(() => $.fallback($.get($$array)[2], () => [], true));
	const iconAttributes = $.derived(() => ({
		...$.get(svgAttributes),
		class: [...$.get(svgAttributes).class.split(" "), $$props.class]
	}));
	var svg = root$5();
	$.attribute_effect(svg, () => ({ ...$.get(iconAttributes) }));
	var node = $.child(svg);
	$.each(node, 17, () => $.get(builtIconNode), $.index, ($$anchor, $$item) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let tag = () => $.get($$array_1)[0];
		let attrs = () => $.get($$array_1)[1];
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);
		$.element(node_1, tag, true, ($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({ ...attrs() }));
		});
		$.append($$anchor, fragment);
	});
	var node_2 = $.sibling(node);
	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(svg);
	$.append($$anchor, svg);
	$.pop();
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/arrow-left.svelte
const __iconData$33 = {
	"name": "arrow-left",
	"size": 24,
	"node": [["path", { "d": "m12 19-7-7 7-7" }], ["path", { "d": "M19 12H5" }]]
};
__iconData$33.node;
var rest_excludes$33 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Arrow_left($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$33);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$33;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/bot.svelte
const __iconData$32 = {
	"name": "bot",
	"size": 24,
	"node": [
		["path", { "d": "M12 8V4H8" }],
		["rect", {
			"width": "16",
			"height": "12",
			"x": "4",
			"y": "8",
			"rx": "2"
		}],
		["path", { "d": "M2 14h2" }],
		["path", { "d": "M20 14h2" }],
		["path", { "d": "M15 13v2" }],
		["path", { "d": "M9 13v2" }]
	]
};
__iconData$32.node;
var rest_excludes$32 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Bot($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$32);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$32;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/bug.svelte
const __iconData$31 = {
	"name": "bug",
	"size": 24,
	"node": [
		["path", { "d": "M12 20v-9" }],
		["path", { "d": "M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" }],
		["path", { "d": "M14.12 3.88 16 2" }],
		["path", { "d": "M21 21a4 4 0 0 0-3.81-4" }],
		["path", { "d": "M21 5a4 4 0 0 1-3.55 3.97" }],
		["path", { "d": "M22 13h-4" }],
		["path", { "d": "M3 21a4 4 0 0 1 3.81-4" }],
		["path", { "d": "M3 5a4 4 0 0 0 3.55 3.97" }],
		["path", { "d": "M6 13H2" }],
		["path", { "d": "m8 2 1.88 1.88" }],
		["path", { "d": "M9 7.13V6a3 3 0 1 1 6 0v1.13" }]
	]
};
__iconData$31.node;
var rest_excludes$31 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Bug($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$31);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$31;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/check.svelte
const __iconData$30 = {
	"name": "check",
	"size": 24,
	"node": [["path", { "d": "M20 6 9 17l-5-5" }]]
};
__iconData$30.node;
var rest_excludes$30 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Check($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$30);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$30;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/chevron-down.svelte
const __iconData$29 = {
	"name": "chevron-down",
	"size": 24,
	"node": [["path", { "d": "m6 9 6 6 6-6" }]]
};
__iconData$29.node;
var rest_excludes$29 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Chevron_down($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$29);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$29;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/circle-check.svelte
const __iconData$28 = {
	"name": "circle-check",
	"size": 24,
	"node": [["circle", {
		"cx": "12",
		"cy": "12",
		"r": "10"
	}], ["path", { "d": "m16 9-5.5 5.5L8 12" }]],
	"aliases": ["check-circle-2"]
};
__iconData$28.node;
var rest_excludes$28 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Circle_check($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$28);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$28;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/circle-x.svelte
const __iconData$27 = {
	"name": "circle-x",
	"size": 24,
	"node": [
		["circle", {
			"cx": "12",
			"cy": "12",
			"r": "10"
		}],
		["path", { "d": "m15 9-6 6" }],
		["path", { "d": "m9 9 6 6" }]
	],
	"aliases": ["x-circle"]
};
__iconData$27.node;
var rest_excludes$27 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Circle_x($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$27);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$27;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/clock.svelte
const __iconData$26 = {
	"name": "clock",
	"size": 24,
	"node": [["circle", {
		"cx": "12",
		"cy": "12",
		"r": "10"
	}], ["path", { "d": "M12 6v6l4 2" }]]
};
__iconData$26.node;
var rest_excludes$26 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Clock($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$26);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$26;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/crosshair.svelte
const __iconData$25 = {
	"name": "crosshair",
	"size": 24,
	"node": [
		["circle", {
			"cx": "12",
			"cy": "12",
			"r": "10"
		}],
		["line", {
			"x1": "22",
			"x2": "18",
			"y1": "12",
			"y2": "12"
		}],
		["line", {
			"x1": "6",
			"x2": "2",
			"y1": "12",
			"y2": "12"
		}],
		["line", {
			"x1": "12",
			"x2": "12",
			"y1": "6",
			"y2": "2"
		}],
		["line", {
			"x1": "12",
			"x2": "12",
			"y1": "22",
			"y2": "18"
		}]
	]
};
__iconData$25.node;
var rest_excludes$25 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Crosshair($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$25);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$25;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/flame.svelte
const __iconData$24 = {
	"name": "flame",
	"size": 24,
	"node": [["path", { "d": "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" }]]
};
__iconData$24.node;
var rest_excludes$24 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Flame($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$24);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$24;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/grid-3x3.svelte
const __iconData$23 = {
	"name": "grid-3x3",
	"size": 24,
	"node": [
		["rect", {
			"width": "18",
			"height": "18",
			"x": "3",
			"y": "3",
			"rx": "2"
		}],
		["path", { "d": "M3 9h18" }],
		["path", { "d": "M3 15h18" }],
		["path", { "d": "M9 3v18" }],
		["path", { "d": "M15 3v18" }]
	],
	"aliases": ["grid", "grid-3-x-3"]
};
__iconData$23.node;
var rest_excludes$23 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Grid_3x3($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$23);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$23;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/hand.svelte
const __iconData$22 = {
	"name": "hand",
	"size": 24,
	"node": [
		["path", { "d": "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }],
		["path", { "d": "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" }],
		["path", { "d": "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" }],
		["path", { "d": "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" }]
	]
};
__iconData$22.node;
var rest_excludes$22 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Hand($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$22);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$22;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/layers.svelte
const __iconData$21 = {
	"name": "layers",
	"size": 24,
	"node": [
		["path", { "d": "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" }],
		["path", { "d": "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }],
		["path", { "d": "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" }]
	],
	"aliases": ["layers-3"]
};
__iconData$21.node;
var rest_excludes$21 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Layers($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$21);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$21;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/loader-circle.svelte
const __iconData$20 = {
	"name": "loader-circle",
	"size": 24,
	"node": [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]],
	"aliases": ["loader-2"]
};
__iconData$20.node;
var rest_excludes$20 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Loader_circle($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$20);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$20;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/maximize-2.svelte
const __iconData$19 = {
	"name": "maximize-2",
	"size": 24,
	"node": [
		["path", { "d": "M15 3h6v6" }],
		["path", { "d": "m21 3-7 7" }],
		["path", { "d": "m3 21 7-7" }],
		["path", { "d": "M9 21H3v-6" }]
	]
};
__iconData$19.node;
var rest_excludes$19 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Maximize_2($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$19);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$19;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/message-square-plus.svelte
const __iconData$18 = {
	"name": "message-square-plus",
	"size": 24,
	"node": [
		["path", { "d": "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" }],
		["path", { "d": "M12 8v6" }],
		["path", { "d": "M9 11h6" }]
	]
};
__iconData$18.node;
var rest_excludes$18 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Message_square_plus($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$18);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$18;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/moon.svelte
const __iconData$17 = {
	"name": "moon",
	"size": 24,
	"node": [["path", { "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]]
};
__iconData$17.node;
var rest_excludes$17 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Moon($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$17);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$17;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/mouse-pointer-2.svelte
const __iconData$16 = {
	"name": "mouse-pointer-2",
	"size": 24,
	"node": [["path", { "d": "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" }]]
};
__iconData$16.node;
var rest_excludes$16 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Mouse_pointer_2($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$16);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$16;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/palette.svelte
const __iconData$15 = {
	"name": "palette",
	"size": 24,
	"node": [
		["path", { "d": "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" }],
		["circle", {
			"cx": "13.5",
			"cy": "6.5",
			"r": ".5",
			"fill": "currentColor"
		}],
		["circle", {
			"cx": "17.5",
			"cy": "10.5",
			"r": ".5",
			"fill": "currentColor"
		}],
		["circle", {
			"cx": "6.5",
			"cy": "12.5",
			"r": ".5",
			"fill": "currentColor"
		}],
		["circle", {
			"cx": "8.5",
			"cy": "7.5",
			"r": ".5",
			"fill": "currentColor"
		}]
	]
};
__iconData$15.node;
var rest_excludes$15 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Palette($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$15);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$15;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/panel-left-close.svelte
const __iconData$14 = {
	"name": "panel-left-close",
	"size": 24,
	"node": [
		["rect", {
			"width": "18",
			"height": "18",
			"x": "3",
			"y": "3",
			"rx": "2"
		}],
		["path", { "d": "M9 3v18" }],
		["path", { "d": "m16 15-3-3 3-3" }]
	],
	"aliases": ["sidebar-close"]
};
__iconData$14.node;
var rest_excludes$14 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Panel_left_close($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$14);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$14;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/panel-left-open.svelte
const __iconData$13 = {
	"name": "panel-left-open",
	"size": 24,
	"node": [
		["rect", {
			"width": "18",
			"height": "18",
			"x": "3",
			"y": "3",
			"rx": "2"
		}],
		["path", { "d": "M9 3v18" }],
		["path", { "d": "m14 9 3 3-3 3" }]
	],
	"aliases": ["sidebar-open"]
};
__iconData$13.node;
var rest_excludes$13 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Panel_left_open($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$13);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$13;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/pencil.svelte
const __iconData$12 = {
	"name": "pencil",
	"size": 24,
	"node": [["path", { "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }], ["path", { "d": "m15 5 4 4" }]]
};
__iconData$12.node;
var rest_excludes$12 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Pencil($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$12);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$12;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/play.svelte
const __iconData$11 = {
	"name": "play",
	"size": 24,
	"node": [["path", { "d": "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]]
};
__iconData$11.node;
var rest_excludes$11 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Play($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$11);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$11;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/rotate-ccw.svelte
const __iconData$10 = {
	"name": "rotate-ccw",
	"size": 24,
	"node": [["path", { "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { "d": "M3 3v5h5" }]]
};
__iconData$10.node;
var rest_excludes$10 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Rotate_ccw($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$10);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$10;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/search.svelte
const __iconData$9 = {
	"name": "search",
	"size": 24,
	"node": [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
		"cx": "11",
		"cy": "11",
		"r": "8"
	}]]
};
__iconData$9.node;
var rest_excludes$9 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Search($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$9);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$9;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/send.svelte
const __iconData$8 = {
	"name": "send",
	"size": 24,
	"node": [["path", { "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" }], ["path", { "d": "m21.854 2.147-10.94 10.939" }]]
};
__iconData$8.node;
var rest_excludes$8 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Send($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$8);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$8;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/settings.svelte
const __iconData$7 = {
	"name": "settings",
	"size": 24,
	"node": [["path", { "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }], ["circle", {
		"cx": "12",
		"cy": "12",
		"r": "3"
	}]]
};
__iconData$7.node;
var rest_excludes$7 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Settings($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$7);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$7;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/square.svelte
const __iconData$6 = {
	"name": "square",
	"size": 24,
	"node": [["rect", {
		"width": "18",
		"height": "18",
		"x": "3",
		"y": "3",
		"rx": "2"
	}]]
};
__iconData$6.node;
var rest_excludes$6 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Square($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$6);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$6;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/sun.svelte
const __iconData$5 = {
	"name": "sun",
	"size": 24,
	"node": [
		["circle", {
			"cx": "12",
			"cy": "12",
			"r": "4"
		}],
		["path", { "d": "M12 2v2" }],
		["path", { "d": "M12 20v2" }],
		["path", { "d": "m4.93 4.93 1.41 1.41" }],
		["path", { "d": "m17.66 17.66 1.41 1.41" }],
		["path", { "d": "M2 12h2" }],
		["path", { "d": "M20 12h2" }],
		["path", { "d": "m6.34 17.66-1.41 1.41" }],
		["path", { "d": "m19.07 4.93-1.41 1.41" }]
	]
};
__iconData$5.node;
var rest_excludes$5 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Sun($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$5);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$5;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/trash.svelte
const __iconData$4 = {
	"name": "trash",
	"size": 24,
	"node": [
		["path", { "d": "M10 11v6" }],
		["path", { "d": "M14 11v6" }],
		["path", { "d": "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
		["path", { "d": "M3 6h18" }],
		["path", { "d": "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
	],
	"aliases": ["trash-2"]
};
__iconData$4.node;
var rest_excludes$4 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Trash($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$4);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$4;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/triangle-exclamation-point.svelte
const __iconData$3 = {
	"name": "triangle-exclamation-point",
	"size": 24,
	"node": [
		["path", { "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
		["path", { "d": "M12 9v4" }],
		["path", { "d": "M12 17h.01" }]
	],
	"aliases": ["alert-triangle", "triangle-alert"]
};
__iconData$3.node;
var rest_excludes$3 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Triangle_exclamation_point($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$3);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$3;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/x.svelte
const __iconData$2 = {
	"name": "x",
	"size": 24,
	"node": [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]]
};
__iconData$2.node;
var rest_excludes$2 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function X($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$2);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$2;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/zoom-in.svelte
const __iconData$1 = {
	"name": "zoom-in",
	"size": 24,
	"node": [
		["circle", {
			"cx": "11",
			"cy": "11",
			"r": "8"
		}],
		["line", {
			"x1": "21",
			"x2": "16.65",
			"y1": "21",
			"y2": "16.65"
		}],
		["line", {
			"x1": "11",
			"x2": "11",
			"y1": "8",
			"y2": "14"
		}],
		["line", {
			"x1": "8",
			"x2": "14",
			"y1": "11",
			"y2": "11"
		}]
	]
};
__iconData$1.node;
var rest_excludes$1 = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Zoom_in($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes$1);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData$1;
	} }));
}
// node_modules/.pnpm/@lucide+svelte@1.80.0_svelte@5.59.2/node_modules/@lucide/svelte/dist/icons/zoom-out.svelte
const __iconData = {
	"name": "zoom-out",
	"size": 24,
	"node": [
		["circle", {
			"cx": "11",
			"cy": "11",
			"r": "8"
		}],
		["line", {
			"x1": "21",
			"x2": "16.65",
			"y1": "21",
			"y2": "16.65"
		}],
		["line", {
			"x1": "8",
			"x2": "14",
			"y1": "11",
			"y2": "11"
		}]
	]
};
__iconData.node;
var rest_excludes = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Zoom_out($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	Icon($$anchor, $.spread_props(() => props, { get icon() {
		return __iconData;
	} }));
}
// src/core/agent-state.ts
const PROVIDERS = ["claude", "antigravity"];
const EFFORT_LEVELS = [
	"low",
	"medium",
	"high",
	"xhigh",
	"max"
];
const hasEffortSuffix = (model) => {
	if (!model) return false;
	return EFFORT_LEVELS.some((level) => {
		return model.endsWith(`-${level}`);
	});
};
v.object({
	enabled: v.boolean(),
	provider: v.picklist(PROVIDERS),
	model: v.nullable(v.pipe(v.string(), v.maxLength(200))),
	effort: v.nullable(v.picklist(EFFORT_LEVELS))
});
v.strictObject({
	enabled: v.optional(v.boolean()),
	provider: v.optional(v.picklist(PROVIDERS)),
	model: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(200)))),
	effort: v.optional(v.nullable(v.picklist(EFFORT_LEVELS)))
});
const CommentRunSchema = v.object({
	commentId: v.string(),
	runId: v.string(),
	status: v.picklist([
		"queued",
		"running",
		"done",
		"needs_attention",
		"failed",
		"cancelled"
	]),
	summary: v.nullable(v.string()),
	error: v.nullable(v.string()),
	protectedTouched: v.array(v.string()),
	updatedAt: v.string()
});
const QueueRoundSchema = v.object({
	runId: v.string(),
	commentIds: v.array(v.string()),
	createdAt: v.string()
});
const PauseReasonSchema = v.object({
	kind: v.picklist([
		"rate_limit",
		"error",
		"restart"
	]),
	message: v.string(),
	resetsAt: v.nullable(v.number())
});
v.object({
	version: v.literal(1),
	activeRunId: v.nullable(v.string()),
	activeCommentIds: v.array(v.string()),
	queue: v.array(QueueRoundSchema),
	paused: v.nullable(PauseReasonSchema),
	runs: v.record(v.string(), CommentRunSchema)
});
// src/client/AgentSettingsModal.svelte
var root$4 = $.from_html(`<div class="ab-loading-block svelte-1jraqfs" aria-live="polite"><span class="ab-spin svelte-1jraqfs"><!></span> <span>Loading available models…</span></div>`);
var root_1$4 = $.from_html(`<span class="ab-dd-sub svelte-1jraqfs"> </span>`);
var root_2$4 = $.from_html(`<button type="button" role="option"><div class="ab-dd-opt-lines svelte-1jraqfs"><span class="ab-dd-opt-label svelte-1jraqfs"> </span> <span class="ab-dd-opt-id svelte-1jraqfs"> </span></div> <!></button>`);
var root_3$3 = $.from_html(`<div role="listbox" aria-label="Models" class="ab-dd-menu svelte-1jraqfs"><button type="button" role="option"><div class="ab-dd-opt-lines svelte-1jraqfs"><span class="ab-dd-opt-label svelte-1jraqfs">CLI default</span> <span class="ab-dd-opt-id svelte-1jraqfs">Use provider default</span></div> <!></button> <!> <div class="ab-dd-sep svelte-1jraqfs"></div> <button type="button" role="option" class="ab-dd-opt svelte-1jraqfs"><div class="ab-dd-opt-lines svelte-1jraqfs"><span class="ab-dd-opt-label svelte-1jraqfs">Custom…</span> <span class="ab-dd-opt-id svelte-1jraqfs">Enter any model ID manually</span></div></button></div>`);
var root_4$3 = $.from_html(`<div class="ab-dd-wrap svelte-1jraqfs"><button type="button" aria-label="Select model" aria-haspopup="listbox" class="ab-dd-trigger svelte-1jraqfs"><div class="ab-dd-trigger-text svelte-1jraqfs"><span class="ab-dd-primary svelte-1jraqfs"> </span> <!></div> <span><!></span></button> <!></div>`);
var root_5$3 = $.from_html(`<button type="button" class="ab-cancel-btn svelte-1jraqfs">Cancel</button>`);
var root_6$3 = $.from_html(`<div class="ab-custom-row svelte-1jraqfs"><input type="text" aria-label="Custom model id" placeholder="Model id (empty = CLI default)" class="ab-field-input svelte-1jraqfs"/> <button type="button" class="ab-save-btn svelte-1jraqfs">Save</button> <!></div>`);
var root_7$3 = $.from_html(`<button type="button" role="option"><span class="ab-dd-opt-label svelte-1jraqfs"> </span> <!></button>`);
var root_8$3 = $.from_html(`<div role="listbox" aria-label="Effort levels" class="ab-dd-menu svelte-1jraqfs"><button type="button" role="option"><span class="ab-dd-opt-label svelte-1jraqfs">CLI default</span> <!></button> <!></div>`);
var root_9$3 = $.from_html(`<div class="ab-field svelte-1jraqfs"><span class="ab-field-label svelte-1jraqfs">Effort</span> <div class="ab-dd-wrap svelte-1jraqfs"><button type="button" aria-label="Select effort" aria-haspopup="listbox" class="ab-dd-trigger svelte-1jraqfs"><span class="ab-dd-primary svelte-1jraqfs"> </span> <span><!></span></button> <!></div></div>`);
var root_10$3 = $.from_html(`<div class="ab-field svelte-1jraqfs"><span class="ab-field-label svelte-1jraqfs">Model</span> <!></div> <!>`, 1);
var root_11$3 = $.from_html(`<div class="ab-modal-backdrop svelte-1jraqfs"><div role="dialog" aria-modal="true" aria-label="Agent Runner Settings" class="ab-modal svelte-1jraqfs"><div class="ab-modal-head svelte-1jraqfs"><div class="ab-modal-title-wrap svelte-1jraqfs"><!> <h2 class="ab-modal-title svelte-1jraqfs">Agent Runner Settings</h2></div> <button type="button" aria-label="Close settings" class="ab-modal-close svelte-1jraqfs"><!></button></div> <div class="ab-modal-body svelte-1jraqfs"><label class="ab-toggle-row svelte-1jraqfs"><div><p class="ab-field-label svelte-1jraqfs">Enable Agent Runner</p> <p class="ab-field-hint svelte-1jraqfs">Allow sending open comments to a local CLI (off by default).</p></div> <input type="checkbox" class="ab-modal-check svelte-1jraqfs"/></label> <div class="ab-field svelte-1jraqfs"><span class="ab-field-label svelte-1jraqfs">Provider</span> <div class="ab-provider-grid svelte-1jraqfs"><button type="button"><span>Claude Code</span> <span></span></button> <button type="button"><span>Antigravity (agy)</span> <span></span></button></div></div> <!></div></div></div>`);
const $$css$4 = {
	hash: "svelte-1jraqfs",
	code: ".ab-modal-backdrop.svelte-1jraqfs {position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0, 0, 0, 0.55);padding:16px;}.ab-modal.svelte-1jraqfs {width:100%;max-width:420px;border-radius:14px;border:1px solid var(--ab-border);background:var(--ab-surface-solid);color:var(--ab-text);box-shadow:0 24px 60px rgba(0, 0, 0, 0.55);overflow:visible;}.ab-modal-head.svelte-1jraqfs {display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--ab-border-subtle);padding:14px 16px;}.ab-modal-title-wrap.svelte-1jraqfs {display:flex;align-items:center;gap:8px;}.ab-modal-title.svelte-1jraqfs {margin:0;font-size:13px;font-weight:700;}.ab-modal-close.svelte-1jraqfs {display:inline-flex;border:none;border-radius:6px;background:transparent;padding:4px;color:var(--ab-text-muted);cursor:pointer;}.ab-modal-close.svelte-1jraqfs:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-modal-body.svelte-1jraqfs {padding:16px;display:flex;flex-direction:column;gap:14px;}.ab-toggle-row.svelte-1jraqfs {display:flex;align-items:flex-start;justify-content:space-between;gap:12px;cursor:pointer;}.ab-field.svelte-1jraqfs {display:flex;flex-direction:column;gap:6px;}.ab-field-label.svelte-1jraqfs {margin:0;font-size:12px;font-weight:600;color:var(--ab-text);}.ab-field-hint.svelte-1jraqfs {margin:2px 0 0;font-size:11px;color:var(--ab-text-muted);}.ab-modal-check.svelte-1jraqfs {width:16px;height:16px;accent-color:#4f46e5;cursor:pointer;}.ab-provider-grid.svelte-1jraqfs {display:grid;grid-template-columns:1fr 1fr;gap:8px;}.ab-provider-btn.svelte-1jraqfs {display:flex;align-items:center;justify-content:space-between;gap:6px;border:1px solid var(--ab-border);border-radius:8px;background:var(--ab-input-bg);padding:8px 10px;font-size:11.5px;font-weight:500;color:var(--ab-text);cursor:pointer;}.ab-provider-active.svelte-1jraqfs {border-color:#6366f1;background:rgba(99, 102, 241, 0.16);color:var(--ab-accent-text);}.ab-avail-dot.svelte-1jraqfs {width:7px;height:7px;border-radius:9999px;background:#52525b;flex-shrink:0;}.ab-avail-ok.svelte-1jraqfs {background:#10b981;}.ab-loading-block.svelte-1jraqfs {display:flex;align-items:center;justify-content:center;gap:8px;min-height:92px;border-radius:10px;border:1px dashed var(--ab-border);background:var(--ab-input-bg);font-size:12px;color:var(--ab-text-muted);}.ab-dd-wrap.svelte-1jraqfs {position:relative;}.ab-dd-trigger.svelte-1jraqfs {display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:38px;border:1px solid var(--ab-border);border-radius:8px;background:var(--ab-input-bg);padding:6px 10px;text-align:left;color:var(--ab-text);cursor:pointer;}.ab-dd-trigger.svelte-1jraqfs:hover {border-color:#6366f1;}.ab-dd-trigger-text.svelte-1jraqfs {display:flex;flex-direction:column;gap:1px;min-width:0;}.ab-dd-primary.svelte-1jraqfs {font-size:12px;font-weight:600;color:var(--ab-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-dd-sub.svelte-1jraqfs {font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-dd-chev.svelte-1jraqfs {display:inline-flex;color:var(--ab-text-muted);flex-shrink:0;transition:transform 0.15s ease;}.ab-dd-chev-open.svelte-1jraqfs {transform:rotate(180deg);}.ab-dd-menu.svelte-1jraqfs {position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:90;max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;border-radius:10px;border:1px solid var(--ab-border);background:var(--ab-surface-solid);padding:4px;box-shadow:0 18px 40px rgba(0, 0, 0, 0.45);}.ab-dd-opt.svelte-1jraqfs {display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:none;border-radius:7px;background:transparent;padding:7px 9px;text-align:left;color:var(--ab-text);cursor:pointer;}.ab-dd-opt.svelte-1jraqfs:hover {background:var(--ab-hover);}.ab-dd-opt-active.svelte-1jraqfs {background:rgba(99, 102, 241, 0.16);color:var(--ab-accent-text);}.ab-dd-opt-lines.svelte-1jraqfs {display:flex;flex-direction:column;gap:1px;min-width:0;}.ab-dd-opt-label.svelte-1jraqfs {font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-dd-opt-id.svelte-1jraqfs {font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-dd-sep.svelte-1jraqfs {height:1px;margin:3px 4px;background:var(--ab-border-subtle);}.ab-field-input.svelte-1jraqfs {box-sizing:border-box;flex:1;min-width:0;height:36px;border:1px solid var(--ab-border);border-radius:8px;background:var(--ab-input-bg);padding:0 10px;font-size:12px;color:var(--ab-text);}.ab-field-input.svelte-1jraqfs:focus {outline:none;border-color:#6366f1;}.ab-custom-row.svelte-1jraqfs {display:flex;gap:6px;}.ab-save-btn.svelte-1jraqfs {border:none;border-radius:8px;background:#4f46e5;padding:0 12px;font-size:12px;font-weight:600;color:#ffffff;cursor:pointer;}.ab-cancel-btn.svelte-1jraqfs {border:1px solid var(--ab-border);border-radius:8px;background:transparent;padding:0 10px;font-size:12px;font-weight:500;color:var(--ab-text-muted);cursor:pointer;}.ab-cancel-btn.svelte-1jraqfs:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-spin.svelte-1jraqfs {display:inline-flex;\n    animation: svelte-1jraqfs-ab-spin 1s linear infinite;}\n\n  @keyframes svelte-1jraqfs-ab-spin {\n    from {\n      transform: rotate(0deg);\n    }\n    to {\n      transform: rotate(360deg);\n    }\n  }"
};
function AgentSettingsModal($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css$4);
	let models = $.state(null);
	let loadingModels = $.state(false);
	let modelMenuOpen = $.state(false);
	let effortMenuOpen = $.state(false);
	let customModelMode = $.state(false);
	let customModelInput = $.state("");
	let saving = $.state(false);
	const settings = $.derived(() => $$props.agentInfo?.settings);
	const available = $.derived(() => $$props.agentInfo?.available);
	const showEffort = $.derived(() => !hasEffortSuffix($.get(settings)?.model));
	const selectedModelOption = $.derived(() => {
		const id = $.get(settings)?.model;
		if (!id) return null;
		return $.get(models)?.find((m) => {
			return m.id === id;
		}) ?? {
			id,
			label: id
		};
	});
	$.user_effect(() => {
		if (!$$props.open || !$.get(settings)) {
			$.set(modelMenuOpen, false);
			$.set(effortMenuOpen, false);
			return;
		}
		const provider = $.get(settings).provider;
		let active = true;
		$.set(loadingModels, true);
		$.set(modelMenuOpen, false);
		$.set(effortMenuOpen, false);
		$$props.loadModels(provider).then((list) => {
			if (!active) return;
			$.set(models, list, true);
			const current = $.get(settings).model;
			if (current && list && !list.some((m) => {
				return m.id === current;
			})) {
				$.set(customModelMode, true);
				$.set(customModelInput, current, true);
			} else $.set(customModelMode, false);
		}).finally(() => {
			if (active) $.set(loadingModels, false);
		});
		return () => {
			active = false;
		};
	});
	async function applyPatch(patch) {
		$.set(saving, true);
		try {
			await $$props.onupdate(patch);
		} finally {
			$.set(saving, false);
		}
	}
	function handleSelectModel(val) {
		$.set(modelMenuOpen, false);
		if (val === "__custom__") {
			$.set(customModelMode, true);
			$.set(customModelInput, $.get(settings)?.model ?? "", true);
			return;
		}
		$.set(customModelMode, false);
		applyPatch({ model: val });
	}
	function handleCancelCustom() {
		$.set(customModelMode, false);
		$.set(customModelInput, $.get(settings)?.model ?? "", true);
	}
	async function handleSaveCustom() {
		const trimmed = $.get(customModelInput).trim() || null;
		await applyPatch({ model: trimmed });
		if (!trimmed) $.set(customModelMode, false);
	}
	var fragment = $.comment();
	var node = $.first_child(fragment);
	var consequent_11 = ($$anchor) => {
		var div = root_11$3();
		var div_1 = $.child(div);
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		Bot($.child(div_3), {
			size: 16,
			color: "#818cf8"
		});
		$.next(2);
		$.reset(div_3);
		var button = $.sibling(div_3, 2);
		X($.child(button), { size: 15 });
		$.reset(button);
		$.reset(div_2);
		var div_4 = $.sibling(div_2, 2);
		var label = $.child(div_4);
		var input = $.sibling($.child(label), 2);
		$.remove_input_defaults(input);
		$.reset(label);
		var div_5 = $.sibling(label, 2);
		var div_6 = $.sibling($.child(div_5), 2);
		var button_1 = $.child(div_6);
		let classes;
		var span = $.sibling($.child(button_1), 2);
		let classes_1;
		$.reset(button_1);
		var button_2 = $.sibling(button_1, 2);
		let classes_2;
		var span_1 = $.sibling($.child(button_2), 2);
		let classes_3;
		$.reset(button_2);
		$.reset(div_6);
		$.reset(div_5);
		var node_3 = $.sibling(div_5, 2);
		var consequent = ($$anchor) => {
			var div_7 = root$4();
			var span_2 = $.child(div_7);
			Loader_circle($.child(span_2), {
				size: 15,
				color: "#818cf8"
			});
			$.reset(span_2);
			$.next(2);
			$.reset(div_7);
			$.append($$anchor, div_7);
		};
		var alternate_1 = ($$anchor) => {
			var fragment_1 = root_10$3();
			var div_8 = $.first_child(fragment_1);
			var node_5 = $.sibling($.child(div_8), 2);
			var consequent_5 = ($$anchor) => {
				var div_9 = root_4$3();
				var button_3 = $.child(div_9);
				var div_10 = $.child(button_3);
				var span_3 = $.child(div_10);
				var text = $.only_child(span_3, true);
				var node_6 = $.sibling(span_3, 2);
				var consequent_1 = ($$anchor) => {
					var span_4 = root_1$4();
					var text_1 = $.only_child(span_4, true);
					$.template_effect(() => $.set_text(text_1, $.get(selectedModelOption).id));
					$.append($$anchor, span_4);
				};
				$.if(node_6, ($$render) => {
					if ($.get(selectedModelOption)) $$render(consequent_1);
				});
				$.reset(div_10);
				var span_5 = $.sibling(div_10, 2);
				let classes_4;
				Chevron_down($.child(span_5), { size: 14 });
				$.reset(span_5);
				$.reset(button_3);
				var node_8 = $.sibling(button_3, 2);
				var consequent_4 = ($$anchor) => {
					var div_11 = root_3$3();
					var button_4 = $.child(div_11);
					let classes_5;
					var node_9 = $.sibling($.child(button_4), 2);
					var consequent_2 = ($$anchor) => {
						Check($$anchor, { size: 13 });
					};
					$.if(node_9, ($$render) => {
						if (!$.get(settings).model) $$render(consequent_2);
					});
					$.reset(button_4);
					var node_10 = $.sibling(button_4, 2);
					$.each(node_10, 17, () => $.get(models), (m) => m.id, ($$anchor, m) => {
						const active = $.derived(() => $.get(settings).model === $.get(m).id);
						var button_5 = root_2$4();
						let classes_6;
						var div_12 = $.child(button_5);
						var span_6 = $.child(div_12);
						var text_2 = $.only_child(span_6, true);
						var span_7 = $.sibling(span_6, 2);
						var text_3 = $.only_child(span_7, true);
						$.reset(div_12);
						var node_11 = $.sibling(div_12, 2);
						var consequent_3 = ($$anchor) => {
							Check($$anchor, { size: 13 });
						};
						$.if(node_11, ($$render) => {
							if ($.get(active)) $$render(consequent_3);
						});
						$.reset(button_5);
						$.template_effect(() => {
							$.set_attribute(button_5, "aria-selected", $.get(active));
							classes_6 = $.set_class(button_5, 1, "ab-dd-opt svelte-1jraqfs", null, classes_6, { "ab-dd-opt-active": $.get(active) });
							$.set_text(text_2, $.get(m).label);
							$.set_text(text_3, $.get(m).id);
						});
						$.delegated("click", button_5, (e) => {
							e.stopPropagation();
							handleSelectModel($.get(m).id);
						});
						$.append($$anchor, button_5);
					});
					var button_6 = $.sibling(node_10, 4);
					$.set_attribute(button_6, "aria-selected", false);
					$.reset(div_11);
					$.template_effect(() => {
						$.set_attribute(button_4, "aria-selected", !$.get(settings).model);
						classes_5 = $.set_class(button_4, 1, "ab-dd-opt svelte-1jraqfs", null, classes_5, { "ab-dd-opt-active": !$.get(settings).model });
					});
					$.delegated("click", button_4, (e) => {
						e.stopPropagation();
						handleSelectModel(null);
					});
					$.delegated("click", button_6, (e) => {
						e.stopPropagation();
						handleSelectModel("__custom__");
					});
					$.append($$anchor, div_11);
				};
				$.if(node_8, ($$render) => {
					if ($.get(modelMenuOpen)) $$render(consequent_4);
				});
				$.reset(div_9);
				$.template_effect(() => {
					$.set_attribute(button_3, "aria-expanded", $.get(modelMenuOpen));
					button_3.disabled = $.get(saving);
					$.set_text(text, $.get(selectedModelOption) ? $.get(selectedModelOption).label : "CLI default");
					classes_4 = $.set_class(span_5, 1, "ab-dd-chev svelte-1jraqfs", null, classes_4, { "ab-dd-chev-open": $.get(modelMenuOpen) });
				});
				$.delegated("click", button_3, (e) => {
					e.stopPropagation();
					$.set(effortMenuOpen, false);
					$.set(modelMenuOpen, !$.get(modelMenuOpen));
				});
				$.append($$anchor, div_9);
			};
			var alternate = ($$anchor) => {
				var div_13 = root_6$3();
				var input_1 = $.child(div_13);
				$.remove_input_defaults(input_1);
				var button_7 = $.sibling(input_1, 2);
				var node_12 = $.sibling(button_7, 2);
				var consequent_6 = ($$anchor) => {
					var button_8 = root_5$3();
					$.template_effect(() => button_8.disabled = $.get(saving));
					$.delegated("click", button_8, handleCancelCustom);
					$.append($$anchor, button_8);
				};
				$.if(node_12, ($$render) => {
					if ($.get(models)) $$render(consequent_6);
				});
				$.reset(div_13);
				$.template_effect(() => button_7.disabled = $.get(saving));
				$.delegated("keydown", input_1, (e) => {
					if (e.key === "Escape") {
						e.stopPropagation();
						handleCancelCustom();
					} else if (e.key === "Enter") handleSaveCustom();
				});
				$.bind_value(input_1, () => $.get(customModelInput), ($$value) => $.set(customModelInput, $$value));
				$.delegated("click", button_7, () => {
					handleSaveCustom();
				});
				$.append($$anchor, div_13);
			};
			$.if(node_5, ($$render) => {
				if ($.get(models) && !$.get(customModelMode)) $$render(consequent_5);
				else $$render(alternate, -1);
			});
			$.reset(div_8);
			var node_13 = $.sibling(div_8, 2);
			var consequent_10 = ($$anchor) => {
				var div_14 = root_9$3();
				var div_15 = $.sibling($.child(div_14), 2);
				var button_9 = $.child(div_15);
				var span_8 = $.child(button_9);
				var text_4 = $.only_child(span_8, true);
				var span_9 = $.sibling(span_8, 2);
				let classes_7;
				Chevron_down($.child(span_9), { size: 14 });
				$.reset(span_9);
				$.reset(button_9);
				var node_15 = $.sibling(button_9, 2);
				var consequent_9 = ($$anchor) => {
					var div_16 = root_8$3();
					var button_10 = $.child(div_16);
					let classes_8;
					var node_16 = $.sibling($.child(button_10), 2);
					var consequent_7 = ($$anchor) => {
						Check($$anchor, { size: 13 });
					};
					$.if(node_16, ($$render) => {
						if (!$.get(settings).effort) $$render(consequent_7);
					});
					$.reset(button_10);
					var node_17 = $.sibling(button_10, 2);
					$.each(node_17, 16, () => EFFORT_LEVELS, (lvl) => lvl, ($$anchor, lvl) => {
						const active = $.derived(() => $.get(settings).effort === lvl);
						var button_11 = root_7$3();
						let classes_9;
						var span_10 = $.child(button_11);
						var text_5 = $.only_child(span_10, true);
						var node_18 = $.sibling(span_10, 2);
						var consequent_8 = ($$anchor) => {
							Check($$anchor, { size: 13 });
						};
						$.if(node_18, ($$render) => {
							if ($.get(active)) $$render(consequent_8);
						});
						$.reset(button_11);
						$.template_effect(() => {
							$.set_attribute(button_11, "aria-selected", $.get(active));
							classes_9 = $.set_class(button_11, 1, "ab-dd-opt svelte-1jraqfs", null, classes_9, { "ab-dd-opt-active": $.get(active) });
							$.set_text(text_5, lvl);
						});
						$.delegated("click", button_11, (e) => {
							e.stopPropagation();
							$.set(effortMenuOpen, false);
							applyPatch({ effort: lvl });
						});
						$.append($$anchor, button_11);
					});
					$.reset(div_16);
					$.template_effect(() => {
						$.set_attribute(button_10, "aria-selected", !$.get(settings).effort);
						classes_8 = $.set_class(button_10, 1, "ab-dd-opt svelte-1jraqfs", null, classes_8, { "ab-dd-opt-active": !$.get(settings).effort });
					});
					$.delegated("click", button_10, (e) => {
						e.stopPropagation();
						$.set(effortMenuOpen, false);
						applyPatch({ effort: null });
					});
					$.append($$anchor, div_16);
				};
				$.if(node_15, ($$render) => {
					if ($.get(effortMenuOpen)) $$render(consequent_9);
				});
				$.reset(div_15);
				$.reset(div_14);
				$.template_effect(() => {
					$.set_attribute(button_9, "aria-expanded", $.get(effortMenuOpen));
					button_9.disabled = $.get(saving);
					$.set_text(text_4, $.get(settings).effort ?? "CLI default");
					classes_7 = $.set_class(span_9, 1, "ab-dd-chev svelte-1jraqfs", null, classes_7, { "ab-dd-chev-open": $.get(effortMenuOpen) });
				});
				$.delegated("click", button_9, (e) => {
					e.stopPropagation();
					$.set(modelMenuOpen, false);
					$.set(effortMenuOpen, !$.get(effortMenuOpen));
				});
				$.append($$anchor, div_14);
			};
			$.if(node_13, ($$render) => {
				if ($.get(showEffort)) $$render(consequent_10);
			});
			$.append($$anchor, fragment_1);
		};
		$.if(node_3, ($$render) => {
			if ($.get(loadingModels)) $$render(consequent);
			else $$render(alternate_1, -1);
		});
		$.reset(div_4);
		$.reset(div_1);
		$.reset(div);
		$.template_effect(() => {
			$.set_checked(input, $.get(settings).enabled);
			input.disabled = $.get(saving);
			classes = $.set_class(button_1, 1, "ab-provider-btn svelte-1jraqfs", null, classes, { "ab-provider-active": $.get(settings).provider === "claude" });
			button_1.disabled = $.get(saving);
			classes_1 = $.set_class(span, 1, "ab-avail-dot svelte-1jraqfs", null, classes_1, { "ab-avail-ok": $.get(available)?.claude });
			$.set_attribute(span, "title", $.get(available)?.claude ? "Installed" : "CLI not found");
			classes_2 = $.set_class(button_2, 1, "ab-provider-btn svelte-1jraqfs", null, classes_2, { "ab-provider-active": $.get(settings).provider === "antigravity" });
			button_2.disabled = $.get(saving);
			classes_3 = $.set_class(span_1, 1, "ab-avail-dot svelte-1jraqfs", null, classes_3, { "ab-avail-ok": $.get(available)?.antigravity });
			$.set_attribute(span_1, "title", $.get(available)?.antigravity ? "Installed" : "CLI not found");
		});
		$.delegated("click", div, function(...$$args) {
			$$props.onclose?.apply(this, $$args);
		});
		$.delegated("click", div_1, (e) => {
			e.stopPropagation();
			$.set(modelMenuOpen, false);
			$.set(effortMenuOpen, false);
		});
		$.delegated("click", button, function(...$$args) {
			$$props.onclose?.apply(this, $$args);
		});
		$.delegated("change", input, (e) => {
			applyPatch({ enabled: e.currentTarget.checked });
		});
		$.delegated("click", button_1, () => {
			applyPatch({ provider: "claude" });
		});
		$.delegated("click", button_2, () => {
			applyPatch({ provider: "antigravity" });
		});
		$.append($$anchor, div);
	};
	$.if(node, ($$render) => {
		if ($$props.open && $.get(settings)) $$render(consequent_11);
	});
	$.append($$anchor, fragment);
	$.pop();
}
$.delegate([
	"click",
	"change",
	"keydown"
]);
// src/client/api-client.ts
const requestJson = async (url, init) => {
	const res = await fetch(url, {
		...init,
		headers: { "Content-Type": "application/json" }
	});
	const data = await res.json().catch(() => {
		return {};
	});
	if (!res.ok) {
		let code = `HTTP ${res.status}`;
		if (typeof data.error === "string") code = data.error;
		else if (typeof data.code === "string") code = data.code;
		throw new Error(code);
	}
	return data;
};
const createApiClient = (apiBase) => {
	const base = apiBase.replace(/\/+$/, "");
	return {
		listComments: async () => {
			return (await requestJson(`${base}/comments`)).comments;
		},
		createComment: async (input) => {
			return (await requestJson(`${base}/comments`, {
				method: "POST",
				body: JSON.stringify(input)
			})).comment;
		},
		patchComment: async (id, patch) => {
			return (await requestJson(`${base}/comments/${id}`, {
				method: "PATCH",
				body: JSON.stringify(patch)
			})).comment;
		},
		deleteComment: async (id) => {
			await requestJson(`${base}/comments/${id}`, { method: "DELETE" });
		},
		clearResolved: async () => {
			return (await requestJson(`${base}/comments?status=resolved`, { method: "DELETE" })).removed;
		},
		getAgentInfo: async () => {
			return requestJson(`${base}/agent`);
		},
		getAgentModels: async (provider) => {
			return (await requestJson(`${base}/agent/models?provider=${encodeURIComponent(provider)}`)).models;
		},
		updateAgentSettings: async (patch) => {
			return (await requestJson(`${base}/agent/settings`, {
				method: "PUT",
				body: JSON.stringify(patch)
			})).settings;
		},
		runAgent: async (ids) => {
			return requestJson(`${base}/agent/run`, {
				method: "POST",
				body: JSON.stringify({ ids })
			});
		},
		cancelAgent: async () => {
			await requestJson(`${base}/agent/cancel`, { method: "POST" });
		},
		resumeAgent: async () => {
			await requestJson(`${base}/agent/resume`, { method: "POST" });
		}
	};
};
// src/client/inspect.ts
const MAX_STACK_FRAMES = 30;
const isProjectFile = (file) => {
	return Boolean(file) && !file.includes("node_modules");
};
const readSvelteStack = (meta) => {
	const frames = [];
	let entry = meta.parent ?? null;
	while (entry && frames.length < MAX_STACK_FRAMES) {
		if (entry.type === "component" && isProjectFile(entry.file)) frames.push({
			name: entry.componentTag ?? null,
			file: entry.file,
			line: entry.line,
			column: entry.column
		});
		entry = entry.parent;
	}
	return frames;
};
const readSvelteMeta = (el, stopAt) => {
	let cursor = el;
	let inherited = false;
	while (cursor && cursor !== stopAt) {
		const meta = cursor.__svelte_meta;
		if (meta?.loc && isProjectFile(meta.loc.file)) return {
			source: {
				file: meta.loc.file,
				line: meta.loc.line,
				column: meta.loc.column,
				inherited
			},
			componentStack: readSvelteStack(meta)
		};
		inherited = true;
		cursor = cursor.parentElement;
	}
	return {
		source: null,
		componentStack: []
	};
};
const buildSelector = (el, stopAt) => {
	const testId = el.getAttribute("data-testid");
	if (testId) return `[data-testid="${testId}"]`;
	if (el.id) return `#${el.id}`;
	const parts = [];
	let cursor = el;
	while (cursor && cursor !== stopAt && parts.length < 5) {
		const tag = cursor.tagName.toLowerCase();
		const parent = cursor.parentElement;
		if (parent) {
			const sameTag = [...parent.children].filter((child) => {
				return child.tagName === cursor?.tagName;
			});
			if (sameTag.length > 1) {
				const index = sameTag.indexOf(cursor) + 1;
				parts.unshift(`${tag}:nth-of-type(${index})`);
			} else parts.unshift(tag);
		} else parts.unshift(tag);
		cursor = parent;
	}
	return parts.join(" > ").slice(0, 1e3);
};
const formatSourceBadge = (source) => {
	if (!source) return null;
	const normalized = source.file.replaceAll("\\", "/");
	return `${normalized.split("/").pop() ?? normalized}:${source.line}`;
};
const inspectElement = (el, boundary) => {
	const { source, componentStack } = readSvelteMeta(el, boundary);
	const tag = el.tagName.toLowerCase().slice(0, 50);
	const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
	const html = (el.outerHTML ?? "").slice(0, 2e3);
	return {
		source,
		componentStack,
		selector: buildSelector(el, boundary),
		tag,
		text,
		html
	};
};
// src/client/ThemeSelect.svelte
var root$3 = $.from_html(`<button type="button" role="option"><span class="ab-select-option-text svelte-157kj6m"> </span> <!></button>`);
var root_1$3 = $.from_html(`<div role="listbox"></div>`);
var root_2$3 = $.from_html(`<div class="ab-select-root svelte-157kj6m"><button type="button" aria-haspopup="listbox"><!> <span class="ab-select-label svelte-157kj6m"> </span> <span><!></span></button> <!></div>`);
const $$css$3 = {
	hash: "svelte-157kj6m",
	code: ".ab-select-root.svelte-157kj6m {position:relative;display:inline-flex;}.ab-select-trigger.svelte-157kj6m {display:inline-flex;align-items:center;gap:6px;height:28px;border:1px solid transparent;border-radius:8px;background:transparent;padding:0 8px;font-family:inherit;font-size:12px;font-weight:500;color:var(--ab-text);cursor:pointer;transition:background 0.15s ease,\n      border-color 0.15s ease;}.ab-select-trigger.svelte-157kj6m:hover,\n  .ab-select-open.svelte-157kj6m {background:var(--ab-hover);border-color:var(--ab-border);}.ab-select-xs.svelte-157kj6m {height:22px;gap:4px;border-radius:6px;border-color:var(--ab-border);background:var(--ab-surface);padding:0 6px;font-size:10px;}.ab-select-label.svelte-157kj6m {white-space:nowrap;}.ab-select-chevron.svelte-157kj6m {display:inline-flex;color:var(--ab-text-muted);transition:transform 0.15s ease;}.ab-select-chevron-open.svelte-157kj6m {transform:rotate(180deg);}.ab-select-menu.svelte-157kj6m {position:absolute;top:calc(100% + 6px);right:0;z-index:60;min-width:132px;display:flex;flex-direction:column;gap:2px;border-radius:10px;border:1px solid var(--ab-border);background:var(--ab-surface-solid);padding:4px;box-shadow:var(--ab-chrome-shadow);backdrop-filter:blur(12px);}.ab-select-menu-xs.svelte-157kj6m {min-width:112px;border-radius:8px;}.ab-select-option.svelte-157kj6m {display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:none;border-radius:6px;background:transparent;padding:6px 8px;font-family:inherit;font-size:12px;font-weight:500;color:var(--ab-text);text-align:left;cursor:pointer;transition:background 0.12s ease;}.ab-select-menu-xs.svelte-157kj6m .ab-select-option:where(.svelte-157kj6m) {padding:5px 7px;font-size:11px;}.ab-select-option.svelte-157kj6m:hover {background:var(--ab-hover);}.ab-select-option-active.svelte-157kj6m {background:rgba(99, 102, 241, 0.16);color:var(--ab-accent-text);}.ab-select-option-active.svelte-157kj6m:hover {background:rgba(99, 102, 241, 0.22);}.ab-select-option-text.svelte-157kj6m {white-space:nowrap;}"
};
function ThemeSelect($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css$3);
	let size = $.prop($$props, "size", 3, "sm"), showIcon = $.prop($$props, "showIcon", 3, false);
	let open = $.state(false);
	let rootEl = $.state(null);
	const selectedTheme = $.derived(() => $$props.themes.find((t) => {
		return t.id === $$props.value;
	}) ?? $$props.themes[0]);
	function setOpen(next) {
		$.set(open, next, true);
		$$props.onopenchange?.(next);
	}
	function selectTheme(id) {
		$$props.onchange(id);
		setOpen(false);
	}
	$.user_effect(() => {
		if (!$.get(open)) return;
		const onDocPointerDown = (e) => {
			if ($.get(rootEl) && !$.get(rootEl).contains(e.target)) setOpen(false);
		};
		const onKeyDown = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("pointerdown", onDocPointerDown);
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("pointerdown", onDocPointerDown);
			window.removeEventListener("keydown", onKeyDown);
		};
	});
	var div = root_2$3();
	var button = $.child(div);
	let classes;
	var node = $.child(button);
	var consequent = ($$anchor) => {
		Palette($$anchor, { size: 13 });
	};
	$.if(node, ($$render) => {
		if (showIcon()) $$render(consequent);
	});
	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	let classes_1;
	var node_1 = $.child(span_1);
	{
		let $0 = $.derived(() => size() === "xs" ? 11 : 13);
		Chevron_down(node_1, { get size() {
			return $.get($0);
		} });
	}
	$.reset(span_1);
	$.reset(button);
	var node_2 = $.sibling(button, 2);
	var consequent_2 = ($$anchor) => {
		var div_1 = root_1$3();
		let classes_2;
		$.each(div_1, 21, () => $$props.themes, (themeOption) => themeOption.id, ($$anchor, themeOption) => {
			const isSelected = $.derived(() => $.get(themeOption).id === $.get(selectedTheme)?.id);
			var button_1 = root$3();
			let classes_3;
			var span_2 = $.child(button_1);
			var text_1 = $.only_child(span_2, true);
			var node_3 = $.sibling(span_2, 2);
			var consequent_1 = ($$anchor) => {
				Check($$anchor, { size: 12 });
			};
			$.if(node_3, ($$render) => {
				if ($.get(isSelected)) $$render(consequent_1);
			});
			$.reset(button_1);
			$.template_effect(() => {
				$.set_attribute(button_1, "aria-selected", $.get(isSelected));
				classes_3 = $.set_class(button_1, 1, "ab-select-option svelte-157kj6m", null, classes_3, { "ab-select-option-active": $.get(isSelected) });
				$.set_text(text_1, $.get(themeOption).label);
			});
			$.delegated("click", button_1, (e) => {
				e.stopPropagation();
				selectTheme($.get(themeOption).id);
			});
			$.append($$anchor, button_1);
		});
		$.reset(div_1);
		$.template_effect(() => {
			$.set_attribute(div_1, "aria-label", $$props.label);
			classes_2 = $.set_class(div_1, 1, "ab-select-menu svelte-157kj6m", null, classes_2, { "ab-select-menu-xs": size() === "xs" });
		});
		$.append($$anchor, div_1);
	};
	$.if(node_2, ($$render) => {
		if ($.get(open)) $$render(consequent_2);
	});
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));
	$.template_effect(() => {
		$.set_attribute(button, "aria-label", $$props.label);
		$.set_attribute(button, "aria-expanded", $.get(open));
		classes = $.set_class(button, 1, "ab-select-trigger svelte-157kj6m", null, classes, {
			"ab-select-xs": size() === "xs",
			"ab-select-open": $.get(open)
		});
		$.set_text(text, $.get(selectedTheme)?.label ?? "");
		classes_1 = $.set_class(span_1, 1, "ab-select-chevron svelte-157kj6m", null, classes_1, { "ab-select-chevron-open": $.get(open) });
	});
	$.delegated("click", button, (e) => {
		e.stopPropagation();
		setOpen(!$.get(open));
	});
	$.append($$anchor, div);
	$.pop();
}
$.delegate(["click"]);
// src/client/ArtboardFrame.svelte
var root$2 = $.from_html(`<span></span>`);
var root_1$2 = $.from_html(`<span class="ab-pin-count svelte-17oxi2j"> </span>`);
var root_2$2 = $.from_html(`<div><!></div>`);
var root_3$2 = $.from_html(`<div class="ab-placeholder svelte-17oxi2j"><div class="ab-placeholder-box svelte-17oxi2j"></div> <p class="ab-placeholder-title svelte-17oxi2j"> </p> <p class="ab-placeholder-sub svelte-17oxi2j"> </p></div>`);
var root_4$2 = $.from_html(`<div class="ab-hover-box svelte-17oxi2j"><span class="ab-hover-badge svelte-17oxi2j"> </span></div>`);
var root_5$2 = $.from_html(`<div class="ab-grid-col svelte-17oxi2j"></div>`);
var root_6$2 = $.from_html(`<div class="ab-grid-overlay svelte-17oxi2j"></div>`);
var root_7$2 = $.from_svg(`<line stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"></line><circle r="4" stroke="#ffffff" stroke-width="1.5"></circle>`, 1);
var root_8$2 = $.from_html(`<span class="ab-spin svelte-17oxi2j"><!></span>`);
var root_9$2 = $.from_html(`<span class="ab-popover-src svelte-17oxi2j"> </span>`);
var root_10$2 = $.from_html(`<button type="button" title="Send to AI Agent" class="ab-pop-btn ab-pop-btn-send svelte-17oxi2j"><!></button>`);
var root_11$2 = $.from_html(`<div class="ab-confirm-bar svelte-17oxi2j"><span>Delete this comment?</span> <div class="ab-confirm-actions svelte-17oxi2j"><button type="button" class="ab-btn-cancel svelte-17oxi2j">Cancel</button> <button type="button" class="ab-btn-danger svelte-17oxi2j">Delete</button></div></div>`);
var root_12$2 = $.from_html(`<textarea rows="3" aria-label="Edit comment text" class="ab-textarea svelte-17oxi2j"></textarea> <div class="ab-draft-footer svelte-17oxi2j"><button type="button" class="ab-btn-cancel svelte-17oxi2j">Cancel</button> <button type="button" class="ab-btn-pin svelte-17oxi2j">Save</button></div>`, 1);
var root_13$2 = $.from_html(`<p class="ab-popover-resolution svelte-17oxi2j"> </p>`);
var root_14$2 = $.from_html(`<p class="ab-popover-run svelte-17oxi2j"> </p>`);
var root_15$2 = $.from_html(`<p> </p> <!> <!>`, 1);
var root_16$1 = $.from_html(`<div class="ab-popover svelte-17oxi2j"><div class="ab-popover-head svelte-17oxi2j"><div class="ab-popover-meta svelte-17oxi2j"><span class="ab-popover-author svelte-17oxi2j"> </span> <!></div> <div class="ab-popover-actions svelte-17oxi2j"><!> <button type="button" title="Edit comment" class="ab-pop-btn svelte-17oxi2j"><!></button> <button type="button" class="ab-pop-btn ab-pop-btn-ok svelte-17oxi2j"><!></button> <button type="button" title="Delete comment" class="ab-pop-btn ab-pop-btn-del svelte-17oxi2j"><!></button> <button type="button" class="ab-pop-btn svelte-17oxi2j"><!></button></div></div> <!></div>`);
var root_17$1 = $.from_html(`<div><button type="button" title="Click to view · Drag to reposition"><!></button> <!></div>`);
var root_18$1 = $.from_html(`<div class="ab-pin-anchor ab-pin-open svelte-17oxi2j"><div class="ab-pin-badge ab-pin-draft svelte-17oxi2j"><!></div> <div class="ab-popover ab-popover-draft svelte-17oxi2j"><div class="ab-popover-meta svelte-17oxi2j"><p class="ab-popover-author svelte-17oxi2j">Add Comment</p> <!></div> <textarea rows="2" placeholder="e.g. Increase padding on mobile..." class="ab-textarea svelte-17oxi2j"></textarea> <div class="ab-draft-footer svelte-17oxi2j"><button type="button" class="ab-btn-cancel svelte-17oxi2j">Cancel</button> <button type="button" class="ab-btn-pin svelte-17oxi2j">Post</button></div></div></div>`);
var root_19$1 = $.from_html(`<div><div class="ab-header svelte-17oxi2j"><div class="ab-header-left svelte-17oxi2j"><!> <button type="button" class="ab-title-btn svelte-17oxi2j"> </button> <span class="ab-dim-pill svelte-17oxi2j"> </span></div> <div class="ab-header-right svelte-17oxi2j"><!> <!> <button type="button" title="Focus / Fit this board" class="ab-icon-btn svelte-17oxi2j"><!></button></div></div> <div><div><!> <!> <!></div> <svg class="ab-leader-svg svelte-17oxi2j" aria-hidden="true"></svg> <!> <!></div></div>`);
const $$css$2 = {
	hash: "svelte-17oxi2j",
	code: ".ab-board.svelte-17oxi2j {position:absolute;user-select:none;z-index:10;}.ab-board-elevated.svelte-17oxi2j {z-index:40;}.ab-header.svelte-17oxi2j {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;padding:0 2px;font-family:'Inter',\n      -apple-system,\n      BlinkMacSystemFont,\n      'Segoe UI',\n      sans-serif;}.ab-header-left.svelte-17oxi2j {display:flex;align-items:center;gap:8px;min-width:0;}.ab-header-right.svelte-17oxi2j {display:flex;align-items:center;gap:4px;flex-shrink:0;}.ab-status-dot.svelte-17oxi2j {width:8px;height:8px;border-radius:9999px;background:var(--ab-dot-idle);flex-shrink:0;}.ab-status-mounted.svelte-17oxi2j {background:#34d399;box-shadow:0 0 8px rgba(52, 211, 153, 0.7);}.ab-title-btn.svelte-17oxi2j {border:none;background:transparent;padding:0;color:var(--ab-text);font-size:12px;font-weight:600;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-title-btn.svelte-17oxi2j:hover {color:var(--ab-accent-text);}.ab-dim-pill.svelte-17oxi2j {flex-shrink:0;border-radius:4px;background:var(--ab-pill-bg);padding:2px 6px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-muted);}.ab-pin-count.svelte-17oxi2j {border-radius:4px;background:rgba(245, 158, 11, 0.2);padding:2px 6px;font-size:10px;font-weight:600;color:#d97706;}.ab-icon-btn.svelte-17oxi2j {display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;padding:4px;color:var(--ab-text-muted);cursor:pointer;}.ab-icon-btn.svelte-17oxi2j:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-frame-outer.svelte-17oxi2j {position:relative;}.ab-cursor-comment.svelte-17oxi2j {cursor:crosshair;}.ab-viewport.svelte-17oxi2j {container-type:inline-size;contain:layout style paint;position:relative;width:100%;height:100%;overflow:hidden;border-radius:12px;border:1px solid var(--ab-frame-border);background:#ffffff;box-shadow:var(--ab-frame-shadow);transition:box-shadow 0.2s ease,\n      border-color 0.2s ease;}.ab-viewport-highlighted.svelte-17oxi2j {border-color:#6366f1;box-shadow:0 0 0 4px rgba(99, 102, 241, 0.35),\n      var(--ab-frame-shadow);}.ab-scroll.svelte-17oxi2j {width:100%;height:100%;overflow:hidden;touch-action:none;user-select:text;}.ab-scroll-interactive.svelte-17oxi2j {overflow-y:auto;touch-action:pan-y;}.ab-non-interactive.svelte-17oxi2j {pointer-events:none;touch-action:none;user-select:none;}.ab-hover-box.svelte-17oxi2j {pointer-events:none;position:absolute;z-index:25;border:2px solid #6366f1;background:rgba(99, 102, 241, 0.12);border-radius:4px;box-sizing:border-box;}.ab-hover-badge.svelte-17oxi2j {position:absolute;top:-22px;left:-2px;border-radius:4px;background:#4f46e5;padding:2px 6px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;font-weight:600;color:#ffffff;white-space:nowrap;}.ab-leader-svg.svelte-17oxi2j {pointer-events:none;position:absolute;inset:0;z-index:28;width:100%;height:100%;overflow:visible;}.ab-placeholder.svelte-17oxi2j {display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;height:100%;background:var(--ab-placeholder-bg);color:var(--ab-text-muted);font-family:'Inter',\n      -apple-system,\n      BlinkMacSystemFont,\n      'Segoe UI',\n      sans-serif;}.ab-placeholder-box.svelte-17oxi2j {width:24px;height:24px;border-radius:8px;border:1px solid var(--ab-border);background:var(--ab-pill-bg);}.ab-placeholder-title.svelte-17oxi2j {margin:0;font-size:12px;font-weight:500;color:var(--ab-text-muted);}.ab-placeholder-sub.svelte-17oxi2j {margin:0;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-subtle);}.ab-grid-overlay.svelte-17oxi2j {pointer-events:none;position:absolute;inset:0;z-index:20;display:grid;gap:16px;padding:0 16px;}.ab-grid-col.svelte-17oxi2j {height:100%;border-left:1px solid rgba(244, 63, 94, 0.22);border-right:1px solid rgba(244, 63, 94, 0.22);background:rgba(244, 63, 94, 0.06);}\n\n  /* Left-bottom anchor so the teardrop tip sits directly on the clicked coordinate */.ab-pin-anchor.svelte-17oxi2j {position:absolute;z-index:30;transform:translate(0, -100%);}.ab-pin-open.svelte-17oxi2j {z-index:50;}.ab-pin-badge.svelte-17oxi2j {display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px 9999px 9999px 4px;border:2px solid #ffffff;background:#f59e0b;color:#ffffff;font-size:11px;font-weight:700;cursor:grab;touch-action:none;box-shadow:0 8px 16px rgba(0, 0, 0, 0.35);transition:transform 0.15s ease;}.ab-pin-badge.svelte-17oxi2j:hover {transform:scale(1.08);}.ab-pin-dragging.svelte-17oxi2j {cursor:grabbing;transform:scale(1.12);}.ab-pin-resolved.svelte-17oxi2j {background:#10b981;}.ab-pin-running.svelte-17oxi2j {background:#6366f1;}.ab-pin-draft.svelte-17oxi2j {background:#6366f1;cursor:default;}.ab-popover.svelte-17oxi2j {position:absolute;top:36px;left:0;z-index:50;width:268px;border-radius:12px;border:1px solid var(--ab-border);background:var(--ab-surface-solid);padding:12px;text-align:left;color:var(--ab-text);box-shadow:0 20px 40px rgba(0, 0, 0, 0.32);font-family:'Inter',\n      -apple-system,\n      BlinkMacSystemFont,\n      'Segoe UI',\n      sans-serif;}.ab-popover-draft.svelte-17oxi2j {border-color:rgba(99, 102, 241, 0.55);}.ab-popover-head.svelte-17oxi2j {display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}.ab-popover-meta.svelte-17oxi2j {display:flex;flex-direction:column;gap:2px;min-width:0;}.ab-popover-author.svelte-17oxi2j {margin:0;font-size:11px;font-weight:600;color:var(--ab-accent-text);}.ab-popover-src.svelte-17oxi2j {font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-popover-actions.svelte-17oxi2j {display:flex;align-items:center;gap:2px;flex-shrink:0;}.ab-pop-btn.svelte-17oxi2j {display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;padding:4px;color:var(--ab-text-muted);cursor:pointer;}.ab-pop-btn.svelte-17oxi2j:hover:not(:disabled) {background:var(--ab-hover);color:var(--ab-text);}.ab-pop-btn.svelte-17oxi2j:disabled {opacity:0.35;cursor:not-allowed;}.ab-pop-btn-send.svelte-17oxi2j:hover:not(:disabled) {color:#818cf8;}.ab-pop-btn-ok.svelte-17oxi2j:hover:not(:disabled) {color:#10b981;}.ab-pop-btn-del.svelte-17oxi2j:hover:not(:disabled) {color:#f43f5e;}.ab-confirm-bar.svelte-17oxi2j {margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:8px;border:1px solid rgba(244, 63, 94, 0.35);background:rgba(244, 63, 94, 0.1);padding:8px 10px;font-size:11.5px;color:#fb7185;}.ab-confirm-actions.svelte-17oxi2j {display:flex;gap:6px;}.ab-btn-danger.svelte-17oxi2j {border:none;border-radius:6px;background:#e11d48;padding:4px 10px;font-size:11px;font-weight:600;color:#ffffff;cursor:pointer;}.ab-btn-danger.svelte-17oxi2j:hover {background:#f43f5e;}.ab-popover-text.svelte-17oxi2j {margin:8px 0 0;font-size:12px;line-height:1.5;color:var(--ab-text);}.ab-popover-text-resolved.svelte-17oxi2j {color:var(--ab-text-subtle);text-decoration:line-through;}.ab-popover-resolution.svelte-17oxi2j {margin:6px 0 0;font-size:11px;line-height:1.4;color:#10b981;}.ab-popover-run.svelte-17oxi2j {margin:6px 0 0;font-size:10px;color:var(--ab-text-muted);}.ab-textarea.svelte-17oxi2j {box-sizing:border-box;width:100%;margin-top:6px;border-radius:8px;border:1px solid var(--ab-border);background:var(--ab-input-bg);padding:8px;font-family:inherit;font-size:12px;color:var(--ab-text);resize:vertical;}.ab-textarea.svelte-17oxi2j:focus {outline:none;border-color:#6366f1;}.ab-draft-footer.svelte-17oxi2j {display:flex;justify-content:flex-end;gap:6px;margin-top:8px;}.ab-btn-cancel.svelte-17oxi2j {border:none;border-radius:6px;background:transparent;padding:4px 8px;font-size:11px;color:var(--ab-text-muted);cursor:pointer;}.ab-btn-cancel.svelte-17oxi2j:hover {background:var(--ab-hover);}.ab-btn-pin.svelte-17oxi2j {border:none;border-radius:6px;background:#4f46e5;padding:4px 10px;font-size:11px;font-weight:600;color:#ffffff;cursor:pointer;}.ab-btn-pin.svelte-17oxi2j:hover {background:#6366f1;}.ab-spin.svelte-17oxi2j {display:inline-flex;\n    animation: svelte-17oxi2j-ab-spin 1s linear infinite;}\n\n  @keyframes svelte-17oxi2j-ab-spin {\n    from {\n      transform: rotate(0deg);\n    }\n    to {\n      transform: rotate(360deg);\n    }\n  }"
};
function ArtboardFrame($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css$2);
	let zoom = $.prop($$props, "zoom", 3, 1), themes = $.prop($$props, "themes", 19, () => []), globalThemeId = $.prop($$props, "globalThemeId", 3, null), runsMap = $.prop($$props, "runsMap", 19, () => ({})), agentEnabled = $.prop($$props, "agentEnabled", 3, false), selectedCommentId = $.prop($$props, "selectedCommentId", 3, null), highlighted = $.prop($$props, "highlighted", 3, false), showDebug = $.prop($$props, "showDebug", 3, false);
	let frameEl = $.state(null);
	let viewportEl = $.state(null);
	let isMounted = $.state(false);
	let localThemeOverride = $.state(null);
	let draftPin = $.state(null);
	let draftText = $.state("");
	let openCommentId = $.state(null);
	let editingCommentId = $.state(null);
	let editText = $.state("");
	let confirmingDeleteId = $.state(null);
	let themeMenuOpen = $.state(false);
	let hoverBox = $.state(null);
	let draggingPin = $.state(null);
	$.user_effect(() => {
		if (selectedCommentId() && $$props.comments.some((c) => {
			return c.id === selectedCommentId();
		})) $.set(openCommentId, selectedCommentId());
	});
	$.user_effect(() => {
		if ($$props.tool !== "comment") $.set(hoverBox, null);
	});
	const activeTheme = $.derived(() => {
		if (themes().length === 0) return null;
		const targetId = $.get(localThemeOverride) ?? $$props.board.defaultTheme ?? globalThemeId() ?? themes()[0]?.id;
		return themes().find((t) => {
			return t.id === targetId;
		}) ?? themes()[0] ?? null;
	});
	const gridCols = $.derived(() => {
		if ($$props.board.width < 520) return 4;
		if ($$props.board.width < 960) return 8;
		return 12;
	});
	const gridIndices = $.derived(() => Array.from({ length: $.get(gridCols) }, (_v, idx) => {
		return idx;
	}));
	$.user_effect(() => {
		const el = $.get(frameEl);
		if (!el) return;
		const rootMargin = window.innerWidth < 768 ? "120px" : "240px";
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const next = entry.isIntersecting;
			if (next !== $.get(isMounted)) {
				$.set(isMounted, next, true);
				$$props.onmountchange?.($$props.board.id, next);
			}
		}, {
			root: null,
			rootMargin,
			threshold: 0
		});
		observer.observe(el);
		return () => {
			observer.disconnect();
			if ($.get(isMounted)) $$props.onmountchange?.($$props.board.id, false);
		};
	});
	function getPinPos(pin) {
		if ($.get(draggingPin) && $.get(draggingPin).id === pin.id) return {
			xPct: $.get(draggingPin).currentXPct,
			yPct: $.get(draggingPin).currentYPct
		};
		return {
			xPct: pin.artboard.pinXPct ?? pin.artboard.xPct,
			yPct: pin.artboard.pinYPct ?? pin.artboard.yPct
		};
	}
	function handlePinPointerDown(event, pin) {
		if (event.button !== 0 || !$.get(frameEl)) return;
		event.stopPropagation();
		const pos = getPinPos(pin);
		$.set(draggingPin, {
			id: pin.id,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startXPct: pos.xPct,
			startYPct: pos.yPct,
			currentXPct: pos.xPct,
			currentYPct: pos.yPct,
			moved: false
		}, true);
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
	}
	function handlePinPointerMove(event) {
		if (!$.get(draggingPin) || !$.get(frameEl)) return;
		event.stopPropagation();
		const dx = event.clientX - $.get(draggingPin).startClientX;
		const dy = event.clientY - $.get(draggingPin).startClientY;
		if (!$.get(draggingPin).moved && Math.hypot(dx, dy) < 4) return;
		const rect = $.get(frameEl).getBoundingClientRect();
		const nextXPct = Math.max(0, Math.min(100, $.get(draggingPin).startXPct + dx / rect.width * 100));
		const nextYPct = Math.max(0, Math.min(100, $.get(draggingPin).startYPct + dy / rect.height * 100));
		$.set(draggingPin, {
			...$.get(draggingPin),
			currentXPct: nextXPct,
			currentYPct: nextYPct,
			moved: true
		}, true);
	}
	function handlePinPointerUp(event, pin) {
		if (!$.get(draggingPin) || $.get(draggingPin).id !== pin.id) return;
		event.stopPropagation();
		const finalDrag = $.get(draggingPin);
		$.set(draggingPin, null);
		if (finalDrag.moved) {
			$$props.onmovepin?.(pin.id, Math.round(finalDrag.currentXPct * 100) / 100, Math.round(finalDrag.currentYPct * 100) / 100);
			return;
		}
		$.set(openCommentId, $.get(openCommentId) === pin.id ? null : pin.id, true);
		$.set(editingCommentId, null);
		$.set(confirmingDeleteId, null);
	}
	function handleViewportPointerMove(event) {
		if ($$props.tool !== "comment" || !$.get(viewportEl) || !$.get(isMounted)) {
			$.set(hoverBox, null);
			return;
		}
		const target = event.target;
		if (!target || target === $.get(viewportEl) || target.classList.contains("ab-scroll")) {
			$.set(hoverBox, null);
			return;
		}
		const vpRect = $.get(viewportEl).getBoundingClientRect();
		const elRect = target.getBoundingClientRect();
		const scale = zoom() || 1;
		const inspected = inspectElement(target, $.get(viewportEl));
		const badge = formatSourceBadge(inspected.source) ?? `<${inspected.tag}>`;
		$.set(hoverBox, {
			left: (elRect.left - vpRect.left) / scale,
			top: (elRect.top - vpRect.top) / scale,
			width: elRect.width / scale,
			height: elRect.height / scale,
			label: badge
		}, true);
	}
	function handleViewportClickCapture(event) {
		if ($$props.tool !== "comment" || !$.get(frameEl) || !$.get(viewportEl)) return;
		event.preventDefault();
		event.stopPropagation();
		const rect = $.get(frameEl).getBoundingClientRect();
		const xPct = Math.max(1, Math.min(99, (event.clientX - rect.left) / rect.width * 100));
		const yPct = Math.max(1, Math.min(99, (event.clientY - rect.top) / rect.height * 100));
		const clickedEl = event.target;
		const target = clickedEl && clickedEl !== $.get(viewportEl) ? inspectElement(clickedEl, $.get(viewportEl)) : {
			source: null,
			componentStack: [],
			selector: "",
			tag: "div",
			text: "",
			html: ""
		};
		$.set(draftPin, {
			xPct,
			yPct,
			target
		}, true);
		$.set(draftText, "");
		$.set(openCommentId, null);
		$.set(editingCommentId, null);
		$.set(confirmingDeleteId, null);
		$.set(hoverBox, null);
	}
	function submitDraftComment() {
		if (!$.get(draftPin) || !$.get(draftText).trim()) return;
		$$props.onaddcomment?.({
			text: $.get(draftText).trim(),
			artboard: {
				boardId: $$props.board.id,
				boardTitle: $$props.board.title,
				section: $$props.board.section,
				viewport: {
					width: $$props.board.viewport.width,
					height: $$props.board.viewport.height,
					label: $$props.board.viewport.label
				},
				theme: $.get(activeTheme) ? {
					id: $.get(activeTheme).id,
					label: $.get(activeTheme).label
				} : null,
				xPct: $.get(draftPin).xPct,
				yPct: $.get(draftPin).yPct
			},
			target: $.get(draftPin).target
		});
		$.set(draftPin, null);
		$.set(draftText, "");
	}
	function startEdit(pin) {
		$.set(editingCommentId, pin.id, true);
		$.set(editText, pin.text, true);
		$.set(confirmingDeleteId, null);
	}
	function submitEdit(pinId) {
		const trimmed = $.get(editText).trim();
		if (!trimmed) return;
		$$props.oneditcomment?.(pinId, trimmed);
		$.set(editingCommentId, null);
		$.set(editText, "");
	}
	const BoardComponent = $.derived(() => $$props.board.component);
	const renderContext = $.derived(() => ({
		theme: $.get(activeTheme),
		viewport: $$props.board.viewport
	}));
	var div = root_19$1();
	let classes;
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);
	var consequent = ($$anchor) => {
		var span = root$2();
		let classes_1;
		$.template_effect(() => {
			$.set_attribute(span, "title", $.get(isMounted) ? "Mounted in DOM" : "Virtualized placeholder (off-screen)");
			classes_1 = $.set_class(span, 1, "ab-status-dot svelte-17oxi2j", null, classes_1, { "ab-status-mounted": $.get(isMounted) });
		});
		$.append($$anchor, span);
	};
	$.if(node, ($$render) => {
		if (showDebug()) $$render(consequent);
	});
	var button = $.sibling(node, 2);
	var text = $.only_child(button, true);
	var span_1 = $.sibling(button, 2);
	var text_1 = $.only_child(span_1, true);
	$.reset(div_2);
	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);
	var consequent_1 = ($$anchor) => {
		var span_2 = root_1$2();
		var text_2 = $.only_child(span_2);
		$.template_effect(() => $.set_text(text_2, `${$$props.comments.length ?? ""} comment${$$props.comments.length > 1 ? "s" : ""}`));
		$.append($$anchor, span_2);
	};
	$.if(node_1, ($$render) => {
		if ($$props.comments.length > 0) $$render(consequent_1);
	});
	var node_2 = $.sibling(node_1, 2);
	var consequent_2 = ($$anchor) => {
		{
			let $0 = $.derived(() => $.get(activeTheme)?.id ?? "");
			ThemeSelect($$anchor, {
				get themes() {
					return themes();
				},
				size: "xs",
				get label() {
					return `Theme for ${$$props.board.title ?? ""}`;
				},
				get value() {
					return $.get($0);
				},
				onchange: (id) => {
					$.set(localThemeOverride, id, true);
				},
				onopenchange: (isOpen) => {
					$.set(themeMenuOpen, isOpen, true);
				}
			});
		}
	};
	$.if(node_2, ($$render) => {
		if (themes().length > 0) $$render(consequent_2);
	});
	var button_1 = $.sibling(node_2, 2);
	Crosshair($.child(button_1), { size: 14 });
	$.reset(button_1);
	$.reset(div_3);
	$.reset(div_1);
	var div_4 = $.sibling(div_1, 2);
	let classes_2;
	var div_5 = $.child(div_4);
	var event_handler = () => {
		$.set(hoverBox, null);
	};
	$.attribute_effect(div_5, () => ({
		onpointermove: handleViewportPointerMove,
		onpointerleave: event_handler,
		onclickcapture: handleViewportClickCapture,
		class: `ab-viewport ${$.get(activeTheme)?.class ?? "" ?? ""}`,
		...$.get(activeTheme)?.attrs,
		[$.CLASS]: { "ab-viewport-highlighted": highlighted() }
	}), void 0, void 0, void 0, "svelte-17oxi2j");
	var node_4 = $.child(div_5);
	var consequent_5 = ($$anchor) => {
		var div_6 = root_2$2();
		let classes_3;
		var node_5 = $.child(div_6);
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_6 = $.first_child(fragment_1);
			$.snippet(node_6, () => $$props.board.render, () => $.get(renderContext));
			$.append($$anchor, fragment_1);
		};
		var consequent_4 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_7 = $.first_child(fragment_2);
			$.component(node_7, () => $.get(BoardComponent), ($$anchor, BoardComponent_1) => {
				BoardComponent_1($$anchor, $.spread_props(() => $$props.board.props));
			});
			$.append($$anchor, fragment_2);
		};
		$.if(node_5, ($$render) => {
			if ($$props.board.render) $$render(consequent_3);
			else if ($.get(BoardComponent)) $$render(consequent_4, 1);
		});
		$.reset(div_6);
		$.template_effect(() => classes_3 = $.set_class(div_6, 1, "ab-scroll svelte-17oxi2j", null, classes_3, {
			"ab-scroll-interactive": $$props.tool === "interact" && zoom() >= .45,
			"ab-non-interactive": $$props.tool === "pan"
		}));
		$.append($$anchor, div_6);
	};
	var alternate = ($$anchor) => {
		var div_7 = root_3$2();
		var p = $.sibling($.child(div_7), 2);
		var text_3 = $.only_child(p, true);
		var p_1 = $.sibling(p, 2);
		var text_4 = $.only_child(p_1);
		$.reset(div_7);
		$.template_effect(() => {
			$.set_text(text_3, $$props.board.title);
			$.set_text(text_4, `Virtualized (${$$props.board.width ?? ""} × ${$$props.board.height ?? ""})`);
		});
		$.append($$anchor, div_7);
	};
	$.if(node_4, ($$render) => {
		if ($.get(isMounted)) $$render(consequent_5);
		else $$render(alternate, -1);
	});
	var node_8 = $.sibling(node_4, 2);
	var consequent_6 = ($$anchor) => {
		var div_8 = root_4$2();
		var span_3 = $.child(div_8);
		var text_5 = $.only_child(span_3, true);
		$.reset(div_8);
		$.template_effect(() => {
			$.set_style(div_8, `left: ${$.get(hoverBox).left ?? ""}px; top: ${$.get(hoverBox).top ?? ""}px; width: ${$.get(hoverBox).width ?? ""}px; height: ${$.get(hoverBox).height ?? ""}px;`);
			$.set_text(text_5, $.get(hoverBox).label);
		});
		$.append($$anchor, div_8);
	};
	$.if(node_8, ($$render) => {
		if ($.get(hoverBox) && $$props.tool === "comment") $$render(consequent_6);
	});
	var node_9 = $.sibling(node_8, 2);
	var consequent_7 = ($$anchor) => {
		var div_9 = root_6$2();
		$.each(div_9, 20, () => $.get(gridIndices), (idx) => idx, ($$anchor, idx) => {
			var div_10 = root_5$2();
			$.append($$anchor, div_10);
		});
		$.reset(div_9);
		$.template_effect(() => $.set_style(div_9, `grid-template-columns: repeat(${$.get(gridCols) ?? ""}, minmax(0, 1fr));`));
		$.append($$anchor, div_9);
	};
	$.if(node_9, ($$render) => {
		if ($$props.showGrid) $$render(consequent_7);
	});
	$.reset(div_5);
	$.bind_this(div_5, ($$value) => $.set(viewportEl, $$value), () => $.get(viewportEl));
	var svg = $.sibling(div_5, 2);
	$.each(svg, 21, () => $$props.comments, (pin) => pin.id, ($$anchor, pin) => {
		const pos = $.derived(() => getPinPos($.get(pin)));
		const x1 = $.derived(() => $.get(pin).artboard.xPct / 100 * $$props.board.width);
		const y1 = $.derived(() => $.get(pin).artboard.yPct / 100 * $$props.board.height);
		const x2 = $.derived(() => $.get(pos).xPct / 100 * $$props.board.width);
		const y2 = $.derived(() => $.get(pos).yPct / 100 * $$props.board.height);
		var fragment_3 = $.comment();
		var node_10 = $.first_child(fragment_3);
		var consequent_8 = ($$anchor) => {
			const strokeColor = $.derived(() => $.get(pin).status === "resolved" ? "#10b981" : "#f59e0b");
			var fragment_4 = root_7$2();
			var line = $.first_child(fragment_4);
			var circle = $.sibling(line);
			$.template_effect(() => {
				$.set_attribute(line, "x1", $.get(x1));
				$.set_attribute(line, "y1", $.get(y1));
				$.set_attribute(line, "x2", $.get(x2));
				$.set_attribute(line, "y2", $.get(y2));
				$.set_attribute(line, "stroke", $.get(strokeColor));
				$.set_attribute(circle, "cx", $.get(x1));
				$.set_attribute(circle, "cy", $.get(y1));
				$.set_attribute(circle, "fill", $.get(strokeColor));
			});
			$.append($$anchor, fragment_4);
		};
		var d = $.derived(() => Math.hypot($.get(x2) - $.get(x1), $.get(y2) - $.get(y1)) > 4);
		$.if(node_10, ($$render) => {
			if ($.get(d)) $$render(consequent_8);
		});
		$.append($$anchor, fragment_3);
	});
	$.reset(svg);
	var node_11 = $.sibling(svg, 2);
	$.each(node_11, 19, () => $$props.comments, (pin) => pin.id, ($$anchor, pin, index) => {
		const pos = $.derived(() => getPinPos($.get(pin)));
		const run = $.derived(() => runsMap()[$.get(pin).id]);
		const running = $.derived(() => $.get(run)?.status === "running");
		const queued = $.derived(() => $.get(run)?.status === "queued");
		const sourceBadge = $.derived(() => formatSourceBadge($.get(pin).target.source));
		var div_11 = root_17$1();
		let classes_4;
		var button_2 = $.child(div_11);
		let classes_5;
		var node_12 = $.child(button_2);
		var consequent_9 = ($$anchor) => {
			var span_4 = root_8$2();
			Loader_circle($.child(span_4), { size: 13 });
			$.reset(span_4);
			$.append($$anchor, span_4);
		};
		var consequent_10 = ($$anchor) => {
			Check($$anchor, { size: 14 });
		};
		var alternate_1 = ($$anchor) => {
			var text_6 = $.text();
			$.template_effect(() => $.set_text(text_6, $.get(index) + 1));
			$.append($$anchor, text_6);
		};
		$.if(node_12, ($$render) => {
			if ($.get(running)) $$render(consequent_9);
			else if ($.get(pin).status === "resolved") $$render(consequent_10, 1);
			else $$render(alternate_1, -1);
		});
		$.reset(button_2);
		var node_14 = $.sibling(button_2, 2);
		var consequent_17 = ($$anchor) => {
			var div_12 = root_16$1();
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var span_5 = $.child(div_14);
			var text_7 = $.only_child(span_5, true);
			var node_15 = $.sibling(span_5, 2);
			var consequent_11 = ($$anchor) => {
				var span_6 = root_9$2();
				var text_8 = $.only_child(span_6, true);
				$.template_effect(() => $.set_text(text_8, $.get(sourceBadge)));
				$.append($$anchor, span_6);
			};
			$.if(node_15, ($$render) => {
				if ($.get(sourceBadge)) $$render(consequent_11);
			});
			$.reset(div_14);
			var div_15 = $.sibling(div_14, 2);
			var node_16 = $.child(div_15);
			var consequent_12 = ($$anchor) => {
				var button_3 = root_10$2();
				Send($.child(button_3), { size: 13 });
				$.reset(button_3);
				$.delegated("click", button_3, () => {
					$$props.onsendtoagent?.([$.get(pin).id]);
				});
				$.append($$anchor, button_3);
			};
			$.if(node_16, ($$render) => {
				if (agentEnabled() && $.get(pin).status === "open" && !$.get(running) && !$.get(queued)) $$render(consequent_12);
			});
			var button_4 = $.sibling(node_16, 2);
			Pencil($.child(button_4), { size: 13 });
			$.reset(button_4);
			var button_5 = $.sibling(button_4, 2);
			Check($.child(button_5), { size: 14 });
			$.reset(button_5);
			var button_6 = $.sibling(button_5, 2);
			Trash($.child(button_6), { size: 14 });
			$.reset(button_6);
			var button_7 = $.sibling(button_6, 2);
			X($.child(button_7), { size: 14 });
			$.reset(button_7);
			$.reset(div_15);
			$.reset(div_13);
			var node_22 = $.sibling(div_13, 2);
			var consequent_13 = ($$anchor) => {
				var div_16 = root_11$2();
				var div_17 = $.sibling($.child(div_16), 2);
				var button_8 = $.child(div_17);
				var button_9 = $.sibling(button_8, 2);
				$.reset(div_17);
				$.reset(div_16);
				$.delegated("click", button_8, () => {
					$.set(confirmingDeleteId, null);
				});
				$.delegated("click", button_9, () => {
					$$props.ondeletecomment?.($.get(pin).id);
					$.set(confirmingDeleteId, null);
					$.set(openCommentId, null);
				});
				$.append($$anchor, div_16);
			};
			var consequent_14 = ($$anchor) => {
				var fragment_7 = root_12$2();
				var textarea = $.first_child(fragment_7);
				$.remove_textarea_child(textarea);
				var div_18 = $.sibling(textarea, 2);
				var button_10 = $.child(div_18);
				var button_11 = $.sibling(button_10, 2);
				$.reset(div_18);
				$.delegated("keydown", textarea, (e) => {
					if (e.key === "Escape") $.set(editingCommentId, null);
					else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submitEdit($.get(pin).id);
				});
				$.bind_value(textarea, () => $.get(editText), ($$value) => $.set(editText, $$value));
				$.delegated("click", button_10, () => {
					$.set(editingCommentId, null);
				});
				$.delegated("click", button_11, () => {
					submitEdit($.get(pin).id);
				});
				$.append($$anchor, fragment_7);
			};
			var alternate_2 = ($$anchor) => {
				var fragment_8 = root_15$2();
				var p_2 = $.first_child(fragment_8);
				let classes_6;
				var text_9 = $.only_child(p_2, true);
				var node_23 = $.sibling(p_2, 2);
				var consequent_15 = ($$anchor) => {
					var p_3 = root_13$2();
					var text_10 = $.only_child(p_3);
					$.template_effect(() => $.set_text(text_10, `↳ ${$.get(pin).resolution ?? ""}`));
					$.append($$anchor, p_3);
				};
				$.if(node_23, ($$render) => {
					if ($.get(pin).resolution) $$render(consequent_15);
				});
				var node_24 = $.sibling(node_23, 2);
				var consequent_16 = ($$anchor) => {
					var p_4 = root_14$2();
					var text_11 = $.only_child(p_4);
					$.template_effect(() => $.set_text(text_11, `Agent: ${$.get(run).status ?? ""}${$.get(run).error ? ` — ${$.get(run).error}` : ""}`));
					$.append($$anchor, p_4);
				};
				$.if(node_24, ($$render) => {
					if ($.get(run) && $.get(run).status !== "done") $$render(consequent_16);
				});
				$.template_effect(() => {
					classes_6 = $.set_class(p_2, 1, "ab-popover-text svelte-17oxi2j", null, classes_6, { "ab-popover-text-resolved": $.get(pin).status === "resolved" });
					$.set_text(text_9, $.get(pin).text);
				});
				$.append($$anchor, fragment_8);
			};
			$.if(node_22, ($$render) => {
				if ($.get(confirmingDeleteId) === $.get(pin).id) $$render(consequent_13);
				else if ($.get(editingCommentId) === $.get(pin).id) $$render(consequent_14, 1);
				else $$render(alternate_2, -1);
			});
			$.reset(div_12);
			$.template_effect(() => {
				$.set_text(text_7, $.get(pin).author);
				button_4.disabled = $.get(running);
				$.set_attribute(button_5, "title", $.get(pin).status === "resolved" ? "Reopen" : "Mark resolved");
				button_5.disabled = $.get(running);
				button_6.disabled = $.get(running);
			});
			$.delegated("click", button_4, () => {
				startEdit($.get(pin));
			});
			$.delegated("click", button_5, () => {
				$$props.ontogglecomment?.($.get(pin));
			});
			$.delegated("click", button_6, () => {
				$.set(confirmingDeleteId, $.get(pin).id, true);
				$.set(editingCommentId, null);
			});
			$.delegated("click", button_7, () => {
				$.set(openCommentId, null);
				$.set(editingCommentId, null);
				$.set(confirmingDeleteId, null);
			});
			$.append($$anchor, div_12);
		};
		$.if(node_14, ($$render) => {
			if ($.get(openCommentId) === $.get(pin).id) $$render(consequent_17);
		});
		$.reset(div_11);
		$.template_effect(() => {
			classes_4 = $.set_class(div_11, 1, "ab-pin-anchor svelte-17oxi2j", null, classes_4, { "ab-pin-open": $.get(openCommentId) === $.get(pin).id || $.get(draggingPin)?.id === $.get(pin).id });
			$.set_style(div_11, `left: ${$.get(pos).xPct ?? ""}%; top: ${$.get(pos).yPct ?? ""}%;`);
			classes_5 = $.set_class(button_2, 1, "ab-pin-badge svelte-17oxi2j", null, classes_5, {
				"ab-pin-resolved": $.get(pin).status === "resolved",
				"ab-pin-running": $.get(running),
				"ab-pin-dragging": $.get(draggingPin)?.id === $.get(pin).id && $.get(draggingPin).moved
			});
		});
		$.delegated("click", div_11, (e) => {
			e.stopPropagation();
		});
		$.delegated("pointerdown", button_2, (e) => {
			handlePinPointerDown(e, $.get(pin));
		});
		$.delegated("pointermove", button_2, handlePinPointerMove);
		$.delegated("pointerup", button_2, (e) => {
			handlePinPointerUp(e, $.get(pin));
		});
		$.event("pointercancel", button_2, (e) => {
			handlePinPointerUp(e, $.get(pin));
		});
		$.append($$anchor, div_11);
	});
	var node_25 = $.sibling(node_11, 2);
	var consequent_19 = ($$anchor) => {
		const draftBadge = $.derived(() => formatSourceBadge($.get(draftPin).target.source));
		var div_19 = root_18$1();
		var div_20 = $.child(div_19);
		Message_square_plus($.child(div_20), { size: 14 });
		$.reset(div_20);
		var div_21 = $.sibling(div_20, 2);
		var div_22 = $.child(div_21);
		var node_27 = $.sibling($.child(div_22), 2);
		var consequent_18 = ($$anchor) => {
			var span_7 = root_9$2();
			var text_12 = $.only_child(span_7, true);
			$.template_effect(() => $.set_text(text_12, $.get(draftBadge)));
			$.append($$anchor, span_7);
		};
		$.if(node_27, ($$render) => {
			if ($.get(draftBadge)) $$render(consequent_18);
		});
		$.reset(div_22);
		var textarea_1 = $.sibling(div_22, 2);
		$.remove_textarea_child(textarea_1);
		var div_23 = $.sibling(textarea_1, 2);
		var button_12 = $.child(div_23);
		var button_13 = $.sibling(button_12, 2);
		$.reset(div_23);
		$.reset(div_21);
		$.reset(div_19);
		$.template_effect(() => $.set_style(div_19, `left: ${$.get(draftPin).xPct ?? ""}%; top: ${$.get(draftPin).yPct ?? ""}%;`));
		$.delegated("click", div_19, (e) => {
			e.stopPropagation();
		});
		$.delegated("keydown", textarea_1, (e) => {
			if (e.key === "Escape") $.set(draftPin, null);
			else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submitDraftComment();
		});
		$.bind_value(textarea_1, () => $.get(draftText), ($$value) => $.set(draftText, $$value));
		$.delegated("click", button_12, () => {
			$.set(draftPin, null);
		});
		$.delegated("click", button_13, submitDraftComment);
		$.append($$anchor, div_19);
	};
	$.if(node_25, ($$render) => {
		if ($.get(draftPin)) $$render(consequent_19);
	});
	$.reset(div_4);
	$.bind_this(div_4, ($$value) => $.set(frameEl, $$value), () => $.get(frameEl));
	$.reset(div);
	$.template_effect(($0) => {
		classes = $.set_class(div, 1, "ab-board svelte-17oxi2j", null, classes, { "ab-board-elevated": $0 });
		$.set_style(div, `left: ${$$props.board.x ?? ""}px; top: ${$$props.board.y ?? ""}px; width: ${$$props.board.width ?? ""}px;`);
		$.set_text(text, $$props.board.title);
		$.set_text(text_1, $$props.board.viewportLabel);
		classes_2 = $.set_class(div_4, 1, "ab-frame-outer svelte-17oxi2j", null, classes_2, { "ab-cursor-comment": $$props.tool === "comment" });
		$.set_style(div_4, `width: ${$$props.board.width ?? ""}px; height: ${$$props.board.height ?? ""}px;`);
		$.set_attribute(svg, "viewBox", `0 0 ${$$props.board.width ?? ""} ${$$props.board.height ?? ""}`);
	}, [() => Boolean($.get(draftPin) || $.get(openCommentId) || $.get(themeMenuOpen) || $.get(draggingPin))]);
	$.delegated("click", button, () => {
		$$props.onfocusboard?.($$props.board);
	});
	$.delegated("click", button_1, () => {
		$$props.onfocusboard?.($$props.board);
	});
	$.append($$anchor, div);
	$.pop();
}
$.delegate([
	"click",
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
// src/client/CommentsPanel.svelte
var root$1 = $.from_html(`<div class="ab-cp-banner ab-cp-banner-warn svelte-17jpg53"><div class="ab-cp-banner-text svelte-17jpg53"><!> <span> </span></div> <div class="ab-cp-banner-actions svelte-17jpg53"><button type="button" class="ab-cp-mini-btn ab-cp-mini-primary svelte-17jpg53"><!> Resume</button> <button type="button" class="ab-cp-mini-btn svelte-17jpg53"><!> Stop</button></div></div>`);
var root_1$1 = $.from_html(`<div class="ab-cp-banner ab-cp-banner-run svelte-17jpg53"><div class="ab-cp-banner-text svelte-17jpg53"><span class="ab-spin svelte-17jpg53"><!></span> <span> </span></div> <button type="button" class="ab-cp-mini-btn ab-cp-mini-danger svelte-17jpg53"><!> Stop</button></div>`);
var root_2$1 = $.from_html(`<button type="button" class="ab-cp-action-btn ab-cp-action-primary svelte-17jpg53"><!> </button> <button type="button" class="ab-cp-action-btn svelte-17jpg53"><!> </button>`, 1);
var root_3$1 = $.from_html(`<button type="button" class="ab-cp-action-btn ab-cp-action-full svelte-17jpg53"><!> Enable Agent Runner…</button>`);
var root_4$1 = $.from_html(`<div class="ab-cp-bar svelte-17jpg53"><!></div>`);
var root_5$1 = $.from_html(`<div class="ab-cp-confirm svelte-17jpg53"><span> </span> <div class="ab-cp-confirm-btns svelte-17jpg53"><button type="button" class="ab-cp-mini-btn svelte-17jpg53">Cancel</button> <button type="button" class="ab-cp-mini-btn ab-cp-mini-danger-solid svelte-17jpg53">Clear</button></div></div>`);
var root_6$1 = $.from_html(`<button type="button" class="ab-cp-action-btn ab-cp-action-full svelte-17jpg53"><!> </button>`);
var root_7$1 = $.from_html(`<p class="ab-cp-empty svelte-17jpg53"> </p>`);
var root_8$1 = $.from_html(`<input type="checkbox" aria-label="Select comment" class="ab-cp-check svelte-17jpg53"/>`);
var root_9$1 = $.from_html(`<span class="ab-cp-source svelte-17jpg53"> </span>`);
var root_10$1 = $.from_html(`<div class="ab-cp-confirm svelte-17jpg53"><span>Delete comment?</span> <div class="ab-cp-confirm-btns svelte-17jpg53"><button type="button" class="ab-cp-mini-btn svelte-17jpg53">Cancel</button> <button type="button" class="ab-cp-mini-btn ab-cp-mini-danger-solid svelte-17jpg53">Delete</button></div></div>`);
var root_11$1 = $.from_html(`<p class="ab-cp-resolution svelte-17jpg53"> </p>`);
var root_12$1 = $.from_html(`<!> <span>Queued</span>`, 1);
var root_13$1 = $.from_html(`<span class="ab-spin svelte-17jpg53"><!></span> <span>Running…</span>`, 1);
var root_14$1 = $.from_html(`<!> <span>Resolved by agent</span>`, 1);
var root_15$1 = $.from_html(`<!> <span>Needs attention</span>`, 1);
var root_16 = $.from_html(`<!> <span>Failed</span>`, 1);
var root_17 = $.from_html(`<span>Cancelled</span>`);
var root_18 = $.from_html(`<span class="ab-cp-protected-warn svelte-17jpg53">⚠ protected</span>`);
var root_19 = $.from_html(`<div class="ab-cp-run-row svelte-17jpg53"><!> <!></div>`);
var root_20 = $.from_html(`<div class="ab-cp-card svelte-17jpg53"><div class="ab-cp-card-top svelte-17jpg53"><!> <button type="button" class="ab-cp-card-link svelte-17jpg53"><span class="ab-cp-board-title svelte-17jpg53"> </span> <!></button> <div class="ab-cp-card-btns svelte-17jpg53"><button type="button" class="ab-cp-icon-btn svelte-17jpg53"><!></button> <button type="button" title="Delete comment" class="ab-cp-icon-btn ab-cp-icon-del svelte-17jpg53"><!></button></div></div> <!> <button type="button" class="ab-cp-card-body svelte-17jpg53"><p class="ab-cp-text svelte-17jpg53"> </p> <!></button> <!></div>`);
var root_21 = $.from_html(`<div class="ab-cp-root svelte-17jpg53"><div class="ab-cp-tabs svelte-17jpg53"><div class="ab-cp-tab-group svelte-17jpg53"><button type="button"> </button> <button type="button"> </button></div> <button type="button" aria-label="Agent settings" title="Agent Runner Settings"><!></button></div> <!> <!> <div class="ab-cp-list svelte-17jpg53"><!></div></div>`);
const $$css$1 = {
	hash: "svelte-17jpg53",
	code: ".ab-cp-root.svelte-17jpg53 {display:flex;flex-direction:column;flex:1;min-height:0;}.ab-cp-tabs.svelte-17jpg53 {display:flex;align-items:center;justify-content:space-between;gap:6px;border-bottom:1px solid var(--ab-border-subtle);padding:8px 10px;}.ab-cp-tab-group.svelte-17jpg53 {display:flex;gap:4px;}.ab-cp-tab.svelte-17jpg53 {border:none;border-radius:6px;background:transparent;padding:4px 8px;font-size:11px;font-weight:500;color:var(--ab-text-muted);cursor:pointer;}.ab-cp-tab.svelte-17jpg53:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-cp-tab-active.svelte-17jpg53 {background:var(--ab-pill-bg);color:var(--ab-text);font-weight:600;}.ab-cp-gear.svelte-17jpg53 {display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ab-border);border-radius:6px;background:transparent;padding:5px;color:var(--ab-text-muted);cursor:pointer;}.ab-cp-gear.svelte-17jpg53:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-cp-gear-on.svelte-17jpg53 {border-color:rgba(16, 185, 129, 0.5);color:#10b981;}.ab-cp-banner.svelte-17jpg53 {display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--ab-border-subtle);padding:8px 10px;font-size:11px;}.ab-cp-banner-warn.svelte-17jpg53 {background:rgba(245, 158, 11, 0.12);color:#f59e0b;}.ab-cp-banner-run.svelte-17jpg53 {background:rgba(99, 102, 241, 0.14);color:var(--ab-accent-text);flex-direction:row;align-items:center;justify-content:space-between;}.ab-cp-banner-text.svelte-17jpg53 {display:flex;align-items:center;gap:6px;min-width:0;}.ab-cp-banner-actions.svelte-17jpg53 {display:flex;gap:6px;}.ab-cp-mini-btn.svelte-17jpg53 {display:inline-flex;align-items:center;gap:4px;border:1px solid var(--ab-border);border-radius:5px;background:var(--ab-surface-solid);padding:3px 7px;font-size:10px;font-weight:600;color:var(--ab-text);cursor:pointer;}.ab-cp-mini-primary.svelte-17jpg53 {border-color:#4f46e5;background:#4f46e5;color:#ffffff;}.ab-cp-mini-danger.svelte-17jpg53 {border-color:rgba(244, 63, 94, 0.5);color:#f43f5e;}.ab-cp-mini-danger-solid.svelte-17jpg53 {border-color:#e11d48;background:#e11d48;color:#ffffff;}.ab-cp-confirm.svelte-17jpg53 {margin-top:6px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:6px;border-radius:6px;border:1px solid rgba(244, 63, 94, 0.35);background:rgba(244, 63, 94, 0.1);padding:5px 8px;font-size:10.5px;color:#fb7185;}.ab-cp-confirm-btns.svelte-17jpg53 {display:flex;gap:4px;}.ab-cp-bar.svelte-17jpg53 {display:flex;gap:6px;border-bottom:1px solid var(--ab-border-subtle);padding:8px 10px;}.ab-cp-action-btn.svelte-17jpg53 {flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--ab-border);border-radius:7px;background:var(--ab-input-bg);padding:6px 8px;font-size:11px;font-weight:600;color:var(--ab-text);cursor:pointer;}.ab-cp-action-btn.svelte-17jpg53:disabled {opacity:0.45;cursor:not-allowed;}.ab-cp-action-primary.svelte-17jpg53 {border-color:#4f46e5;background:#4f46e5;color:#ffffff;}.ab-cp-action-full.svelte-17jpg53 {width:100%;}.ab-cp-list.svelte-17jpg53 {flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px;}.ab-cp-empty.svelte-17jpg53 {margin:24px 12px;text-align:center;font-size:11px;line-height:1.5;color:var(--ab-text-subtle);}.ab-cp-card.svelte-17jpg53 {border:1px solid var(--ab-border-subtle);border-radius:9px;background:var(--ab-input-bg);padding:8px;}.ab-cp-card-top.svelte-17jpg53 {display:flex;align-items:center;gap:6px;}.ab-cp-check.svelte-17jpg53 {accent-color:#6366f1;cursor:pointer;margin:0;}.ab-cp-card-link.svelte-17jpg53 {flex:1;min-width:0;border:none;background:transparent;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:1px;}.ab-cp-board-title.svelte-17jpg53 {font-size:11px;font-weight:600;color:var(--ab-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-cp-source.svelte-17jpg53 {font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-accent-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-cp-card-btns.svelte-17jpg53 {display:flex;gap:2px;flex-shrink:0;}.ab-cp-icon-btn.svelte-17jpg53 {display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;padding:4px;color:var(--ab-text-muted);cursor:pointer;}.ab-cp-icon-btn.svelte-17jpg53:hover:not(:disabled) {background:var(--ab-hover);color:var(--ab-text);}.ab-cp-icon-btn.svelte-17jpg53:disabled {opacity:0.35;cursor:not-allowed;}.ab-cp-icon-del.svelte-17jpg53:hover:not(:disabled) {color:#f43f5e;}.ab-cp-card-body.svelte-17jpg53 {width:100%;border:none;background:transparent;padding:0;margin-top:6px;text-align:left;cursor:pointer;}.ab-cp-text.svelte-17jpg53 {margin:0;font-size:11.5px;line-height:1.45;color:var(--ab-text);word-break:break-word;}.ab-cp-resolution.svelte-17jpg53 {margin:4px 0 0;font-size:10.5px;line-height:1.4;color:#10b981;}.ab-cp-run-row.svelte-17jpg53 {margin-top:6px;padding-top:5px;border-top:1px solid var(--ab-border-subtle);display:flex;align-items:center;gap:5px;font-size:10px;color:var(--ab-text-muted);}.ab-cp-protected-warn.svelte-17jpg53 {margin-left:auto;color:#f59e0b;font-weight:600;}.ab-spin.svelte-17jpg53 {display:inline-flex;\n    animation: svelte-17jpg53-ab-spin 1s linear infinite;}\n\n  @keyframes svelte-17jpg53-ab-spin {\n    from {\n      transform: rotate(0deg);\n    }\n    to {\n      transform: rotate(360deg);\n    }\n  }"
};
function CommentsPanel($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css$1);
	let activeTab = $.state("open");
	let confirmingDeleteId = $.state(null);
	let confirmingClearResolved = $.state(false);
	const selectedIds = new SvelteSet();
	const openComments = $.derived(() => $$props.comments.filter((c) => {
		return c.status === "open";
	}));
	const resolvedComments = $.derived(() => $$props.comments.filter((c) => {
		return c.status === "resolved";
	}));
	const visibleComments = $.derived(() => $.get(activeTab) === "open" ? $.get(openComments) : $.get(resolvedComments));
	const runsMap = $.derived(() => $$props.agentInfo?.state.runs ?? {});
	const agentEnabled = $.derived(() => $$props.agentInfo?.settings.enabled ?? false);
	const agentWorking = $.derived(() => $$props.agentInfo?.state.activeRunId !== null && $$props.agentInfo !== null);
	const agentPaused = $.derived(() => $$props.agentInfo?.state.paused ?? null);
	const sendableOpenIds = $.derived(() => $.get(openComments).filter((c) => {
		const st = $.get(runsMap)[c.id]?.status;
		return st !== "running" && st !== "queued";
	}).map((c) => {
		return c.id;
	}));
	const selectedSendableIds = $.derived(() => $.get(sendableOpenIds).filter((id) => {
		return selectedIds.has(id);
	}));
	function getRun(id) {
		return $.get(runsMap)[id];
	}
	function isRunning(id) {
		return getRun(id)?.status === "running";
	}
	function toggleSelect(id) {
		if (selectedIds.has(id)) selectedIds.delete(id);
		else selectedIds.add(id);
	}
	function handleSendSelected() {
		if ($.get(selectedSendableIds).length === 0) return;
		$$props.onsendtoagent([...$.get(selectedSendableIds)]);
		for (const id of $.get(selectedSendableIds)) selectedIds.delete(id);
	}
	function handleSendAll() {
		if ($.get(sendableOpenIds).length === 0) return;
		$$props.onsendtoagent([...$.get(sendableOpenIds)]);
		selectedIds.clear();
	}
	var div = root_21();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var button = $.child(div_2);
	let classes;
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	let classes_1;
	var text_1 = $.only_child(button_1);
	$.reset(div_2);
	var button_2 = $.sibling(div_2, 2);
	let classes_2;
	Settings($.child(button_2), { size: 13 });
	$.reset(button_2);
	$.reset(div_1);
	var node_1 = $.sibling(div_1, 2);
	var consequent = ($$anchor) => {
		var div_3 = root$1();
		var div_4 = $.child(div_3);
		var node_2 = $.child(div_4);
		Triangle_exclamation_point(node_2, { size: 13 });
		var span = $.sibling(node_2, 2);
		var text_2 = $.only_child(span, true);
		$.reset(div_4);
		var div_5 = $.sibling(div_4, 2);
		var button_3 = $.child(div_5);
		Play($.child(button_3), { size: 11 });
		$.next();
		$.reset(button_3);
		var button_4 = $.sibling(button_3, 2);
		Square($.child(button_4), { size: 11 });
		$.next();
		$.reset(button_4);
		$.reset(div_5);
		$.reset(div_3);
		$.template_effect(() => $.set_text(text_2, $.get(agentPaused).message));
		$.delegated("click", button_3, function(...$$args) {
			$$props.onresumeagent?.apply(this, $$args);
		});
		$.delegated("click", button_4, function(...$$args) {
			$$props.oncancelagent?.apply(this, $$args);
		});
		$.append($$anchor, div_3);
	};
	var consequent_1 = ($$anchor) => {
		var div_6 = root_1$1();
		var div_7 = $.child(div_6);
		var span_1 = $.child(div_7);
		Loader_circle($.child(span_1), { size: 13 });
		$.reset(span_1);
		var span_2 = $.sibling(span_1, 2);
		var text_3 = $.only_child(span_2);
		$.reset(div_7);
		var button_5 = $.sibling(div_7, 2);
		Square($.child(button_5), { size: 11 });
		$.next();
		$.reset(button_5);
		$.reset(div_6);
		$.template_effect(() => $.set_text(text_3, `Agent resolving (${$$props.agentInfo?.state.activeCommentIds.length ?? 0 ?? ""})…`));
		$.delegated("click", button_5, function(...$$args) {
			$$props.oncancelagent?.apply(this, $$args);
		});
		$.append($$anchor, div_6);
	};
	$.if(node_1, ($$render) => {
		if ($.get(agentPaused)) $$render(consequent);
		else if ($.get(agentWorking)) $$render(consequent_1, 1);
	});
	var node_7 = $.sibling(node_1, 2);
	var consequent_3 = ($$anchor) => {
		var div_8 = root_4$1();
		var node_8 = $.child(div_8);
		var consequent_2 = ($$anchor) => {
			var fragment = root_2$1();
			var button_6 = $.first_child(fragment);
			var node_9 = $.child(button_6);
			Send(node_9, { size: 12 });
			var text_4 = $.sibling(node_9);
			$.reset(button_6);
			var button_7 = $.sibling(button_6, 2);
			var node_10 = $.child(button_7);
			Bot(node_10, { size: 12 });
			var text_5 = $.sibling(node_10);
			$.reset(button_7);
			$.template_effect(($0, $1) => {
				button_6.disabled = $0;
				$.set_text(text_4, ` Send (${$.get(selectedSendableIds).length ?? ""})`);
				button_7.disabled = $1;
				$.set_text(text_5, ` Send all (${$.get(sendableOpenIds).length ?? ""})`);
			}, [() => $.get(selectedSendableIds).length === 0 || Boolean($.get(agentPaused)), () => $.get(sendableOpenIds).length === 0 || Boolean($.get(agentPaused))]);
			$.delegated("click", button_6, handleSendSelected);
			$.delegated("click", button_7, handleSendAll);
			$.append($$anchor, fragment);
		};
		var alternate = ($$anchor) => {
			var button_8 = root_3$1();
			Bot($.child(button_8), { size: 12 });
			$.next();
			$.reset(button_8);
			$.delegated("click", button_8, function(...$$args) {
				$$props.onopenagentsettings?.apply(this, $$args);
			});
			$.append($$anchor, button_8);
		};
		$.if(node_8, ($$render) => {
			if ($.get(agentEnabled)) $$render(consequent_2);
			else $$render(alternate, -1);
		});
		$.reset(div_8);
		$.append($$anchor, div_8);
	};
	var consequent_5 = ($$anchor) => {
		var div_9 = root_4$1();
		var node_12 = $.child(div_9);
		var consequent_4 = ($$anchor) => {
			var div_10 = root_5$1();
			var span_3 = $.child(div_10);
			var text_6 = $.only_child(span_3);
			var div_11 = $.sibling(span_3, 2);
			var button_9 = $.child(div_11);
			var button_10 = $.sibling(button_9, 2);
			$.reset(div_11);
			$.reset(div_10);
			$.template_effect(() => $.set_text(text_6, `Clear all ${$.get(resolvedComments).length ?? ""} resolved?`));
			$.delegated("click", button_9, () => {
				$.set(confirmingClearResolved, false);
			});
			$.delegated("click", button_10, () => {
				$$props.onclearresolved();
				$.set(confirmingClearResolved, false);
			});
			$.append($$anchor, div_10);
		};
		var alternate_1 = ($$anchor) => {
			var button_11 = root_6$1();
			var node_13 = $.child(button_11);
			Trash(node_13, { size: 12 });
			var text_7 = $.sibling(node_13);
			$.reset(button_11);
			$.template_effect(() => $.set_text(text_7, ` Clear resolved (${$.get(resolvedComments).length ?? ""})`));
			$.delegated("click", button_11, () => {
				$.set(confirmingClearResolved, true);
			});
			$.append($$anchor, button_11);
		};
		$.if(node_12, ($$render) => {
			if ($.get(confirmingClearResolved)) $$render(consequent_4);
			else $$render(alternate_1, -1);
		});
		$.reset(div_9);
		$.append($$anchor, div_9);
	};
	$.if(node_7, ($$render) => {
		if ($.get(activeTab) === "open" && $.get(openComments).length > 0) $$render(consequent_3);
		else if ($.get(activeTab) === "resolved" && $.get(resolvedComments).length > 0) $$render(consequent_5, 1);
	});
	var div_12 = $.sibling(node_7, 2);
	var node_14 = $.child(div_12);
	var consequent_6 = ($$anchor) => {
		var p = root_7$1();
		var text_8 = $.only_child(p, true);
		$.template_effect(() => $.set_text(text_8, $.get(activeTab) === "open" ? "No open comments. Switch to Comment mode (C) and click any element on an artboard." : "No resolved comments yet."));
		$.append($$anchor, p);
	};
	var alternate_4 = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_15 = $.first_child(fragment_1);
		$.each(node_15, 17, () => $.get(visibleComments), (item) => item.id, ($$anchor, item) => {
			const run = $.derived(() => getRun($.get(item).id));
			const running = $.derived(() => isRunning($.get(item).id));
			const sourceBadge = $.derived(() => formatSourceBadge($.get(item).target.source));
			var div_13 = root_20();
			var div_14 = $.child(div_13);
			var node_16 = $.child(div_14);
			var consequent_7 = ($$anchor) => {
				var input = root_8$1();
				$.remove_input_defaults(input);
				$.template_effect(($0) => {
					$.set_checked(input, $0);
					input.disabled = $.get(running) || $.get(run)?.status === "queued";
				}, [() => selectedIds.has($.get(item).id)]);
				$.delegated("change", input, () => {
					toggleSelect($.get(item).id);
				});
				$.append($$anchor, input);
			};
			$.if(node_16, ($$render) => {
				if ($.get(activeTab) === "open" && $.get(agentEnabled)) $$render(consequent_7);
			});
			var button_12 = $.sibling(node_16, 2);
			var span_4 = $.child(button_12);
			var text_9 = $.only_child(span_4, true);
			var node_17 = $.sibling(span_4, 2);
			var consequent_8 = ($$anchor) => {
				var span_5 = root_9$1();
				var text_10 = $.only_child(span_5, true);
				$.template_effect(() => $.set_text(text_10, $.get(sourceBadge)));
				$.append($$anchor, span_5);
			};
			$.if(node_17, ($$render) => {
				if ($.get(sourceBadge)) $$render(consequent_8);
			});
			$.reset(button_12);
			var div_15 = $.sibling(button_12, 2);
			var button_13 = $.child(div_15);
			var node_18 = $.child(button_13);
			var consequent_9 = ($$anchor) => {
				Rotate_ccw($$anchor, { size: 12 });
			};
			var alternate_2 = ($$anchor) => {
				Check($$anchor, { size: 12 });
			};
			$.if(node_18, ($$render) => {
				if ($.get(item).status === "resolved") $$render(consequent_9);
				else $$render(alternate_2, -1);
			});
			$.reset(button_13);
			var button_14 = $.sibling(button_13, 2);
			Trash($.child(button_14), { size: 12 });
			$.reset(button_14);
			$.reset(div_15);
			$.reset(div_14);
			var node_20 = $.sibling(div_14, 2);
			var consequent_10 = ($$anchor) => {
				var div_16 = root_10$1();
				var div_17 = $.sibling($.child(div_16), 2);
				var button_15 = $.child(div_17);
				var button_16 = $.sibling(button_15, 2);
				$.reset(div_17);
				$.reset(div_16);
				$.delegated("click", button_15, () => {
					$.set(confirmingDeleteId, null);
				});
				$.delegated("click", button_16, () => {
					$$props.ondeletecomment($.get(item).id);
					$.set(confirmingDeleteId, null);
				});
				$.append($$anchor, div_16);
			};
			$.if(node_20, ($$render) => {
				if ($.get(confirmingDeleteId) === $.get(item).id) $$render(consequent_10);
			});
			var button_17 = $.sibling(node_20, 2);
			var p_1 = $.child(button_17);
			var text_11 = $.only_child(p_1, true);
			var node_21 = $.sibling(p_1, 2);
			var consequent_11 = ($$anchor) => {
				var p_2 = root_11$1();
				var text_12 = $.only_child(p_2);
				$.template_effect(() => $.set_text(text_12, `↳ ${$.get(item).resolution ?? ""}`));
				$.append($$anchor, p_2);
			};
			$.if(node_21, ($$render) => {
				if ($.get(item).resolution) $$render(consequent_11);
			});
			$.reset(button_17);
			var node_22 = $.sibling(button_17, 2);
			var consequent_18 = ($$anchor) => {
				var div_18 = root_19();
				var node_23 = $.child(div_18);
				var consequent_12 = ($$anchor) => {
					var fragment_4 = root_12$1();
					Clock($.first_child(fragment_4), {
						size: 11,
						color: "#94a3b8"
					});
					$.next(2);
					$.append($$anchor, fragment_4);
				};
				var consequent_13 = ($$anchor) => {
					var fragment_5 = root_13$1();
					var span_6 = $.first_child(fragment_5);
					Loader_circle($.child(span_6), {
						size: 11,
						color: "#818cf8"
					});
					$.reset(span_6);
					$.next(2);
					$.append($$anchor, fragment_5);
				};
				var consequent_14 = ($$anchor) => {
					var fragment_6 = root_14$1();
					Circle_check($.first_child(fragment_6), {
						size: 11,
						color: "#10b981"
					});
					$.next(2);
					$.append($$anchor, fragment_6);
				};
				var consequent_15 = ($$anchor) => {
					var fragment_7 = root_15$1();
					Triangle_exclamation_point($.first_child(fragment_7), {
						size: 11,
						color: "#f59e0b"
					});
					$.next(2);
					$.append($$anchor, fragment_7);
				};
				var consequent_16 = ($$anchor) => {
					var fragment_8 = root_16();
					Circle_x($.first_child(fragment_8), {
						size: 11,
						color: "#f43f5e"
					});
					$.next(2);
					$.append($$anchor, fragment_8);
				};
				var alternate_3 = ($$anchor) => {
					var span_7 = root_17();
					$.append($$anchor, span_7);
				};
				$.if(node_23, ($$render) => {
					if ($.get(run).status === "queued") $$render(consequent_12);
					else if ($.get(run).status === "running") $$render(consequent_13, 1);
					else if ($.get(run).status === "done") $$render(consequent_14, 2);
					else if ($.get(run).status === "needs_attention") $$render(consequent_15, 3);
					else if ($.get(run).status === "failed") $$render(consequent_16, 4);
					else $$render(alternate_3, -1);
				});
				var node_29 = $.sibling(node_23, 2);
				var consequent_17 = ($$anchor) => {
					var span_8 = root_18();
					$.template_effect(($0) => $.set_attribute(span_8, "title", `Protected files modified: ${$0 ?? ""}`), [() => $.get(run).protectedTouched.join(", ")]);
					$.append($$anchor, span_8);
				};
				$.if(node_29, ($$render) => {
					if ($.get(run).protectedTouched.length > 0) $$render(consequent_17);
				});
				$.reset(div_18);
				$.template_effect(() => $.set_attribute(div_18, "title", $.get(run).error ?? $.get(run).summary ?? $.get(run).status));
				$.append($$anchor, div_18);
			};
			$.if(node_22, ($$render) => {
				if ($.get(run)) $$render(consequent_18);
			});
			$.reset(div_13);
			$.template_effect(() => {
				$.set_text(text_9, $.get(item).artboard.boardTitle);
				$.set_attribute(button_13, "title", $.get(item).status === "resolved" ? "Reopen" : "Mark resolved");
				button_13.disabled = $.get(running);
				button_14.disabled = $.get(running);
				$.set_text(text_11, $.get(item).text);
			});
			$.delegated("click", button_12, () => {
				$$props.onfocuscomment($.get(item));
			});
			$.delegated("click", button_13, () => {
				$$props.ontogglecomment($.get(item));
			});
			$.delegated("click", button_14, () => {
				$.set(confirmingDeleteId, $.get(item).id, true);
			});
			$.delegated("click", button_17, () => {
				$$props.onfocuscomment($.get(item));
			});
			$.append($$anchor, div_13);
		});
		$.append($$anchor, fragment_1);
	};
	$.if(node_14, ($$render) => {
		if ($.get(visibleComments).length === 0) $$render(consequent_6);
		else $$render(alternate_4, -1);
	});
	$.reset(div_12);
	$.reset(div);
	$.template_effect(() => {
		classes = $.set_class(button, 1, "ab-cp-tab svelte-17jpg53", null, classes, { "ab-cp-tab-active": $.get(activeTab) === "open" });
		$.set_text(text, `Open (${$.get(openComments).length ?? ""})`);
		classes_1 = $.set_class(button_1, 1, "ab-cp-tab svelte-17jpg53", null, classes_1, { "ab-cp-tab-active": $.get(activeTab) === "resolved" });
		$.set_text(text_1, `Resolved (${$.get(resolvedComments).length ?? ""})`);
		classes_2 = $.set_class(button_2, 1, "ab-cp-gear svelte-17jpg53", null, classes_2, { "ab-cp-gear-on": $.get(agentEnabled) });
	});
	$.delegated("click", button, () => {
		$.set(activeTab, "open");
	});
	$.delegated("click", button_1, () => {
		$.set(activeTab, "resolved");
	});
	$.delegated("click", button_2, function(...$$args) {
		$$props.onopenagentsettings?.apply(this, $$args);
	});
	$.append($$anchor, div);
	$.pop();
}
$.delegate(["click", "change"]);
// src/client/defaults.ts
let currentDefaults = {
	studioTheme: "dark",
	storageKey: "sveltekit-artboard-prefs-v1",
	appUrl: "/",
	apiBase: "/__artboard/api",
	defaultDebug: false
};
const setStudioDefaults = (patch) => {
	currentDefaults = {
		...currentDefaults,
		...patch
	};
};
const getStudioDefaults = () => {
	return currentDefaults;
};
// src/client/layout.ts
const BOARD_GAP_X = 72;
const SECTION_GAP_Y = 160;
const HEADER_OFFSET_Y = 76;
const START_X = 120;
const START_Y = 100;
const computeCanvasLayout = (inputSections, stressMultiplier = 1) => {
	const sections = [];
	const boards = [];
	let cursorY = START_Y;
	for (let pass = 0; pass < stressMultiplier; pass++) {
		const suffix = pass === 0 ? "" : `-stress-${pass}`;
		const titlePrefix = pass === 0 ? "" : `[Stress Copy #${pass}] `;
		for (const row of inputSections) {
			sections.push({
				id: `${row.id}${suffix}`,
				title: `${titlePrefix}${row.title}`,
				subtitle: row.subtitle,
				category: row.category,
				x: START_X,
				y: cursorY
			});
			let cursorX = START_X;
			let maxRowHeight = 0;
			for (const board of row.boards) {
				const { width, height, label } = board.viewport;
				boards.push({
					id: `${board.id}${suffix}`,
					title: pass === 0 ? board.title : `${board.title} (#${pass})`,
					section: `${titlePrefix}${row.title}`,
					category: row.category,
					viewport: board.viewport,
					viewportLabel: label ? `${label} (${width} × ${height})` : `${width} × ${height}`,
					width,
					height,
					x: cursorX,
					y: cursorY + HEADER_OFFSET_Y,
					defaultTheme: board.defaultTheme,
					render: board.render,
					component: board.component,
					props: board.props
				});
				cursorX += width + BOARD_GAP_X;
				if (height > maxRowHeight) maxRowHeight = height;
			}
			cursorY += HEADER_OFFSET_Y + maxRowHeight + SECTION_GAP_Y;
		}
	}
	return {
		sections,
		boards
	};
};
// src/client/ArtboardApp.svelte
var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_html(`<span></span>`);
var root_2 = $.from_html(`<span class="ab-row-pin-badge svelte-eeo971"> </span>`);
var root_3 = $.from_html(`<button type="button"><div class="ab-board-row-left svelte-eeo971"><!> <div class="ab-board-row-meta svelte-eeo971"><p class="ab-board-row-title svelte-eeo971"> </p> <p class="ab-board-row-dim svelte-eeo971"> </p></div></div> <!></button>`);
var root_4 = $.from_html(`<div class="ab-sidebar-filters svelte-eeo971"><div class="ab-search-wrap svelte-eeo971"><span class="ab-search-icon svelte-eeo971"><!></span> <input type="search" placeholder="Jump to artboard..." class="ab-search-input svelte-eeo971"/></div> <div class="ab-cat-row svelte-eeo971"></div></div> <div class="ab-board-list svelte-eeo971"></div>`, 1);
var root_5 = $.from_html(`<aside class="ab-sidebar svelte-eeo971"><div class="ab-sidebar-head svelte-eeo971"><div class="ab-brand svelte-eeo971"><div class="ab-brand-icon svelte-eeo971"><!></div> <div><h1 class="ab-brand-title svelte-eeo971">Artboard Studio</h1> <p class="ab-brand-badge svelte-eeo971">DEV-ONLY PLUGIN</p></div></div> <button type="button" title="Collapse sidebar" class="ab-icon-btn svelte-eeo971"><!></button></div> <div class="ab-side-tabs svelte-eeo971"><button type="button"> </button> <button type="button">Comments<!></button></div> <!> <div class="ab-sidebar-foot svelte-eeo971"><a class="ab-back-link svelte-eeo971"><!> Back to Live App</a></div></aside>`);
var root_6 = $.from_html(`<button type="button" title="Open sidebar" class="ab-pill-group ab-icon-pad svelte-eeo971"><!></button>`);
var root_7 = $.from_html(`<span class="ab-spin svelte-eeo971"><!></span> <span>Agent running…</span>`, 1);
var root_8 = $.from_html(`<!> <span>Agent paused</span>`, 1);
var root_9 = $.from_html(`<button type="button"><!></button>`);
var root_10 = $.from_html(`<!> <div class="ab-divider svelte-eeo971"></div>`, 1);
var root_11 = $.from_html(`<button type="button" title="Toggle Stress Test (3x artboards for IntersectionObserver benchmark)"><!> <span class="ab-mobile-hide svelte-eeo971"> </span></button>`);
var root_12 = $.from_html(`<p class="ab-section-sub svelte-eeo971"> </p>`);
var root_13 = $.from_html(`<div class="ab-section-head svelte-eeo971"><h2 class="ab-section-title svelte-eeo971"> </h2> <!></div>`);
var root_14 = $.from_html(`<div class="ab-hud svelte-eeo971"><div><p class="ab-hud-label svelte-eeo971">IntersectionObserver</p> <div class="ab-hud-row svelte-eeo971"><span class="ab-hud-num svelte-eeo971"> </span> <span class="ab-hud-muted svelte-eeo971"> </span></div></div> <div class="ab-hud-sep svelte-eeo971"></div> <div><p class="ab-hud-label svelte-eeo971">FPS</p> <p class="ab-hud-num svelte-eeo971"> </p></div> <div class="ab-hud-sep svelte-eeo971"></div> <div class="ab-hud-hints svelte-eeo971"><p class="svelte-eeo971"><kbd class="ab-kbd svelte-eeo971">Space</kbd> + Drag to pan</p> <p class="svelte-eeo971"><kbd class="ab-kbd svelte-eeo971">Ctrl</kbd> + Scroll to zoom</p></div></div>`);
var root_15 = $.from_html(`<div class="ab-root svelte-eeo971"><!> <div class="ab-main svelte-eeo971"><div class="ab-topbar svelte-eeo971"><div class="ab-topbar-left svelte-eeo971"><!> <div class="ab-pill-group svelte-eeo971"><button type="button" title="Interact with UI components (V)"><!> Interact</button> <button type="button" title="Pan Canvas (H or hold Space)"><!> Pan</button> <button type="button" title="Pin Review Comments (C)"><!> Comment</button></div> <!></div> <div class="ab-pill-group ab-topbar-right svelte-eeo971"><!> <button type="button" aria-label="Grid" title="Toggle Layout Grid Overlay (G)"><!> <span class="ab-mobile-hide svelte-eeo971">Grid</span></button> <!> <button type="button" aria-label="Toggle debug tools" title="Toggle Debug &amp; Performance Tools (D)"><!></button> <button type="button" aria-label="Toggle studio theme" title="Switch Artboard Studio UI between Light and Dark" class="ab-icon-btn svelte-eeo971"><!></button> <div class="ab-divider svelte-eeo971"></div> <button type="button" title="Zoom out" class="ab-icon-btn svelte-eeo971"><!></button> <button type="button" title="Reset to 100%" class="ab-zoom-val svelte-eeo971"> </button> <button type="button" title="Zoom in" class="ab-icon-btn svelte-eeo971"><!></button> <button type="button" title="Fit all boards (0)" class="ab-icon-btn svelte-eeo971"><!></button></div></div> <div role="application" aria-label="Artboard Infinite Canvas"><div class="ab-world svelte-eeo971"><!> <!></div></div> <!></div> <!></div>`);
const $$css = {
	hash: "svelte-eeo971",
	code: ".ab-root.svelte-eeo971 {\n    /* Dark Studio Chrome (default) */--ab-bg: #09090b;--ab-surface: rgba(24, 24, 27, 0.94);--ab-surface-solid: #18181b;--ab-input-bg: #09090b;--ab-pill-bg: #27272a;--ab-hover: #27272a;--ab-border: rgba(63, 63, 70, 0.85);--ab-border-subtle: #27272a;--ab-text: #f4f4f5;--ab-text-muted: #a1a1aa;--ab-text-subtle: #71717a;--ab-accent-text: #a5b4fc;--ab-dot-idle: #52525b;--ab-canvas-dot: rgba(148, 163, 184, 0.22);--ab-frame-border: rgba(63, 63, 70, 0.85);--ab-frame-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.55);--ab-placeholder-bg: rgba(24, 24, 27, 0.95);--ab-chrome-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);display:flex;width:100vw;height:100vh;overflow:hidden;background:var(--ab-bg);color:var(--ab-text);font-family:'Inter',\n      -apple-system,\n      BlinkMacSystemFont,\n      'Segoe UI',\n      Roboto,\n      sans-serif;}.ab-root[data-studio-theme='light'].svelte-eeo971 {--ab-bg: #f1f5f9;--ab-surface: rgba(255, 255, 255, 0.94);--ab-surface-solid: #ffffff;--ab-input-bg: #f8fafc;--ab-pill-bg: #e2e8f0;--ab-hover: #f1f5f9;--ab-border: #cbd5e1;--ab-border-subtle: #e2e8f0;--ab-text: #0f172a;--ab-text-muted: #475569;--ab-text-subtle: #64748b;--ab-accent-text: #4f46e5;--ab-dot-idle: #94a3b8;--ab-canvas-dot: rgba(100, 116, 139, 0.28);--ab-frame-border: #cbd5e1;--ab-frame-shadow: 0 16px 36px -10px rgba(15, 23, 42, 0.16);--ab-placeholder-bg: #e2e8f0;--ab-chrome-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);}.ab-sidebar.svelte-eeo971 {z-index:30;display:flex;flex-direction:column;width:288px;flex-shrink:0;border-right:1px solid var(--ab-border-subtle);background:var(--ab-surface);backdrop-filter:blur(12px);}.ab-sidebar-head.svelte-eeo971 {display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--ab-border-subtle);padding:12px 16px;}.ab-side-tabs.svelte-eeo971 {display:grid;grid-template-columns:1fr 1fr;gap:4px;border-bottom:1px solid var(--ab-border-subtle);padding:8px 12px;}.ab-side-tab.svelte-eeo971 {border:none;border-radius:7px;background:transparent;padding:6px 8px;font-size:11.5px;font-weight:500;color:var(--ab-text-muted);cursor:pointer;}.ab-side-tab.svelte-eeo971:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-side-tab-active.svelte-eeo971 {background:var(--ab-pill-bg);color:var(--ab-text);font-weight:600;}.ab-agent-chip.svelte-eeo971 {padding:6px 10px;font-size:11.5px;font-weight:600;color:var(--ab-accent-text);cursor:pointer;}.ab-agent-chip-warn.svelte-eeo971 {color:#f59e0b;}.ab-spin.svelte-eeo971 {display:inline-flex;\n    animation: svelte-eeo971-ab-spin 1s linear infinite;}\n\n  @keyframes svelte-eeo971-ab-spin {\n    from {\n      transform: rotate(0deg);\n    }\n    to {\n      transform: rotate(360deg);\n    }\n  }.ab-brand.svelte-eeo971 {display:flex;align-items:center;gap:8px;}.ab-brand-icon.svelte-eeo971 {display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#4f46e5;color:#ffffff;}.ab-brand-title.svelte-eeo971 {margin:0;font-size:12px;font-weight:700;color:var(--ab-text);}.ab-brand-badge.svelte-eeo971 {margin:0;font-size:10px;color:#10b981;letter-spacing:0.04em;}.ab-sidebar-filters.svelte-eeo971 {display:flex;flex-direction:column;gap:10px;border-bottom:1px solid var(--ab-border-subtle);padding:12px;}.ab-search-wrap.svelte-eeo971 {position:relative;}.ab-search-icon.svelte-eeo971 {pointer-events:none;position:absolute;top:50%;left:10px;transform:translateY(-50%);color:var(--ab-text-subtle);display:inline-flex;}.ab-search-input.svelte-eeo971 {box-sizing:border-box;width:100%;height:32px;border-radius:8px;border:1px solid var(--ab-border);background:var(--ab-input-bg);padding:0 10px 0 32px;font-size:12px;color:var(--ab-text);}.ab-search-input.svelte-eeo971:focus {outline:none;border-color:#6366f1;}.ab-cat-row.svelte-eeo971 {display:flex;flex-wrap:wrap;gap:4px;}.ab-cat-pill.svelte-eeo971 {border:none;border-radius:6px;background:var(--ab-pill-bg);padding:4px 8px;font-size:11px;font-weight:500;color:var(--ab-text-muted);cursor:pointer;}.ab-cat-pill.svelte-eeo971:hover {color:var(--ab-text);}.ab-cat-active.svelte-eeo971 {background:#4f46e5;color:#ffffff;}.ab-board-list.svelte-eeo971 {flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px;}.ab-board-row.svelte-eeo971 {display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;border:none;border-radius:8px;background:transparent;padding:8px 10px;text-align:left;color:var(--ab-text);cursor:pointer;}.ab-board-row.svelte-eeo971:hover {background:var(--ab-hover);}.ab-board-row-active.svelte-eeo971 {background:rgba(99, 102, 241, 0.16);color:var(--ab-accent-text);}.ab-board-row-left.svelte-eeo971 {display:flex;align-items:center;gap:8px;min-width:0;}.ab-row-dot.svelte-eeo971 {width:6px;height:6px;border-radius:9999px;background:var(--ab-dot-idle);flex-shrink:0;}.ab-row-dot-live.svelte-eeo971 {background:#34d399;}.ab-board-row-meta.svelte-eeo971 {min-width:0;}.ab-board-row-title.svelte-eeo971 {margin:0;font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.ab-board-row-dim.svelte-eeo971 {margin:2px 0 0;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:10px;color:var(--ab-text-subtle);}.ab-row-pin-badge.svelte-eeo971 {flex-shrink:0;border-radius:9999px;background:rgba(245, 158, 11, 0.2);padding:2px 6px;font-size:10px;font-weight:600;color:#d97706;}.ab-sidebar-foot.svelte-eeo971 {border-top:1px solid var(--ab-border-subtle);padding:12px;}.ab-back-link.svelte-eeo971 {display:flex;align-items:center;justify-content:center;gap:8px;border-radius:8px;border:1px solid var(--ab-border);background:var(--ab-input-bg);padding:8px 12px;font-size:12px;font-weight:500;color:var(--ab-text);text-decoration:none;}.ab-back-link.svelte-eeo971:hover {background:var(--ab-hover);}.ab-main.svelte-eeo971 {position:relative;flex:1;overflow:hidden;}.ab-topbar.svelte-eeo971 {pointer-events:none;position:absolute;top:16px;right:16px;left:16px;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:12px;}.ab-topbar-left.svelte-eeo971 {display:flex;align-items:center;gap:6px;}.ab-pill-group.svelte-eeo971 {pointer-events:auto;display:inline-flex;align-items:center;gap:4px;border-radius:12px;border:1px solid var(--ab-border);background:var(--ab-surface);padding:4px;box-shadow:var(--ab-chrome-shadow);backdrop-filter:blur(12px);color:var(--ab-text);}.ab-icon-pad.svelte-eeo971 {padding:8px;cursor:pointer;}.ab-tool-btn.svelte-eeo971 {display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;background:transparent;padding:6px 10px;font-size:12px;font-weight:500;color:var(--ab-text-muted);cursor:pointer;}.ab-tool-btn.svelte-eeo971:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-tool-active.svelte-eeo971 {background:#4f46e5;color:#ffffff;}.ab-tool-active.svelte-eeo971:hover {background:#4f46e5;color:#ffffff;}.ab-tool-comment.svelte-eeo971 {background:#f59e0b;color:#09090b;}.ab-tool-comment.svelte-eeo971:hover {background:#f59e0b;color:#09090b;}.ab-tool-grid.svelte-eeo971 {background:rgba(244, 63, 94, 0.16);color:#e11d48;}.ab-tool-stress.svelte-eeo971 {background:rgba(249, 115, 22, 0.2);color:#ea580c;}.ab-tool-debug.svelte-eeo971 {background:rgba(16, 185, 129, 0.18);color:#10b981;}.ab-divider.svelte-eeo971 {width:1px;height:16px;margin:0 4px;background:var(--ab-border);}.ab-icon-btn.svelte-eeo971 {display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:8px;background:transparent;padding:6px;color:var(--ab-text-muted);cursor:pointer;}.ab-icon-btn.svelte-eeo971:hover {background:var(--ab-hover);color:var(--ab-text);}.ab-zoom-val.svelte-eeo971 {min-width:48px;border:none;border-radius:8px;background:transparent;padding:4px 6px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:12px;color:var(--ab-text);cursor:pointer;}.ab-zoom-val.svelte-eeo971:hover {background:var(--ab-hover);}.ab-canvas.svelte-eeo971 {width:100%;height:100%;overflow:hidden;touch-action:none;background-image:radial-gradient(circle, var(--ab-canvas-dot) 1px, transparent 1px);background-size:24px 24px;}\n\n  @media (max-width: 767px) {.ab-sidebar.svelte-eeo971 {position:fixed;inset:0 auto 0 0;z-index:50;background:var(--ab-surface-solid);backdrop-filter:none;box-shadow:0 20px 50px rgba(0, 0, 0, 0.45);}.ab-pill-group.svelte-eeo971,\n    .ab-hud.svelte-eeo971 {background:var(--ab-surface-solid);backdrop-filter:none;}.ab-topbar.svelte-eeo971 {flex-direction:column;align-items:flex-start;top:10px;right:10px;left:10px;gap:6px;}.ab-topbar-left.svelte-eeo971,\n    .ab-topbar-right.svelte-eeo971 {max-width:100%;}\n  }\n\n  @media (max-width: 480px) {.ab-mobile-hide.svelte-eeo971 {display:none;}.ab-topbar-right.svelte-eeo971 {gap:2px;padding:3px;}.ab-topbar-right.svelte-eeo971 .ab-tool-btn:where(.svelte-eeo971),\n    .ab-topbar-right.svelte-eeo971 .ab-icon-btn:where(.svelte-eeo971) {padding:5px;}.ab-topbar-right.svelte-eeo971 .ab-divider:where(.svelte-eeo971) {margin:0 2px;}.ab-topbar-right.svelte-eeo971 .ab-zoom-val:where(.svelte-eeo971) {min-width:38px;padding:4px 2px;font-size:11px;}.ab-topbar-left.svelte-eeo971 .ab-tool-btn:where(.svelte-eeo971) {padding:5px 8px;font-size:11px;}\n  }.ab-canvas-grab.svelte-eeo971 {cursor:grab;}.ab-canvas-grabbing.svelte-eeo971 {cursor:grabbing;}.ab-world.svelte-eeo971 {transform-origin:0 0;}.ab-section-head.svelte-eeo971 {position:absolute;user-select:none;}.ab-section-title.svelte-eeo971 {margin:0;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:var(--ab-text);}.ab-section-sub.svelte-eeo971 {margin:2px 0 0;font-size:12px;color:var(--ab-text-muted);}.ab-hud.svelte-eeo971 {pointer-events:auto;position:absolute;right:16px;bottom:16px;z-index:30;display:flex;align-items:center;gap:16px;border-radius:12px;border:1px solid var(--ab-border);background:var(--ab-surface);padding:10px 16px;font-size:12px;box-shadow:var(--ab-chrome-shadow);backdrop-filter:blur(12px);}.ab-hud-label.svelte-eeo971 {margin:0;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--ab-text-muted);}.ab-hud-row.svelte-eeo971 {display:flex;align-items:center;gap:8px;margin-top:2px;}.ab-hud-num.svelte-eeo971 {margin:2px 0 0;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-weight:700;color:#10b981;}.ab-hud-muted.svelte-eeo971 {font-size:11px;color:var(--ab-text-muted);}.ab-hud-sep.svelte-eeo971 {width:1px;height:28px;background:var(--ab-border);}.ab-hud-hints.svelte-eeo971 {font-size:10px;line-height:1.5;color:var(--ab-text-muted);}.ab-hud-hints.svelte-eeo971 p:where(.svelte-eeo971) {margin:0;}.ab-kbd.svelte-eeo971 {border-radius:4px;background:var(--ab-pill-bg);padding:1px 5px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;color:var(--ab-text);}"
};
function ArtboardApp($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css);
	const defaults = getStudioDefaults();
	let themes = $.prop($$props, "themes", 19, () => []), studioTheme = $.prop($$props, "studioTheme", 19, () => defaults.studioTheme), storageKey = $.prop($$props, "storageKey", 19, () => defaults.storageKey), appUrl = $.prop($$props, "appUrl", 19, () => defaults.appUrl), defaultDebug = $.prop($$props, "defaultDebug", 19, () => defaults.defaultDebug);
	let debugOverride = $.state(null);
	const showDebug = $.derived(() => $.get(debugOverride) ?? defaultDebug());
	let studioThemeOverride = $.state(null);
	let systemPrefersDark = $.state(true);
	const resolvedStudioTheme = $.derived(() => {
		if ($.get(studioThemeOverride)) return $.get(studioThemeOverride);
		if (studioTheme() === "system") return $.get(systemPrefersDark) ? "dark" : "light";
		return studioTheme();
	});
	let globalThemeOverride = $.state(null);
	const activeGlobalThemeId = $.derived(() => $.get(globalThemeOverride) ?? themes()[0]?.id ?? null);
	let stressTest = $.state(false);
	const layout = $.derived(() => computeCanvasLayout($$props.sections, $.get(stressTest) ? 3 : 1));
	let sidebarOpen = $.state(true);
	let sidebarTab = $.state("boards");
	let agentModalOpen = $.state(false);
	let selectedCommentId = $.state(null);
	let searchQuery = $.state("");
	let activeCategory = $.state("all");
	let highlightedBoardId = $.state(null);
	const api = createApiClient(defaults.apiBase);
	let comments = $.state($.proxy([]));
	let agentInfo = $.state(null);
	const openCommentCount = $.derived(() => $.get(comments).filter((c) => {
		return c.status === "open";
	}).length);
	const agentWorking = $.derived(() => $.get(agentInfo)?.state.activeRunId !== null && $.get(agentInfo) !== null);
	const agentPaused = $.derived(() => $.get(agentInfo)?.state.paused ?? null);
	let tool = $.state("interact");
	let spacePressed = $.state(false);
	let showGrid = $.state(false);
	let viewportEl = $.state(null);
	let camX = $.state(40);
	let camY = $.state(40);
	let zoom = $.state(.55);
	let isPanning = $.state(false);
	let panStart = {
		x: 0,
		y: 0,
		camX: 0,
		camY: 0
	};
	const activePointers = new SvelteMap();
	let pinchStart = null;
	const mountedIds = new SvelteSet();
	let fps = $.state(60);
	async function refreshComments() {
		try {
			$.set(comments, await api.listComments(), true);
		} catch (err) {
			console.warn("[sveltekit-artboard] Failed to load comments:", err);
		}
	}
	async function refreshAgent() {
		try {
			$.set(agentInfo, await api.getAgentInfo(), true);
		} catch {}
	}
	$.user_effect(() => {
		if (window.innerWidth < 768) $.set(sidebarOpen, false);
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		$.set(systemPrefersDark, mq.matches, true);
		const onChange = (e) => {
			$.set(systemPrefersDark, e.matches, true);
		};
		mq.addEventListener("change", onChange);
		return () => {
			mq.removeEventListener("change", onChange);
		};
	});
	$.user_effect(() => {
		try {
			const savedDebug = localStorage.getItem(`${storageKey()}:debug`);
			if (savedDebug === "true" || savedDebug === "false") $.set(debugOverride, savedDebug === "true");
			const savedStudioTheme = localStorage.getItem(`${storageKey()}:studio-theme`);
			if (savedStudioTheme === "dark" || savedStudioTheme === "light") $.set(studioThemeOverride, savedStudioTheme, true);
		} catch {}
		refreshComments();
		refreshAgent();
		const onCommentsChanged = () => {
			refreshComments();
		};
		const onAgentChanged = () => {
			refreshAgent();
		};
		window.addEventListener("artboard:comments-changed", onCommentsChanged);
		window.addEventListener("artboard:agent-changed", onAgentChanged);
		return () => {
			window.removeEventListener("artboard:comments-changed", onCommentsChanged);
			window.removeEventListener("artboard:agent-changed", onAgentChanged);
		};
	});
	function toggleDebug() {
		const next = !$.get(showDebug);
		$.set(debugOverride, next);
		if (!next) $.set(stressTest, false);
		try {
			localStorage.setItem(`${storageKey()}:debug`, String(next));
		} catch {}
	}
	function toggleStudioTheme() {
		const next = $.get(resolvedStudioTheme) === "dark" ? "light" : "dark";
		$.set(studioThemeOverride, next, true);
		try {
			localStorage.setItem(`${storageKey()}:studio-theme`, next);
		} catch {}
	}
	const effectiveTool = $.derived(() => $.get(spacePressed) ? "pan" : $.get(tool));
	const categories = $.derived(() => {
		const seen = new SvelteSet();
		const list = [{
			id: "all",
			label: "All"
		}];
		for (const sec of $$props.sections) if (!seen.has(sec.category)) {
			seen.add(sec.category);
			const label = sec.category.charAt(0).toUpperCase() + sec.category.slice(1);
			list.push({
				id: sec.category,
				label
			});
		}
		return list;
	});
	const filteredBoards = $.derived(() => {
		const q = $.get(searchQuery).trim().toLowerCase();
		return $.get(layout).boards.filter((b) => {
			const matchCat = $.get(activeCategory) === "all" || b.category === $.get(activeCategory);
			const matchQ = !q || b.title.toLowerCase().includes(q) || b.section.toLowerCase().includes(q) || b.viewportLabel.toLowerCase().includes(q);
			return matchCat && matchQ;
		});
	});
	const mountedCount = $.derived(() => {
		let count = 0;
		for (const b of $.get(layout).boards) if (mountedIds.has(b.id)) count++;
		return count;
	});
	const mountedRatio = $.derived(() => $.get(layout).boards.length ? Math.round($.get(mountedCount) / $.get(layout).boards.length * 100) : 0);
	const fpsColor = $.derived(() => {
		if ($.get(fps) >= 50) return "#10b981";
		if ($.get(fps) >= 30) return "#f59e0b";
		return "#f43f5e";
	});
	$.user_effect(() => {
		if (!$.get(showDebug)) return;
		let frames = 0;
		let lastTime = performance.now();
		let rafId = 0;
		const tick = (now) => {
			frames++;
			if (now - lastTime >= 500) {
				$.set(fps, Math.round(frames * 1e3 / (now - lastTime)), true);
				frames = 0;
				lastTime = now;
			}
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(rafId);
		};
	});
	$.user_effect(() => {
		const onKeyDown = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if (e.code === "Space") {
				e.preventDefault();
				$.set(spacePressed, true);
			} else if (e.key === "h" || e.key === "H") $.set(tool, "pan");
			else if (e.key === "v" || e.key === "V") $.set(tool, "interact");
			else if (e.key === "c" || e.key === "C") $.set(tool, "comment");
			else if (e.key === "g" || e.key === "G") $.set(showGrid, !$.get(showGrid));
			else if (e.key === "d" || e.key === "D") toggleDebug();
			else if (e.key === "0") fitAll();
		};
		const onKeyUp = (e) => {
			if (e.code === "Space") $.set(spacePressed, false);
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	});
	function handleMountChange(id, mounted) {
		if (mounted) mountedIds.add(id);
		else mountedIds.delete(id);
	}
	function getPinchMetrics() {
		const pts = [...activePointers.values()];
		if (pts.length < 2 || !$.get(viewportEl)) return null;
		const rect = $.get(viewportEl).getBoundingClientRect();
		const dx = pts[1].x - pts[0].x;
		const dy = pts[1].y - pts[0].y;
		return {
			dist: Math.hypot(dx, dy) || 1,
			midX: (pts[0].x + pts[1].x) / 2 - rect.left,
			midY: (pts[0].y + pts[1].y) / 2 - rect.top
		};
	}
	function handlePointerDown(e) {
		const isEmptyCanvasTarget = e.target === $.get(viewportEl);
		const shouldTrackTouch = e.pointerType === "touch";
		const shouldPan = e.button === 1 || e.button === 0 && ($.get(effectiveTool) === "pan" || shouldTrackTouch && isEmptyCanvasTarget);
		if (!shouldPan && !shouldTrackTouch) return;
		if (shouldPan) e.preventDefault();
		activePointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (activePointers.size >= 2) {
			$.set(isPanning, false);
			const metrics = getPinchMetrics();
			if (metrics) pinchStart = {
				...metrics,
				zoom: $.get(zoom),
				camX: $.get(camX),
				camY: $.get(camY)
			};
			try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {}
			return;
		}
		if (shouldPan) {
			$.set(isPanning, true);
			pinchStart = null;
			panStart = {
				x: e.clientX,
				y: e.clientY,
				camX: $.get(camX),
				camY: $.get(camY)
			};
			try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {}
		}
	}
	function handlePointerMove(e) {
		if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (activePointers.size >= 2 && pinchStart) {
			const metrics = getPinchMetrics();
			if (!metrics) return;
			const nextZoom = Math.max(.12, Math.min(2, pinchStart.zoom * (metrics.dist / pinchStart.dist)));
			const ratio = nextZoom / pinchStart.zoom;
			$.set(camX, metrics.midX - (pinchStart.midX - pinchStart.camX) * ratio);
			$.set(camY, metrics.midY - (pinchStart.midY - pinchStart.camY) * ratio);
			$.set(zoom, nextZoom, true);
			return;
		}
		if (!$.get(isPanning)) return;
		$.set(camX, panStart.camX + (e.clientX - panStart.x));
		$.set(camY, panStart.camY + (e.clientY - panStart.y));
	}
	function handlePointerUp(e) {
		activePointers.delete(e.pointerId);
		if (activePointers.size < 2) pinchStart = null;
		if (activePointers.size === 1 && $.get(effectiveTool) === "pan") {
			const remaining = [...activePointers.values()][0];
			if (remaining) {
				$.set(isPanning, true);
				panStart = {
					x: remaining.x,
					y: remaining.y,
					camX: $.get(camX),
					camY: $.get(camY)
				};
				return;
			}
		}
		if (activePointers.size === 0) $.set(isPanning, false);
	}
	function handleWheel(e) {
		if (!$.get(viewportEl)) return;
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			const rect = $.get(viewportEl).getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const factor = Math.exp(-e.deltaY * .0025);
			const nextZoom = Math.max(.12, Math.min(2, $.get(zoom) * factor));
			const ratio = nextZoom / $.get(zoom);
			$.set(camX, mouseX - (mouseX - $.get(camX)) * ratio);
			$.set(camY, mouseY - (mouseY - $.get(camY)) * ratio);
			$.set(zoom, nextZoom, true);
		} else {
			$.set(camX, $.get(camX) - e.deltaX);
			$.set(camY, $.get(camY) - e.deltaY);
		}
	}
	function zoomBy(factor) {
		if (!$.get(viewportEl)) return;
		const rect = $.get(viewportEl).getBoundingClientRect();
		const cx = rect.width / 2;
		const cy = rect.height / 2;
		const nextZoom = Math.max(.12, Math.min(2, $.get(zoom) * factor));
		const ratio = nextZoom / $.get(zoom);
		$.set(camX, cx - (cx - $.get(camX)) * ratio);
		$.set(camY, cy - (cy - $.get(camY)) * ratio);
		$.set(zoom, nextZoom, true);
	}
	function focusBoard(board) {
		if (!$.get(viewportEl)) return;
		const rect = $.get(viewportEl).getBoundingClientRect();
		const pad = 120;
		const targetZoom = Math.max(.25, Math.min(1, Math.min((rect.width - pad) / board.width, (rect.height - pad) / board.height)));
		$.set(zoom, targetZoom, true);
		$.set(camX, rect.width / 2 - (board.x + board.width / 2) * targetZoom);
		$.set(camY, rect.height / 2 - (board.y + board.height / 2) * targetZoom);
		$.set(highlightedBoardId, board.id, true);
		setTimeout(() => {
			if ($.get(highlightedBoardId) === board.id) $.set(highlightedBoardId, null);
		}, 1600);
	}
	function fitAll() {
		if (!$.get(viewportEl) || $.get(layout).boards.length === 0) return;
		const rect = $.get(viewportEl).getBoundingClientRect();
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const b of $.get(layout).boards) {
			if (b.x < minX) minX = b.x;
			if (b.y < minY) minY = b.y;
			if (b.x + b.width > maxX) maxX = b.x + b.width;
			if (b.y + b.height > maxY) maxY = b.y + b.height;
		}
		const contentW = maxX - minX + 200;
		const contentH = maxY - minY + 200;
		const nextZoom = Math.max(.12, Math.min(.8, Math.min(rect.width / contentW, rect.height / contentH)));
		$.set(zoom, nextZoom, true);
		$.set(camX, (rect.width - contentW * nextZoom) / 2 - (minX - 100) * nextZoom);
		$.set(camY, (rect.height - contentH * nextZoom) / 2 - (minY - 100) * nextZoom);
	}
	async function handleAddComment(input) {
		try {
			const created = await api.createComment(input);
			$.set(comments, [...$.get(comments), created], true);
		} catch (err) {
			console.warn("[sveltekit-artboard] Failed to create comment:", err);
		}
	}
	async function handleEditComment(commentId, text) {
		try {
			const updated = await api.patchComment(commentId, { text });
			$.set(comments, $.get(comments).map((c) => {
				return c.id === updated.id ? updated : c;
			}), true);
		} catch {}
	}
	async function handleMovePin(commentId, pinXPct, pinYPct) {
		$.set(comments, $.get(comments).map((c) => {
			return c.id === commentId ? {
				...c,
				artboard: {
					...c.artboard,
					pinXPct,
					pinYPct
				}
			} : c;
		}), true);
		try {
			const updated = await api.patchComment(commentId, {
				pinXPct,
				pinYPct
			});
			$.set(comments, $.get(comments).map((c) => {
				return c.id === updated.id ? updated : c;
			}), true);
		} catch {
			await refreshComments();
		}
	}
	async function handleToggleComment(comment) {
		const nextStatus = comment.status === "resolved" ? "open" : "resolved";
		try {
			const updated = await api.patchComment(comment.id, { status: nextStatus });
			$.set(comments, $.get(comments).map((c) => {
				return c.id === updated.id ? updated : c;
			}), true);
		} catch {}
	}
	async function handleDeleteComment(commentId) {
		try {
			await api.deleteComment(commentId);
			$.set(comments, $.get(comments).filter((c) => {
				return c.id !== commentId;
			}), true);
		} catch {}
	}
	async function handleClearResolved() {
		try {
			await api.clearResolved();
			await refreshComments();
		} catch {}
	}
	function handleFocusComment(comment) {
		const targetBoard = $.get(layout).boards.find((b) => {
			return b.id === comment.artboard.boardId;
		});
		if (targetBoard) focusBoard(targetBoard);
		$.set(selectedCommentId, comment.id, true);
	}
	async function handleSendToAgent(ids) {
		try {
			await api.runAgent(ids);
			await refreshAgent();
		} catch {
			await refreshAgent();
		}
	}
	async function handleCancelAgent() {
		try {
			await api.cancelAgent();
			await refreshAgent();
		} catch {}
	}
	async function handleResumeAgent() {
		try {
			await api.resumeAgent();
			await refreshAgent();
		} catch {}
	}
	async function handleUpdateAgentSettings(patch) {
		await api.updateAgentSettings(patch);
		await refreshAgent();
	}
	var div = root_15();
	var node = $.child(div);
	var consequent_4 = ($$anchor) => {
		var aside = root_5();
		var div_1 = $.child(aside);
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		Layers($.child(div_3), { size: 16 });
		$.reset(div_3);
		$.next(2);
		$.reset(div_2);
		var button = $.sibling(div_2, 2);
		Panel_left_close($.child(button), { size: 16 });
		$.reset(button);
		$.reset(div_1);
		var div_4 = $.sibling(div_1, 2);
		var button_1 = $.child(div_4);
		let classes;
		var text_1 = $.only_child(button_1);
		var button_2 = $.sibling(button_1, 2);
		let classes_1;
		var node_3 = $.sibling($.child(button_2));
		var consequent = ($$anchor) => {
			var text_2 = $.text();
			$.template_effect(() => $.set_text(text_2, `(${$.get(openCommentCount) ?? ""})`));
			$.append($$anchor, text_2);
		};
		$.if(node_3, ($$render) => {
			if ($.get(openCommentCount) > 0) $$render(consequent);
		});
		$.reset(button_2);
		$.reset(div_4);
		var node_4 = $.sibling(div_4, 2);
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_4();
			var div_5 = $.first_child(fragment_1);
			var div_6 = $.child(div_5);
			var span = $.child(div_6);
			Search($.child(span), { size: 14 });
			$.reset(span);
			var input_1 = $.sibling(span, 2);
			$.remove_input_defaults(input_1);
			$.reset(div_6);
			var div_7 = $.sibling(div_6, 2);
			$.each(div_7, 21, () => $.get(categories), (cat) => cat.id, ($$anchor, cat) => {
				var button_3 = root();
				let classes_2;
				var text_3 = $.only_child(button_3, true);
				$.template_effect(() => {
					classes_2 = $.set_class(button_3, 1, "ab-cat-pill svelte-eeo971", null, classes_2, { "ab-cat-active": $.get(activeCategory) === $.get(cat).id });
					$.set_text(text_3, $.get(cat).label);
				});
				$.delegated("click", button_3, () => {
					$.set(activeCategory, $.get(cat).id, true);
				});
				$.append($$anchor, button_3);
			});
			$.reset(div_7);
			$.reset(div_5);
			var div_8 = $.sibling(div_5, 2);
			$.each(div_8, 21, () => $.get(filteredBoards), (board) => board.id, ($$anchor, board) => {
				const pinCount = $.derived(() => $.get(comments).filter((c) => {
					return c.artboard.boardId === $.get(board).id && c.status === "open";
				}).length);
				const isLive = $.derived(() => mountedIds.has($.get(board).id));
				var button_4 = root_3();
				let classes_3;
				var div_9 = $.child(button_4);
				var node_6 = $.child(div_9);
				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();
					let classes_4;
					$.template_effect(() => classes_4 = $.set_class(span_1, 1, "ab-row-dot svelte-eeo971", null, classes_4, { "ab-row-dot-live": $.get(isLive) }));
					$.append($$anchor, span_1);
				};
				$.if(node_6, ($$render) => {
					if ($.get(showDebug)) $$render(consequent_1);
				});
				var div_10 = $.sibling(node_6, 2);
				var p = $.child(div_10);
				var text_4 = $.only_child(p, true);
				var p_1 = $.sibling(p, 2);
				var text_5 = $.only_child(p_1, true);
				$.reset(div_10);
				$.reset(div_9);
				var node_7 = $.sibling(div_9, 2);
				var consequent_2 = ($$anchor) => {
					var span_2 = root_2();
					var text_6 = $.only_child(span_2, true);
					$.template_effect(() => $.set_text(text_6, $.get(pinCount)));
					$.append($$anchor, span_2);
				};
				$.if(node_7, ($$render) => {
					if ($.get(pinCount) > 0) $$render(consequent_2);
				});
				$.reset(button_4);
				$.template_effect(() => {
					classes_3 = $.set_class(button_4, 1, "ab-board-row svelte-eeo971", null, classes_3, { "ab-board-row-active": $.get(highlightedBoardId) === $.get(board).id });
					$.set_text(text_4, $.get(board).title);
					$.set_text(text_5, $.get(board).viewportLabel);
				});
				$.delegated("click", button_4, () => {
					focusBoard($.get(board));
				});
				$.append($$anchor, button_4);
			});
			$.reset(div_8);
			$.bind_value(input_1, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
			$.append($$anchor, fragment_1);
		};
		var alternate = ($$anchor) => {
			CommentsPanel($$anchor, {
				get comments() {
					return $.get(comments);
				},
				get agentInfo() {
					return $.get(agentInfo);
				},
				onfocuscomment: handleFocusComment,
				ontogglecomment: handleToggleComment,
				ondeletecomment: handleDeleteComment,
				onclearresolved: handleClearResolved,
				onsendtoagent: handleSendToAgent,
				oncancelagent: handleCancelAgent,
				onresumeagent: handleResumeAgent,
				onopenagentsettings: () => {
					$.set(agentModalOpen, true);
				}
			});
		};
		$.if(node_4, ($$render) => {
			if ($.get(sidebarTab) === "boards") $$render(consequent_3);
			else $$render(alternate, -1);
		});
		var div_11 = $.sibling(node_4, 2);
		var a = $.child(div_11);
		Arrow_left($.child(a), { size: 14 });
		$.next();
		$.reset(a);
		$.reset(div_11);
		$.reset(aside);
		$.template_effect(() => {
			classes = $.set_class(button_1, 1, "ab-side-tab svelte-eeo971", null, classes, { "ab-side-tab-active": $.get(sidebarTab) === "boards" });
			$.set_text(text_1, `Boards (${$.get(layout).boards.length ?? ""})`);
			classes_1 = $.set_class(button_2, 1, "ab-side-tab svelte-eeo971", null, classes_1, { "ab-side-tab-active": $.get(sidebarTab) === "comments" });
			$.set_attribute(a, "href", appUrl());
		});
		$.delegated("click", button, () => {
			$.set(sidebarOpen, false);
		});
		$.delegated("click", button_1, () => {
			$.set(sidebarTab, "boards");
		});
		$.delegated("click", button_2, () => {
			$.set(sidebarTab, "comments");
		});
		$.append($$anchor, aside);
	};
	$.if(node, ($$render) => {
		if ($.get(sidebarOpen)) $$render(consequent_4);
	});
	var div_12 = $.sibling(node, 2);
	var div_13 = $.child(div_12);
	var div_14 = $.child(div_13);
	var node_9 = $.child(div_14);
	var consequent_5 = ($$anchor) => {
		var button_5 = root_6();
		Panel_left_open($.child(button_5), { size: 16 });
		$.reset(button_5);
		$.delegated("click", button_5, () => {
			$.set(sidebarOpen, true);
		});
		$.append($$anchor, button_5);
	};
	$.if(node_9, ($$render) => {
		if (!$.get(sidebarOpen)) $$render(consequent_5);
	});
	var div_15 = $.sibling(node_9, 2);
	var button_6 = $.child(div_15);
	let classes_5;
	Mouse_pointer_2($.child(button_6), { size: 14 });
	$.next();
	$.reset(button_6);
	var button_7 = $.sibling(button_6, 2);
	let classes_6;
	Hand($.child(button_7), { size: 14 });
	$.next();
	$.reset(button_7);
	var button_8 = $.sibling(button_7, 2);
	let classes_7;
	Message_square_plus($.child(button_8), { size: 14 });
	$.next();
	$.reset(button_8);
	$.reset(div_15);
	var node_14 = $.sibling(div_15, 2);
	var consequent_7 = ($$anchor) => {
		var button_9 = root_9();
		let classes_8;
		var node_15 = $.child(button_9);
		var consequent_6 = ($$anchor) => {
			var fragment_3 = root_7();
			var span_3 = $.first_child(fragment_3);
			Loader_circle($.child(span_3), { size: 13 });
			$.reset(span_3);
			$.next(2);
			$.append($$anchor, fragment_3);
		};
		var alternate_1 = ($$anchor) => {
			var fragment_4 = root_8();
			Bot($.first_child(fragment_4), { size: 13 });
			$.next(2);
			$.append($$anchor, fragment_4);
		};
		$.if(node_15, ($$render) => {
			if ($.get(agentWorking)) $$render(consequent_6);
			else $$render(alternate_1, -1);
		});
		$.reset(button_9);
		$.template_effect(($0) => classes_8 = $.set_class(button_9, 1, "ab-pill-group ab-agent-chip svelte-eeo971", null, classes_8, { "ab-agent-chip-warn": $0 }), [() => Boolean($.get(agentPaused))]);
		$.delegated("click", button_9, () => {
			$.set(sidebarOpen, true);
			$.set(sidebarTab, "comments");
		});
		$.append($$anchor, button_9);
	};
	$.if(node_14, ($$render) => {
		if ($.get(agentWorking) || $.get(agentPaused)) $$render(consequent_7);
	});
	$.reset(div_14);
	var div_16 = $.sibling(div_14, 2);
	var node_18 = $.child(div_16);
	var consequent_8 = ($$anchor) => {
		var fragment_5 = root_10();
		var node_19 = $.first_child(fragment_5);
		{
			let $0 = $.derived(() => $.get(activeGlobalThemeId) ?? "");
			ThemeSelect(node_19, {
				get themes() {
					return themes();
				},
				size: "sm",
				showIcon: true,
				label: "Global app theme",
				get value() {
					return $.get($0);
				},
				onchange: (id) => {
					$.set(globalThemeOverride, id, true);
				}
			});
		}
		$.next(2);
		$.append($$anchor, fragment_5);
	};
	$.if(node_18, ($$render) => {
		if (themes().length > 0) $$render(consequent_8);
	});
	var button_10 = $.sibling(node_18, 2);
	let classes_9;
	Grid_3x3($.child(button_10), { size: 14 });
	$.next(2);
	$.reset(button_10);
	var node_21 = $.sibling(button_10, 2);
	var consequent_9 = ($$anchor) => {
		var button_11 = root_11();
		let classes_10;
		var node_22 = $.child(button_11);
		Flame(node_22, { size: 14 });
		var span_4 = $.sibling(node_22, 2);
		var text_7 = $.only_child(span_4, true);
		$.reset(button_11);
		$.template_effect(() => {
			$.set_attribute(button_11, "aria-label", $.get(stressTest) ? `Stress (${$.get(layout).boards.length})` : "Stress Test");
			classes_10 = $.set_class(button_11, 1, "ab-tool-btn svelte-eeo971", null, classes_10, { "ab-tool-stress": $.get(stressTest) });
			$.set_text(text_7, $.get(stressTest) ? `Stress (${$.get(layout).boards.length})` : "Stress Test");
		});
		$.delegated("click", button_11, () => {
			$.set(stressTest, !$.get(stressTest));
		});
		$.append($$anchor, button_11);
	};
	$.if(node_21, ($$render) => {
		if ($.get(showDebug)) $$render(consequent_9);
	});
	var button_12 = $.sibling(node_21, 2);
	let classes_11;
	Bug($.child(button_12), { size: 14 });
	$.reset(button_12);
	var button_13 = $.sibling(button_12, 2);
	var node_24 = $.child(button_13);
	var consequent_10 = ($$anchor) => {
		Moon($$anchor, {
			size: 14,
			color: "#818cf8"
		});
	};
	var alternate_2 = ($$anchor) => {
		Sun($$anchor, {
			size: 14,
			color: "#d97706"
		});
	};
	$.if(node_24, ($$render) => {
		if ($.get(resolvedStudioTheme) === "dark") $$render(consequent_10);
		else $$render(alternate_2, -1);
	});
	$.reset(button_13);
	var button_14 = $.sibling(button_13, 4);
	Zoom_out($.child(button_14), { size: 14 });
	$.reset(button_14);
	var button_15 = $.sibling(button_14, 2);
	var text_8 = $.only_child(button_15);
	var button_16 = $.sibling(button_15, 2);
	Zoom_in($.child(button_16), { size: 14 });
	$.reset(button_16);
	var button_17 = $.sibling(button_16, 2);
	Maximize_2($.child(button_17), { size: 14 });
	$.reset(button_17);
	$.reset(div_16);
	$.reset(div_13);
	var div_17 = $.sibling(div_13, 2);
	let classes_12;
	var div_18 = $.child(div_17);
	var node_28 = $.child(div_18);
	$.each(node_28, 17, () => $.get(layout).sections, (section) => section.id, ($$anchor, section) => {
		var div_19 = root_13();
		var h2 = $.child(div_19);
		var text_9 = $.only_child(h2, true);
		var node_29 = $.sibling(h2, 2);
		var consequent_11 = ($$anchor) => {
			var p_2 = root_12();
			var text_10 = $.only_child(p_2, true);
			$.template_effect(() => $.set_text(text_10, $.get(section).subtitle));
			$.append($$anchor, p_2);
		};
		$.if(node_29, ($$render) => {
			if ($.get(section).subtitle) $$render(consequent_11);
		});
		$.reset(div_19);
		$.template_effect(() => {
			$.set_style(div_19, `left: ${$.get(section).x ?? ""}px; top: ${$.get(section).y ?? ""}px;`);
			$.set_text(text_9, $.get(section).title);
		});
		$.append($$anchor, div_19);
	});
	var node_30 = $.sibling(node_28, 2);
	$.each(node_30, 17, () => $.get(layout).boards, (board) => board.id, ($$anchor, board) => {
		{
			let $0 = $.derived(() => $.get(comments).filter((c) => {
				return c.artboard.boardId === $.get(board).id;
			}));
			let $1 = $.derived(() => $.get(agentInfo)?.state.runs ?? {});
			let $2 = $.derived(() => $.get(agentInfo)?.settings.enabled ?? false);
			let $3 = $.derived(() => $.get(highlightedBoardId) === $.get(board).id);
			ArtboardFrame($$anchor, {
				get board() {
					return $.get(board);
				},
				get tool() {
					return $.get(effectiveTool);
				},
				get zoom() {
					return $.get(zoom);
				},
				get themes() {
					return themes();
				},
				get globalThemeId() {
					return $.get(activeGlobalThemeId);
				},
				get showGrid() {
					return $.get(showGrid);
				},
				get comments() {
					return $.get($0);
				},
				get runsMap() {
					return $.get($1);
				},
				get agentEnabled() {
					return $.get($2);
				},
				get selectedCommentId() {
					return $.get(selectedCommentId);
				},
				get highlighted() {
					return $.get($3);
				},
				get showDebug() {
					return $.get(showDebug);
				},
				onmountchange: handleMountChange,
				onfocusboard: focusBoard,
				onaddcomment: handleAddComment,
				oneditcomment: handleEditComment,
				onmovepin: handleMovePin,
				ontogglecomment: handleToggleComment,
				ondeletecomment: handleDeleteComment,
				onsendtoagent: handleSendToAgent
			});
		}
	});
	$.reset(div_18);
	$.reset(div_17);
	$.bind_this(div_17, ($$value) => $.set(viewportEl, $$value), () => $.get(viewportEl));
	var node_31 = $.sibling(div_17, 2);
	var consequent_12 = ($$anchor) => {
		var div_20 = root_14();
		var div_21 = $.child(div_20);
		var div_22 = $.sibling($.child(div_21), 2);
		var span_5 = $.child(div_22);
		var text_11 = $.only_child(span_5);
		var span_6 = $.sibling(span_5, 2);
		var text_12 = $.only_child(span_6);
		$.reset(div_22);
		$.reset(div_21);
		var div_23 = $.sibling(div_21, 4);
		var p_3 = $.sibling($.child(div_23), 2);
		var text_13 = $.only_child(p_3, true);
		$.reset(div_23);
		$.next(4);
		$.reset(div_20);
		$.template_effect(() => {
			$.set_text(text_11, `${$.get(mountedCount) ?? ""} / ${$.get(layout).boards.length ?? ""}`);
			$.set_text(text_12, `mounted (${$.get(mountedRatio) ?? ""}%)`);
			$.set_style(p_3, `color: ${$.get(fpsColor) ?? ""};`);
			$.set_text(text_13, $.get(fps));
		});
		$.append($$anchor, div_20);
	};
	$.if(node_31, ($$render) => {
		if ($.get(showDebug)) $$render(consequent_12);
	});
	$.reset(div_12);
	AgentSettingsModal($.sibling(div_12, 2), {
		get open() {
			return $.get(agentModalOpen);
		},
		get agentInfo() {
			return $.get(agentInfo);
		},
		loadModels: (provider) => {
			return api.getAgentModels(provider);
		},
		onupdate: handleUpdateAgentSettings,
		onclose: () => {
			$.set(agentModalOpen, false);
		}
	});
	$.reset(div);
	$.template_effect(($0) => {
		$.set_attribute(div, "data-studio-theme", $.get(resolvedStudioTheme));
		classes_5 = $.set_class(button_6, 1, "ab-tool-btn svelte-eeo971", null, classes_5, { "ab-tool-active": $.get(effectiveTool) === "interact" });
		classes_6 = $.set_class(button_7, 1, "ab-tool-btn svelte-eeo971", null, classes_6, { "ab-tool-active": $.get(effectiveTool) === "pan" });
		classes_7 = $.set_class(button_8, 1, "ab-tool-btn svelte-eeo971", null, classes_7, { "ab-tool-comment": $.get(effectiveTool) === "comment" });
		classes_9 = $.set_class(button_10, 1, "ab-tool-btn svelte-eeo971", null, classes_9, { "ab-tool-grid": $.get(showGrid) });
		classes_11 = $.set_class(button_12, 1, "ab-icon-btn svelte-eeo971", null, classes_11, { "ab-tool-debug": $.get(showDebug) });
		$.set_text(text_8, `${$0 ?? ""}%`);
		classes_12 = $.set_class(div_17, 1, "ab-canvas svelte-eeo971", null, classes_12, {
			"ab-canvas-grab": $.get(effectiveTool) === "pan" && !$.get(isPanning),
			"ab-canvas-grabbing": $.get(effectiveTool) === "pan" && $.get(isPanning)
		});
		$.set_style(div_18, `transform: translate(${$.get(camX) ?? ""}px, ${$.get(camY) ?? ""}px) scale(${$.get(zoom) ?? ""});`);
	}, [() => Math.round($.get(zoom) * 100)]);
	$.delegated("click", button_6, () => {
		$.set(tool, "interact");
	});
	$.delegated("click", button_7, () => {
		$.set(tool, "pan");
	});
	$.delegated("click", button_8, () => {
		$.set(tool, "comment");
	});
	$.delegated("click", button_10, () => {
		$.set(showGrid, !$.get(showGrid));
	});
	$.delegated("click", button_12, toggleDebug);
	$.delegated("click", button_13, toggleStudioTheme);
	$.delegated("click", button_14, () => {
		zoomBy(.8);
	});
	$.delegated("click", button_15, () => {
		$.set(zoom, 1);
	});
	$.delegated("click", button_16, () => {
		zoomBy(1.25);
	});
	$.delegated("click", button_17, fitAll);
	$.delegated("pointerdown", div_17, handlePointerDown);
	$.delegated("pointermove", div_17, handlePointerMove);
	$.delegated("pointerup", div_17, handlePointerUp);
	$.event("pointercancel", div_17, handlePointerUp);
	$.event("wheel", div_17, handleWheel);
	$.append($$anchor, div);
	$.pop();
}
$.delegate([
	"click",
	"pointerdown",
	"pointermove",
	"pointerup"
]);
// src/registry.ts
const defineArtboards = (sections) => {
	return sections;
};
// src/client/studio.ts
const Artboard = ArtboardApp;
export { Artboard, defineArtboards, getStudioDefaults, setStudioDefaults };
