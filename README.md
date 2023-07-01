# Leaflet.LeaderLine
Leaflet plugin for drawing leader lines connecting a geometric shape to a label.

Given a label (Leaflet L.tooltip) and a polygon on a map, this plugin will automatically connect these with a line (or two lines at a 90 degree angle).

* Plugin is functional at this point, but - NOT FULLY IMPLEMENTED -
* This documentation is a first draft.
* Multi polygons are not supported at this point.
* Lots of styling options still to be implemented.

\
Live demo and layout tool available at:

https://starcodr.github.io/Leaflet.LeaderLine

## Installation
See example in "examples" folder for files to include.\
\
Dependencies:
* Leaflet
* jQuery (only for example right now)
* https://github.com/makinacorpus/Leaflet.GeometryUtil
* https://github.com/hayeswise/Leaflet.PointInPolygon

## Usage
### Basic usage
#### 1. Create a polygon feature (perhaps from GeoJSON)
#### 2. Create a leaflet tooltip (L.tooltip) and add to map
If you are in the process of laying out tooltips and polygons (see below), set the tooltip to some arbitrary position, for instance the center of the polygon.\
Interactive, permanent and sticky options must be set to true.
```
let tooltip = L.tooltip({
	interactive: true,
	permanent: true,
	sticky: true,
	direction: "center"
})
.setLatLng(polygon.getCenter())
.setContent("Some name")
.addTo(map);
```
#### 3. Create an L.LeaderLine object
Pass the tooltip and polygon as parameters and an optional options object.
```
let leaderLine = new L.LeaderLine(polygon, tooltip, {
	attachTo: "center",
	interactive: true,
	weight: 2.5,
	tooltip: {
		featureId: layer.feature.id,
		featureName: layer.feature.properties.name
	}
});

leaderLine.addTo(leaderLinesLayer);
```
### Layout/placement of tooltips
Part of the process of showing leader lines on a map is the actual placement of the labels/tooltips relative to the polygons.

The live demo is made in order to help with the design/layout of tooltips and leader lines. Use it as is or modify it to accommodate your specific needs.

Using the demo, follow these steps for laying out tooltips at desired positions:
- Create polygons.
- Create tooltips for each polygon with some arbitrary position (fx. center of polygon).
- Create leader line with polygon and tooltip as parameters and option "interactive" = true.
- Goto webpage.
- Drag tooltips around the map until tooltips and leader lines look as desired.
- Export resulting tooltip coordinates using the export button.

The exported JSON data can now be used in your code for later display on your map (and "interactive" can be disabled).

(hint: toggle "attachToTooltipHorizontal" by clicking on leader line)

### Example export output
```
  "10": {
    "state": "Delaware",
    "attachTo": "center",
    "attachToBoundaryOn": "both",
    "attachToBoundarySingleLine": true,
    "attachToTooltipHorizontal": true,
    "tooltipPosition": {
      "lat": 45.912774818772206,
      "lng": -90.89818557816999
    }
  },
  "11": {
    "state": "District of Columbia",
    "attachTo": "center",
    "attachToBoundaryOn": "both",
    "attachToBoundarySingleLine": true,
    "attachToTooltipHorizontal": true,
    "tooltipPosition": {
      "lat": 45.912774818772206,
      "lng": -90.89818557816999
    }
  }
 ```

NOTE: At this point, the JSON output of the export function has tooltip coordinates, but these are not yet used if given as input parameter to L.LeaderLine.

### Options
| Option | Description | Value |
| --- | --- | --- |
| `interactive` | Enable tooltip dragging and leader line clickability for toggling "attachToTooltipHorizontal" mode | Boolean (default true) |
| `attachTo` | Should the leader line attach to the boundary or center of the polygon/feature | "boundary" or "center" |
| `attachToBoundaryOn` | If attachTo is boundary where should the leader line attach | "edge", "vertex" or "both" |
| `attachToBoundarySingleLine` | If attachTo is boundary should the leader line consist of two 90 degree lines or a single line | Boolean (default true) |
| `attachToTooltipHorizontal` | Should the leader line attach to the tooltip to the sides (horizontal) or top/bottom (vertical). Attachment point is automatically choosen in some cases to improve the look | Boolean (default true) |
| `attachOutsideSpacing` | Spacing outside tooltip | Integer |

