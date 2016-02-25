for i in *.shp; do ogr2ogr -f GeoJSON -t_srs crs:84 ../`basename $i .shp`.json $i; done

cat features-head.json > ../bom-regions.json
grep -h '{ "type": "Feature"' I*.json | sed -e 's/,$//' | sed -e 's/\}$/\},/' >> ../bom-regions.json
cat features-tail.json >> ../bom-regions.json

# need to fix the json file to remove the trailing comma from the last feature...

cat ../bom-regions.json | simplify-geojson -t 0.1 > ../bom-regions-simplified.json
