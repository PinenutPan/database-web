module.exports = {
  devServer: {
    proxy: {
      "/": {
        target: "http://localhost:8088",
        // 允许跨域
        changeOrigin: true,
        ws: true
      },
    },
  },
  assetsDir: 'static',
  publicPath: './'
  
}
