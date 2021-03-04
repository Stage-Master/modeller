
function init() {

     if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make;  // for conciseness in defining templates

      myDiagram = $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
          {
            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
            "LinkRelinked": showLinkLabel,
            "undoManager.isEnabled": true  // enable undo & redo
          });

      // when the document is modified, add a "*" to the title and enable the "Save" button
      myDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
      });

      // helper definitions for node templates

      function nodeStyle() {
        return [
          // The Node.location comes from the "loc" property of the node data,
          // converted by the Point.parse static method.
          // If the Node.location is changed, it updates the "loc" property of the node data,
          // converting back using the Point.stringify static method.
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          {
            // the Node.location is at the center of each node
            locationSpot: go.Spot.Center
          }
        ];
      }

      // Define a function for creating a "port" that is normally transparent.
      // The "name" is used as the GraphObject.portId,
      // the "align" is used to determine where to position the port relative to the body of the node,
      // the "spot" is used to control how links connect with the port and whether the port
      // stretches along the side of the node,
      // and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
      function makePort(name, align, spot, output, input) {
        var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
        // the port is basically just a transparent rectangle that stretches along the side of the node,
        // and becomes colored when the mouse passes over it
        return $(go.Shape,
          {
            fill: "transparent",  // changed to a color in the mouseEnter event handler
            strokeWidth: 0,  // no stroke
            width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
            height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
            alignment: align,  // align the port on the main Shape
            stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
            portId: name,  // declare this object to be a "port"
            fromSpot: spot,  // declare where links may connect at this port
            fromLinkable: output,  // declare whether the user may draw links from here
            toSpot: spot,  // declare where links may connect at this port
            toLinkable: input,  // declare whether the user may draw links to here
            cursor: "pointer",  // show a different cursor to indicate potential link point
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
              if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
            },
            mouseLeave: function(e, port) {
              port.fill = "transparent";
            }
          });
      }

      function textStyle() {
        return {
          font: "bold 10pt Lato, Helvetica, Arial, sans-serif",
          stroke: "#615D5D",
        }
      }

      // define the Node templates for regular nodes

      myDiagram.nodeTemplateMap.add("",  // the default category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Auto",
            $(go.Shape, "Rectangle",
              { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true,
                alignment: go.Spot.Bottom
              },
              new go.Binding("text", "Name").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
          makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
          makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ));
      myDiagram.nodeTemplateMap.add("cache",  // the default category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Rectangle",
              {desiredSize: new go.Size(70, 70),  fill: "#ffffff", stroke:"transparent" },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,

              },
               )
          ),
        ));
      myDiagram.nodeTemplateMap.add("Anchor",  // the Anchor category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Rectangle",
              {desiredSize: new go.Size(35, 35),  fill: "#FF8888", stroke:"transparent" },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true,
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())
          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


         myDiagram.nodeTemplateMap.add("AnchorWithinRectangle",  // the Anchor within rectangle category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
              $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(50, 50), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Rectangle",
              {desiredSize: new go.Size(35, 35),  fill: "#FF8888", stroke:"transparent" },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true,
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())
          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));
        //End of Anchor within a rectangle

      myDiagram.nodeTemplateMap.add("Attribute", // The attribute category
        $(go.Node, "Table", nodeStyle(),
          $(go.Panel, "Spot",
            $(go.Shape, "Circle",
              { desiredSize: new go.Size(40, 40), fill: "white", stroke: "#FF8888", strokeWidth:3}),
             $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // three named ports, one on each side except the top, all output only:
            makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


      myDiagram.nodeTemplateMap.add("AttributeWithinRectangle", //Attribute within a rectangle
        $(go.Node, "Table", nodeStyle(),
          $(go.Panel, "Spot",
          $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(55, 55), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Circle",
              { desiredSize: new go.Size(40, 40), fill: "white", stroke: "#FF8888", strokeWidth:3}),
             $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // three named ports, one on each side except the top, all output only:
            makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));
      // End Attribute within a rectangle

      myDiagram.nodeTemplateMap.add("Tie", // The tie category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a diamond Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Diamond",
              { desiredSize: new go.Size(50, 50), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),

              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


        myDiagram.nodeTemplateMap.add("TieWithinRectangle", // Tie within Rectangle
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(60, 60), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Diamond",
              { desiredSize: new go.Size(50, 50), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),

              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));

        // End Tie within Rectangle
      myDiagram.nodeTemplateMap.add("Historized.Tie", // The historized tie category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a diamond Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Diamond",
              { desiredSize: new go.Size(55, 55), fill: "white", stroke:"#A8A8A8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
             $(go.Shape, "Diamond",
              { desiredSize: new go.Size(30, 30), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),
              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


        myDiagram.nodeTemplateMap.add("Historized.TieWithinRectangle", // HistorizedTie Within Rectangle
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
             $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(65, 65), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Diamond",
              { desiredSize: new go.Size(55, 55), fill: "white", stroke:"#A8A8A8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
             $(go.Shape, "Diamond",
              { desiredSize: new go.Size(30, 30), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),
              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));

        // End HistorizedTie Within Rectangle
      myDiagram.nodeTemplateMap.add("Knot",  // the knot category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rounded rectangular Shape
          $(go.Panel, "Spot",
            $(go.Shape, "RoundedRectangle",
              {desiredSize: new go.Size(35, 35),  fill: "white", stroke:"#FF8888", strokeWidth:3 },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.TopSide, true, true),
          makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
          makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ));


         myDiagram.nodeTemplateMap.add("KnotWithinRectangle",  //  //Knot Within Rectangle
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
             $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(50, 50), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "RoundedRectangle",
              {desiredSize: new go.Size(35, 35),  fill: "white", stroke:"#FF8888", strokeWidth:3 },
              new go.Binding("figure", "figure")),
            $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.TopSide, true, true),
          makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
          makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ));

        //End Knot Within Rectangle
      myDiagram.nodeTemplateMap.add("Historized.Attribute", // The historized attribute category
        $(go.Node, "Table", nodeStyle(),
          $(go.Panel, "Spot",
            $(go.Shape, "Circle",
              { desiredSize: new go.Size(40, 40), fill: "white", stroke: "#FF8888", strokeWidth:3}),
              $(go.Shape, "Circle",
              { desiredSize: new go.Size(30, 30), fill: "white", stroke: "#FF8888", strokeWidth:3}),
             $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())
             ),
          // three named ports, one on each side except the top, all output only:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));

          myDiagram.nodeTemplateMap.add("Historized.AttributeWithinRectangle", //Historized.Attribute Within Rectangle
        $(go.Node, "Table", nodeStyle(),
          $(go.Panel, "Spot",
             $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(55, 55), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Circle",
              { desiredSize: new go.Size(40, 40), fill: "white", stroke: "#FF8888", strokeWidth:3}),
              $(go.Shape, "Circle",
              { desiredSize: new go.Size(30, 30), fill: "white", stroke: "#FF8888", strokeWidth:3}),
             $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
              new go.Binding("text", "Mnemonic").makeTwoWay())
             ),
          // three named ports, one on each side except the top, all output only:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));
        //End Historized.Attribute Within Rectangle

        myDiagram.nodeTemplateMap.add("TieFact", // The te fact category
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a triangle Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Triangle",
              { desiredSize: new go.Size(50, 40), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),

              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


          myDiagram.nodeTemplateMap.add("TieFactWithinRectangle", //TieFact Within Rectangle
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
              $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(60, 60), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Triangle",
              { desiredSize: new go.Size(50, 40), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),

              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));
        //End TieFact Within Rectangle

      myDiagram.nodeTemplateMap.add("Historized.TieFact", // The historized tie fact
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
            $(go.Shape, "Triangle",
              { desiredSize: new go.Size(57, 45), fill: "white", stroke:"#A8A8A8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
             $(go.Shape, "Triangle",
              { desiredSize: new go.Size(40, 30), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),
              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));


       myDiagram.nodeTemplateMap.add("Historized.TieFactWithinRectangle",    //HistorizedTieFact within Rectangle
        $(go.Node, "Table", nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(go.Panel, "Spot",
           $(go.Shape, "Rectangle",
              { desiredSize: new go.Size(65, 65), fill: "transparent", stroke:"#0084E8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
            $(go.Shape, "Triangle",
              { desiredSize: new go.Size(57, 45), fill: "white", stroke:"#A8A8A8", strokeWidth:2 },
              new go.Binding("figure", "figure")),
             $(go.Shape, "Triangle",
              { desiredSize: new go.Size(40, 30), fill: "#A8A8A8", stroke:"transparent" },
              new go.Binding("figure", "figure")),
              $(go.TextBlock, textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
              },
             new go.Binding("text", "Mnemonic").makeTwoWay())

          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, true, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));
       //End HistorizedTieFact within Rectangle


      // taken from ../extensions/Figures.js:
      go.Shape.defineFigureGenerator("File", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, 0, true); // starting point
        geo.add(fig);
        fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
        fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
        var fig2 = new go.PathFigure(.75 * w, 0, false);
        geo.add(fig2);
        // The Fold
        fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
        fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
        geo.spot1 = new go.Spot(0, .25);
        geo.spot2 = go.Spot.BottomRight;
        return geo;
      });


      // replace the default Link template in the linkTemplateMap
      myDiagram.linkTemplate =  $(go.Link,  // the whole link panel
          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            resegmentable: true,
            // mouse-overs subtly highlight links:
            mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
            mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
            selectionAdorned: false
          },
          new go.Binding("points").makeTwoWay(),
          $(go.Shape,  // the highlight shape, normally transparent
            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
          $(go.Shape,  // the link path shape
            { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
            new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()),

          /*$(go.Panel, "Auto",  // the link label, normally not visible
            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
            new go.Binding("visible", "visible").makeTwoWay(),
            $(go.Shape, "RoundedRectangle",  // the label shape
              { fill: "#F8F8F8", strokeWidth: 0 }),
            $(go.TextBlock, "Role",  // the label
              {
                textAlign: "center",
                font: "10pt helvetica, arial, sans-serif",
                stroke: "#333333",
                editable: true
              },
              new go.Binding("text", "Role").makeTwoWay())
          )*/
        );

      // Make link labels visible if coming out of a "conditional" node.
      // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
      function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL");
        if (label !== null) label.visible = (e.subject.fromNode.data.category === "Anchor");
      }

      // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
      myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
      myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

      load();   // load an initial diagram from some JSON text

      // initialize the Palette that is on the left side of the page
      myPalette = $(go.Palette, "myPaletteDiv",  // must name or refer to the DIV HTML element
          {

            // Instead of the default animation, use a custom fade-down
            "animationManager.initialAnimationStyle": go.AnimationManager.None,
            "InitialAnimationStarting": animateFadeDown, // Instead, animate with this function
            nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
            model: new go.GraphLinksModel([  // specify the contents of the Palette
              { category: "cache"},
              { category: "Anchor", Mnemonic:"Anchor", Name:"???", ID:"???"},
             { category: "Knot", Mnemonic: "Knot" , Name:"???", ID:"???" , FieldName : "???", FieldType : "???" },
              { category: "Attribute", Mnemonic: "Attribute", Name:"???",  FieldName : "???", FieldType : "???" },
              { category: "Historized.Attribute", Mnemonic: "Historized.Attribute",Name:"???",  FieldName : "???", FieldType : "???" },
              { category: "Tie" , Mnemonic: "Tie",Name:"???"},
              { category: "Historized.Tie" ,Mnemonic: "Historized.Tie", Name:"???"},
              { category: "TieFact" , Mnemonic: "TieFact", Name:"???", Measure:"???", MeasureType : "???"},
              { category: "Historized.TieFact" ,Mnemonic: "Historized.TieFact", Name:"???", Measure:"???", MeasureType : "???"},

            ])
          });


        // Show the primary selection's data, or blanks if no Part is selected:
        var inspector = new Inspector('myInspectorDiv', myDiagram,
        {

          properties: {
            "category": {show:Inspector.showIfNode, readOnly: true},
            "Mnemonic": {show:Inspector.showIfNode},
            "Name": {show:Inspector.showIfNode},
            "ID": { show:Inspector.showIfNode,show: Inspector.showIfPresent,},
            "FieldName": {show:Inspector.showIfNode, show: Inspector.showIfPresent, },
            "FieldType": {show: Inspector.showIfNode, show: Inspector.showIfPresent,},
            "Measure": {show:Inspector.showIfNode, show: Inspector.showIfPresent, },
            "MeasureType": { show: Inspector.showIfNode, show: Inspector.showIfPresent,
            },
             // "Measures": {show:Inspector.showIfNode, show: Inspector.showIfPresent, },
             "key": { show: false },
             "loc": { show: false },
             "from": { show: false },
             "to": { show: false },
             "points": { show: false },
          },


        });

       // This is a re-implementation of the default animation, except it fades in from downwards, instead of upwards.
      function animateFadeDown(e) {
        var diagram = e.diagram;
        var animation = new go.Animation();
        animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
        animation.easing = go.Animation.EaseOutExpo;
        animation.duration = 900;
        // Fade "down", in other words, fade in from above
        animation.add(diagram, 'position', diagram.position.copy().offset(0, 200), diagram.position);
        animation.add(diagram, 'opacity', 0, 1);
        animation.start();
      }
    } // end init


    // Show the diagram's model in JSON format
   function exportJSON(title) {
       var content = myDiagram.model.toJson();
       var blob = new Blob([content], {type: "application/json"});
       saveAs(blob, title+".json");
    }


    function exportJSONForHome(title,content) {
       var blob = new Blob([JSON.stringify(content)], {type: "application/json"});
       saveAs(blob, title+".json");
    }

     function exportSQLForHome(title,jsonString) {
     jsonString=JSON.stringify(jsonString);
      $.ajax({
                 	    type: 'GET',
                 	    url: "/sqlConvertor",
                        data: {"jsonString": jsonString, "dbms":"PostgreSQL", "view": "withView" },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {
                 	    var s=response["sql"];
                 	    var blob = new Blob([s], {type: "application/sql"});
                           saveAs(blob, title+".sql");
                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 	  });


    }


    function loadJSON()
    {
        $("#inputJSONLoad").trigger("click");
       var inputElement = document.getElementById("inputJSONLoad");
       inputElement.addEventListener("change", handleFilesLoad, false);
    }


   function handleFilesLoad() {
     var fileList = this.files; /* now you can work with the file list */
     var file=fileList[0];
     var title=file.name.replace(/\.[^/.]+$/, "")
     var reader = new FileReader();
       reader.onload = function(e) {
       content = e.target.result;
        $.ajax({
                 	    type: 'GET',
                 	    url: "/loadModel",
                        data: {"title": title, "content": content },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {
                 	         document.getElementById("mySavedModel").value=content;
                 	         load();
                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 });
       };
      reader.readAsText(file);

   }

    var modelID;
    function importJSON(id) {
      $("#inputJSONImport").trigger("click");
      modelID=id;
       var inputElement = document.getElementById("inputJSONImport");
       inputElement.addEventListener("change", handleFilesImport, false);
    }


   function handleFilesImport() {
     var fileList = this.files; /* now you can work with the file list */
     var file=fileList[0];
     var title=file.name.replace(/\.[^/.]+$/, "")
     var reader = new FileReader();
       reader.onload = function(e) {
       content = e.target.result;
       console.log(content);
        $.ajax({
                 	    type: 'GET',
                 	    url: "/importModel",
                        data: {"title": title, "content": content, "modelID":modelID },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {
                         window.location.href="/loadModelVersions/"+modelID;
                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 });
       };
      reader.readAsText(file);

   }

    function save(id) {
      var content = myDiagram.model.toJson();
         $.ajax({
                 	    type: 'GET',
                 	    url: "/modellerFromVersionSave",
                        data: {"id": id, "content": content },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {

                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 });

    }

   function load() {
       myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    }

    function undo() {
     myDiagram.commandHandler.undo();
     }

      function redo() {
     myDiagram.commandHandler.redo();
     }

      function remove() {
     myDiagram.commandHandler.deleteSelection();
     }

     function selectAll() {
     myDiagram.commandHandler.selectAll();
     }
    function off() {
   	  document.getElementById("SQLOverlay").style.display = "none";

   	}
   	function offCreate() {
   	  document.getElementById("CreateOverlay").style.display = "none";

   	}
   	function offCreateSuper() {
   	  document.getElementById("CreateSuperOverlay").style.display = "none";

   	}

    function onCreate() {
   	  document.getElementById("CreateOverlay").style.display = "block";
   	}

   	 function onCreateSuper() {
   	  document.getElementById("CreateSuperOverlay").style.display = "block";
   	}

   	function offRename() {
   	  document.getElementById("RenameOverlay").style.display = "none";

   	}

   	function offRenameSuper() {
   	  document.getElementById("RenameSuperOverlay").style.display = "none";
   	}

    function onRename(id,title) {
      document.getElementById("inputRenameModelID").value=id;
      document.getElementById("inputRenameModelTitle").value=title;
   	  document.getElementById("RenameOverlay").style.display = "block";
   	}

   	 function onRenameSuper(id,title) {
     document.getElementById("inputRenameSuperModelID").value=id;
      document.getElementById("inputRenameSuperModelTitle").value=title;
   	  document.getElementById("RenameSuperOverlay").style.display = "block";
   	}

   	// Copy the sql code being generated
   	function copySQL() {
   	document.getElementById("copySQL").style.color = "#00aaff";
    var text = document.getElementById("copySQL").innerText;
    var elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = text;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);

   	}

   	 function copySQLAdded() {
   	document.getElementById("copySQLAdded").style.color = "#00aaff";
    var text = document.getElementById("copySQLAdded").innerText;
    var elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = text;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);

   	}
     function showEvolution(){
     document.getElementById("btn1").style.display="none";
     document.getElementById("btn2").style.display="inline";
     document.getElementById("btn3").style.display="inline";
     document.getElementById("btn3").disabled=true;
     document.getElementById("btn4").style.display="none";
     document.getElementById("btn5").style.display="none";

     var elms=document.getElementsByClassName("select");

     for(var i=0;i<elms.length;i++)
       {
          elms[i].style.display="inline";

        }
   }

     var cpt=0;
     var selection=[];

     function select(id,date){
     document.getElementById("select_"+id).style.display="none";
     document.getElementById("selected_"+id).style.display="inline";
     selection.push({id:id, date:date});
     cpt++;
     if (cpt==2 ) {
           document.getElementById("btn3").disabled=false;

     }
     else {
         document.getElementById("btn3").disabled=true;
     }
     }

     function selected(id,date){
     document.getElementById("select_"+id).style.display="inline";
     document.getElementById("selected_"+id).style.display="none";
      var output=[]
      for(var i=0;i<selection.length;i++)
       {
         if (selection[i].id!==id){
         output.push({id:selection[i].id, date:selection[i].date});
         }
        }
     selection=output;
     cpt--;
     if (cpt==2 ) {
           document.getElementById("btn3").disabled=false;

     }
     else {
         document.getElementById("btn3").disabled=true;
     }

     }
     function back(){
     document.getElementById("btn1").style.display="inline";
     document.getElementById("btn2").style.display="none";
     document.getElementById("btn3").style.display="none";
     document.getElementById("btn4").style.display="inline";
     document.getElementById("btn5").style.display="inline";
      var elmts=document.getElementsByClassName("select");
     for(var i=0;i<elmts.length;i++)
       {
          elmts[i].style.display='none';
        }

     elmts=document.getElementsByClassName("selected");
     for(var i=0;i<elmts.length;i++)
       {
          elmts[i].style.display='none';
        }
        cpt=0;
        selection=[];
     }

     function compare(){
         firstDate=new Date(selection[0].date)
         secondDate=new Date(selection[1].date)
         if (firstDate <= secondDate){
          var idOld=selection[0].id;
          var idRecent=selection[1].id;
         }
         else
         {
          var idOld=selection[1].id;
          var idRecent=selection[0].id;
         }

         window.open("/compare/"+idOld+"/"+idRecent);
    }


    // function lunched every time and detects if SQLCode button is being clicked to display sql Code
   	$(function(){
         $("#SQLCode").click(function() {
            var jsonString = myDiagram.model.toJson();
            var dbms=document.getElementById("dbms").value;
            var view;
           if(document.getElementById("view").checked) {view="withView";}
           else {view="withoutView";}
        		  $.ajax({
                 	    type: 'GET',
                 	    url: "/sqlConvertor",
                        data: {"jsonString": jsonString,"dbms": dbms, "view": view },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {
                 	    var s=response["sql"].replace(/(?:\r\n|\r|\n)/g, '<br>');
                        var sql= '<div class="panel-heading"><h3>Generate SQL</h3></div><div  class="panel-body"><p id="copySQL">'+ s +'</p><div><button type="button"  class="btn btn-primary" style="margin-left:60%;margin-top:10%"  onclick="copySQL()">COPY</button><button type="button" class="btn btn-default" style="margin-left:3%;margin-top:10%;color:#00aaff"  onclick="off()">CLOSE</button> </div></div>';
                       $('#SQLOverlay div.panel').empty();
                 	    $('#SQLOverlay div.panel').append(sql);
                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 	  });
        		document.getElementById("SQLOverlay").style.display = "block";

        		});

     });

     	$(function(){
         $("#JSONCode").click(function() {
           var jsonString = myDiagram.model.toJson();
        		  $.ajax({
                 	    type: 'GET',
                 	    url: "/jsonConvertor",
                        data: {"jsonString": jsonString },
                        crossDomain:true,
                	    crossOrigin:true,
                 	    success: function (response) {
                 	    var s=response["schema"]
                        var schema= '<div class="panel-heading"><h3>Generate JSON</h3></div><div  class="panel-body"><p id="copySQL">'+ s +'</p><div><button type="button"  class="btn btn-primary" style="margin-left:60%;margin-top:10%"  onclick="copySQL()">COPY</button><button type="button" class="btn btn-default" style="margin-left:3%;margin-top:10%;color:#00aaff"  onclick="off()">CLOSE</button> </div></div>';
                       $('#SQLOverlay div.panel').empty();
                 	    $('#SQLOverlay div.panel').append(schema);
                         },
                 	    error : function(response) {
                 	      alert("ERROR: ", response);
                 	      console.log("ERROR: ", response);
                 	    }
                 	  });
        		document.getElementById("SQLOverlay").style.display = "block";

        		});

     });

     // print the diagram by opening a new window holding SVG images of the diagram contents for each page
    function printDiagram() {
      var svgWindow = window.open();
      if (!svgWindow) return;  // failure to open a new Window
      var printSize = new go.Size(700, 960);
      var bnds = myDiagram.documentBounds;
      var x = bnds.x;
      var y = bnds.y;
      while (y < bnds.bottom) {
        while (x < bnds.right) {
          var svg = myDiagram.makeSVG({ scale: 1.0, position: new go.Point(x, y), size: printSize });
          svgWindow.document.body.appendChild(svg);
          x += printSize.width;
        }
        x = bnds.x;
        y += printSize.height;
      }
      setTimeout(function() { svgWindow.print(); }, 1);
    }

    $(function(){
      $("#inputFilter").on("keyup", function() {
        	      var inputValue = $(this).val().toLowerCase();
        	      $("#tableVersions tr").filter(function() {
        	        $(this).toggle($(this).text().toLowerCase().indexOf(inputValue) > -1)
        	      });
        	  });

     });



  $(function(){
      $("#scroll").scrollTop(66);
  });

function loadModelVersions(modelID){
document.getElementById("model_"+modelID).style.background="#dddddd";
}


















