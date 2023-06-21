// import 'leaflet-geometryutil';
// const { GeometryUtil } = require('leaflet-geometryutil');

L.LeaderLine = L.Polyline.extend({
	options: {
		interactive: true,
		attachTo: "boundary", // boundary/center
		attachToBoundaryOn: "both", // edge, vertex or both
		attachToBoundarySingleLine: false,
		attachToTooltipHorizontal: true,
		attachOutsideSpacing: 10,
		lineCornerRadius: 10,
		className: "leaderline"
	},

	mapx: null,
	feature: null,
	corner: null,
	draggable: null,
	tooltipElement: null,
	tooltip: null,
	currentTooltipPosition: null,

	arcTopLeft: null,
	arcTopRight: null,
	arcBottomRight: null,
	arcBottomLeft: null,
	lineCornerArc: null,

	initialize: function (_feature, _tooltip, options) {
		// L.Path.prototype.initialize.call(this, map);

		this.feature = _feature;
		this.tooltip = _tooltip;

		this.tooltipElement = this.tooltip.getElement();
		this.currentTooltipPosition = this.tooltip.getLatLng();

		this._initInteractive();

		let latlng = this.feature.getCenter();
		let latlngs = [
			[latlng.lat, latlng.lng],
			[this.tooltip.getLatLng().lat, this.tooltip.getLatLng().lng]
		];

		this._setLatLngs(latlngs);

		let opt = {
			color: '#fefefe',
			weight: 2.5,
			opacity: 1.0,
			lineJoin: "round"
		};

		// console.log(this.feature.feature.geometry.type);
		if (this.feature.feature.geometry.type == "MultiPolygon") this.options.attachTo = "center"

		L.extend(options, opt);
		L.setOptions(this, options);

		this._setOptions();
	},

	onAdd: function (layer) {
		this.mapx = this._map;

		this.mapx.on('zoom', () => {
			this._updateLeaderLine();
		});

		L.Polyline.prototype.onAdd.call(this, map);
		this._updateLeaderLine();
	},

	addTo: function (map) {
		L.Polyline.prototype.addTo.call(this, map);
		// this._updateLeaderLine();
	},

	setOptions(opt, update = true) {
		L.extend(options, opt);

		this._setOptions();

		if (update) this._updateLeaderLine();
	},

	_setOptions() {
		this._setLineCornerRadius();

		if (this.options.interactive) {
			this.draggable.enable();
		} else {
			this.draggable.disable();
		}
	},

	_setLineCornerRadius() {
		let radius = this.options.lineCornerRadius;

		let arcPathTopLeft = '<path d="M ' + radius + ',0 Q 0,0 0,' + radius + '" stroke="black" fill="none" stroke-width="1" fill-opacity="0.5"/>';
		let arcPathTopRight = '<path d="M ' + radius + ',' + radius + ' Q ' + radius + ',0 0,0" stroke="black" fill="none" stroke-width="1" fill-opacity="0.5"/>';
		let arcPathBottomRight = '<path d="M 0,' + radius + ' Q ' + radius + ',' + radius + ' ' + radius + ',0" stroke="black" fill="none" stroke-width="1" fill-opacity="0.5"/>';
		let arcPathBottomLeft = '<path d="M ' + radius + ',' + radius + ' Q 0,' + radius + ' 0,0" stroke="black" fill="none" stroke-width="1" fill-opacity="0.5"/>';

		let latlng = this.feature.getCenter();
	
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		svgElement.setAttribute('viewBox', "0 0 31 31");
		svgElement.setAttribute('name', "arcPathBottomLeft");
		svgElement.innerHTML = arcPathTopLeft;
		this.arcTopLeft = L.svgOverlay(svgElement, new L.LatLngBounds(latlng, latlng));
	
		svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		svgElement.setAttribute('viewBox', "0 0 31 31");
		svgElement.setAttribute('name', "arcPathBottomLeft");
		svgElement.innerHTML = arcPathTopRight;
		this.arcTopRight = L.svgOverlay(svgElement, new L.LatLngBounds(latlng, latlng));
	
		svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		svgElement.setAttribute('viewBox', "0 0 31 31");
		svgElement.setAttribute('name', "arcPathBottomLeft");
		svgElement.innerHTML = arcPathBottomRight;
		this.arcBottomRight = L.svgOverlay(svgElement, new L.LatLngBounds(latlng, latlng));
	
		svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		svgElement.setAttribute('viewBox', "0 0 31 31");
		svgElement.setAttribute('name', "arcPathBottomLeft");
		svgElement.innerHTML = arcPathBottomLeft;
		this.arcBottomLeft = L.svgOverlay(svgElement, new L.LatLngBounds(latlng, latlng));
	},

	// onRemove: function (map) {
	// 	L.Path.prototype.onRemove.call(this, map);
	// },

	_initInteractive: function () {
		this.draggable = new L.Draggable(this.tooltipElement);

		this.draggable.on('dragend', (e) => ((draggable, tooltip) => {
			L.DomEvent.stopPropagation(e);
			tooltip.setLatLng(this.currentTooltipPosition);
			this._updateLeaderLine();
		})(this.draggable, this.tooltip));

		this.draggable.on('drag', (e) => ((draggable, tooltip) => {
			let latlng = this._map.mouseEventToLatLng(e.originalEvent);
			this.currentTooltipPosition = latlng;
			this._updateLeaderLine();
		})(this.draggable, this.tooltip));

		this.draggable.on('dragstart', (e) => (() => {
			//let latlng = //this.map.mouseEventToLatLng(e.propagatedFrom);

			this.currentTooltipPosition = this.tooltip.getLatLng();
		})());

		this.on('click', (e) => (() => {
			if (this.options.interactive) {
				L.DomEvent.stopPropagation(e);
				this.options.attachToTooltipHorizontal = !this.options.attachToTooltipHorizontal;

				this._updateLeaderLine();
			}
		})());
	},

	_updateLeaderLine: function () {
		try {
			/* Set new position of label */
			// this.tooltip.setLatLng(this.currentTooltipPosition);

			if (this.lineCornerArc != null) this.lineCornerArc.removeFrom(this.mapx);

			/* Only show connector line if outside polygon */
			if (!this.feature.contains(this.currentTooltipPosition)) {
				switch (this.options.attachTo) {
					case "center": this._attachToFeatureCenter()
					case "boundary": this._attachToBoundary()
				}
			} else {
				this.setLatLngs([]);
			}
		} catch (exception) {
			console.log(exception);
		}
	},

	_attachToFeatureCenter() {
		let toolTipBounds = this.tooltipElement.getBoundingClientRect();
		let mapBounds = $("#map")[0].getBoundingClientRect();

		toolTipBounds.left = toolTipBounds.left - this.options.attachOutsideSpacing;
		toolTipBounds.right = toolTipBounds.right + this.options.attachOutsideSpacing;
		toolTipBounds.top = toolTipBounds.top - this.options.attachOutsideSpacing;
		toolTipBounds.bottom = toolTipBounds.bottom + this.options.attachOutsideSpacing;

		let topLeft = new L.Point(toolTipBounds.left - mapBounds.left, toolTipBounds.top - mapBounds.top);
		let topRight = new L.Point(toolTipBounds.right - mapBounds.left, toolTipBounds.top - mapBounds.top);
		let bottomLeft = new L.Point(toolTipBounds.left - mapBounds.left, toolTipBounds.bottom - mapBounds.top);
		let bottomRight = new L.Point(toolTipBounds.right - mapBounds.left, toolTipBounds.bottom - mapBounds.top);
		let topMiddle = new L.Point(toolTipBounds.left + (toolTipBounds.right - toolTipBounds.left) / 2 - mapBounds.left, toolTipBounds.top - mapBounds.top);
		let bottomMiddle = new L.Point(toolTipBounds.left + (toolTipBounds.right - toolTipBounds.left) / 2 - mapBounds.left, toolTipBounds.bottom - mapBounds.top);
		let leftMiddle = new L.Point(toolTipBounds.left - mapBounds.left, toolTipBounds.top + (toolTipBounds.bottom - toolTipBounds.top) / 2 - mapBounds.top);
		let rightMiddle = new L.Point(toolTipBounds.right - mapBounds.left, toolTipBounds.top + (toolTipBounds.bottom - toolTipBounds.top) / 2 - mapBounds.top);

		// let sortedPolylines = this._sortedPolylines(this.feature, this.currentTooltipPosition);
		let center = this.feature.getCenter(); //sortedPolylines[0]["middleOfPolyline"];
		let centerPoint = this.mapx.latLngToContainerPoint(this.feature.getCenter());

		// let centerPosition = "";

		let svgStartPoint = new L.Point(0, 0);
		let cornerPoint = new L.Point(0, 0);

		let centerPointIsSouth = centerPoint.x > (topLeft.x - this.options.attachOutsideSpacing) && centerPoint.x < (topRight.x + this.options.attachOutsideSpacing) && centerPoint.y > bottomRight.y;
		let centerPointIsNorth = centerPoint.x > (topLeft.x - this.options.attachOutsideSpacing) && centerPoint.x < (topRight.x + this.options.attachOutsideSpacing) && centerPoint.y < topRight.y;
		let centerPointIsWest = centerPoint.x < topLeft.x && centerPoint.y < (bottomLeft.y + this.options.attachOutsideSpacing) && centerPoint.y > (topLeft.y - this.options.attachOutsideSpacing);
		let centerPointIsEast = centerPoint.x > topRight.x && centerPoint.y < (bottomRight.y + this.options.attachOutsideSpacing) && centerPoint.y > (topRight.y - this.options.attachOutsideSpacing);

		if (centerPointIsWest) { // "west" - always attach to left side of label
			svgStartPoint = new L.Point(leftMiddle.x - this.options.attachOutsideSpacing, leftMiddle.y);
			cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
			if (svgStartPoint.y < centerPoint.y) {
				this.lineCornerArc = this.arcTopLeft;
			} else {
				this.lineCornerArc = this.arcBottomLeft;
			}
		} else if (centerPointIsEast) { // "east" - always attach to right side of label
			svgStartPoint = new L.Point(rightMiddle.x + this.options.attachOutsideSpacing, rightMiddle.y);
			cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
			if (svgStartPoint.y < centerPoint.y) {
				this.lineCornerArc = this.arcTopRight;
			} else {
				this.lineCornerArc = this.arcBottomRight;
			}
		} else if (centerPointIsNorth) { // "north" - always attach to top of label
			svgStartPoint = new L.Point(topMiddle.x, topMiddle.y - this.options.attachOutsideSpacing);
			cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
			if (svgStartPoint.x < centerPoint.x) {
				this.lineCornerArc = this.arcTopLeft;
			} else {
				this.lineCornerArc = this.arcTopRight;
			}
		} else if (centerPointIsSouth) { // "south" - always attach to bottom of label
			svgStartPoint = new L.Point(bottomMiddle.x, bottomMiddle.y + this.options.attachOutsideSpacing);
			cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
			if (svgStartPoint.x < centerPoint.x) {
				this.lineCornerArc = this.arcBottomLeft;
			} else {
				this.lineCornerArc = this.arcBottomRight;
			}
		} else if (centerPoint.x < topLeft.x && centerPoint.y < topLeft.y) { // "northwest"
			if (this.options.attachToTooltipHorizontal) {
				svgStartPoint = new L.Point(leftMiddle.x - this.options.attachOutsideSpacing, leftMiddle.y); // attach to left side
				cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
				this.lineCornerArc = this.arcBottomLeft;
			} else {
				svgStartPoint = new L.Point(topMiddle.x, topMiddle.y - this.options.attachOutsideSpacing); // attach to top
				cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
				this.lineCornerArc = this.arcTopRight;
			}
		} else if (centerPoint.x > topRight.x && centerPoint.y < topRight.y) { // "northeast"
			if (this.options.attachToTooltipHorizontal) {
				svgStartPoint = new L.Point(rightMiddle.x + this.options.attachOutsideSpacing, rightMiddle.y); // attach to right side
				cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
				this.lineCornerArc = this.arcBottomRight;
			} else {
				svgStartPoint = new L.Point(topMiddle.x, topMiddle.y - this.options.attachOutsideSpacing); // attach to top
				cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
				this.lineCornerArc = this.arcTopLeft;
			}
		} else if (centerPoint.x > topRight.x && centerPoint.y > bottomRight.y) { // "southeast"
			if (this.options.attachToTooltipHorizontal) {
				svgStartPoint = new L.Point(rightMiddle.x + this.options.attachOutsideSpacing, rightMiddle.y); // attach to right side
				cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
				this.lineCornerArc = this.arcTopRight;
			} else {
				svgStartPoint = new L.Point(bottomMiddle.x, bottomMiddle.y + this.options.attachOutsideSpacing); // attach to bottom
				cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
				this.lineCornerArc = this.arcBottomLeft;
			}
		} else if (centerPoint.x < topLeft.x && centerPoint.y > bottomLeft.y) { // "southwest"
			if (this.options.attachToTooltipHorizontal) {
				svgStartPoint = new L.Point(leftMiddle.x - this.options.attachOutsideSpacing, leftMiddle.y); // attach to left side
				cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
				this.lineCornerArc = this.arcTopLeft;
			} else {
				svgStartPoint = new L.Point(bottomMiddle.x, bottomMiddle.y + this.options.attachOutsideSpacing); // attach to bottom
				cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
				this.lineCornerArc = this.arcBottomRight;
			}
		}

		// if (this.lineCornerArc != null) console.log(this.arcBottomLeft.getElement());

		// if (this.options.attachToTooltipHorizontal) {
		// 	if (centerPointIsNorth || centerPointIsSouth) {
		// 		cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
		// 	} else {
		// 		cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
		// 	}
		// } else {
		// 	if (centerPointIsWest || centerPointIsEast) {
		// 		cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
		// 	} else {
		// 		cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
		// 	}
		// }

		let svgStartPointCoordinates = this.mapx.containerPointToLatLng(svgStartPoint);
		let cornerPointCoordinates = this.mapx.containerPointToLatLng(cornerPoint);

		// let metersPerPixel = 40075016.686 * Math.abs(Math.cos(this.mapx.getCenter().lat * Math.PI/180)) / Math.pow(2, this.mapx.getZoom()+8);

		let line1Path = '<path d="M ' + svgStartPoint.x + ', ' + svgStartPoint.y + ' L ' + cornerPoint.x + ', ' + (cornerPoint.y + 56) + '" stroke="black" fill="none" stroke-width="3" fill-opacity="0.5"/>';

		// console.log(line1Path);

		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		// svgElement.setAttribute('viewBox', "0 0 " + (cornerPoint.x - svgStartPoint.x) + " 1");
		svgElement.innerHTML = line1Path;

		// let bounds1 = this.mapx.containerPointToLatLng(new L.Point(cornerPoint.x - 10, cornerPoint.y - 10));
		// let bounds2 = this.mapx.containerPointToLatLng(new L.Point(cornerPoint.x + 10, cornerPoint.y + 10));
		let bounds1 = this.mapx.containerPointToLatLng(new L.Point(cornerPoint.x - 10, cornerPoint.y - 10));
		let bounds2 = this.mapx.containerPointToLatLng(new L.Point(cornerPoint.x + 10, cornerPoint.y + 10));

		// console.log(bounds1);
		// console.log(bounds2);

		var svgElementBounds = new L.LatLngBounds(bounds1, bounds2);
		let line1Bounds = new L.LatLngBounds(cornerPointCoordinates, svgStartPointCoordinates);
		// console.log(line1Bounds);
		let x = L.svgOverlay(svgElement, line1Bounds);

		x.addTo(this.mapx);

		let latlngs = [
			[svgStartPointCoordinates.lat, svgStartPointCoordinates.lng],
			[cornerPointCoordinates.lat, cornerPointCoordinates.lng],
			[center.lat, center.lng]
		];

		this.setLatLngs(latlngs);
	},

	_attachToBoundary() {
		let sortedFeatures = this._sortedFeatures(this.feature, this.currentTooltipPosition);

		// console.log(sortedFeatures);

		if (sortedFeatures.length > 0) {
			let attachPoint = sortedFeatures[0].latlng;

			if (this.options.attachToBoundarySingleLine) {
				this.setLatLngs([
					[this.currentTooltipPosition.lat, this.currentTooltipPosition.lng],
					[attachPoint.lat, attachPoint.lng]
				]);
			} else {
				this.setLatLngs([
					[this.currentTooltipPosition.lat, this.currentTooltipPosition.lng],
					[this.currentTooltipPosition.lat, attachPoint.lng],
					[attachPoint.lat, attachPoint.lng]
				]);
			}
		} else {
			this.setLatLngs([]);
		}
	},

	_attachToCorner() {

	},

	_pixelBoundsToLatLng(corner1, corner2) {
		let corner1LatLng = this.mapx.containerPointToLatLng(new L.latLng(corner1[0], corner1));
		return this.mapx.containerPointToLatLng(point);
	},

	_coordsToPoint(latlng) {
		return this.mapx.latLngToContainerPoint(latlng);
	},

	_pixelsPerMeter: function() {
		const southEastPoint = this.mapx.getBounds().getSouthEast();
		const northEastPoint = this.mapx.getBounds().getNorthEast();
		const mapHeightInMetres = southEastPoint.distanceTo(northEastPoint);
		const mapHeightInPixels = this.mapx.getSize().y;
	
		return mapHeightInMetres / mapHeightInPixels;
	},

	_sortedFeatures: function (polygon, latlng) {
		let sortedFeatures = new Array();

		if (polygon.feature.geometry.type == "MultiPolygon") return Array(); // For some reason this happens sometimes

		if (this.options.attachToBoundaryOn == "edge" || this.options.attachToBoundaryOn == "both") {
			let polylines = this._polygonToPolylines(polygon);

			for (var i = 0; i < polylines.length; i++) {
				let polyline = polylines[i]; //.flat();
				let middleOfPolyline = L.GeometryUtil.interpolateOnLine(this.mapx, polyline, 0.5);
				let distance = L.GeometryUtil.distance(this.mapx, latlng, middleOfPolyline.latLng);

				sortedFeatures.push({
					type: "polyline",
					feature: polylines[i],
					latlng: middleOfPolyline.latLng,
					distance: distance
				});
			}
		}

		if (this.options.attachToBoundaryOn == "vertex" || this.options.attachToBoundaryOn == "both") {
			for (var i = 0; i < polygon.getLatLngs()[0].length; i++) { // why nested array?
				sortedFeatures.push({
					type: "vertex",
					feature: polygon.getLatLngs()[0][i],
					latlng: polygon.getLatLngs()[0][i],
					distance: L.GeometryUtil.distance(this.mapx, latlng, polygon.getLatLngs()[0][i])
				});
			}
		}

		sortedFeatures.sort(function (a, b) {
			if (a.distance > b.distance) { return 1; }
			if (a.distance < b.distance) { return -1; }
			return 0;
		});

		return sortedFeatures;
	},

	_polygonToPolylines: function (polygon) {
		let polylines = Array();
		let polygons = polygon.getLatLngs();

		for (var p = 0; p < polygons.length; p++) {
			let points = polygons[p];

			for (var i = 0; i < points.length; i++) {
				let pointStart = points[i];

				if (i == points.length - 1) {
					polylines.push( L.polyline([pointStart, points[0]]) );
				} else {
					polylines.push( L.polyline([pointStart, points[i + 1]]) );
				}
			}
		}

		return polylines;
	}
});

L.leaderLine = function (feature, tooltip, options) {
	return new L.LeaderLine(feature, tooltip, options);
};

// L.LeaderLine.addInitHook(function(){

// });