# pubtrans #

Extract bus stops and train stations from [OpenStreetMap](https://www.openstreetmap.org/)

## Install ##
```
$ git clone https://github.com/davvo/pubtrans.git
$ cd pubtrans
$ npm install
```

## Example usage ##

Extract points from a local osm database. The first argument should be a geojson file containing features of type Polygon (or MultiPolygon). Only points that are contained by a polygon will be written to output.
```
$ ./pubtrans.js geojson/modena.geojson

3928419380;44.656879;10.889834;D'Avia bv Silone
3928419379;44.656778;10.889945;D'Avia bv Silone
3915067544;44.645676;10.890041;Leonardo Da Vinci - Polo Scolastico
3927064835;44.643445;10.890764;Galilei bv Cartesio
3927064834;44.643319;10.890881;Galilei bv Cartesio
3914963159;44.632226;10.891345;Sagittario
3914963158;44.632041;10.891428;Sagittario
3928376601;44.660539;10.891791;Barchetta
3960722246;44.685546;10.892480;Lesignana
...
```

Filter geojson by property. This example will only extract points inside polygons where property NAME_3 is equal to Bergamo.
```
$ ./pubtrans.js geojson/italy.geojson --filter NAME_3=Bergamo

2041160226;45.689821;9.706112;Via Borgo Palazzo
2027150850;45.695002;9.706739;Via Monte Gleno
2027150842;45.694911;9.706783;Via Monte Gleno
2081697083;45.691063;9.708025;Via Mario Flores
2028247550;45.691172;9.708272;Via Mario Flores
2028247525;45.693451;9.708652;Via Pizzo Redorta
2028247548;45.693312;9.708827;Via Pizzo Redorta
1681048103;45.688950;9.709363;ATB
4188087992;45.689124;9.709935;642
2028247557;45.688542;9.709956;ATB
...
```

## Prerequisites ##
You need to have [NodeJS](https://nodejs.org/en/) (version 6 or higher) installed. On mac you can use homebrew

```
$ brew update
$ brew install node
```

You also need access to OpenStreetMap data loaded in PostgreSQL database. 

https://switch2osm.org/loading-osm-data/
