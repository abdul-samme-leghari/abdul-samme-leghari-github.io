// Re-structure the JSON data input to initialize map
// Returns a object with network Nodes and Edges
let lineWidth = null;
let styleOfLine = null;
let defaultFont = null;
let customOnSelectFontSize = null;

function structureData(payload, style) {
  let nodes = [];
  let temp = {};
  let edges = [];
  try {
    let data = payload;
    let numOfBubble = data.length;
    let customTextSize = bubbleTextSize(numOfBubble);

    let bdClr = style ? style.bubbleColor : null;
    bdClr = bdClr ? bdClr : "#5BBFBA";
    let textColor = style ? style.textColor : null;
    textColor = textColor ? textColor : "#fff";
    let textSize = style.default == true ? customTextSize : style.textSize;

    for (let index = 0; index < data.length; index++) {
      nodes.push({
        id: index + 1,
        label: breakText(data[index].termKey),
        shape: "circle",
        margin: 10,
        font: {
          color: textColor,
          size: textSize,
        },
        color: {
          border: "transparent",
          background: bdClr,
          hover: {
            background: bdClr === "transparent" ? bdClr : pSBC(-0.4, bdClr),
            border: bdClr === "transparent" ? bdClr : pSBC(-0.4, bdClr),
          },
        },
      });
      temp[data[index].termKey] = index + 1;
    }
    for (let i = 0; i < data.length; i++) {
      let lineColor = style ? style.lineColor : null;
      lineColor = lineColor ? lineColor : "#000";
      for (let j = 0; j < data[i].edges.length; j++) {
        edges.push({
          from: i + 1,
          color: lineColor,
          to: temp[data[i].edges[j].to],
          length:
            bdClr !== "transparent" &&
            detectEdgeLength(
              breakText(data[i].edges[j].to),
              breakText(data[i].termKey)
            ),
        });
      }
    }
  } catch (err) {
    console.log("Invalid json");
  }
  return {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges),
  };
}

function pSBC(p, c0, c1, l) {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 == "string";
  if (
    typeof p != "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 != "string" ||
    (c0[0] != "r" && c0[0] != "#") ||
    (c1 && !a)
  )
    return null;
  if (!this.pSBCr)
    this.pSBCr = (d) => {
      let n = d.length,
        x = {};
      if (n > 9) {
        ([r, g, b, a] = d = d.split(",")), (n = d.length);
        if (n < 3 || n > 4) return null;
        (x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4))),
          (x.g = i(g)),
          (x.b = i(b)),
          (x.a = a ? parseFloat(a) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6)
          d =
            "#" +
            d[1] +
            d[1] +
            d[2] +
            d[2] +
            d[3] +
            d[3] +
            (n > 4 ? d[4] + d[4] : "");
        d = i(d.slice(1), 16);
        if (n == 9 || n == 5)
          (x.r = (d >> 24) & 255),
            (x.g = (d >> 16) & 255),
            (x.b = (d >> 8) & 255),
            (x.a = m((d & 255) / 0.255) / 1000);
        else
          (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
      }
      return x;
    };
  (h = c0.length > 9),
    (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
    (f = this.pSBCr(c0)),
    (P = p < 0),
    (t =
      c1 && c1 != "c"
        ? this.pSBCr(c1)
        : P
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 }),
    (p = P ? p * -1 : p),
    (P = 1 - p);
  if (!f || !t) return null;
  if (l)
    (r = m(P * f.r + p * t.r)),
      (g = m(P * f.g + p * t.g)),
      (b = m(P * f.b + p * t.b));
  else
    (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
      (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
      (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
  (a = f.a),
    (t = t.a),
    (f = a >= 0 || t >= 0),
    (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
  if (h)
    return (
      "rgb" +
      (f ? "a(" : "(") +
      r +
      "," +
      g +
      "," +
      b +
      (f ? "," + m(a * 1000) / 1000 : "") +
      ")"
    );
  else
    return (
      "#" +
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
}

// Set node colors w.r.t ideaRelevance score
function addColor(payload) {
  payload.sort(function (a, b) {
    return a.ideaRelevance - b.ideaRelevance;
  });
  for (let index = 0; index < payload.length; index++) {
    const element = payload[index];
    // element.color = index === 0 ? '#06B8BB' : index === payload.length - 1 ? '#005D5E' : rgbToHex(6, 184 - index * 10, 187 - index * 10);
    // element.color = rgbToHex(5, 184 - element.termKey.length * 4, 187 - element.termKey.length * 4);
    element.color = "blue";
  }
  return payload;
}
function breakText(text) {
  let space = null;
  let main = text.repeat(1);
  for (let i = 0; i <= main.length; i++) {
    if (text[i] === " ") {
      space = i;
    }
    if (i % 9 === 0 && space) {
      if (text[space + 1] === " ") {
        space = space + 1;
      }
      text = text.replace(text[space], "\n");
      space = null;
    }
  }
  return text;
}
function detectEdgeLength(node1, node2) {
  let node = node1.split("\n");
  let first = node.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  });
  node = node2.split("\n");
  let second = node.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  });
  let final = first + second;
  return 5 + final.length * 9;
}

