#!/usr/bin/env node

'use strict'

const fs = require('fs')
const pg = require('pg')
const async = require('async')
const flatten = require('geojson-flatten')
const bbox = require('geojson-bbox')
const inside = require('point-in-polygon')
const mercator = require('globalmercator')
const args = require('minimist')(process.argv.slice(2))

const makeArray = (v) => v ? (Array.isArray(v) ? v : [v]) : []

const filters = {}
makeArray(args.filter).forEach(term => {
	const split = term.split('=')
	const name = split[0]
	const values = split[1]
	filters[name] = values.split(',')
})

// Return true if feature matches filter
const isMatch = (feature) => Object.keys(filters).every(name => {
	return filters[name].some(value => feature.properties[name] === value)
})

const rowsToGeoJson = (rows) => ({
	type: 'FeatureCollection',
	features: rows.map(row => {
		const coords = JSON.parse(row.geom).coordinates
	    const lnglat = mercator.metersToLatLon(coords[0], coords[1]).reverse()
		return ({
			type: 'Feature',
			id: row.osm_id,
			properties: {
				name: row.name || '',
				type: row.highway === 'bus_stop' ? 'bus' : 'train'
			},
			geometry: {
				type: 'Point',
				coordinates: lnglat
			}
		})
	})
})

const processOne = (feature, callback) => {
	const outer = feature.geometry.coordinates[0]
	const bounds = bbox(feature)
	const minMercator = mercator.latLonToMeters(bounds[1], bounds[0])
	const maxMercator = mercator.latLonToMeters(bounds[3], bounds[2])
	const bboxMercator = minMercator.concat(maxMercator)

	const query = 
		`
		SELECT osm_id, name, railway, highway, ST_AsGeoJSON(way) AS geom FROM planet_osm_point
		WHERE (railway='station' OR railway='halt' OR highway='bus_stop')
		AND way && ST_MakeEnvelope(${bboxMercator.join(', ')}, 3857)
		`

	const client = new pg.Client(args.pg || 'postgres://localhost:5432/gis')

	client.connect(err => {
  		if (err) throw err
  		client.query(query, (err, result) => {
    		if (err) throw err

			const geojson = rowsToGeoJson(result.rows)

			geojson.features.forEach(feature => {
				const lnglat = feature.geometry.coordinates
				if (inside(lnglat, outer)) {
					console.log([
						feature.id, 
						feature.properties.name,
						feature.geometry.coordinates[1].toFixed(6),
						feature.geometry.coordinates[0].toFixed(6),
						//feature.properties.type
					].join(';'))
				}
			})

			client.end()
			callback()
  		})
	})
}

// Load input file
const areas = JSON.parse(fs.readFileSync(process.argv[2]), 'utf8')

// Filter features and flatten geometries
const features = []
areas.features.filter(isMatch).forEach(feature => {
	flatten(feature).forEach(flat => {
		features.push(flat)
	})
})

// Process all features
async.eachSeries(features, processOne, (err) => {
	if (err) {
		throw err
	}
	console.error("Done")
})