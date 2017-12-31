const path = require('path');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: ["./src/KeyFrameSystem.ts"],
    watch: false,
    output: {
        path: path.resolve('./dist'),
        filename: "index.js",
        libraryTarget: 'umd',
        library: 'ecs'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                // exclude:/\.spec.ts?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [ '.ts' ]
    },
    // plugins: [new UglifyJSPlugin({ sourceMap : true }) 
    //    ]
};