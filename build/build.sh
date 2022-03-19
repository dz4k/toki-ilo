
build_dir=$(dirname $0)
cd $build_dir/..


for dir in dist dist/www dist/pkg
do
    if [ ! -d $dir ]
    then mkdir $dir
    fi
done

cp -r www/* dist/www
cp -r lib/* dist/www

cp -r bin lib README.md dist/pkg
