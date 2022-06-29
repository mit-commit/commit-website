./gen.sh > temp
sed -i 's/author/author0/g' temp
cat prefix_t temp postfix_t > pp.json
