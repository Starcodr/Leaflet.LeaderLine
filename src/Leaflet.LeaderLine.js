// import 'leaflet-geometryutil';
// const { GeometryUtil } = require('leaflet-geometryutil');

L.LeaderLine = L.Polyline.extend({
	options: {
		width: 1,
		height: 1,
		attachPoint: "outside", // outside/inside/corner
		attachHorizontal: false,
		attachOutsideSpacing: 10,
		lineCornerRadius: 10
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

		this._createDraggable();
		this._setLineCornerRadius(this.options.lineCornerRadius);

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

		L.extend(options, opt);
		L.setOptions(this, options);
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

	_setLineCornerRadius(radius) {
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

	_createDraggable: function () {
		this.draggable = new L.Draggable(this.tooltipElement);
		this.draggable.enable();

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
	},

	_updateLeaderLine: function () {
		try {
			/* Set new position of label */
			// this.tooltip.setLatLng(this.currentTooltipPosition);

			if (this.lineCornerArc != null) this.lineCornerArc.removeFrom(this.mapx);

			/* Only show connector line if outside polygon */
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

			if (!this.feature.contains(this.currentTooltipPosition)) {
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
					if (this.options.attachHorizontal) {
						svgStartPoint = new L.Point(leftMiddle.x - this.options.attachOutsideSpacing, leftMiddle.y); // attach to left side
						cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
						this.lineCornerArc = this.arcBottomLeft;
					} else {
						svgStartPoint = new L.Point(topMiddle.x, topMiddle.y - this.options.attachOutsideSpacing); // attach to top
						cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
						this.lineCornerArc = this.arcTopRight;
					}
				} else if (centerPoint.x > topRight.x && centerPoint.y < topRight.y) { // "northeast"
					if (this.options.attachHorizontal) {
						svgStartPoint = new L.Point(rightMiddle.x + this.options.attachOutsideSpacing, rightMiddle.y); // attach to right side
						cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
						this.lineCornerArc = this.arcBottomRight;
					} else {
						svgStartPoint = new L.Point(topMiddle.x, topMiddle.y - this.options.attachOutsideSpacing); // attach to top
						cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
						this.lineCornerArc = this.arcTopLeft;
					}
				} else if (centerPoint.x > topRight.x && centerPoint.y > bottomRight.y) { // "southeast"
					if (this.options.attachHorizontal) {
						svgStartPoint = new L.Point(rightMiddle.x + this.options.attachOutsideSpacing, rightMiddle.y); // attach to right side
						cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
						this.lineCornerArc = this.arcTopRight;
					} else {
						svgStartPoint = new L.Point(bottomMiddle.x, bottomMiddle.y + this.options.attachOutsideSpacing); // attach to bottom
						cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
						this.lineCornerArc = this.arcBottomLeft;
					}
				} else if (centerPoint.x < topLeft.x && centerPoint.y > bottomLeft.y) { // "southwest"
					if (this.options.attachHorizontal) {
						svgStartPoint = new L.Point(leftMiddle.x - this.options.attachOutsideSpacing, leftMiddle.y); // attach to left side
						cornerPoint = new L.Point(centerPoint.x, svgStartPoint.y);
						this.lineCornerArc = this.arcTopLeft;
					} else {
						svgStartPoint = new L.Point(bottomMiddle.x, bottomMiddle.y + this.options.attachOutsideSpacing); // attach to bottom
						cornerPoint = new L.Point(svgStartPoint.x, centerPoint.y);
						this.lineCornerArc = this.arcBottomRight;
					}
				}

				if (this.lineCornerArc != null) console.log(this.arcBottomLeft.getElement());

				// if (this.options.attachHorizontal) {
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

				let latlngs = [
					[svgStartPointCoordinates.lat, svgStartPointCoordinates.lng],
					[cornerPointCoordinates.lat, cornerPointCoordinates.lng],
					[center.lat, center.lng]
				];


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

				// let latlngs = [
				// 	[bounds1.lat, bounds1.lng],
				// 	[bounds2.lat, bounds2.lng]
				// ];

				this.setLatLngs(latlngs);

			} else {
				this.setLatLngs([]);
			}
		} catch (exception) {
			console.log(exception);
		}
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

	_sortedPolylines: function (polygon, latlng) {
		let polylines = this._polygonToPolylines(polygon);

		let sortedPolylines = new Array();

		// let info = {
		// 	closestPolyline: null,
		// 	shortestDistance: 9999999999
		// };

		for (var i = 0; i < polylines.length; i++) {
			// let polyline = polylines[i];
			let middleOfPolyline = L.GeometryUtil.interpolateOnLine(this.mapx, polylines[i], 0.5);
			let distance = L.GeometryUtil.distance(this.mapx, latlng, middleOfPolyline.latLng);

			sortedPolylines.push({
				polyline: polylines[i],
				middleOfPolyline: middleOfPolyline,
				distance: distance
			});
		}

		sortedPolylines.sort(function (a, b) {
			if (a.distance > b.distance) { return 1; }
			if (a.distance < b.distance) { return -1; }
			return 0;
		});

		return sortedPolylines;
	},

	_polygonToPolylines: function (polygon) {
		// console.log(polygon);
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