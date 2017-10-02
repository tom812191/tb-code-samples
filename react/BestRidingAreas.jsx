import { Meteor } from 'meteor/meteor';
import { scaleLinear } from 'd3';
import React, { Component, PropTypes } from 'react';
import GoogleMapContainer from '../map/GoogleMapContainer';
import { googleMapStyleBasic } from '../map/GoogleMapStyle';

import { ButtonGroup, Button } from 'react-bootstrap';

export default class BestRidingAreas extends Component {

    constructor() {
        super();

        this.state = {
            mapIsLoading: false,
            displaying: 'rating',
        };

        this.mapName = 'feature-map';

        this.mapOptions = {
            center: {lat: 39.8333, lng: -98.585522},
            zoom: 4,
            mapTypeId: 'terrain',
            styles: googleMapStyleBasic,
        };

        this.options = {
            key: Meteor.settings.public.mapsApiKey,
            libraries: 'drawing',
        };

        this.ratingPercentileColorScale = scaleLinear()
            .domain([0, 1.9559143123253649, 1.955914312325365, 50, 100])
            .range(['#EEEEEE', '#EEEEEE', '#fc8d59', '#ffffbf', '#91cf60']);

        this.curvinessPercentileColorScale = scaleLinear()
            .domain([0, 1.9559143123253649, 1.955914312325365, 50, 100])
            .range(['#EEEEEE', '#EEEEEE', '#e0ecf4', '#9ebcda', '#8856a7']);

        this.curvinessColorScale = scaleLinear()
            .domain([0, 2, 4, 10])
            .range(['#edf8fb', '#b3cde3', '#8c96c6', '#88419d']);
    }

    initMapLayer() {

        this.countyLayer = new google.maps.Data();
        this.countyLayer.loadGeoJson('/data/riding-hotspots.json');

        this.setMapStyle('rating');

        this.countyLayer.setMap(this.map)
    }


    onMapReady() {
        this.map = GoogleMaps.maps[this.mapName].instance;
        this.initMapLayer();
    }

    setMapStyle(displaying) {

        if (displaying === 'rating'){
            this.countyLayer.setStyle(feature => {
                return {
                    fillColor: this.ratingPercentileColorScale(feature.getProperty('rating_percentile')),
                    fillOpacity: 0.4,
                    strokeColor: '#b3b3b3',
                    strokeWeight: 0,
                    zIndex: 1
                };
            });
        } else {
            this.countyLayer.setStyle(feature => {
                return {
                    fillColor: this.curvinessColorScale(feature.getProperty('curviness')),
                    fillOpacity: 0.4,
                    strokeColor: '#b3b3b3',
                    strokeWeight: 0,
                    zIndex: 1
                };
            });
        }
    }

    setDisplaying(displaying) {
        this.setState({
            displaying,
        });

        this.setMapStyle(displaying);
    }

    renderLegend() {

        this.currentScale = this.ratingPercentileColorScale;

        if (this.state.displaying === 'curviness') {
            this.currentScale = this.curvinessPercentileColorScale;
        }

        return (
            <div className="legend">
                <h3>Legend</h3>
                <h6>
                    <span>{this.state.displaying === 'rating' ? 'Poorly Rated' : 'Not Curvy'}</span>
                    <span className="pull-right">{this.state.displaying === 'rating' ? 'Top Rated' : 'Extremely Curvy'}</span>
                </h6>
                <svg width="100%" height="15px">
                    <defs>
                        <linearGradient id="MyGradient">
                            <stop offset="2%"  stopColor={this.currentScale(2)}/>
                            <stop offset="50%" stopColor={this.currentScale(50)}/>
                            <stop offset="100%" stopColor={this.currentScale(100)}/>
                        </linearGradient>
                    </defs>

                    <rect fill="url(#MyGradient)"
                          x="0" y="0" width="100%" height="10"/>
                </svg>
                <ButtonGroup className="btn-group-raised btn-group-justified">
                    <a onClick={this.setDisplaying.bind(this, 'rating')}
                        className={'btn' + (this.state.displaying === 'rating' ? ' active' : '')}>Rating</a>
                    <a onClick={this.setDisplaying.bind(this, 'curviness')}
                        className={'btn' + (this.state.displaying === 'curviness' ? ' active' : '')}>Curviness</a>
                </ButtonGroup>
            </div>
        );
    }

    render() {

        return (
            <div>
                <h1>Best Riding Areas</h1>
                <p>
                    This map depicts average road ratings and curviness scores by county across the United States.
                    Use the <a href="/app">Apex Roads app</a> to find specific roads for your next trip.
                </p>
                <p>See below for <a href="#how-to-read">how to read</a> this map and the <a href="#methods">methods</a> used to create it</p>
                <div>
                    { this.renderLegend() }
                    <div className={'feature-map-container' + (this.state.mapIsLoading ? ' loading' : '')}>
                        <GoogleMapContainer
                            onReady={this.onMapReady.bind(this)}
                            mapOptions={() => this.mapOptions}
                            options={this.options}
                            name={this.mapName}
                        />
                    </div>
                </div>
                <h3 id="how-to-read">How to Read</h3>
                <p>
                    These visualizations are meant to serve as a rough guide to different areas. Keep in mind that each
                    county score is an average, so a poorly rated county could still contain some great roads, they are
                    just mixed in with more poor roads. For specific roads rather than an average, use the
                    <a href="/app"> Apex Roads app.</a>
                </p>
                <h3 id="methods">Methods</h3>
                <p>
                    This map takes the distance-weighted average rating and curviness rating from the Apex Roads database by
                    county across the United States. The Apex Roads database contains all roads deemed "motorcycle
                    worthy," and therefore excludes residential roads and major motorways.
                </p>
                <h4>Rating</h4>
                <p>
                    Rating is displayed in relative terms as percentile rank. This is to say that some of the red sections
                    aren't necessarily bad, they just don't compare favorably to other parts of the country.
                </p>
                <p>
                    One issue to keep in mind is that county size varies greatly, which slightly skews the results when
                    shown as percentile rank. Specifically, Kansas e.g. has many small counties with poor roads, which
                    occupy many of the lowest ranks. Arizona, on the other hand, has vast stretches of straight,
                    underwhelming roads, but since they are in large counties with other good roads, they average out to
                    be better than Kansas. This is true of the whole southwest.
                </p>
                <h4>Curviness</h4>
                <p>
                    Curviness is displayed in absolute terms.
                </p>
            </div>
        );
    }
}

BestRidingAreas.propTypes = {};