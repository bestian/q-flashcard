module.exports = {
  css: { sourceMap: true },
  productionSourceMap: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/q-flashcard/'
    : '/'
}