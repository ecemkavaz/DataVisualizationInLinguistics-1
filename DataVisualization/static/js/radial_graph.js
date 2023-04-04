/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

// Variable to check if the ready function code has been completely executed
var codeReady = false;

//Graph
let link, node;
var canvasHeight = 1000, canvasWidth = document.getElementById("tree-container").offsetWidth; //Dimensions of our canvas (grayish area)
const canvasFactor = 1;

const edgeLength = 24 * 20;
const initialZoomScale = 0.2; //Initial zoom scale to display almost the whole graph
var initialZoom, initialX, initialY; //Initial zoom and central coordinates of the first visualization of the graph

//Node radius
const minNodeRadius = 30, minRadius = 30;
const incrementRadiusFactorPerChild = 10;

//Features
const dotRadius = 15;
const cheeseX = 15, cheeseY = -10, cheeseHeight = 20, cheeseWidth = 20;

//Images
const targetIconHeight = 30, targetIconWidth = 30,
    targetIconGroupX = -60, targetIconPersonX = -120, targetIconStereotypeX = -180,
    targetIconY = -30; //Size and relative position of targets drawn as icons
const imgRatio = 10; //Percentage of difference between the radii of a node and its associated image

//Zoom
let currentZoomScale; //Current scale
const minZoom = 0.05, maxZoom = 8; //Zoom range

//Paths
const pathTargets = pt;

// Colours

const colourToxicity0 = "#FAFFA8", colourToxicity1 = "#F8BB7C", colourToxicity2 = "#F87A54",
    colourToxicity3 = "#7A1616", colourNewsArticle = "lightsteelblue";
const colourBothStances = "#FFDA0A", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
    colourNeutralStance = "#2b2727";
const colourConstructiveness = "#90F6B2", colourArgumentation = "#1B8055", colourSarcasm = "#97CFFF",
    colourMockery = "#1795FF",
    colourIntolerance = "#0B5696", colourImproper = "#E3B7E8", colourInsult = "#A313B3",
    colourAggressiveness = "#5E1566";

var colorFeature = ["#90F6B2", "#1B8055",
    "#97CFFF", "#1795FF", "#0B5696",
    "#E3B7E8", "#A313B3", "#5E1566"];

var targetImagesPath = ["icons/Group.svg", "icons/Person.svg", "icons/Blank.png", "icons/Stereotype.svg"];
var toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

// Objects for target images
const objTargetGroup = {
        class: "targetGroup",
        id: "targetGroup",
        name: "target-group",
        x: -40,
        y: -15,
        xInside: -0.9,
        yInside: -0.8,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Group.svg"
    },
    objTargetPerson = {
        class: "targetPerson",
        id: "targetPerson",
        name: "target-person",
        x: -80,
        y: -15,
        xInside: -0.5,
        yInside: 0,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Person.svg"
    },
    objTargetStereotype = {
        class: "targetStereotype",
        id: "targetStereotype",
        name: "target-stereotype",
        x: -120,
        y: -15,
        xInside: -0.1,
        yInside: -0.8,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Stereotype.svg"
    };

// Objects for feature images
const objFeatArgumentation = {
        class: "featArgumentation",
        id: "featArgumentation",
        name: "argumentation",
        color: colourArgumentation,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Argumentation.svg"
    },
    objFeatConstructiveness = {
        class: "featConstructiveness",
        id: "featConstructiveness",
        name: "constructiveness",
        color: colourConstructiveness,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Constructiveness.svg"
    },
    objFeatSarcasm = {
        class: "featSarcasm",
        id: "featSarcasm",
        name: "sarcasm",
        color: colourSarcasm,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Sarcasm.svg"
    },
    objFeatMockery = {
        class: "featMockery",
        id: "featMockery",
        name: "mockery",
        color: colourMockery,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Mockery.svg"
    },
    objFeatIntolerance = {
        class: "featIntolerance",
        id: "featIntolerance",
        name: "intolerance",
        color: colourIntolerance,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Intolerance.svg"
    },
    objFeatImproper = {
        class: "featImproper",
        id: "featImproper",
        name: "improper_language",
        color: colourImproper,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Improper.svg"
    },
    objFeatInsult = {
        class: "featInsult",
        id: "featInsult",
        name: "insult",
        color: colourInsult,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Insult.svg"
    },
    objFeatAggressiveness = {
        class: "featAggressiveness",
        id: "featAggressiveness",
        name: "aggressiveness",
        color: colourAggressiveness,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Aggressiveness.svg"
    },
    objFeatGray = {
        class: "featGray",
        id: "featGray",
        name: "gray",
        selected: 1,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Gray.png"
    };

/**
 * Return the value of a property (set from the JSON) of the given node
 *
 * @param d Datum of a node
 * @param {string} propertyNameToRetrieve The property whose value is returned
 * */
function retrieveAttributeFromComment(d, propertyNameToRetrieve) {
    switch (propertyNameToRetrieve) {
        //Features
        case "argumentation":
            return d.argumentation;
        case "constructiveness":
            return d.constructiveness;
        case "sarcasm":
            return d.sarcasm;
        case "mockery":
            return d.mockery;
        case "intolerance":
            return d.intolerance;
        case "improper_language":
            return d.improper_language;
        case "insult":
            return d.insult;
        case "aggressiveness":
            return d.aggressiveness;
        case "gray":
            return 1;
        case "gray-ring":
            return 0.5;

        //Targets
        case "target-group":
            return d.target_group;
        case "target-person":
            return d.target_person;
        case "target-stereotype":
            return d.stereotype;

        //Toxicity
        case "toxicity-0":
            return d.toxicity_level === 0 ? 1 : 0;
        case "toxicity-1":
            return d.toxicity_level === 1 ? 1 : 0;
        case "toxicity-2":
            return d.toxicity_level === 2 ? 1 : 0;
        case "toxicity-3":
            return d.toxicity_level === 3 ? 1 : 0;

        default:
            //console.log("An attribute could not be retrieved because the key word did not match any case...");
            break;
    }
}

/**
 * Removes the features of the node given
 * */
function removeThisFeatures(nodeEnter) {
    nodeEnter.selectAll("#featGray").remove();
    nodeEnter.selectAll("#featArgumentation").remove();
    nodeEnter.selectAll("#featConstructiveness").remove();
    nodeEnter.selectAll("#featSarcasm").remove();
    nodeEnter.selectAll("#featMockery").remove();
    nodeEnter.selectAll("#featIntolerance").remove();
    nodeEnter.selectAll("#featImproper").remove();
    nodeEnter.selectAll("#featInsult").remove();
    nodeEnter.selectAll("#featAggressiveness").remove();
}


function removeToxicities(nodeEnter) {
    nodeEnter.selectAll("#toxicity0").remove();
    nodeEnter.selectAll("#toxicity1").remove();
    nodeEnter.selectAll("#toxicity2").remove();
    nodeEnter.selectAll("#toxicity3").remove();
}


/**
 * Draws a circle in an horizontal line at the right of the node
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {object} object The object of a property
 * @param {number} itemOrder Order in which the circles is drawn (away from the node)
 * */
