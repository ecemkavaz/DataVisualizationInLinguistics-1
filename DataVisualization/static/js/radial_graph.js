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


// Get JSON data
//20170819_CR.json
//20190519_SO.json
//20190716_CR.json
//20200608_SO.json
//20200618_MI.json
//20200621_SO.json
//20200622_MI.json
//20200626_SO.json
//20200705_SO.json
//20200708_MI.json
//20200715_CR.json
//20200715b_CR.json
//20200726_SO.json
treeJSON = d3.json(dataset, function (error, treeData) {

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 22;
    // variables for drag/drop
    // panning variables
    var panSpeed = 200;
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root, rootName = "News Article";


    var groupDrawn = false, personDrawn = false;
    var opacityValue = 0.2;
    var circleRadius = 8.7;

    /* Colours
   * */
    var colourBothStances = "#FFA500", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
        colourNeutralStance = "#2b2727";
    var colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
        colourToxicity3 = "#000000", colourNewsArticle = "lightsteelblue";

    /*
    Target objects
    * */
    var drawingAllInOne = false; //if we are drawing all together or separated
    var pathTargets = pt;
    var targetIconHeight = 15, targetIconWidth = 15, targetIconGroupX = -30, targetIconPersonX = -50,
        targetIconStereotypeX = -70, targetIconY = -10; //Size and relative position of targets drawn as icons
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

    /* Features
    * */
    var cheeseX = -17.53, cheeseY = -27.45, cheeseHeight = 55, cheeseWidth = 55;

    var pathFeatures = pf;

    var objToxicity0 = {class: "toxicity0", id: "toxicity0", selected: 1, fileName: "Level0.png"},
        objToxicity1 = {class: "toxicity1", id: "toxicity1", selected: 1, fileName: "Level1.png"},
        objToxicity2 = {class: "toxicity2", id: "toxicity2", selected: 1, fileName: "Level2.png"},
        objToxicity3 = {class: "toxicity3", id: "toxicity3", selected: 1, fileName: "Level3.png"};

    var tooltipText;


    var listCheeseImgPath = ["./images/features/trivialCheese/Gray.png", "./images/features/trivialCheese/Argumentation.png", "./images/features/trivialCheese/Constructiveness.png",
        "./images/features/trivialCheese/Sarcasm.png", "./images/features/trivialCheese/Mockery.png", "./images/features/trivialCheese/Intolerance.png",
        "./images/features/trivialCheese/Improper.png", "./images/features/trivialCheese/Insult.png", "./images/features/trivialCheese/Aggressiveness.png"];
    var listTargetImgPath = ["./images/targets/icons/Group.png", "./images/targets/icons/Person.png", "./images/targets/icons/Stereotype.png"];

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();
    var separationHeight = 61; //Sets the separation between two nodes to 15 pixels
    var radiusFactor = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children

    root = treeData; //Define the root
    var tree = d3.layout.tree()
        .nodeSize(root.children.length, 0) //NOTE the width is overwritten later
        .sort(function (a, b) {
            console.log(a, b);
            if (a.toxicity_level === b.toxicity_level) {

                var childrenOfA = a.children ? a.children : a._children;
                var childrenOfB = b.children ? b.children : b._children;

                if (childrenOfA && childrenOfB) { //If it has children or collapsed children
                    var aNumChildren = childrenOfA.length,
                        bNumChildren = childrenOfB.length;
                    return aNumChildren < bNumChildren ? 1 : aNumChildren > bNumChildren ? 2 : 0;
                }

                if (!childrenOfA && !childrenOfB) return 0; //None of them has children nor collapsed children

                if (childrenOfA || childrenOfB) {  // If just one of them has children
                    return (a.children || a._children) ? -1 : 1;
                }
            }
            //If they have different toxicities: sort by toxicities
            return a.toxicity_level < b.toxicity_level ? -3 : a.toxicity_level > b.toxicity_level ? 3 : a.toxicity_level === b.toxicity_level ? 0 : NaN;
            //return d3.ascending(a.toxicity_level, b.toxicity_level); //NOTE: this avoids the tree being sorted and changed when collapsing a node
        });

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonalHorizontally = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    /**
     * @param x: angulo
     * @param y: radio
     *
     * @return punto en coordenadas cartesianas
     *
     * NOTE: el origen del sistema (0,0) es el nodo root <- FIXME not quite true
     * This is from the official library https://github.com/d3/d3-shape/blob/master/src/pointRadial.js
     * */
    function radialPointWithDepth(d, x, y) {
        /* console.log("values in rgd", x,y);
         console.log("depth en radial point: ", d.depth, x, y );
         console.log("wtv: ",  [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x) ]);*/
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    function radialPoint(x, y) {
        // console.log("x,y", x, y);
        var first, second;
        first = (y = +y) * Math.cos(x -= Math.PI / 2);
        second = y * Math.sin(x);
        //var idk = [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x) ]
        // console.log("on radial point function: ", first, second);
        return [first, second];
        //return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x) ];
    }

    var tooltip = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1")
        .style("visibility", "hidden");

    var tooltip2 = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-tooltip2") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

    var statisticBackground = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1") //it has no change
        .style("visibility", "visible")
        .html("Static values of the news article");

    var statisticTitleBackground = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-statistic-title") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "0") //it has no change
        .style("visibility", "visible");

    /* SECTION legend*/
    var targetLegend = d3.select("#target-legend-container");

    function displayTargetLegend() {
        // Handmade legend
        targetLegend.append("image")
            .attr("x", 10)
            .attr("y", 0)
            .attr("height", 25)
            .attr("width", 25)
            .attr("href", pathTargets + "icons/" + objTargetGroup.fileName);
        targetLegend.append("text")
            .attr("x", 50).attr("y", 10)
            .text("Target group")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")

        targetLegend.append("image")
            .attr("x", 10)
            .attr("y", 25)
            .attr("height", 25)
            .attr("width", 25)
            .attr("href", pathTargets + "icons/" + objTargetPerson.fileName);
        targetLegend.append("text")
            .attr("x", 50).attr("y", 40)
            .text("Target person")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")

        targetLegend.append("image")
            .attr("x", 10)
            .attr("y", 55)
            .attr("height", 25)
            .attr("width", 25)
            .attr("href", pathTargets + "icons/" + objTargetStereotype.fileName);
        targetLegend.append("text")
            .attr("x", 50).attr("y", 70)
            .text("Stereotype")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    }


    var featureLegend = d3.select("#feature-legend-container");

    // create a list of keys
    var keys = ["Argumentation", "Constructiveness", "Sarcasm", "Mockery", "Intolerance", "Improper language", "Insult", "Aggressiveness"];
    var colorFeature = ["#a1d99b", "#31a354",
        "#fee5d9", "#fcbba1", "#fc9272",
        "#fb6a4a", "#de2d26", "#a50f15"];

    // Add one dot in the legend for each name.
    featureLegend.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 20)
        .attr("cy", function (d, i) {
            return 20 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d, i) {
            return colorFeature[i]
        });

    featureLegend.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", function (d, i) {
            return 20 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");


    var nodeLegend = d3.select("#toxicity-legend-container");

    // create a list of keys
    var keysNode = ["Not toxic", "Mildly toxic", "Toxic", "Very toxic", "News Article", "Node collapsed with", " just one direct son"];
    var colorNode = [colourToxicity0, colourToxicity1, colourToxicity2, colourToxicity3, colourNewsArticle, "lightsteelblue", "none"];

    // Add one dot in the legend for each name.
    nodeLegend.selectAll("mydotsToxicity")
        .data(keysNode)
        .enter()
        .append("circle")
        .attr("cx", 20)
        .attr("cy", function (d, i) {
            return 20 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d, i) {
            return colorNode[i]
        });

    nodeLegend.selectAll("mylabelsToxicity")
        .data(keysNode)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", function (d, i) {
            return 20 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .attr("white-space", "normal")
        .attr("overflow", "scroll")
        .style("alignment-baseline", "middle");


    var edgeLegend = d3.select("#edge-legend-container");

    // create a list of keys
    var keysEdge = ["Neutral", "Positive stance", "Negative stance"];
    var colorEdge = ["#000000", "#77dd77", "#ff6961"];

    // Add one dot in the legend for each name.
    edgeLegend.selectAll("mylinesEdges")
        .data(keysEdge)
        .enter()
        .append("rect")
        .attr("x", 10)
        .attr("y", function (d, i) {
            return 15 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", "20px")
        .attr("height", "10px")
        .style("fill", function (d, i) {
            return colorEdge[i]
        });

    edgeLegend.selectAll("mylabelsEdge")
        .data(keysEdge)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", function (d, i) {
            return 20 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .attr("white-space", "normal")
        .attr("overflow", "scroll")
        .style("alignment-baseline", "middle");

    /* END SECTION legend*/

    /*SECTION checkboxes*/
    //Check the values of the checkboxes and do something
    var checkbox = document.querySelector("input[name=cbTargets]");
    var checkboxesTargets = document.querySelectorAll("input[type=checkbox][name=cbTargets]");
    let enabledTargets = []; //Where the cb selected will appear

    // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
    var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
    let enabledSettings = []; //Where the cb selected will appear
    var checkboxFeatureMenu = document.querySelector("input[name=cbFeatureMenu]");

    //Or dots or cheese
    var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");
    var checkboxFeatureDot = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=dot-feat]");
    var checkboxFeatureCheese = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=cheese-feat]");

    //Dropdown menu
    var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
    var cbFeatureInside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
    var cbFeatureOutside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

    //Check the values of the checkboxes and do something
    var checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
    var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
    var checkboxAND = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=and-group]");
    var checkboxOR = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=or-group]");
    var checkboxesHighlightGroup = document.querySelectorAll("input[type=checkbox][name=cbHighlight]");

    let enabledHighlight = []; //Where the cb selected will appear
    /*END SECTION checkboxes*/

    /*
    Dropdown menus
    * */
    var dropdownTargets = document.getElementById("dropdown-targets");
    var dropdownFeatures = document.getElementById("dropdown-features");

    //Define objects after the checkbox where we keep if it is selected
    var objTargetGroup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargets.indexOf("target-group"),
            x: -30,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Group.png"
        },
        objTargetPerson = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargets.indexOf("target-person"),
            x: -50,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Person.png"
        },
        objTargetStereotype = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargets.indexOf("target-stereotype"),
            x: -70,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Stereotype.png"
        };

    displayTargetLegend();

    var objFeatArgumentation = {
            class: "featArgumentation",
            id: "featArgumentation",
            selected: enabledSettings.indexOf("argumentation"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Argumentation.png"
        },
        objFeatConstructiveness = {
            class: "featConstructiveness",
            id: "featConstructiveness",
            selected: enabledSettings.indexOf("constructiveness"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Constructiveness.png"
        },
        objFeatSarcasm = {
            class: "featSarcasm",
            id: "featSarcasm",
            selected: enabledSettings.indexOf("sarcasm"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Sarcasm.png"
        },
        objFeatMockery = {
            class: "featMockery",
            id: "featMockery",
            selected: enabledSettings.indexOf("mockery"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Mockery.png"
        },
        objFeatIntolerance = {
            class: "featIntolerance",
            id: "featIntolerance",
            selected: enabledSettings.indexOf("intolerance"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Intolerance.png"
        },
        objFeatImproper = {
            class: "featImproper",
            id: "featImproper",
            selected: enabledSettings.indexOf("improper_language"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Improper.png"
        },
        objFeatInsult = {
            class: "featInsult",
            id: "featInsult",
            selected: enabledSettings.indexOf("insult"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Insult.png"
        },
        objFeatAggressiveness = {
            class: "featAggressiveness",
            selected: enabledSettings.indexOf("aggressiveness"),
            id: "featAggressiveness",
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Aggressiveness.png"
        },
        objFeatGray = {
            class: "featGray",
            id: "featGray",
            selected: 1,
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Gray.png"
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

    // Call visit function to establish maxLabelLength
    visit(treeData, function (d) {
        totalNodes++;
        //maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // Pan function, can be better implemented.
    function pan(domNode, direction) {
        console.log("pan being called");
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function () {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree
    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", 2200)
        .attr("height", 900)
        .attr("class", "overlay")
        .call(zoomListener);

    // Helper functions for collapsing and expanding nodes.
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    function centerNode(source) {
        var angulo = source.x0 % 360;
        console.log("Los valores anteriores: ", "x0: ", (source.x0 % 360), "y0: ", source.y0 / 220);

        //Por definición, el ángulo de Math.cos en javascript debe ser dado en radianes
        var zoomX = source.y0 * Math.cos(angulo * Math.PI / 180);
        var zoomY = source.y0 * Math.sin(angulo * Math.PI / 180);
        //console.log("Translate x,y: ", zoomX, zoomY);

        /*
        El sistema de coordenadas es un poco diferente.
        El (0,0) se encuentra "abajo a la derecha" en nuestro json original.
        El "News Article" se muestra aprox en (500,300)
        El eje de las X es el horizontal, aumenta hacia la izquierda y decrece hacia la derecha (NOTE: al revés de lo normal)
        El eje de las Y es el vertical, aumenta hacia arriba y decrece hacia abajo.
        Teniendo en cuenta que nuestra definición de coordenadas nos sitúa
                   0º
                   |
          270º ---------- 90º
                   |
                 180º
        Tenemos que sumar y restar de esta forma zoomX y zoomY para obtener el zoom en el nodo clicado
        * */
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + (500 - zoomY) + "," + (300 + zoomX) + ")");
    }

    function centerLink(link) {
        scale = zoomListener.scale();
        /*
        Note: los valores de la Y nos dan el radio; por tanto, queremos la media de este valor
        el valor de la x nos daba el ángulo, por tanto, si no están en línea recta, queremos un promedio
        * */
        x = (link.source.y0 + link.target.y0) / 2;
        y = ((link.source.x0 % 360) + (link.target.x0 % 360)) / 2;

        var zoomX = x * Math.cos((y) * Math.PI / 180);
        var zoomY = x * Math.sin((y) * Math.PI / 180);

        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + ((viewerWidth / 2) - zoomY) + "," + ((viewerHeight / 2) + zoomX) + ")");

        console.log("LINK: origen:", link.source.name, " target: ", link.target.name);
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

    // Toggle children on click.
    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed

        //Compute children data (quantity and how many with each toxicity) before collapsing the node
        var descendantsData = getDescendants(d);
        d.numberOfDescendants = descendantsData.children;
        d.descendantsWithToxicity0 = descendantsData.toxicity0;
        d.descendantsWithToxicity1 = descendantsData.toxicity1;
        d.descendantsWithToxicity2 = descendantsData.toxicity2;
        d.descendantsWithToxicity3 = descendantsData.toxicity3;

        d = toggleChildren(d);
        update(d); // esconde y recalcula posiciones al compactar nodos
    }

    function zoomToNode(d) {
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + d3.event.transform.x + "," + (d3.event.transform.y + ")"));
    }

    function clickLink(l) {
        if (d3.event.defaultPrevented) return; // click suppressed
        console.log("Link clicked");
        centerLink(l);
    }

    /* SECTION TO DRAW TARGETS */
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

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    });
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
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;
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
        var option = dropdownTargets.value;

        //If we are displaying all in one, call that function
        if (drawingAllInOne) selectFeatureVisualization(nodeEnter);
        else {
            switch (option) {
                //draw as icons on the left side of the node
                case "icons":
                    drawTargets(nodeEnter, "icons/");
                    break;
                case "directory-1":
                    drawTargets(nodeEnter, "newOption1/")
                    break;
                case "directory-2":
                    drawTargets(nodeEnter, "newOption2/")
                    break;
                //draw as ring outside of the node
                case "rings":
                    drawTargetRings(nodeEnter, "rings/")
                    break;
                //draw as an icon if 1, as rings if more options checked
                case "one-icon-or-rings":
                    enabledTargets.length > 1 ? drawTargetRings(nodeEnter, "rings/") : drawTargets(nodeEnter, "icons/");
                    break;

                default:
                    console.log("default option", option);
                    break;
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

    /** Removes the pngs for the toxicities drawn
     * */
    function removeToxicities(nodeEnter) {
        nodeEnter.selectAll("#toxicity0").remove();
        nodeEnter.selectAll("#toxicity1").remove();
        nodeEnter.selectAll("#toxicity2").remove();
        nodeEnter.selectAll("#toxicity3").remove();
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

        var cbFeatureEnabled = [enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness")];

        var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < 8; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.append("circle")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("r", "4.5")
                    .attr("transform", "translate(" + (35 + i * 10) + "," + 0 + ")")
                    .attr("fill", colorFeature[i])
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;
                        listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    });
            }
        }

    }

    function drawFeatureAsCheese(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter.append("image")
            .attr('class', objFeatGray.class)
            .attr('id', objFeatGray.id)
            .attr("x", objFeatGray.x) //NOTE: it is always displayed at the left side!!
            .attr("y", objFeatGray.y)
            .attr("height", objFeatGray.height)
            .attr("width", objFeatGray.width)
            .attr("href", pathFeatures + localPath + objFeatGray.fileName)
            .attr("opacity", function (d) {
                if (d.name === rootName) return 0;
                return 0.5;
            });

        var cbFeatureEnabled = [enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness")];

        var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < features.length; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("x", features[i].x)
                    .attr("y", features[i].y)
                    .attr("height", 55)
                    .attr("width", 55)
                    .attr("href", pathFeatures + localPath + features[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;
                        listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Hide all previous features and targets
     * Draw everything inside of the node
     * */
    function drawFeatureAsGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objTargetGroup, objTargetPerson, objTargetStereotype];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1, 1, 1, 1,
            enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", localPosition - 17.53)
                    .attr("y", -27.45)
                    .attr("height", 55)
                    .attr("width", 55)
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;

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
        removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objFeatGray,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objTargetGroup, objTargetPerson, objTargetStereotype];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1,
            enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness"),
            1, 1, 1, 1,
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", localPosition - 17.53)
                    .attr("y", -27.45)
                    .attr("height", 55)
                    .attr("width", 55)
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.name === rootName) return 0;

                        listOpacity = [1,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.target_group, d.target_person, d.stereotype];

                        return listOpacity[i];
                    });
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
        var option = dropdownFeatures.value;
        document.getElementById("feature-over-node-or-outside").style.display = "none"; //Hide the dropdown menu
        drawingAllInOne = false;
        var localPosition;
        cbFeatureInside.checked ? localPosition = -10 : localPosition = 30;

        switch (option) {
            case "dots":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureDots(nodeEnter); //Always drawn on the right side
                break;
            case "trivial-cheese":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCheese(nodeEnter, "trivialCheese/"); //Always drawn on the right side
                break;

            case "directory-1": //"All for one and one for all" we will draw the features inside of the circle, the targets outside will be hidden and the level of toxicity in blue
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu

                drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition);
                break;
            case "directory-2":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                drawFeatureAsCircularGlyph(nodeEnter, "Circular/", localPosition);
                break;

            case "directory-3":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                drawFeatureAsGlyph(nodeEnter, "Rectangular/", localPosition);
                break;

            default:
                console.log("default option", option);
                break;
        }
    }

    function drawFeaturesCheese(nodeEnter) {
        hideFeatureDots();

        var listEnabledVisualization = [0, enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness")];

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
                        if (d.name === rootName) return 0;
                        listCheeseOpacity = [0.5, d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listCheeseOpacity[i];
                    });
            }
        }
    }

    function drawFeatures(nodeEnter) {
        hideCheese();
        // Argumentation
        if (enabledSettings.indexOf("argumentation") > -1) {
            nodeEnter.append("circle")
                .attr('class', 'featureArgumentation')
                .attr('id', 'featureArgumentation')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 35 + "," + 0 + ")")
                .attr("fill", colorFeature[0])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1 //If node contains argumentation
                    return 0 //We hide it if it has no argumentation
                });
        }

        if (enabledSettings.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter.append("circle")
                .attr('class', 'featureConstructiveness')
                .attr('id', 'featureConstructiveness')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 45 + "," + 0 + ")")
                .attr("fill", colorFeature[1])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1
                    return 0
                });
        }
        if (enabledSettings.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter.append("circle")
                .attr('class', 'featureSarcasm')
                .attr('id', 'featureSarcasm')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 55 + "," + 0 + ")")
                .attr("fill", colorFeature[2])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1
                    return 0
                });
        }
        if (enabledSettings.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter.append("circle")
                .attr('class', 'featureMockery')
                .attr('id', 'featureMockery')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 65 + "," + 0 + ")")
                .attr("fill", colorFeature[3])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.mockery) return 1
                    return 0
                });
        }
        if (enabledSettings.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter.append("circle")
                .attr('class', 'featureIntolerance')
                .attr('id', 'featureIntolerance')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 75 + "," + 0 + ")")
                .attr("fill", colorFeature[4])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1
                    return 0
                });
        }

        if (enabledSettings.indexOf("improper_language") > -1) {
            // Improper Language
            nodeEnter.append("circle")
                .attr('class', 'featureImproperLanguage')
                .attr('id', 'featureImproperLanguage')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 95 + "," + 0 + ")")
                .attr("fill", colorFeature[5])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1
                    return 0
                });
        }

        if (enabledSettings.indexOf("insult") > -1) {
            // Insult
            nodeEnter.append("circle")
                .attr('class', 'featureInsult')
                .attr('id', 'featureInsult')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 105 + "," + 0 + ")")
                .attr("fill", colorFeature[6])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .attr("opacity", function (d) {
                    if (d.insult) return 1
                    return 0
                });
        }
        if (enabledSettings.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter.append("circle")
                .attr('class', 'featureAggressiveness')
                .attr('id', 'featureAggressiveness')
                .attr("r", "4.5")
                .attr("transform", "translate(" + 115 + "," + 0 + ")")
                .attr("fill", colorFeature[7])
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
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
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance && !d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (!d.target.positive_stance && !d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node.filter(function (d) {
                return (d.positive_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.positive_stance);
            }).style("opacity", 1);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node.filter(function (d) {
                return (d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node.filter(function (d) {
                return (d.target_group);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_group);
            }).style("opacity", 1);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node.filter(function (d) {
                return (d.target_person);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_person);
            }).style("opacity", 1);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node.filter(function (d) {
                return (d.stereotype);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.stereotype);
            }).style("opacity", 1);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node.filter(function (d) {
                return (d.argumentation);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.argumentation);
            }).style("opacity", 1);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node.filter(function (d) {
                return (d.constructiveness);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.constructiveness);
            }).style("opacity", 1);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node.filter(function (d) {
                return (d.sarcasm);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.sarcasm);
            }).style("opacity", 1);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node.filter(function (d) {
                return (d.mockery);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.mockery);
            }).style("opacity", 1);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node.filter(function (d) {
                return (d.intolerance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.intolerance);
            }).style("opacity", 1);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node.filter(function (d) {
                return (d.improper_language);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.improper_language);
            }).style("opacity", 1);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node.filter(function (d) {
                return (d.insult);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.insult);
            }).style("opacity", 1);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
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
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node.filter(function (d) {
                return (d.positive_stance || d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.positive_stance || d.target.negative_stance);
            }).style("opacity", opacityValue);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.positive_stance);
            }).style("opacity", opacityValue);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node.filter(function (d) {
                return (!d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.negative_stance);
            }).style("opacity", opacityValue);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node.filter(function (d) {
                return (!d.target_group);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_group);
            }).style("opacity", opacityValue);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node.filter(function (d) {
                return (!d.target_person);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_person);
            }).style("opacity", opacityValue);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node.filter(function (d) {
                return (!d.stereotype);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.stereotype);
            }).style("opacity", opacityValue);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node.filter(function (d) {
                return (!d.argumentation);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.argumentation);
            }).style("opacity", opacityValue);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node.filter(function (d) {
                return (!d.constructiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.constructiveness);
            }).style("opacity", opacityValue);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node.filter(function (d) {
                return (!d.sarcasm);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.sarcasm);
            }).style("opacity", opacityValue);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node.filter(function (d) {
                return (!d.mockery);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.mockery);
            }).style("opacity", opacityValue);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node.filter(function (d) {
                return (!d.intolerance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.intolerance);
            }).style("opacity", opacityValue);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node.filter(function (d) {
                return (!d.improper_language);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.improper_language);
            }).style("opacity", opacityValue);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node.filter(function (d) {
                return (!d.insult);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.insult);
            }).style("opacity", opacityValue);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
            node.filter(function (d) {
                return (!d.aggressiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.aggressiveness);
            }).style("opacity", opacityValue);
        }
    }

    /*END section */


    /**
     * Recursive function to count the total number of descendants and
     * the total number of nodes by toxicity
     * */
    function getDescendants(node) {

        if (!node.children && !node._children) {
            return {
                children: 0,
                toxicityLevel: node.toxicity_level,
                toxicity0: 0,
                toxicity1: 0,
                toxicity2: 0,
                toxicity3: 0
            };
        }
        var total = 0, childrenList = [], totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0;
        if (node.children) {
            node.children.forEach(function (d) {

                childrenList = getDescendants(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;

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

            })
        }

        if (node._children) {
            node._children.forEach(function (d) {

                childrenList = getDescendants(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;

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
            })
        }

        return {
            children: total,
            toxicityLevel: node.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3
        };
    }

    /**
     * Write tooltip text in a table with bold lyrics if the feature is present
     * */
    function writeTooltipText(d) {

        //I want to show Argument and Constructiveness in one line, I add a dummy space to keep that in the loop
        var jsonValues = [d.name, d.toxicity_level, d.depth,
            d.argumentation, d.constructiveness, -1,
            d.sarcasm, d.mockery, d.intolerance,
            d.improper_language, d.insult, d.aggressiveness,
            d.target_group, d.target_person, d.stereotype];
        var jsonNames = ["Comment ID", "Toxicity level", "Comment level",
            "Argument", "Constructiveness", " ",
            "Sarcasm", "Mockery", "Intolerance",
            "Improper language", "Insult", "Aggressiveness",
            "Target group", "Target person", "Stereotype"];
        var i = 0;
        tooltipText = "<table>";

        for (i = 0; i < jsonValues.length; i++) {
            if (i === 3 || i === 12) tooltipText += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
            if (i % 3 === 0) tooltipText += "<tr>"; //Start table line
            if (i < 3) tooltipText += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>"; //First ones without bold
            else if (jsonValues[i] !== -1) jsonValues[i] ? tooltipText += "<td><b>" + jsonNames[i] + ": " + jsonValues[i] + "</b></td>" : tooltipText += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
            if ((i + 1) % 3 === 0) tooltipText += "</tr>"; //End table line
        }

        tooltipText += "</table>";

        tooltipText += "<br> <table>";
        //If node is collapsed, we also want to add some information about its sons
        if (d._children) {
            var sonTitles = ["Direct comments", "Total number of generated comments", "Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
            var sonValues = [d._children.length, d.numberOfDescendants, d.descendantsWithToxicity0, d.descendantsWithToxicity1, d.descendantsWithToxicity2, d.descendantsWithToxicity3];

            for (i = 0; i < sonValues.length; i++) {
                if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
                tooltipText += "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
            }

        }
        tooltipText += "</table>";
        tooltipText += "<br>" + d.coment;
    }

    function update(source) {
        tree = tree.nodeSize([separationHeight, 0]) //heigth and width of the rectangles that define the node space
            .separation(function (a, b) {
                if (a.depth === 1 && b.depth === 1) {
                    //return 360 / root.children.length ; //how to determine the separation of the nodes of first level so they are not extremely together, nor too separated that do not look sorted
                    //return root.children.length / 360;
                    //return 1; it makes the nodes and edges appear one over the other
                    //return 1 / root.children.length *4 *4;
                    return (360.0 / root.children.length) / separationHeight;
                }
                if (a.depth === 2 && b.depth === 2) return Math.min((360.0 / root.children.length) / separationHeight, (a.parent === b.parent ? 1 / (a.depth * a.depth) : 2 / (a.depth * a.depth)));
                //if (a.depth === 1 && b.depth === 1) return 360 / root.children.length; //it looks nice for the 20190716_CR, but overlaps for the eighth
                return (a.parent === b.parent ? 1 / (a.depth * a.depth) : 2 / (a.depth * a.depth));
            })
        /*.sort(null)*/;

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        /*        var numChildren;
                root.children ?  numChildren = root.children.length : root._children.length;
                // Set widths between levels
                nodes.forEach(function(d) {
                    console.log(d.depth, d);
                    //Compute how many children the root has
                    //The number of children of first level multiplied by the height of the glyphs, will tell
                    // This way we modify the radius of the first level nodes, so we do not have intersections at least... not taking into account if they get separated due to number of children of the nodes of first level
                    var firstLevelRadius = Math.max( (d.depth * (maxLabelLength * 20) ), (numChildren * (cheeseHeight + 5)) / (2 * Math.PI));

                    console.log("first level", firstLevelRadius);
                    if (d.depth === 1 ) d.y = firstLevelRadius;
                    else d.y = firstLevelRadius + ( (d.depth - 1) * (maxLabelLength * 20)) ;

                    //d.y = (d.depth * (maxLabelLength * 20)); //maxLabelLength * 10px

                });*/

        // Set widths between levels
        nodes.forEach(function (d) {
            d.y = (d.depth * (maxLabelLength * 20));
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + radialPoint(source.x0, source.y0) + ")";
            })
            .on('click', function (d) {
                console.log("Node positions when clicked ON CLICK: ", source.x, source.y);
                console.log("maybe: ", radialPointWithDepth(d, source.x0, source.y0));
                click(d);
            })
            .on('mouseover', function (d) {
                console.log("coordinates ", d.x, d.y);
                if (d !== root) {
                    writeTooltipText(d);
                    tooltip.style("visibility", "visible")
                        .html(tooltipText);
                }
            })
            .on("mousemove", function (d) {
                if (d !== root) {
                    return tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX - 440) + "px");
                }
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
        dropdownTargets.addEventListener("change", function () {
            selectTargetVisualization(nodeEnter);
        });
        dropdownFeatures.addEventListener("change", function () {
            selectFeatureVisualization(nodeEnter);
        });


        /*SECTION checkboxes listener*/
        // Use Array.forEach to add an event listener to each checkbox.
        // Draw target images
        checkboxesTargets.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledTargets =
                    Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                console.log(enabledTargets);
                selectTargetVisualization(nodeEnter);
            })
        });

        // if the option to show features is checked, enable checkboxes and dropdown menu
        checkboxFeatureMenu.addEventListener('change', function () {
            if (this.checked) { //Enable checkboxes and dropdown menu + show features if they are selected
                checkboxesPropertyFeature.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxesPositioningFeature.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxes.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                dropdownFeatures.removeAttribute('disabled');

                if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
                    document.querySelector("input[value=dot-feat]").checked = true;
                }

                if (!document.querySelector("input[value=on-node]").checked && !document.querySelector("input[value=node-outside]").checked) {
                    document.querySelector("input[value=on-node]").checked = true;
                }
                selectFeatureVisualization(nodeEnter);

            } else { //Disable checkboxes and dropdown menu + remove all the features
                checkboxesPropertyFeature.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                checkboxesPositioningFeature.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                document.getElementById("feature-over-node-or-outside").style.display = "none";
                dropdownFeatures.setAttribute('disabled', 'disabled');

                checkboxes.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });

                removeAllFeatures(); //Hide all features when the cb is unchecked
            }
        });

        //This needs to be commented or else it will draw things by default
        /*        // if DOT is checked, uncheck OR
                checkboxFeatureDot.addEventListener('change', function() {
                    if (this.checked){
                        checkboxFeatureCheese.checked = false;
                        drawFeatures(nodeEnter);
                    }
                    else {
                        checkboxFeatureCheese.checked = true;
                        drawFeaturesCheese(nodeEnter);
                    }

                });
                // if CHEESE is checked, uncheck AND
                checkboxFeatureCheese.addEventListener('change', function() {
                    if (this.checked) {
                        checkboxFeatureDot.checked = false;
                        drawFeaturesCheese(nodeEnter);
                    }
                    else {
                        checkboxFeatureDot.checked = true;
                        drawFeatures(nodeEnter);
                    }
                });*/

        // if DOT is checked, uncheck OR
        cbFeatureInside.addEventListener('change', function () {
            this.checked ? cbFeatureOutside.checked = false : cbFeatureOutside.checked = true;
            selectFeatureVisualization(nodeEnter);
        });
        // if CHEESE is checked, uncheck AND
        cbFeatureOutside.addEventListener('change', function () {
            this.checked ? cbFeatureInside.checked = false : cbFeatureInside.checked = true;
            selectFeatureVisualization(nodeEnter);
        });

        // Use Array.forEach to add an event listener to each checkbox.
        // Draw feature circles
        checkboxes.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledSettings =
                    Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                console.log(enabledSettings);
                selectFeatureVisualization(nodeEnter);

            })
        });

        // if the option to highlight nodes is checked
        checkboxHighlightMenu.addEventListener('change', function () {
            if (this.checked) {
                checkboxesProperty.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxesHighlightGroup.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });

                if (!document.querySelector("input[value=and-group]").checked && !document.querySelector("input[value=or-group]").checked) {
                    document.querySelector("input[value=and-group]").checked = true;
                    highlightByPropertyAND(node, link);
                } else {
                    checkboxAND.checked ? highlightByPropertyAND(node, link) : highlightByPropertyOR(node, link);
                    console.log(enabledHighlight);
                }

            } else { //We make all nodes and links visible again
                checkboxesProperty.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                checkboxesHighlightGroup.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                node.style("opacity", 1);
                link.style("opacity", 1);
            }
        });

        // if AND is checked, uncheck OR
        checkboxAND.addEventListener('change', function () {
            if (this.checked) {
                checkboxOR.checked = false;
                highlightByPropertyAND(node, link);
            } else {
                checkboxOR.checked = true;
                highlightByPropertyOR(node, link);
            }

        });
        // if OR is checked, uncheck AND
        checkboxOR.addEventListener('change', function () {
            if (this.checked) {
                checkboxAND.checked = false;
                highlightByPropertyOR(node, link);
            } else {
                checkboxAND.checked = true;
                highlightByPropertyAND(node, link);
            }
        });

        // Use Array.forEach to add an event listener to each checkbox.
        checkboxesHighlightGroup.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledHighlight =
                    Array.from(checkboxesHighlightGroup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                console.log(enabledHighlight);
                checkboxOR.checked ? highlightByPropertyOR(node, link) : highlightByPropertyAND(node, link);
            })
        });

        /*END SECTION checkboxes listener*/

        /* NOTE: the nodes that get to the function update()
        are root and the ones that were collapsed
        Therefore, for this nodes that are getting uncollapsed we want to:
        - show the targets if necessary
        - show the features if necessary
        - highlight nodes and edges
        * */
        selectTargetVisualization(nodeEnter);
        checkboxFeatureMenu.checked ? selectFeatureVisualization(nodeEnter) : removeAllFeatures();

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", function (d) {
                if (d._children)
                    if (d._children.length > 2)
                        return radiusFactor * d._children.length * 4
                    else if (d._children.length === 2)
                        return 8.7 * radiusFactor
                    else
                        return 7.7 * radiusFactor;
                return 8.7;
            })
            .style("fill", function (d) {
                //console.log("if _children QUANTITY", d._children.length);
                if (d._children) { // Si solo tiene un hijo, lo pongo de color azul
                    if (d._children.length === 1) {
                        return "lightsteelblue";
                    } else { // Si tiene más de un hijo, le dejamos su nivel de toxicidad como color
                        if (d.toxicity_level === 0) {
                            return colourToxicity0;
                        }
                        if (d.toxicity_level === 1) {
                            return colourToxicity1;
                        }
                        if (d.toxicity_level === 2) {
                            return colourToxicity2;
                        } else {
                            if (d.toxicity_level)
                                return colourToxicity3;
                            else return "lightsteelblue";
                        }
                    }
                } else { // Le ponemos color al nodo según su toxicidad
                    if (d.toxicity_level === 0) {
                        return colourToxicity0;
                    }
                    if (d.toxicity_level === 1) {
                        return colourToxicity1;
                    }
                    if (d.toxicity_level === 2) {
                        return colourToxicity2;
                    } else {
                        if (d.toxicity_level)
                            return colourToxicity3;
                        else return colourNewsArticle;
                    }
                }
                //return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                //if (d.x > 360) return "rotate(" + (d.x - 100) + ")translate(" + d.y + ")";
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });


        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name.length + 50) + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);


        // Update the links…
        var link = svgGroup.selectAll("path.link")
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
                if (d.target.positive_stance && d.target.negative_stance) { //Si está a favor y en contra
                    return colourBothStances;
                } else if (d.target.positive_stance === 1) { //A favor
                    return colourPositiveStance;
                } else if (d.target.negative_stance === 1) { // En contra
                    return colourNegativeStance;
                } else {
                    return colourNeutralStance;
                }
            })
            .on('click', clickLink);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal)
        ;

        //Highlight nodes if necessary NOTE: it needs to be after the definition of the link
        if (checkboxHighlightMenu.checked && source.children) checkboxOR.checked ? highlightByPropertyOR(node, link) : highlightByPropertyAND(node, link);
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

        console.log("node positions at the end of update: ", source.x, source.y);
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;

    //root.x0 = viewerHeight / 2;
    root.x0 = 0;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    console.log("root coordinates", root.x, root.y);
    update(root);
    console.log("root coordinates AFTER UPDATE", root.x, root.y);
    centerNode(root);
    console.log("root coordinates AFTER center node", root.x, root.y);

    /**
     * Wrap call to compute statistics and to write them in a hover text
     * */
    function computeStatistics() {
        //I compute the values for the statistic data showing in the background
        var listStatistics = getStatisticValues(root);
        var totalNumberOfNodes = listStatistics.children;

        var totalNotToxic = listStatistics.toxicity0,
            totalMildlyToxic = listStatistics.toxicity1,
            totalToxic = listStatistics.toxicity2,
            totalVeryToxic = listStatistics.toxicity3;

        var totalGroup = listStatistics.totalTargGroup,
            totalPerson = listStatistics.totalTargPerson,
            totalStereotype = listStatistics.totalTargStereotype,
            totalNone = listStatistics.totalTargNone;

        var statisticTitle = "Static values of the news article";
        statisticTitleBackground.style("visibility", "visible").html(statisticTitle);
        statisticBackground.style("visibility", "visible").html(writeStatisticText(totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic,
            totalGroup, totalPerson, totalStereotype, totalNone));
    }

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

                //Targets are not exclusive
                childrenList.targGroup ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
                childrenList.targPerson ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
                childrenList.targStereotype ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
                (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype) ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
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
    var totalNumberOfNodes = listStatistics.children;

    var totalNotToxic = listStatistics.toxicity0,
        totalMildlyToxic = listStatistics.toxicity1,
        totalToxic = listStatistics.toxicity2,
        totalVeryToxic = listStatistics.toxicity3;

    var totalGroup = listStatistics.totalTargGroup,
        totalPerson = listStatistics.totalTargPerson,
        totalStereotype = listStatistics.totalTargStereotype,
        totalNone = listStatistics.totalTargNone;

    var statisticTitle = "<span style='font-size: 22px;'> Static values of " + sel_item.split('/')[2] + "</span>";
    statisticTitleBackground.style("visibility", "visible").html(statisticTitle);
    statisticBackground.style("visibility", "visible").html(writeStatisticText());

    function writeStatisticText() {
        var statisticText = "<table style='width: 500px;'>";

        var statTitlesToxicity = ["Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
        var statTitlesTargets = ["Target group", "Target person", "Stereotype", "None"];
        var statValuesTox = [totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic];
        var statValuesTarg = [totalGroup, totalPerson, totalStereotype, totalNone];
        var targetImagesPath = ["icons/Group.png", "icons/Person.png", "icons/Stereotype.png", "/icons/Blank.png"];
        var toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

        for (var i = 0; i < statTitlesToxicity.length; i++) {
            statisticText += "<tr style='font-size: 20px;'>"; //Start table line

            //Write toxicity and target line
            statisticText += "<td style='font-size: 20px; width: 400px; margin-right: 25px;'>" + "<img src=" + pf + toxicityLevelsPath[i] + " style='width: 35px; margin-right: 15px; margin-left: 25px;'>" + statTitlesToxicity[i].toString() + ": " + "<td style='padding-right: 55px;'>" + statValuesTox[i].toString() + "</td>";
            statisticText += "<td style='font-size: 20px; width: 400px;'>" + "<img src=" + pt + targetImagesPath[i] + " style='width: 25px; margin-right: 15px; margin-left: 25px;'>" + statTitlesTargets[i].toString() + ": " + "<td>" + statValuesTarg[i].toString() + "</td>";

            statisticText += "</tr>"; //End table line
        }

        statisticText += "</table>";
        return statisticText;
    }


    //computeStatistics();

});