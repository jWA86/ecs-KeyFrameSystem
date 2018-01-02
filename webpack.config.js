const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: ["./src/entry.ts"],
    watch: false,
    output: {
        path: path.resolve('./dist'),
        filename: "index.js",
        libraryTarget: 'umd',
        library: 'ecs-keyframesystem'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                // exclude:/\.spec.ts?$/,
                // exclude: [/(node_modules)/, /\.spec.ts?$/],
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [ '.ts' ]
    },
    externals: 
    {
        "ecs-framework": "umd ecs-framework",
        "bezier-easing": "bezier-easing"

    },
    // plugins: [new UglifyJSPlugin({ sourceMap : true }) ]
};