function drawObjectAsDot(nodeEnter, object, itemOrder) {
    nodeEnter.append("circle")
        .attr('class', object.class)
        .attr('id', object.id)
        .attr("r", dotRadius)
        .attr("transform", function (d) {
            return "translate(" + (d.radius + (itemOrder + 1) * (dotRadius * 2)) + "," + 0 + ")";
        })
        .attr("fill", object.color)
        .style("stroke", "black")
        .style("stroke-width", "1.5px")
        .attr("opacity", function (d) {
            if (d.parent === null || d.parent === undefined) return 0;
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Draw features as dots
 * */
function drawFeatureDots(nodeEnter, enabledFeatures) {
    removeThisFeatures(nodeEnter);
    removeToxicities(nodeEnter); //Remove all the pngs for toxicity

    let index = 0;
    if (enabledFeatures.indexOf("argumentation") > -1) drawObjectAsDot(nodeEnter, objFeatArgumentation, index);
    if (enabledFeatures.indexOf("constructiveness") > -1) drawObjectAsDot(nodeEnter, objFeatConstructiveness, ++index);

    if (enabledFeatures.indexOf("sarcasm") > -1) drawObjectAsDot(nodeEnter, objFeatSarcasm, ++index);
    if (enabledFeatures.indexOf("mockery") > -1) drawObjectAsDot(nodeEnter, objFeatMockery, ++index);
    if (enabledFeatures.indexOf("intolerance") > -1) drawObjectAsDot(nodeEnter, objFeatIntolerance, ++index);

    if (enabledFeatures.indexOf("improper_language") > -1) drawObjectAsDot(nodeEnter, objFeatImproper, ++index);
    if (enabledFeatures.indexOf("insult") > -1) drawObjectAsDot(nodeEnter, objFeatInsult, ++index);
    if (enabledFeatures.indexOf("aggressiveness") > -1) drawObjectAsDot(nodeEnter, objFeatAggressiveness, ++index);
}


/**
 * Remove all the target icon or images of the given node
 * */
function removeThisTargets(nodeEnter) {
    nodeEnter.select("#targetGroup").remove();
    nodeEnter.select("#targetPerson").remove();
    nodeEnter.select("#targetStereotype").remove();
    nodeEnter.select("#targetGray").remove();
}

/**
 * Draw an image on the left side of a node displaced by object.x pixels
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {object} object The object of a property
 * @param {string} path The path of the image
 * */
function drawObjectTargetOutside(nodeEnter, object, path) {
    nodeEnter.append("image")
        .attr('class', object.class)
        .attr('id', object.id)
        .attr("x", function (d) {
            return object.x - d.radius;
        })
        .attr("y", object.y)
        .attr("height", object.height)
        .attr("width", object.width)
        .attr("href", path + object.fileName)
        .attr("opacity", function (d) {
            if (d.parent === null || d.parent === undefined) return 0;
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Call to draw all the targets
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {string} path The path of the image
 * @param {array} enabledTargets The array containing which checkboxes are selected
 * @param {object} target The object containing the objects to draw
 * @param {callback} draw The function to call to draw the object
 * @param {number} percentage The percentage of the difference of radii between the node and the image
 * */
function drawTargetsGeneral(nodeEnter, path, enabledTargets, target, draw, percentage = imgRatio) {
    if (enabledTargets.indexOf("target-group") > -1) draw(nodeEnter, target.group, path, percentage);
    if (enabledTargets.indexOf("target-person") > -1) draw(nodeEnter, target.person, path, percentage);
    if (enabledTargets.indexOf("target-stereotype") > -1) draw(nodeEnter, target.stereotype, path, percentage);
}

/**
 * Draws the 3 targets of a node if the checkbox is checked
 * and if the node has that target (sets the opacity to visible)
 *
 * The icon used is from the local path passed by parameter
 * The css values are from the target objects that are icons
 * */
function drawTargetsOutside(nodeEnter, localPath, enabledTargets) {
    removeThisTargets(nodeEnter);

    let path = pathTargets + localPath;
    let target = {group: objTargetGroup, person: objTargetPerson, stereotype: objTargetStereotype};
    drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawObjectTargetOutside);

    /*nodeEnter.append("image")
        .attr("x", function (d) {
            return - (d.radius + sizeImage(minRadius, 0) * (i + 1));
        })
        .attr("y", - minRadius)

        .attr("height", function (d) {
            return sizeImage(minRadius, 0);
        })
        .attr("width", function (d) {
            return sizeImage(minRadius, 0);
        })
        ;*/
}

/**
 * Set edge stroke width based on current zoom value
 * */
function getEdgeStrokeWidth() {
    //console.log("Current zoom is: ", currentZoomScale);
    switch (true) {
        case (currentZoomScale > 7):
            return 1
        case (currentZoomScale > 6):
            return 2
        case (currentZoomScale > 4):
            return 3
        case (currentZoomScale > 3):
            return 4
        case (currentZoomScale > 1):
            return 5
        case (currentZoomScale > 0.6):
            return 6
        case (currentZoomScale > 0.5):
            return 7
        case (currentZoomScale > 0.4):
            return 8
        case (currentZoomScale > 0.3):
            return 9
        case (currentZoomScale > 0.2):
            return 10
        case (currentZoomScale > 0.1):
            return 11
        case (currentZoomScale > 0.075):
            return 15
        case (currentZoomScale > 0):
            return 20
    }
}

function getNodeStrokeWidth() {
    //console.log("Zoom: ", currentZoomScale)
    switch (true) {
        case (currentZoomScale > 1):
            return 1
        case (currentZoomScale > 0.6):
            return 2
        case (currentZoomScale > 0.5):
            return 3
        case (currentZoomScale > 0.4):
            return 4
        case (currentZoomScale > 0.3):
            return 5
        case (currentZoomScale > 0.2):
            return 6
        case (currentZoomScale > 0.1):
            return 7
        case (currentZoomScale > 0.075):
            return 8
        case (currentZoomScale > 0):
            return 10
    }
}

/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadius(d, edgeLength = 300) {
    d.radius = minNodeRadius;
    if ((d.children === undefined || d.children === null) && (d._children === undefined || d._children === null)) return d.radius; //No children

    let children = d.children ?? d._children; //Assign children collapsed or not

    children.length > 2 ? d.radius = minNodeRadius + incrementRadiusFactorPerChild * children.length // more than 2 children
        : children.length === 2 ? d.radius = minNodeRadius + incrementRadiusFactorPerChild * 2 //2 children
            : d.radius = minNodeRadius + incrementRadiusFactorPerChild; //One child

    //Avoid the root node from being so large that overlaps/hides its children
    if ((d.parent === null || d.parent === undefined) && d.radius < 180) d.radius = 180;
    if ((d.parent === null || d.parent === undefined) && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return d.radius;
}
/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensions(nodes) {
    /* Note our coordinate system:
    * in radian coordinates
    * q4    |       q1
    * ------|---------
    * q3    |       q2
    * */
    var maxYq1 = -Infinity, maxYq2 = -Infinity, maxYq3 = -Infinity, maxYq4 = -Infinity;
    var xQ1, xQ2, xQ3, xQ4;

    for (const n of nodes) {
        //Quadrant 1
        if (0 <= n.x && n.x < 90 && n.y > maxYq1) {
            maxYq1 = n.y;
            xQ1 = n.x;
        }

        //Quadrant 2
        if (90 <= n.x && n.x < 180 && n.y > maxYq2) {
            maxYq2 = n.y;
            xQ2 = n.x;
        }
        if (-270 <= n.x && n.x < -180 && n.y > maxYq2) {
            maxYq2 = n.y;
            xQ2 = n.x;
        }

        //Quadrant 3
        if (180 <= n.x && n.x < 270 && n.y > maxYq3) {
            maxYq3 = n.y;
            xQ3 = n.x;
        }
        if (-180 <= n.x && n.x < -90 && n.y > maxYq3) {
            maxYq3 = n.y;
            xQ3 = n.x;
        }

        //Quadrant 4
        if (-90 <= n.x && n.x < 0 && n.y > maxYq4) {
            maxYq4 = n.y;
            xQ4 = n.x;
        }
    }
    return {
        maxYq1: maxYq1, maxYq2: maxYq2, maxYq3: maxYq3, maxYq4: maxYq4,
        xQ1: xQ1, xQ2: xQ2, xQ3: xQ3, xQ4: xQ4
    };
}

/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensions(nodes) {
    /* Note our coordinate system:
     *
     *                     | X negative
     *                     |
     * Y negative <--------|-------> Y positive
     *                     |
     *                     | X positive
     * And note we need to take into account the radius of the node
     * */
    var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const n of nodes) {
        if ((n.x - n.radius) < minX) minX = n.x - n.radius;
        if ((n.y - n.radius) < minY) minY = n.y - n.radius;
        if ((n.x + n.radius) > maxX) maxX = n.x + n.radius;
        if ((n.y + n.radius) > maxY) maxY = n.y + n.radius;
    }
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

/**
 * Center graph and zoom to fit the whole graph visualization in our canvas
 * */
function zoomToFit() {
    //By default, the (0,0) (our root node) is displayed on the top left corner
    //We need to center the graph in the canvas

}


/**
 * Highlights nodes by category of Toxicity
 * */
function highlightToxicityOR(node, enabledHighlight) {
    //Toxicity 0
    if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 0) d.highlighted = 1;
            return (d.toxicity_level === 0);
        }).style("opacity", 1);
    }

    //Toxicity 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 1) d.highlighted = 1;
            return (d.toxicity_level === 1);
        }).style("opacity", 1);
    }

    //Toxicity 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 2) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 2);
        }).style("opacity", 1);
    }

    //Toxicity 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 3) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 3);
        }).style("opacity", 1);
    }

}

/**
 * Highlights nodes and edges by category of Toxicity belonging to the intersection of selected values
 *
 * Unhighlights nodes that do not have the selected property
 * */
function highlightToxicityAND(node, enabledHighlight, opacityValue = 0.1) {
    //Toxicity not 0
    if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
        var unhighlightNodes = node.filter(function (d) {
            if (d.toxicity_level !== 0) d.highlighted = 0;
            return (d.toxicity_level !== 0);
        });
        unhighlightNodes.style("opacity", opacityValue);
        unhighlightNodes.select("g.node.backgroundCircle").style("opacity", 1);
    }

    //Toxicity not 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 1) d.highlighted = 0;
            return (d.toxicity_level !== 1);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Toxicity not 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 2) d.highlighted = 0;
            return (d.toxicity_level !== 2);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Toxicity not 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 3) d.highlighted = 0;
            return (d.toxicity_level !== 3);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}

function highlightStanceOR(node, enabledHighlight) {
    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance && !d.negative_stance) d.highlighted = 1;
            return (!d.positive_stance && !d.negative_stance);
        }).style("opacity", 1);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
        node.filter(function (d) {
            if (d.positive_stance) d.highlighted = 1;
            return (d.positive_stance);
        }).style("opacity", 1);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
        node.filter(function (d) {
            if (d.negative_stance) d.highlighted = 1;
            return (d.negative_stance);
        }).style("opacity", 1);
    }

    //Positive + Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-both") > -1) {
        node.filter(function (d) {
            if (d.negative_stance && d.positive_stance) d.highlighted = 1;
            return ((d.negative_stance && d.positive_stance));
        }).style("opacity", 1);

    }
}

