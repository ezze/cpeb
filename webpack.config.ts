import path from 'path';

import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

import packageJson from './package.json';

const { DefinePlugin } = webpack;

const srcDirPath = path.resolve(__dirname, 'src/client');
const distDirPath = path.resolve(__dirname, 'lib/client');

const port = process.env.PORT || 40002;

declare interface ObjectWithAnyProps {
  [index: string]: any;
}

declare interface WebpackConfiguration extends webpack.Configuration {
  devServer?: ObjectWithAnyProps;
}

const config = (env: string, argv: ObjectWithAnyProps): WebpackConfiguration => {
  const { mode } = argv;
  return {
    entry: path.resolve(srcDirPath, 'index.ts'),
    output: {
      path: distDirPath,
      filename: mode === 'development' ? '[name].js' : '[name].[contenthash:6].js'
    },
    devtool: mode === 'development' ? 'source-map' : false,
    devServer: {
      historyApiFallback: true,
      contentBase: distDirPath,
      publicPath: '/',
      compress: true,
      progress: true,
      port
    },
    module: {
      rules: [{
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        include: [srcDirPath]
      }]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlPlugin({
        title: packageJson.description,
        template: 'src/client/index.html'
      }),
      new MiniCssExtractPlugin({
        filename: `css/${mode === 'development' ? '[name].css' : '[name].[contenthash:6].css'}`,
        chunkFilename: `css/${mode === 'development' ? '[name].css' : '[name].[contenthash:6].css'}`
      }),
      new ForkTsCheckerPlugin(),
      new DefinePlugin({
        appVersion: JSON.stringify(packageJson.version)
      })
    ],
    optimization: {
      minimize: mode === 'production',
      minimizer: [
        new TerserPlugin({
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    }
  };
};

export default config;