function padZero(str, len) {
  len = len || 2;
  let zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

function invertColor(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

// Initializes the network map
// id: id prop of the html element
// dataset: JSON data input
// readyCallBack: Fired when the map is completely drawn on the canvas
// callbackFunction: Fired when an interaction with the nodes is registered
function initialization(
  container,
  dataSet,
  readyCallBack,
  callbackFunction,
  style
) {
  function lineStyl(style) {
    return style.lineStyle;
  }
  function lineWid(style) {
    return style.lineWidth;
  }
  function defaultFontValue(style) {
    return style.default;
  }
  function customOnSelectFontSizeValue(style) {
    return style.onSelectTextSize;
  }
  let main = structureData(addColor(dataSet), style);
  styleOfLine = lineStyl(style);
  lineWidth = lineWid(style);
  defaultFont = defaultFontValue(style);
  customOnSelectFontSize = customOnSelectFontSizeValue(style);
  let nodes = main.nodes;
  let edges = main.edges;
  let data = {
    nodes: nodes,
    edges: edges,
  };
  // Vis js initialization params

  let options = {
    layout: {
      randomSeed: 15,
    },
    edges: {
      dashes: [1.5, 3],
      hoverWidth: 0.3,
      width: lineWidth,
      color: "#005D5E",
      font: {
        strokeWidth: 0.3,
      },
    },
    nodes: {
      borderWidth: 2,
      borderWidthSelected: 1,
      color: {
        highlight: {
          border: "#005D5E",
          background: "#FAFAFA",
        },
      },
      font: {
        color: "#000",
        size: 33,
        face: "arial",
        background: "none",
        strokeWidth: 0,
        align: "center",
      },
    },
    physics: {
      enabled: true,
      forceAtlas2Based: {
        gravitationalConstant: -90,
      },
      maxVelocity: 146,
      solver: "forceAtlas2Based",
      timestep: 0.35,
      stabilization: {
        enabled: true,
        iterations: 1000,
        updateInterval: 25,
      },
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: true,
      dragView: true,
      zoomView: true,
      dragNodes: true,
    },
  };
  if (styleOfLine === "solid") {
    options = {
      layout: {
        randomSeed: 15,
      },
      edges: {
        solid: [1.5, 3],
        hoverWidth: 0.3,
        width: lineWidth,
        color: "#005D5E",
        font: {
          strokeWidth: 0.3,
        },
      },
      nodes: {
        borderWidth: 2,
        borderWidthSelected: 1,
        color: {
          highlight: {
            border: "#005D5E",
            background: "#FAFAFA",
          },
        },
        font: {
          color: "#000",
          size: 33,
          face: "arial",
          background: "none",
          strokeWidth: 0,
          align: "center",
        },
      },
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -90,
        },
        maxVelocity: 146,
        solver: "forceAtlas2Based",
        timestep: 0.35,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25,
        },
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        dragView: true,
        zoomView: true,
        dragNodes: true,
      },
    };
  }
  if (styleOfLine == "dashes") {
    options = {
      layout: {
        randomSeed: 15,
      },
      edges: {
        dashes: [1.5, 3],
        hoverWidth: 0.3,
        width: lineWidth,
        color: "#005D5E",
        font: {
          strokeWidth: 0.3,
        },
      },
      nodes: {
        borderWidth: 2,
        borderWidthSelected: 1,
        color: {
          highlight: {
            border: "#005D5E",
            background: "#FAFAFA",
          },
        },
        font: {
          color: "#000",
          size: 33,
          face: "arial",
          background: "none",
          strokeWidth: 0,
          align: "center",
        },
      },
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -90,
        },
        maxVelocity: 146,
        solver: "forceAtlas2Based",
        timestep: 0.35,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25,
        },
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        dragView: true,
        zoomView: true,
        dragNodes: true,
      },
    };
  }

  // Initialize network map with vis.Network
  let network = new vis.Network(container, data, options);
  network.dataSet = dataSet;
  network.deNodeId = null;
  // network.setOptions(options);
  let temp = true;
  network.nodes = main.nodes;
  network.edges = main.edges;
  // get all ids
  let ids = network.nodes.getIds();

  // Register drag event on map
  network.on("dragging", function (params) {
    let selectedNodeId = params.nodes[0];
    let node = network.body.nodes[selectedNodeId];
    if (network.deNodeId !== selectedNodeId) {
      deSelectNode(network.deNodeId);
    }
    network.deNodeId = selectedNodeId;
    node.setOptions({
      outline: "none",
      borderWidthSelected: 1,
      color: {
        border: "#09321f",
      },
      font: {
        color: "#09321f",
      },
    });
  });
  // Register hover event on nodes
  network.on("hoverNode", function (params) {
    let selectedNodeId = params.node;
    let nodeOption = nodes._data[selectedNodeId];
    let node = network.body.nodes[selectedNodeId];
    if (temp) {
      node.setOptions({
        font: {
          size: nodeOption.font.size + 2,
        },
      });
    }
    if (callbackFunction) {
      callbackFunction({
        type: "hovered",
        key: network.dataSet[params.node - 1].termKey,
      });
    }
  });
  // Register event on node blur
  network.on("blurNode", function (params) {
    let selectedNodeId = params.node;
    let node = network.body.nodes[selectedNodeId];
    if (temp) {
      node.setOptions({
        font: {
          size: node.options.font.size - 1,
        },
      });
    }
  });
  // Register event for node selection
  network.on("selectNode", function (params) {
    nodeClickEvent(params);
  });

  // Register dragEnd event on map
  network.on("dragEnd", function (params) {
    nodeClickEvent(params);
  });

  // Register event for node deselection
  network.on("deselectNode", function () {
    // let deselectedNodeId = params.previousSelection.nodes[0];
    deSelectNode(network.deNodeId);
  });
  let nodeClickEvent = function (params) {
    if (params.nodes.length === 0) return;
    let selectedNodeId = params.nodes[0];
    network.deNodeId = selectedNodeId;
    temp = false;
    let numberOfBubbles = ids.length;
    let onSelectCustomTextSize = onSelectCustomBubblesize(
      numberOfBubbles,
      selectedNodeId
    );
    /*  
    ids = ids.filter((id) => id !== selectedNodeId);
    console.log("ids", ids);

    for (var id of ids) {
      let node = network.body.nodes[id];
      let nodeOption = nodes._data[id];
      node.setOptions({
        //  x: 10,
        //  y: 10,

        font: {
          size: 50,
        },
      });

      console.log(id);
    } */
    //console.log(onSelectCustomTextSize[1]);
    node = network.body.nodes[selectedNodeId];
    //console.log("node", node);
    nodeOption = nodes._data[selectedNodeId];
    //console.log("nodeOption", nodeOption);
    //temp = false;
    console.log(defaultFont);
    onSelectCustomTextSize =
      defaultFont == true ? onSelectCustomTextSize : customOnSelectFontSize;
    node.setOptions({
      font: {
        size: onSelectCustomTextSize,
        color:
          nodeOption.font.color === "transparent"
            ? invertColor(nodeOption.font.color)
            : "",
      },
      color: {
        highlight: {
          border:
            nodeOption.color.background === "transparent"
              ? nodeOption.color.background
              : "#005D5E",
          background:
            nodeOption.color.background === "transparent"
              ? nodeOption.color.background
              : "#FAFAFA",
        },
      },
    });
    // console.log(nodeOption.font.size);
    if (callbackFunction) {
      callbackFunction({
        type: "clicked",
        key: network.dataSet[params.nodes[0] - 1].termKey,
      });
    }
  };
  let deSelectNode = (id) => {
    let node = network.body.nodes[id];
    let nodeOption = nodes._data[id];
    temp = true;
    if (network.deNodeId) {
      node.setOptions({
        color: {
          border: "transparent",
        },
        font: {
          color: nodeOption.font.color,
          size: nodeOption.font.size,
        },
      });
    }
  };
  // Updates the JSON input for map network and redraws/reinitializes the map
  var updateDataset = (network, newDataSet) => {
    let main2 = structureData(addColor(newDataSet));
    network.dataSet = newDataSet;
    let data2 = {
      nodes: main2.nodes,
      edges: main2.edges,
    };
    network.setData(data2);
  };
  if (typeof readyCallBack === "function") {
    setTimeout(function () {
      readyCallBack();
    }, 0);
  }
  network.fit();
  return {
    updateDataset: updateDataset,
    reDraw: updateDataset,
    network,
  };
}

