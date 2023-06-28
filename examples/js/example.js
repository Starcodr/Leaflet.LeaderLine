$(function () {
	let mapOptions = {
		minZoom: 3,
		maxZoom: 18,
		zoom: 4.5,
		zoomSnap: 0.25,
		zoomDelta: 0.3,
		center: [39.8097343, -98.5556199]
	};

	var map = L.map('map', mapOptions);

	var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	/* Layer for polygons, tooltips and leader lines */
	let leaderLinesLayer = new L.layerGroup().addTo(map);

	/* Test polygons */
	let polygonLayer = L.geoJSON({
			type: "FeatureCollection",
			features: []
		},
		{
			filter: function (feature, layer) {
				return feature;
			},
			// style: this.areaPathOptions,
			onEachFeature: (feature, layer) => {
			}
		}
	).addTo(map);

	polygonLayer.addData(statesData);

	polygonLayer.eachLayer( (layer) => {
		let tooltip = L.tooltip({
			permanent: true,
			sticky: true,
			direction: "center"
		})
		.setLatLng(layer.getCenter())
		.setContent(layer.feature.properties.name)
		.addTo(map);

		let leaderLine = new L.LeaderLine(layer, tooltip, {
			interactive: true,
			tooltip: {
				latLng: layer.getCenter(),
				content: layer.feature.properties.name,
				featureId: layer.feature.id,
				featureName: layer.feature.properties.name
			}
		});

		leaderLine.addTo(leaderLinesLayer);
	});

	/**
	 * Export state of leader lines and tooltip position. Modify as needed.
	 */
	leaderLineOptions = {};

	leaderLinesLayer.eachLayer( (layer) => {
		let options = layer.getOptions();

		leaderLineOptions[options.tooltip.featureId] = {
			state: options.tooltip.featureName,
			attachTo: options.attachTo,
			attachToBoundaryOn: options.attachToBoundaryOn,
			attachToBoundarySingleLine: options.attachToBoundarySingleLine,
			attachToTooltipHorizontal: options.attachToTooltipHorizontal,
			tooltipPosition: layer.getTooltip().getLatLng()
		}
	});

	$("#export-button").on("click", function(event) {
		L.DomEvent.stopPropagation(event);
		$("#output").empty().val(JSON.stringify(leaderLineOptions, null, 2));
	});
});