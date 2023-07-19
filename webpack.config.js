const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const path = require('path');

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    filename: "index.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    assetModuleFilename: 'img/[name].[contenthash][ext]',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Форма оплаты",
      template: path.join(__dirname, "src", "index.html"),
      filename: "index.html",
      scriptLoading: "defer",
      externals: {
        "ymaps3": "ymaps3"
      }
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].css",
    }),    
  ],
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset/resource",
        // generator: {
        //   filename: path.join("img/", "[name].[contenthash][ext]"),
        // },
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            }
          }
        ]
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          //"style-loader", // Создает узлы стиля из строк JavaScript
          MiniCssExtractPlugin.loader, // Извлечь стили в отдельный файл          
          "css-loader",
          "sass-loader", // Компилирует Sass в CSS
        ],
        
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          }
        }
      }
    ],
  },

  devServer: {
    historyApiFallback: true,
    hot: true,
    //port: 8080,
    compress: true,
    watchFiles: ["src/**/*"], // для отслеживания изменений всех файлов внутри директории src
  },
};