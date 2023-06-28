# Leaflet.LeaderLine
Leaflet plugin for drawing leader lines connecting a geometric shape to a label.

Given a label (Leaflet L.tooltip) and a polygon on a map, this plugin will automatically connect these with a line (or two lines at 90 degree angles).

Plugin is functional at this point, but - NOT FULLY IMPLEMENTED -

This documentation is a first draft.

Multi polygons are not supported.

## Installation
See example in "examples" folder for files to include.

## Usage
### Basic usage
1. Create a leaflet tooltip (L.tooltip)
2. Create a polygon feature (perhaps from GeoJSON)
3. Create an L.LeaderLine object passing the tooltip and feature as parameters and an optional options object.

### Layout/placement of tooltips
```
Part of the process of showing leader lines on a map is the actual placement of the labels/tooltips relative to the polygons.

The included example serves the purpose of making the design/layout of tooltips and leader lines easier. Modify the example code to accommodate your specific needs.
```

Using the included example, follow these steps for laying out tooltips at desired positions:
- Create polygons.
- Create tooltips for each polygon with some arbitrary position (fx. center of polygon).
- Create leader line with polygon and tooltip as parameters and option "interactive" = true.
- Goto webpage.
- Drag tooltips around the map until tooltips and leader lines look as desired.
- Export resulting tooltip coordinates using the export button.

The exported JSON data can now be used in your code for later display on your map (and "interactive" can be disabled).

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

