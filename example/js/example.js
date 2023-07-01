$(function () {
	let mapOptions = {
		minZoom: 3,
		maxZoom: 18,
		zoom: 4.5,
		zoomSnap: 0.25,
		zoomDelta: 0.3,
		center: [39.8097343, -98.5556199]
	};

	let polygonOptions = {
		fillColor: "#04859D",
		fillOpacity: 0.2,
		color: "#FF7C00",
		opacity: 0.6,
		weight: 0.8
	}

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
			filter: function (feature, layer) { return feature; },
			style: polygonOptions,
			onEachFeature: (feature, layer) => {}
		}
	).addTo(map);

	polygonLayer.addData(statesData);

	polygonLayer.eachLayer( (layer) => {
		/* Interactive, permanent and sticky options must be set to true. */
		let tooltip = L.tooltip({
			interactive: true,
			permanent: true,
			sticky: true,
			direction: "center"
		})
		.setLatLng(layer.getCenter())
		// .setLatLng(new L.latLng(45.912774818772206,-90.89818557816999))
		.setContent(layer.feature.properties.name)
		.addTo(map);

		/* You can pass custom options, For instance an ID for later reference when using exported options. */
		let leaderLine = new L.LeaderLine(layer, tooltip, {
			attachTo: "center",
			interactive: true,
			weight: 2,
			color: "#ffffff",
			tooltip: {
				featureId: layer.feature.id,
				featureName: layer.feature.properties.name
			}
		});

		leaderLine.addTo(leaderLinesLayer);
	});

	/**
	 * Export state of leader lines and tooltip position. Modify as needed.
	 */
	$("#export-button").on("click", function(event) {
		L.DomEvent.stopPropagation(event);
		leaderLineOptions = {};
		L.popup()
		.setLatLng(new L.latLng(39.8097343, -98.5556199))
		.setContent('<pre>Hello</pre>')
		.addTo(map)
		.openOn(map);
		leaderLinesLayer.eachLayer( (layer) => {
			let options = layer.getOptions();
	// console.log(options.tooltip.featureName + ": " + options.attachToTooltipHorizontal);
			leaderLineOptions[options.tooltip.featureId] = {
				state: options.tooltip.featureName,
				attachTo: options.attachTo,
				attachToBoundaryOn: options.attachToBoundaryOn,
				attachToBoundarySingleLine: options.attachToBoundarySingleLine,
				attachToTooltipHorizontal: options.attachToTooltipHorizontal,
				tooltipPosition: layer.getTooltip().getLatLng()
			}
		});

		$("#output").empty().val(JSON.stringify(leaderLineOptions, null, 2));
	});
});