let onSelectCustomBubblesize = (size, id) => {
  let onSelectBubbleSize = null;

  if (size == 1 && id == 1) return (onSelectBubbleSize = 23);
  if (size == 2 && (id == 1 || id == 2)) return (onSelectBubbleSize = 22);
  if (size == 3 && (id == 1 || id == 2 || id == 3))
    return (onSelectBubbleSize = 28);
  if (size == 4 && (id == 1 || id == 2 || id == 3 || id == 4))
    return (onSelectBubbleSize = 34);
  if (size == 5 && (id == 1 || id == 2 || id == 3 || id == 4 || id == 5))
    return (onSelectBubbleSize = 50);
  if (
    size == 6 &&
    (id == 1 || id == 2 || id == 3 || id == 4 || id == 5 || id == 6)
  )
    return (onSelectBubbleSize = 52);
  if (
    size == 7 &&
    (id == 1 || id == 2 || id == 3 || id == 4 || id == 5 || id == 6 || id == 7)
  )
    return (onSelectBubbleSize = 56);
  if (
    size == 8 &&
    (id == 1 ||
      id == 2 ||
      id == 3 ||
      id == 4 ||
      id == 5 ||
      id == 6 ||
      id == 7 ||
      id == 8)
  )
    return (onSelectBubbleSize = 60);
};

let bubbleTextSize = (numberOfBubbles) => {
  let customTextSize = null;
  switch (numberOfBubbles) {
    case 1:
      customTextSize = 16;
      break;
    case 2:
      customTextSize = 18;
      break;
    case 3:
      customTextSize = 19;
      break;
    case 4:
      customTextSize = 22;
      break;
    case 5:
      customTextSize = 34;
      break;
    case 6:
      customTextSize = 36;
      break;
    case 7:
      customTextSize = 34;
      break;
    case 8:
      customTextSize = 30;
      break;
    default:
      customTextSize = 20;
  }
  return customTextSize;
};
