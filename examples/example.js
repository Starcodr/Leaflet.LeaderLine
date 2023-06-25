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
	let leaderLinesLayer = new L.layerGroup();

	/* Finally add shared layer to map */
	leaderLinesLayer.addTo(map);

	/**
	 * Test polygons
	 */
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
		/* Tooltip */
		let tooltip = L.tooltip({
			permanent: true,
			sticky: true,
			direction: "center"
		})
		.setLatLng(layer.getCenter())
		.setContent(layer.feature.properties.name)
		.addTo(map);
console.log(tooltip);
		let leaderLine = new L.LeaderLine(layer, tooltip, {
			interactive: true,
			tooltip: {
				latLng: layer.getCenter(),
				content: layer.feature.properties.name
			}
		});

		leaderLine.addTo(leaderLinesLayer);
	});

	// /* Polygon */
	// var latlngsx = [[37, -109.05],[41, -109.03],[41.5, -102.55],[38, -102.04]];
	// var polygon = L.polygon(latlngsx, {color: 'red'}).addTo(map);
});