function highlightStanceAND(node, enabledHighlight, opacityValue = 0.1) {
    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
        node.filter(function (d) {
            if (d.positive_stance || d.negative_stance) d.highlighted = 0;
            return (d.positive_stance || d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance) d.highlighted = 0;
            return (!d.positive_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
        node.filter(function (d) {
            if (!d.negative_stance) d.highlighted = 0;
            return (!d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Positive + Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-both") > -1) {
        node.filter(function (d) {
            if (!(d.negative_stance && d.positive_stance)) d.highlighted = 0;
            return (!(d.negative_stance && d.positive_stance));
        }) //.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}

function highlightTargetOR(node, enabledHighlight) {
    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-target-group") > -1) {
        node.filter(function (d) {
            if (d.target_group) d.highlighted = 1;
            return (d.target_group);
        }).style("opacity", 1);
    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-target-person") > -1) {
        node.filter(function (d) {
            if (d.target_person) d.highlighted = 1;
            return (d.target_person);
        }).style("opacity", 1);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-features-stereotype") > -1) {
        node.filter(function (d) {
            if (d.stereotype) d.highlighted = 1;
            return (d.stereotype);
        }).style("opacity", 1);
    }
}

function highlightTargetAND(node, enabledHighlight, opacityValue = 0.1) {
    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-target-group") > -1) {
        node.filter(function (d) {
            if (!d.target_group) d.highlighted = 0;
            return (!d.target_group);
        }).style("opacity", opacityValue);

    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-target-person") > -1) {
        node.filter(function (d) {
            if (!d.target_person) d.highlighted = 0;
            return (!d.target_person);
        }).style("opacity", opacityValue);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-features-stereotype") > -1) {
        node.filter(function (d) {
            if (!d.stereotype) d.highlighted = 0;
            return (!d.stereotype);
        }).style("opacity", opacityValue);
    }
}

function highlightPositiveOR(node, enabledHighlight) {
    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
        node.filter(function (d) {
            if (d.argumentation) d.highlighted = 1;
            return (d.argumentation);
        }).style("opacity", 1);
    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
        node.filter(function (d) {
            if (d.constructiveness) d.highlighted = 1;
            return (d.constructiveness);
        }).style("opacity", 1);
    }

}

function highlightPositiveAND(node, enabledHighlight, opacityValue = 0.1) {
    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
        node.filter(function (d) {
            if (!d.argumentation) d.highlighted = 0;
            return (!d.argumentation);
        }).style("opacity", opacityValue);
    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
        node.filter(function (d) {
            if (!d.constructiveness) d.highlighted = 0;
            return (!d.constructiveness);
        }).style("opacity", opacityValue);
    }

}

function highlightNegativeOR(node, enabledHighlight) {
    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
        node.filter(function (d) {
            if (d.sarcasm) d.highlighted = 1;
            return (d.sarcasm);
        }).style("opacity", 1);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
        node.filter(function (d) {
            if (d.mockery) d.highlighted = 1;
            return (d.mockery);
        }).style("opacity", 1);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
        node.filter(function (d) {
            if (d.intolerance) d.highlighted = 1;
            return (d.intolerance);
        }).style("opacity", 1);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
        node.filter(function (d) {
            if (d.improper_language) d.highlighted = 1;
            return (d.improper_language);
        }).style("opacity", 1);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
        node.filter(function (d) {
            if (d.insult) d.highlighted = 1;
            return (d.insult);
        }).style("opacity", 1);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
        node.filter(function (d) {
            if (d.aggressiveness) d.highlighted = 1;
            return (d.aggressiveness);
        }).style("opacity", 1);
    }
}

function highlightNegativeAND(node, enabledHighlight, opacityValue = 0.1) {
    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
        node.filter(function (d) {
            if (!d.sarcasm) d.highlighted = 0;
            return (!d.sarcasm);
        }).style("opacity", opacityValue);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
        node.filter(function (d) {
            if (!d.mockery) d.highlighted = 0;
            return (!d.mockery);
        }).style("opacity", opacityValue);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
        node.filter(function (d) {
            if (!d.intolerance) d.highlighted = 0;
            return (!d.intolerance);
        }).style("opacity", opacityValue);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
        node.filter(function (d) {
            if (!d.improper_language) d.highlighted = 0;
            return (!d.improper_language);
        }).style("opacity", opacityValue);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
        node.filter(function (d) {
            if (!d.insult) d.highlighted = 0;
            return (!d.insult);
        }).style("opacity", opacityValue);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
        node.filter(function (d) {
            if (!d.aggressiveness) d.highlighted = 0;
            return (!d.aggressiveness);
        }).style("opacity", opacityValue);
    }
}

// Get JSON data
treeJSON = d3.json(dataset, function (error, treeData) {

    // Calculate total nodes, max label length
    var totalNodes = 0;

    // Misc. variables
    var i = 0;
    var duration = 750;
    var root, rootName = "News Article";
    var nodes;


    var groupDrawn = false, personDrawn = false;
    var opacityValue = 0.1;

    var circleRadius = 8.7, minRadius = 10;
    const dotRadius = 10.5;

    /* Colours
   * */
    var colourBothStances = "#FFDD1F", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
        colourNeutralStance = "#2b2727";
    var colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
        colourToxicity3 = "#000000", colourNewsArticle = "lightsteelblue", colourCollapsed1Son = "lightsteelblue";
    var colorFeature = ["#90F6B2", "#1B8055",
        "#97CFFF", "#1795FF", "#0B5696",
        "#E3B7E8", "#A313B3", "#5E1566"
    ];

    /* Root icon */
    var rootPath = pr;
    var objRoot = {
        class: "rootNode",
        id: "rootNode",
        fileName: "root.png"
    };

    var imgRatio = 10; //Percentage of difference between the radii of a node and its associated image

    /* Targets: size, position, local path, objects to draw the target as ring
    * */
    var drawingAllInOne = false; //if we are drawing all together or separated

    var objTargetGroupRing = {
            class: "targetGroup",
            id: "targetGroup",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Group.png"
        },
        objTargetPersonRing = {
            class: "targetPerson",
            id: "targetPerson",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Person.png"
        },
        objTargetStereotypeRing = {
            class: "targetStereotype",
            id: "targetStereotype",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Stereotype.png"
        },
        objTargetGrayRing = {
            class: "targetGray",
            id: "targetGray",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Gray.png"
        };

    /* Features: size, position, local path
    * */
    var cheeseX = -17.53, cheeseY = -27.45, cheeseHeight = 55, cheeseWidth = 55;
    var pathFeatures = pf;

    var objToxicity0 = {class: "toxicity0", id: "toxicity0", selected: 1, fileName: "Level0.svg"},
        objToxicity1 = {class: "toxicity1", id: "toxicity1", selected: 1, fileName: "Level1.svg"},
        objToxicity2 = {class: "toxicity2", id: "toxicity2", selected: 1, fileName: "Level2.svg"},
        objToxicity3 = {class: "toxicity3", id: "toxicity3", selected: 1, fileName: "Level3.svg"};

    var tooltipText;


    var listCheeseImgPath = ["./images/features/trivialCheese/Gray.png", "./images/features/trivialCheese/Argumentation.png", "./images/features/trivialCheese/Constructiveness.png",
        "./images/features/trivialCheese/Sarcasm.png", "./images/features/trivialCheese/Mockery.png", "./images/features/trivialCheese/Intolerance.png",
        "./images/features/trivialCheese/Improper.png", "./images/features/trivialCheese/Insult.png", "./images/features/trivialCheese/Aggressiveness.png"];
    var listTargetImgPath = ["./images/targets/icons/Group.png", "./images/targets/icons/Person.png", "./images/targets/icons/Stereotype.png"];

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();
    var separationHeight = 61; //Desired separation between two node brothers
    var radiusFactor = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children

    root = treeData; //Define the root

    // The edge length is overwritten in the update()
    let tree = d3.layout.tree()
        .size([360, 0]) // breadth (x) is measured in degrees and the depth (y) is a radius r in pixels, say [360, r].
        .separation(function (a, b) {
            let separation;

            if (a.depth === 0) separation = 1;
            else if (a.parent !== b.parent) separation = 2 / a.depth;
            else {
                if (a._children?.length >= 5 || b._children?.length >= 5) separation = 3 / a.depth; // if 5 children or more collapsed
                else separation = 1 / a.depth;
            }

            return separation;
        })
        .sort(function (a, b) {
            return d3.ascending(a.toxicity_level, b.toxicity_level);
        });

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    /**
     * Computes the rectangular coordinates from the polar coordinates
     * @param x: angle theta of a point in polar coordinates
     * @param y: radius r of a point in polar coordinates
     *
     * Conversion formula to convert from polar to rectangular coordinates
     * x = r cos(theta)
     * y = r sin(theta)
     *
     * @return rectangular coordinates
     *
     * This is from the official library https://github.com/d3/d3-shape/blob/master/src/pointRadial.js
     * */
    function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    // Hover rectangle in which the information of a node is displayed
    var tooltip = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "60")
        .style("visibility", "hidden");

    // Div where the title of the "Static Values" is displayed
    var statisticBackground = d3.select("#tree-container")
        .append("div")
        .attr("id", "statistics-text")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1") //it has no change
        .style("visibility", "visible")
        .style("right", "320px");

    /*SECTION zoom*/
    var zoomLabel = document.getElementById("zoom_level");
    var XLabel = document.getElementById("position_x");
    var YLabel = document.getElementById("position_y");

    /*SECTION checkboxes*/
    //Check the values of the checkboxes and do something
    var checkbox = document.querySelector("input[name=cbTargets]");
    var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")];
    let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

    // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
    var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
    let enabledFeatures = []; //Variable which contains the string of the enabled options to display features
    // var checkboxFeatureMenu = document.querySelector("input[name=cbFeatureMenu]");

    // Select how to display the features: svg circles or trivial cheese (previous version)
    var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");
    var checkboxFeatureDot = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=dot-feat]");
    var checkboxFeatureCheese = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=cheese-feat]");

    //Dropdown menu
    var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
    // var cbFeatureInside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
    // var cbFeatureOutside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

    // Select which properties and if an intersection or union of those
    // var checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
    var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
    var checkboxAND = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
    var checkboxOR = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
    var checkboxesHighlightGroupOR = document.querySelectorAll("input[name=cbHighlightOR]");
    var checkboxesHighlightGroupAND = document.querySelectorAll("input[name=cbHighlightAND]");

    // var checkboxStaticValues = document.querySelector("input[name=cbStaticValues]");


    let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight
    /*END SECTION checkboxes*/

    var checkButtons = document.querySelectorAll("input[name=check_button_features]");


    /* Dropdown menus */
    // var dropdownTargets = document.getElementById("dropdown-targets");
    var dropdownFeatures = document.getElementById("dropdown-features");


    var dotsFeatures = document.getElementById("dots_icon_button");
    var glyphsFeatures = document.getElementById("glyphs_icon_button");
    var trivialFeatures = document.getElementById("trivial_icon_button");

    //Define objects after the checkbox where we keep if it is selected
    var objTargetGroup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargets.indexOf("target-group"),
            x: -70,
            y: -15,
            xInside: -0.9,
            yInside: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Group.svg"
        },
        objTargetPerson = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargets.indexOf("target-person"),
            x: -115,
            y: -15,
            xInside: -0.5,
            yInside: 0,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Person.svg"
        },
        objTargetStereotype = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargets.indexOf("target-stereotype"),
            x: -160,
            y: -15,
            xInside: -0.1,
            yInside: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Stereotype.svg"
        };

    var objFeatArgumentation = {
            class: "featArgumentation",
            id: "featArgumentation",
            selected: enabledFeatures.indexOf("argumentation"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Argumentation.svg"
        },
        objFeatConstructiveness = {
            class: "featConstructiveness",
            id: "featConstructiveness",
            selected: enabledFeatures.indexOf("constructiveness"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Constructiveness.svg"
        },
        objFeatSarcasm = {
            class: "featSarcasm",
            id: "featSarcasm",
            selected: enabledFeatures.indexOf("sarcasm"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Sarcasm.svg"
        },
        objFeatMockery = {
            class: "featMockery",
            id: "featMockery",
            selected: enabledFeatures.indexOf("mockery"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Mockery.svg"
        },
        objFeatIntolerance = {
            class: "featIntolerance",
            id: "featIntolerance",
            selected: enabledFeatures.indexOf("intolerance"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Intolerance.svg"
        },
        objFeatImproper = {
            class: "featImproper",
            id: "featImproper",
            selected: enabledFeatures.indexOf("improper_language"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Improper.svg"
        },
        objFeatInsult = {
            class: "featInsult",
            id: "featInsult",
            selected: enabledFeatures.indexOf("insult"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Insult.svg"
        },
        objFeatAggressiveness = {
            class: "featAggressiveness",
            selected: enabledFeatures.indexOf("aggressiveness"),
            id: "featAggressiveness",
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Aggressiveness.svg"
        },
        objFeatGray = {
            class: "featGray",
            id: "featGray",
            selected: 1,
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Gray.svg"
        };

    // A recursive helper function for performing some setup by walking through all nodes
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish edgeLength
    visit(treeData, function (d) {
        totalNodes++;
    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    var currentX = 200;
    var currentY = 200;
    var currentScale = 0.5;


    /**
     * Define zoom and translation
     * */
    function zoom() {

        /* The initial d3 events for scale and translation have initial values 1 and [x,y] = [50, 200] respectively
         * Therefore we need to take this into account and sum the difference to our initial scale and position attributes
         * defined in zoomToFit()
         * */

        /*
        * NOTE:
        * If the scale is negative, we will see the graph upside-down and left-right swapped
        * If the scale is 0, we will not see the graph
        * Define the scale to be at least 0.1 and set it to the initialZoom + the difference of the listener and the d3.event initial scale
        * */
        let newScale = Math.max(initialZoomScale + (d3.event.scale - 1), 0.1); //Avoid the graph to be seen mirrored.
        //console.log("New scale is: ", initialZoomScale + (d3.event.scale - 1))
        /*
        * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
        * d3.event.translate returns an array [x,y] with starting values [50, 200]
        * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
        * */
        let movement = d3.event.translate;
        let newX = initialX + (movement[1] - 200);
        let newY = initialY + (movement[0] - 50);
        svgGroup.attr("transform", "translate(" + [newY, newX] + ")scale(" + newScale + ")");
        currentScale = newScale;

    }

    function zoom() {
        var zoom = d3.event;
        svgGroup.attr("transform", "translate(" + zoom.translate + ")scale(" + zoom.scale + ")");
        currentScale = zoom.scale;
    }

    let zoomListener = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]).on("zoom", function () {
        currentZoomScale = d3.event.scale
        link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
        node.select("circle").style("stroke-width", getNodeStrokeWidth()); //Enlarge stroke-width on zoom out
        zoom();
    });


    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    /**
     * Center the screen to the position of the given node
     * */
    function centerNode(source) {
        var angulo = source.x0 % 360;

        //By definition, the angle of the Math.cos function must be given in radians
        var zoomX = source.y0 * Math.cos(angulo * Math.PI / 180);
        var zoomY = source.y0 * Math.sin(angulo * Math.PI / 180);

        /*
        The coordinate system is a little bit different.
        The (0,0) point is approximately at the "bottom right" of where our tree is being displayed.
        The "News Article" is shown approximately at (500,300)
        The X axis is the horizontal one. It increases to the left and decreases to the right (the opposite of the cartesian system)
        The Y axis is the vertical one. It increases upward and decreases downwards.

        Taking into account that our definition of coordinates has the angles placed like
                   0º
                   |
          270º ---------- 90º
                   |
                 180º
        We have to sum and substract zoomX and zoomY to obtain the zoom in the given node.
        * */
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + (500 - zoomY) + "," + (300 + zoomX) + ")");
    }

    /**
     * Center the screen to the position of the given link
     * */
    function centerLink(link) {
        scale = zoomListener.scale();
        /*
         NOTE: the Y values give us the radius; therefore, we want the average of this value
         the X value give us the angle; therefore, if the nodes are not in a line, we want the average value
         * */
        x = (link.source.y0 + link.target.y0) / 2;
        y = ((link.source.x0 % 360) + (link.target.x0 % 360)) / 2;

        var zoomX = x * Math.cos((y) * Math.PI / 180);
        var zoomY = x * Math.sin((y) * Math.PI / 180);

        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + ((viewerWidth / 2) - zoomY) + "," + ((viewerHeight / 2) + zoomX) + ")");

        // console.log("LINK: origen:", link.source.name, " target: ", link.target.name);
    }

    // Toggle children function
    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    /**
     * Clicked node behaviour
     * Compute descendants information
     * Toggle children on click.
     * */
    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed

        //Compute children data (quantity and how many with each toxicity) before collapsing the node
        var descendantsData = getDescendants(d);

        d.numberOfDescendants = descendantsData.children;
        d.descendantsWithToxicity0 = descendantsData.toxicity0;
        d.descendantsWithToxicity1 = descendantsData.toxicity1;
        d.descendantsWithToxicity2 = descendantsData.toxicity2;
        d.descendantsWithToxicity3 = descendantsData.toxicity3;

        //Hides/Shows and recomputes the position when collapsing or uncollapsing a node
        d = toggleChildren(d);
        update(d, false, document.querySelector("#tree-container div.my-statistic").style.visibility === "visible");
    }

    function zoomToNode(d) {
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + d3.event.transform.x + "," + (d3.event.transform.y + ")"));
    }

    function clickLink(l) {
        if (d3.event.defaultPrevented) return; // click suppressed
        //console.log("Link clicked");
        centerLink(l);
    }

    /* SECTION TO DRAW TARGETS */

    /**
     * Compute the position of an associated image to be centered on the node
     * that is a radiusPercentage smaller than it
     * */
    function positionImage(nodeRadius, radiusPercentage = imgRatio) {
        return nodeRadius * (radiusPercentage / 100.0 - 1);
    }

    /**
     * Compute the size of an associated image to be a radiusPercentage smaller than the node
     * */
    function sizeImage(nodeRadius, radiusPercentage = imgRatio) {
        return 2 * nodeRadius * (1 - radiusPercentage / 100.0);
    }


    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are icons
     * */
    function drawTargets(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (let i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", 40)
                    .attr("width", 40)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
            }
        }
    }

    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are rings
     * */
    function drawTargetRings(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [1, enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")]; //Note: we will always display the gray ring
        var listOpacity;
        var targets = [objTargetGrayRing, objTargetGroupRing, objTargetPersonRing, objTargetStereotypeRing];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listOpacity = [0.5, d.target_group, d.target_person, d.stereotype]; //Note: the opacity of the gray ring
                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Determines the type of visualization for the targets
     * determinated by the drop down menu
     *
     *
     * */
    function selectTargetVisualization(nodeEnter) {
        // var option = dropdownTargets.value;
        var option = "icons";

        //If we are displaying all in one, call that function
        if (false) selectFeatureVisualization(nodeEnter);
        else {
            switch (option) {
                //draw as icons on the left side of the node
                case "icons":
                    drawTargets(nodeEnter, "icons/");
                    break;
                case "icon-outside-node":
                    drawTargetsOutside(nodeEnter, "icons/", enabledTargets);
                    break;

                case "icon-on-node":
                    drawTargetsInside(nodeEnter, "icons/");
                    break;
                case "directory-1":
                    drawTargets(nodeEnter, "newOption1/")
                    break;
                case "directory-2":
                    drawTargets(nodeEnter, "NewCircular/")
                    break;
                //draw as ring outside of the node
                case "ring-on-node":
                    drawTargetRings(nodeEnter, "rings/")
                    break;
                //draw as an icon if 1, as rings if more options checked
                case "one-icon-or-rings":
                    enabledTargets.length > 1 ? drawTargetRings(nodeEnter, "rings/") : drawTargets(nodeEnter, "icons/");
                    break;

                default:
                    //console.log("default option", option);
                    break;
            }
        }
    }


    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are icons
     *
     * Draw in a triangle Group --- Stereotype
     *                          \ /
     *                         Person
     * */
    function drawTargetsInside(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", function (d) {
                        return d.radius * targets[i].xInside;
                    })
                    .attr("y", function (d) {
                        return d.radius * targets[i].yInside;
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius) / 2.0;
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius) / 2.0;
                    })
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    });
            }
        }
    }

    function drawTargetGroup(nodeEnter) {
        // TARGET GROUP
        nodeEnter.append("image")
            .attr('class', 'targetGroup')
            .attr('id', 'targetGroup')
            .attr("x", -20) //NOTE: it is always displayed at the left side!!
            .attr("y", -10)
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", listTargetImgPath[0])
            .attr("opacity", function (d) {
                if (d.target_group) return 1
                return 0 //We need to set the opacity or it will always be displayed!
            });
        groupDrawn = true;
    }

    function drawTargetPerson(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetPerson')
            .attr('id', 'targetPerson')
            .attr("x", -40) //NOTE: it is always displayed at the left side!!
            .attr("y", -10)
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", listTargetImgPath[1])
            .attr("opacity", function (d) {
                if (d.target_person) return 1
                return 0
            });
        personDrawn = true;
    }

    function drawTargeStereotype(nodeEnter) {

        nodeEnter.append("image")
            .attr('class', 'targetStereotype')
            .attr('id', 'targetStereotype')
            /*.attr("x", radialPoint(source.x0 - 70, source.y0 - 10)[0] ) //NOTE: it is always displayed at the inside side!!
            .attr("y",  radialPoint(source.x0 - 70, source.y0 - 10)[1])*/
            .attr("x", -60) //NOTE: it is always displayed at the inside side!!
            .attr("y", -10)
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", listTargetImgPath[2])
            .attr("opacity", function (d) {
                if (d.stereotype) return 1
                return 0
            });
    }

    function visualiseTargets(nodeEnter) {
        enabledTargets.indexOf("target-group") > -1 ? drawTargetGroup(nodeEnter) : d3.selectAll("#targetGroup").remove();
        enabledTargets.indexOf("target-person") > -1 ? drawTargetPerson(nodeEnter) : d3.selectAll("#targetPerson").remove();
        enabledTargets.indexOf("target-stereotype") > -1 ? drawTargeStereotype(nodeEnter) : d3.selectAll("#targetStereotype").remove();
    }

    function removeTargets() {
        d3.selectAll("#targetGroup").remove();
        d3.selectAll("#targetPerson").remove();
        d3.selectAll("#targetStereotype").remove();
    }

    /* SECTION: Draw features*/

    /**
     * Removes the features of all the nodes
     * */
    function removeAllFeatures() {
        d3.selectAll("#featGray").remove();
        d3.selectAll("#featArgumentation").remove();
        d3.selectAll("#featConstructiveness").remove();
        d3.selectAll("#featSarcasm").remove();
        d3.selectAll("#featMockery").remove();
        d3.selectAll("#featIntolerance").remove();
        d3.selectAll("#featImproper").remove();
        d3.selectAll("#featInsult").remove();
        d3.selectAll("#featAggressiveness").remove();
    }


    /**
     * Delete the features of the node
     * Redraw the features of the node
     *
     * Deleting the features firts helps us when the selected dropdown menu option changes
     * */
    function drawFeatureDots(nodeEnter) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        var cbFeatureEnabled = [enabledFeatures.indexOf("constructiveness"), enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

        var features = [objFeatConstructiveness, objFeatArgumentation, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < 8; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.constructiveness, d.argumentation, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    }
                }).append("circle")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("r", dotRadius)
                    .attr("transform", function (d) {
                        return "translate(" + (d.radius + (i + 1) * (dotRadius * 2)) + "," + 0 + ")"
                    })
                    .attr("fill", colorFeature[i])
                    .style("stroke", "black")
                    .style("stroke-width", "1.5px")
            }
        }

    }


    function drawFeatureAsCheese(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter.filter(function (d) {
                    return (d.parent !== null && d.parent !== undefined);
                }).append("image")
            .attr('class', objFeatGray.class)
            .attr('id', objFeatGray.id)
            .attr("x", function (d) {
                return positionImage(d.radius);
            })
            .attr("y", function (d) {
                return positionImage(d.radius);
            })
            .attr("height", function (d) {
                return sizeImage(d.radius);
            })
            .attr("width", function (d) {
                return sizeImage(d.radius);
            })
            .attr("href", pathFeatures + localPath + objFeatGray.fileName)
            .attr("opacity", function (d) {
                return 0.5;
            });

        var cbFeatureEnabled = [enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

        var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < features.length; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("href", pathFeatures + localPath + features[i].fileName)
            }
        }
    }

    /**
     * Hide all previous features and targets
     * Draw everything inside of the node
     * */
    function drawFeatureAsGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        //removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            //objTargetGroup, objTargetPerson, objTargetStereotype
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1, 1, 1, 1,
            enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "1.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;

                        listOpacity = [d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.target_group, d.target_person, d.stereotype];

                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Hide all previous features and targets
     * Draw everything inside of the node
     * */
    function drawFeatureAsRectangularGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objTargetGroup, objTargetPerson, objTargetStereotype];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1, 1, 1, 1,
            enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius + d.radius / 5.0, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "1.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;

                        listOpacity = [d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.target_group, d.target_person, d.stereotype];

                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Draw everything in a circular glyph
     * Better done than perfect
     *
     * Due to pngs order, features need to be drawn first
     * */
    function drawFeatureAsCircularGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        //removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objFeatGray,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            //objTargetGroup, objTargetPerson, objTargetStereotype
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1,
            enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness"),
            1, 1, 1, 1,
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [1,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "1.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
            }
        }
    }


    /**
     * Determines the type of visualization for the features
     * determinated by the drop down menu
     *
     *
     * */
    function selectFeatureVisualization(nodeEnter) {
        // var option = dropdownFeatures.value;
        var option = "dots";

        if (dotsFeatures.checked) {
            option = "dots";
        }

        if (glyphsFeatures.checked) {
            option = "directory-2";
        }

        if (trivialFeatures.checked) {
            option = "trivial-cheese-on-node";
        }

        // document.getElementById("feature-over-node-or-outside").style.display = "none"; //Hide the dropdown menu
        drawingAllInOne = false;
        var localPosition;
        // cbFeatureInside.checked ? localPosition = -10 : localPosition = 30;

        switch (option) {
            case "dots":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureDots(nodeEnter, enabledFeatures); //Always drawn on the right side
                break;
            case "trivial-cheese-on-node":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCheese(nodeEnter, "trivialCheese/"); //Always drawn on the right side
                break;

            case "directory-1": //"All for one and one for all" we will draw the features inside of the circle, the targets outside will be hidden and the level of toxicity in blue
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu

                drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition);
                break;
            case "directory-2":
                drawingAllInOne = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                drawFeatureAsCircularGlyph(nodeEnter, "NewCircular/", localPosition);
                selectTargetVisualization(nodeEnter);
                break;

            case "directory-3":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                drawFeatureAsRectangularGlyph(nodeEnter, "Rectangular/", localPosition);
                break;


            case "new-circular":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                drawFeatureAsCircularGlyph(
                    nodeEnter,
                    "NewCircular/",
                    localPosition
                );
                break;
            default:
                //console.log("default option", option);
                break;
        }
    }

    function drawFeaturesCheese(nodeEnter) {
        hideFeatureDots();

        var listEnabledVisualization = [0, enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

        var listCheeseClass = ["grayCheese", "cheeseArgumentation", "cheeseConstructiveness",
            "cheeseSarcasm", "cheeseMockery", "cheeseIntolerance", "cheeseImproper", "cheeseInsult", "cheeseAggressiveness"];

        var listCheeseOpacity;

        for (var i = 0; i < listCheeseClass.length; i++) {
            if (listEnabledVisualization[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', listCheeseClass[i])
                    .attr('id', listCheeseClass[i])
                    .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                    .attr("y", cheeseY)
                    .attr("height", cheeseHeight)
                    .attr("width", cheeseWidth)
                    .attr("href", listCheeseImgPath[i])
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listCheeseOpacity = [0.5, d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listCheeseOpacity[i];
                    });
            }
        }
    }


    function drawFeatures(nodeEnter) {
        hideCheese();

        if (enabledFeatures.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter.append("circle")
                .attr('class', 'featureConstructiveness')
                .attr('id', 'featureConstructiveness')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 45 + "," + 0 + ")")
                .attr("fill", colorFeature[0])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1
                    return 0
                });
        }
        // Argumentation
        if (enabledFeatures.indexOf("argumentation") > -1) {
            nodeEnter.append("circle")
                .attr('class', 'featureArgumentation')
                .attr('id', 'featureArgumentation')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 35 + "," + 0 + ")")
                .attr("fill", colorFeature[1])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1 //If node contains argumentation
                    return 0 //We hide it if it has no argumentation
                });
        }
        if (enabledFeatures.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter.append("circle")
                .attr('class', 'featureSarcasm')
                .attr('id', 'featureSarcasm')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 55 + "," + 0 + ")")
                .attr("fill", colorFeature[2])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1
                    return 0
                });
        }
        if (enabledFeatures.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter.append("circle")
                .attr('class', 'featureMockery')
                .attr('id', 'featureMockery')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 65 + "," + 0 + ")")
                .attr("fill", colorFeature[3])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.mockery) return 1
                    return 0
                });
        }
        if (enabledFeatures.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter.append("circle")
                .attr('class', 'featureIntolerance')
                .attr('id', 'featureIntolerance')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 75 + "," + 0 + ")")
                .attr("fill", colorFeature[4])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1
                    return 0
                });
        }

        if (enabledFeatures.indexOf("improper_language") > -1) {
            // Improper Language
            // Improper Language
            nodeEnter.append("circle")
                .attr('class', 'featureImproperLanguage')
                .attr('id', 'featureImproperLanguage')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 95 + "," + 0 + ")")
                .attr("fill", colorFeature[5])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1
                    return 0
                });
        }

        if (enabledFeatures.indexOf("insult") > -1) {
            // Insult
            nodeEnter.append("circle")
                .attr('class', 'featureInsult')
                .attr('id', 'featureInsult')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 105 + "," + 0 + ")")
                .attr("fill", colorFeature[6])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.insult) return 1
                    return 0
                });
        }
        if (enabledFeatures.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter.append("circle")
                .attr('class', 'featureAggressiveness')
                .attr('id', 'featureAggressiveness')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 115 + "," + 0 + ")")
                .attr("fill", colorFeature[7])
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("opacity", function (d) {
                    if (d.aggressiveness) return 1
                    return 0
                });
        }

    }

    function hideFeatureDots() {
        d3.selectAll("#featureArgumentation").remove();
        d3.selectAll("#featureConstructiveness").remove();
        d3.selectAll("#featureSarcasm").remove();
        d3.selectAll("#featureMockery").remove();
        d3.selectAll("#featureIntolerance").remove();
        d3.selectAll("#featureImproperLanguage").remove();
        d3.selectAll("#featureInsult").remove();
        d3.selectAll("#featureAggressiveness").remove();
    }

    function hideCheese() {
        var listCheeseClass = ["#grayCheese", "#cheeseArgumentation", "#cheeseConstructiveness", "#cheeseSarcasm",
            "#cheeseMockery", "#cheeseIntolerance", "#cheeseImproper", "#cheeseInsult", "#cheeseAggressiveness"];
        for (var i = 0; i < listCheeseClass.length; i++) d3.selectAll(listCheeseClass[i]).remove();
    }

    /* END section*/

    /**
     * Draw an icon for the root node
     * */
    function visualiseRootIcon(node) {
        //Filter the nodes and append an icon just for the root node
        node.filter(function (d) {
            return (d.parent === null || d.parent === undefined);
        }).append("image")
            .attr('class', objRoot.class)
            .attr('id', objRoot.id)

            .attr("x", positionImage(root.radius, 0))
            .attr("y", positionImage(root.radius, 0))
            .attr("height", sizeImage(root.radius, 0))
            .attr("width", sizeImage(root.radius, 0))
            .attr("href", rootPath + objRoot.fileName)
            .attr("opacity", 1);
    }

    /*SECTION highlighting */
    function highlightByPropertyOR(node, link) {
        node.style("opacity", 0.2);
        link.style("opacity", 0.2);

        //Toxicity 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 0);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 0);
            }).style("opacity", 1);
        }

        //Toxicity 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 1);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 1);
            }).style("opacity", 1);
        }

        //Toxicity 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 2);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 2);
            }).style("opacity", 1);
        }

        //Toxicity 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 3);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 3);
            }).style("opacity", 1);
        }

        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance && !d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (!d.target.positive_stance && !d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
            node.filter(function (d) {
                return (d.positive_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.positive_stance);
            }).style("opacity", 1);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
            node.filter(function (d) {
                return (d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-target-group") > -1) {
            node.filter(function (d) {
                return (d.target_group);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_group);
            }).style("opacity", 1);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-target-person") > -1) {
            node.filter(function (d) {
                return (d.target_person);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_person);
            }).style("opacity", 1);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-features-stereotype") > -1) {
            node.filter(function (d) {
                return (d.stereotype);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.stereotype);
            }).style("opacity", 1);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
            node.filter(function (d) {
                return (d.argumentation);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.argumentation);
            }).style("opacity", 1);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
            node.filter(function (d) {
                return (d.constructiveness);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.constructiveness);
            }).style("opacity", 1);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
            node.filter(function (d) {
                return (d.sarcasm);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.sarcasm);
            }).style("opacity", 1);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
            node.filter(function (d) {
                return (d.mockery);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.mockery);
            }).style("opacity", 1);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
            node.filter(function (d) {
                return (d.intolerance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.intolerance);
            }).style("opacity", 1);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
            node.filter(function (d) {
                return (d.improper_language);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.improper_language);
            }).style("opacity", 1);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
            node.filter(function (d) {
                return (d.insult);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.insult);
            }).style("opacity", 1);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
            node.filter(function (d) {
                return (d.aggressiveness);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.aggressiveness);
            }).style("opacity", 1);
        }
    }

    function highlightByPropertyAND(node, link) {
        node.style("opacity", 1);
        link.style("opacity", 1);

        //Toxicity not 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 0);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 0);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 1);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 1);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 2);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 2);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 3);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 3);
            }).style("opacity", opacityValue);
        }


        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            node.filter(function (d) {
                return (d.positive_stance || d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.positive_stance || d.target.negative_stance);
            }).style("opacity", opacityValue);
        }



        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.positive_stance);
            }).style("opacity", opacityValue);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
            node.filter(function (d) {
                return (!d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.negative_stance);
            }).style("opacity", opacityValue);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-target-group") > -1) {
            node.filter(function (d) {
                return (!d.target_group);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_group);
            }).style("opacity", opacityValue);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-target-person") > -1) {
            node.filter(function (d) {
                return (!d.target_person);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_person);
            }).style("opacity", opacityValue);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-features-stereotype") > -1) {
            node.filter(function (d) {
                return (!d.stereotype);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.stereotype);
            }).style("opacity", opacityValue);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
            node.filter(function (d) {
                return (!d.argumentation);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.argumentation);
            }).style("opacity", opacityValue);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
            node.filter(function (d) {
                return (!d.constructiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.constructiveness);
            }).style("opacity", opacityValue);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
            node.filter(function (d) {
                return (!d.sarcasm);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.sarcasm);
            }).style("opacity", opacityValue);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
            node.filter(function (d) {
                return (!d.mockery);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.mockery);
            }).style("opacity", opacityValue);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
            node.filter(function (d) {
                return (!d.intolerance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.intolerance);
            }).style("opacity", opacityValue);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
            node.filter(function (d) {
                return (!d.improper_language);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.improper_language);
            }).style("opacity", opacityValue);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
            node.filter(function (d) {
                return (!d.insult);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.insult);
            }).style("opacity", opacityValue);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
            node.filter(function (d) {
                return (!d.aggressiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.aggressiveness);
            }).style("opacity", opacityValue);
        }
    }

    function highlightNodesByPropertyOR(node, link) {
        if (enabledHighlight.length === 0) { //If no tag (toxicity, stance,...) checkbox is selected: highlight all
            nodes.forEach(function (d) {
                d.highlighted = 1;
            });
            node.style("opacity", 1);
        } else { //If some tag checkbox is selected behave as expected
            //First, unhighlight everything and set the parameter highlighted to 0
            nodes.forEach(function (d) {
                d.highlighted = 0;
            });
            node.style("opacity", opacityValue);

            //Then highlight by property OR
            highlightToxicityOR(node, enabledHighlight);
            highlightStanceOR(node, enabledHighlight);
            highlightTargetOR(node, enabledHighlight);
            highlightPositiveOR(node, enabledHighlight);
            highlightNegativeOR(node, enabledHighlight);
        }

        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlight.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlight.indexOf("highlight-stance-both") > -1 ||
            enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValue;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
            });
        }
        $(window).trigger("statistics-changed");
    }

    function highlightNodesByPropertyAND(node, link) {
        nodes.forEach(function (d) {
            d.highlighted = 1;
        });
        node.style("opacity", 1);

        //Then unhighlight by property AND
        highlightToxicityAND(node, enabledHighlight);
        highlightStanceAND(node, enabledHighlight);
        highlightTargetAND(node, enabledHighlight);
        highlightPositiveAND(node, enabledHighlight);
        highlightNegativeAND(node, enabledHighlight);

        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlight.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlight.indexOf("highlight-stance-both") > -1 ||
            enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValue;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
            });
        }
        $(window).trigger("statistics-changed");
    }

    /*END section */

    function update(source, first_call, static_values_checked_param = true) {

        // Compute the new tree layout.
        nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);

        const firstLevelEdgeLength = Math.max(
            (root.children?.length || root._children?.length) * minNodeRadius / Math.PI,
            480);
        // Set widths between levels
        nodes.forEach(function (d) {
            let computedRadius = firstLevelEdgeLength + (d.depth - 1) * edgeLength;

            //if (d.depth === 1) //console.log("First y: ", firstLevelEdgeLength, computedRadius);
            d.depth === 1 ? d.y = firstLevelEdgeLength : d.y = computedRadius;
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .filter(function (d) {
                return d;
            })
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + radialPoint(source.x0, source.y0) + ")";
            })
            .on('click', function (d) {
                click(d);
                if (!d3.event.defaultPrevented){
                    $(window).trigger("statistics-changed");
                    if (document.querySelector("#tree-container div.my-statistic").style.visibility === "visible") {
                        statisticBackground.html(writeStatisticText(root));
                    }
                }
            })
            .on('mouseover', function (d) {
                //console.log("Before transforming coordenates: ", source.x0, source.y0);
                var highlighted_nodes = node.filter(function (n) {
                    return n.highlighted;
                })[0].map(i => i.__data__.name); // don't ask..
                if (d !== root && highlighted_nodes.includes(d.name)) {
                    tooltipText = writeTooltipText(d);
                    tooltip.style("visibility", "visible")
                        .html(tooltipText);
                }
                else if(d == root){
                    tooltipText = writeTooltipRoot(d, numberOfDirectNodes, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic);
                    tooltip.style("visibility", "visible").html(tooltipText);
                }
            })
            .on("mousemove", function (d) {
                // if (d !== root) {
                    return tooltip.style("top", (d3.mouse(document.querySelector(".overlay"))[1] - 130) + "px").style("left", (d3.mouse(document.querySelector(".overlay"))[0] - 490) + "px");
                // }
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", circleRadius)
            .style("stroke", "black")
            .style("stroke-width", 0.5);

        //Dropdown menus
        // dropdownTargets.addEventListener("change", function () {
        //     selectTargetVisualization(nodeEnter);
        // });
        // dropdownFeatures.addEventListener("change", function () {
        //     selectFeatureVisualization(nodeEnter);
        // });

        function featureVisualizationListener () {
                if (nodeEnter[0].length) {
                    Object.keys(nodeEnter[0]).forEach(key => {
                        if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                    });
                    nodeEnter = nodeEnter.filter(function (d) {
                        return d;
                    })
                    if (nodeEnter[0].length) {
                        selectFeatureVisualization(nodeEnter);
                    }
                }
                if (!nodeEnter[0].length) {
                    dotsFeatures.removeEventListener("change", featureVisualizationListener);
                    glyphsFeatures.removeEventListener("change", featureVisualizationListener);
                    trivialFeatures.removeEventListener("change", featureVisualizationListener);
                }
        }
        if (nodeEnter[0].length) {
            dotsFeatures.addEventListener("change", featureVisualizationListener);
            glyphsFeatures.addEventListener("change", featureVisualizationListener);
            trivialFeatures.addEventListener("change", featureVisualizationListener);
        }

        var static_values_checked = static_values_checked_param;
        jQuery("#static_values_button").click(function () {
            if (!static_values_checked) {
                document.getElementById('static_values_button').innerHTML = '&#8722;';
                static_values_checked = true;
                statisticBackground.style("visibility", "visible").html(writeStatisticText(root));
                console.log('[User]', user.split('/')[2], '| [interaction]', 'show_summary', ' | [Date]', Date.now());

            } else {
                document.getElementById('static_values_button').innerHTML = '&#43;'
                static_values_checked = false;
                statisticBackground.style("visibility", "hidden").html(writeStatisticText(root));
                console.log('[User]', user.split('/')[2], '| [interaction]', 'hide_summary', ' | [Date]', Date.now());

            }
        });

        function getLengthFilterByName(array, stringToMatch, matchPositive = true) {
            return Array.from(array).filter(function (val) {
                if (matchPositive) {
                    return val.includes(stringToMatch);
                } else {
                    return !val.includes(stringToMatch);
                }
            }).length;
        }

        try {
            $(document).ready(function () {

                if (first_call) {
                    checkboxesTargets.forEach(function (checkboxItem) {
                        enabledTargets =
                            Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        selectTargetVisualization(nodeEnter);
                    });

                    checkboxes.forEach(function (checkboxItem) {
                        enabledFeatures =
                            Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        selectFeatureVisualization(nodeEnter);
                    });

                    selectTargetVisualization(nodeEnter);
                    selectFeatureVisualization(nodeEnter);
                }

                /*SECTION checkboxes listener*/

                function checkboxesTargetsListener (event) {
                    if (nodeEnter[0].length) {

                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledTargets =
                                Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            }
                            selectTargetVisualization(nodeEnter);
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesTargets.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesTargetsListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                // Draw target images
                checkboxesTargets.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesTargetsListener)
                    }
                });

                function checkboxesListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledFeatures =
                                Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            selectFeatureVisualization(nodeEnter);
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxes.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesListener);
                        });
                    }
                }

                checkboxes.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesListener);
                    }
                });

                function checkboxesHighlightGroupORListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledHighlight =
                                Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            var filteredOriginalToxicity = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-toxicity-");
                            var filteredCompareToxicity = getLengthFilterByName(Array.from(enabledHighlight), "highlight-toxicity-");
                            document.getElementById('highlight-OR-selectAll-toxicity').checked = filteredOriginalToxicity === filteredCompareToxicity;

                            var filteredOriginalStance = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-stance-");
                            var filteredCompareStance = getLengthFilterByName(Array.from(enabledHighlight), "highlight-stance-");
                            document.getElementById('highlight-OR-selectAll-stance').checked = filteredOriginalStance === filteredCompareStance;

                            var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-target-");
                            var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlight), "highlight-target-");
                            document.getElementById('highlight-OR-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                            var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-features-");
                            var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlight), "highlight-features-");
                            document.getElementById('highlight-OR-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;


                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                            if (static_values_checked) {
                                statisticBackground.html(writeStatisticText(root));
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesHighlightGroupOR.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesHighlightGroupORListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupOR.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesHighlightGroupORListener)
                    }
                });

                function checkboxesHighlightGroupANDListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledHighlight =
                                Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.


                            var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupAND).map(i => i.value), "highlight-target-");
                            var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlight), "highlight-target-");
                            document.getElementById('highlight-AND-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                            var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupAND).map(i => i.value), "highlight-features-");
                            var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlight), "highlight-features-");
                            document.getElementById('highlight-AND-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;


                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                            if (static_values_checked) {
                                statisticBackground.html(writeStatisticText(root));
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesHighlightGroupAND.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesHighlightGroupANDListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupAND.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesHighlightGroupANDListener)
                    }
                });

                // To notify the DOM that the ready function has finished executing.
                // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                const event = new Event('codeReady');

                // Dispatch the event.
                document.querySelector("body").dispatchEvent(event);

                codeReady = true;
            });
        } catch (TypeError) {
            console.error("Error attaching buttons... trying again...");
        }

        /**
         * Gets the array of nodes belonging to the deepest threads, highlights them,
         * updating the network statistics, and displays the result in a Bootstrap modal
         */
        $(window).off("longest_thread");
        $(window).on("longest_thread", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                longestThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                document.getElementById("do_action").value = 'longest_thread';
                sendPopup('send_to_main');
            }
        });

        /**
         * Obtains the indices of the widest levels of the graph, highlights the nodes that belong to those levels,
         * and updates the network statistics
         */
        $(window).off("widest_level");
        $(window).on("widest_level", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                widestLevelHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                document.getElementById("selected_container").value = "";
                document.getElementById("do_action").value = 'widest_level';
                sendPopup('send_to_main');
            }
        });

        /**
         * Gets the array of nodes belonging to the largest threads, highlights them,
         * updating the network statistics, and displays the result in a Bootstrap modal
         */
        $(window).off("largest_thread");
        $(window).on("largest_thread", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                largestThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                document.getElementById("do_action").value = 'largest_thread';
                sendPopup('send_to_main');
            }
        });

        /**
         * Gets the array of nodes belonging to the most toxic threads, highlights them,
         * updating the network statistics, and displays the result in a Bootstrap modal
         */
        $(window).off("most_toxic_thread");
        $(window).on("most_toxic_thread", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                mostToxicThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                document.getElementById("do_action").value = 'most_toxic_thread';
                sendPopup('send_to_main');
            }
        });

        /**
         * Gets the array of nodes belonging to the most toxic subtree, highlights them,
         * updating the network statistics, and displays the result in a Bootstrap modal
         */
        $(window).off("most_toxic_subtree");
        $(window).on("most_toxic_subtree", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                mostToxicSubtreeHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                document.getElementById("do_action").value = 'most_toxic_subtree';
                sendPopup('send_to_main');
            }
        });

        /**
         * Displays in the chat the three features that appear the most in the main window graph
         */
        $(window).off("most_tagged_features");
        $(window).on("most_tagged_features", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                mostTaggedFeatures(root);
            } else if (selectedContainer === "popup") {
                $(window).trigger("most_tagged_features_popup");
            }
        });

        // Gets the statistics of the features of the graph shown in the main window,
        // and displays them in a modal as a chart
        $(window).off("statistics_all_features_tree");
        $(window).on("statistics_all_features_tree", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsAllFeaturesTree(root);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_all_features_tree_popup");
            }
        });

        // Gets the statistics of the features of all the subgraphs displayed in the main window,
        // and displays them in a modal as a chart, for comparison purposes
        $(window).off("statistics_all_features_subtrees");
        $(window).on("statistics_all_features_subtrees", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsAllFeaturesSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_all_features_subtrees_popup");
            }
        });

        // Gets the statistics of the toxicity of the graph shown in the main window,
        // and displays them in a modal as a chart
        $(window).off("statistics_toxicity_tree");
        $(window).on("statistics_toxicity_tree", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsToxicityTree(root);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_toxicity_tree_popup");
            }
        });

        // Gets the statistics of the toxicity of all the subgraphs displayed in the main window,
        // and displays them in a modal as a chart, for comparison purposes
        $(window).off("statistics_toxicity_subtrees");
        $(window).on("statistics_toxicity_subtrees", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsToxicitySubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_toxicity_subtrees_popup");
            }
        });

        // Gets the statistics of the stance of the graph shown in the main window,
        // and displays them in a modal as a chart
        $(window).off("statistics_stance_tree");
        $(window).on("statistics_stance_tree", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsStanceTree(root);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_stance_tree_popup");
            }
        });

        // Gets the statistics of the stance of all the subgraphs displayed in the main window,
        // and displays them in a modal as a chart, for comparison purposes
        $(window).off("statistics_stance_subtrees");
        $(window).on("statistics_stance_subtrees", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsStanceSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_stance_subtrees_popup");
            }
        });

        // Gets the statistics of the target of the graph shown in the main window,
        // and displays them in a modal as a chart
        $(window).off("statistics_target_tree");
        $(window).on("statistics_target_tree", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsTargetTree(root);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_target_tree_popup");
            }
        });

        // Gets the statistics of the target of all the subgraphs displayed in the main window,
        // and displays them in a modal as a chart, for comparison purposes
        $(window).off("statistics_target_subtrees");
        $(window).on("statistics_target_subtrees", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                statisticsTargetSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link);
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics_target_subtrees_popup");
            }
        });

        $(window).off("main-container-click");
        $(window).on("main-container-click", function () {
            if (document.getElementById("selected_container").value !== "main" && document.getElementById("selected_container").value !== "") {
                document.getElementById("selected_container").value = "main";
                document.querySelector("#popupModal .modal-dialog").classList.remove("selected-container");
                document.querySelector("#tree-container .overlay").classList.add("selected-container");
                checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                if (static_values_checked) {
                    statisticBackground.html(writeStatisticText(root));
                }
                statisticsDataChangedSubtree(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, null, null, false)
            }
        });

        $(window).off("popup-container-click");
        $(window).on("popup-container-click", function () {
            if (document.getElementById("popup_graph_info").value !== "complete" &&
                document.getElementById("popup_subtree_document_description").value ===
                document.getElementById("main_subtree_document_description").value) {
                let nodesIDs = JSON.parse("[" + document.getElementById("popup_subtree_nodes_ids").value + "]");
                highlightFromPopupNodesIDs (static_values_checked, statisticBackground, root, nodes, nodesIDs, opacityValue, node, link);
            }
            $(window).trigger("popup-container-click-bubble");
        });

        $(window).off("statistics-changed");
        $(window).on("statistics-changed", function () {
            let selectedContainer = document.getElementById("selected_container").value;
            if (selectedContainer === "main" || selectedContainer === "") {
                if (document.getElementById('circle_layout_button').checked) {
                    statisticsDataChangedTree(root, true);
                } else {
                    statisticsDataChangedTree(root);
                }
            } else if (selectedContainer === "popup") {
                $(window).trigger("statistics-changed-popup");
            }
        });

        if (!first_call) {
            checkboxesTargets.forEach(function (checkboxItem) {
                enabledTargets =
                    Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectTargetVisualization(nodeEnter);
            });

            checkboxes.forEach(function (checkboxItem) {
                enabledFeatures =
                    Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectFeatureVisualization(nodeEnter);
            });
        }

        if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
            document.querySelector("input[value=dot-feat]").checked = true;
        }

        // If AND is selected, uncheck the OR and highlight by property AND
        function checkboxANDListener () {
            if (nodeEnter[0].length) {
                Object.keys(nodeEnter[0]).forEach(key => {
                    if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                });

                nodeEnter = nodeEnter.filter(function (d) {
                    return d;
                })

                if (nodeEnter[0].length) {
                    if (this.checked) {
                        checkboxOR.checked = false;

                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        highlightNodesByPropertyAND(node, link);
                    } else {
                        checkboxOR.checked = true;
                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        highlightNodesByPropertyOR(node, link);
                    }
                }
            }
            if (!nodeEnter[0].length) {
                checkboxAND.removeEventListener("change", checkboxANDListener);
            }
        }
        if (nodeEnter[0].length) {
            checkboxAND.addEventListener("change",checkboxANDListener);
        }

        function checkboxORListener () {
            if (nodeEnter[0].length) {
                Object.keys(nodeEnter[0]).forEach(key => {
                    if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                });

                nodeEnter = nodeEnter.filter(function (d) {
                    return d;
                })

                if (nodeEnter[0].length) {
                    if (this.checked) {
                        checkboxAND.checked = false;

                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        highlightNodesByPropertyOR(node, link);
                    } else {
                        checkboxAND.checked = true;
                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        highlightNodesByPropertyAND(node, link);
                    }
                }
            }
            if (!nodeEnter[0].length) {
                checkboxOR.removeEventListener("change", checkboxORListener);
            }
        }
        // If OR is selected, uncheck the AND and highlight by property OR
        if (nodeEnter[0].length) {
            checkboxOR.addEventListener("change",checkboxORListener);
        }

        d3.select("#zoom_in_icon").on("click", function () {
            currentScale = Math.min(3.0, zoomListener.scale() + 0.1);

            zoomListener.scale(currentScale)
                // .translate([2200 - currentX - currentScale, 900 - currentY - currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());

        });
        d3.select("#zoom_out_icon").on("click", function () {
            currentScale = Math.max(0.1, currentScale - 0.1);

            zoomListener.scale(currentScale)
                // .translate([2200 - currentX + currentScale, 900 - currentY + currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_out', ' | [Date]', Date.now());
        });

        d3.select("#zoom_reset_icon").on("click", function () {
            currentScale = 0.4;

            zoomListener.scale(currentScale)
                .translate([currentX - currentScale, currentY - currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'reset_zoom', ' | [Date]', Date.now());

        });


        /*END SECTION checkboxes listener*/

        /* NOTE: the nodes that get to the function update()
        are root and the ones that were collapsed
        Therefore, for this nodes that are getting uncollapsed we want to:
        - show the targets if necessary
        - show the features if necessary
        - highlight nodes and edges
        * */
        if (!first_call) {
            selectTargetVisualization(nodeEnter);
            selectFeatureVisualization(nodeEnter);
        }
        // checkboxFeatureMenu.checked ? selectFeatureVisualization(nodeEnter) : removeAllFeatures();

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", function (d) {
                return computeNodeRadius(d);
            })
            .style("fill", function (d) { //Colour the node according to its level of toxicity
                switch (d.toxicity_level) {
                    case 0:
                        return colourToxicity0;
                    case 1:
                        return colourToxicity1;
                    case 2:
                        return colourToxicity2;
                    case 3:
                        return colourToxicity3;
                    default:
                        return colourNewsArticle;
                }
            })
            .style("stroke-width", getEdgeStrokeWidth());

        visualiseRootIcon(node); //Draw an icon for the root node

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });


        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name + 50) + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);


        // Update the links…
        link = svgGroup.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {x: source.x0, y: source.y0 * 2};
                return diagonal({source: o, target: o});
            })
            .style("stroke", function (d) {
                if (d.target.positive_stance && d.target.negative_stance) return colourBothStances; //Both against and in favour
                else if (d.target.positive_stance === 1) return colourPositiveStance; //In favour
                else if (d.target.negative_stance === 1) return colourNegativeStance; //Against
                else return colourNeutralStance; //Neutral comment
            })
            .on('click', clickLink)
            .style("stroke-width", getEdgeStrokeWidth());

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        //Highlight nodes if necessary NOTE: it needs to be after the definition of the link
        // if (checkboxHighlightMenu.checked && source.children) checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
        checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .duration(duration)
            .attr("d", function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;

    root.x0 = 0;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    document.querySelector("#tree-container div.my-statistic").style.visibility = "visible";
    update(root, true,true);

    // Positioning and scaling the graph
    zoomListener.scale(initialZoomScale);
    zoomListener.translate([canvasWidth / 2, canvasHeight / 2]);
    zoomListener.event(baseSvg);

    /**
     * Recursive function to compute the global statistics
     * counts nodes by toxicity and by targets
     * */
    function getStatisticValues(node) {
        if (!node.children) {
            return {
                children: 0,
                toxicityLevel: node.toxicity_level,
                toxicity0: 0,
                toxicity1: 0,
                toxicity2: 0,
                toxicity3: 0,
                totalTargGroup: 0,
                totalTargPerson: 0,
                totalTargStereotype: 0,
                totalTargNone: 0,
                targGroup: node.target_group,
                targPerson: node.target_person,
                targStereotype: node.stereotype,
                targNone: 0
            };
        }
        var total = 0, childrenList = [],
            totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0,
            totalTargGroup = 0, totalTargPerson = 0, totalTargStereotype = 0, totalTargNone = 0;

        if (node.children) {
            node.children.forEach(function (d) {
                childrenList = getStatisticValues(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;

                if (d.highlighted) {
                    switch (childrenList.toxicityLevel) {
                        case 0:
                            totalToxic0 += 1;
                            break;
                        case 1:
                            totalToxic1 += 1;
                            break;
                        case 2:
                            totalToxic2 += 1;
                            break;
                        case 3:
                            totalToxic3 += 1;
                            break;
                    }
                }

                //Targets are not exclusive
                childrenList.targGroup && d.highlighted ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
                childrenList.targPerson && d.highlighted ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
                childrenList.targStereotype && d.highlighted ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
                (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype) && d.highlighted ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
            })
        }

        return {
            children: total,
            toxicityLevel: node.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3,
            totalTargGroup: totalTargGroup,
            totalTargPerson: totalTargPerson,
            totalTargStereotype: totalTargStereotype,
            totalTargNone: totalTargNone,
            targGroup: node.target_group,
            targPerson: node.target_person,
            targStereotype: node.stereotype,
            targNone: 0
        };
    }

//I compute the values for the statistic data showing in the background
    var listStatistics = getStatisticValues(root);
    var numberOfDirectNodes = root.children ? root.children.length : 0,
        totalNumberOfNodes = listStatistics.children;

    var totalNotToxic = listStatistics.toxicity0,
        totalMildlyToxic = listStatistics.toxicity1,
        totalToxic = listStatistics.toxicity2,
        totalVeryToxic = listStatistics.toxicity3;

    var totalGroup = listStatistics.totalTargGroup,
        totalPerson = listStatistics.totalTargPerson,
        totalStereotype = listStatistics.totalTargStereotype,
        totalNone = listStatistics.totalTargNone;

    console.log('[User]', user.split('/')[2], '| [interaction]', 'Radial_layout_loaded', ' | [Date]', Date.now());
});