/**
 * Webpack config for production electron main process
 */

const path = require("path");
const webpack = require('webpack');
//import { merge } from 'webpack-merge';
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
//import baseConfig from './webpack.config.base';
//import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
//import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

//CheckNodeEnv('production');
//DeleteSourceMaps();

module.exports = {

    mode: 'production',

    target: 'electron-main',

    entry: './electron/main.js',

    output: {
        path: path.join(__dirname, './build/electron'),
        filename: './main.js',
    },

    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             use: [
    //                 {
    //                     loader: 'file-loader',
    //                 },
    //             ],
    //         },
    //     ],
    // },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: false,
                        "plugins": ["@babel/plugin-proposal-class-properties"]
                    },
                },
            },
        ],
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true,
                cache: true,
            }),
        ],
    },

    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',//'server',
            openAnalyzer: 'false',
        }),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
        }),
    ],

    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        modules: [path.resolve(__dirname, 'electron'), 'node_modules']
    },
    externals: ['pg-hstore'],
    /**
     * Disables webpack processing of __dirname and __filename.
     * If you run the bundle in node.js it falls back to these values of node.js.
     * https://github.com/webpack/webpack/issues/2010
     */
    // node: {
    //     // fs: "empty",
    //     // child_process: "empty",
    //     // 'pg-hstore': "empty",
    //     // __dirname: false,
    //     // __filename: false,
    // },
};