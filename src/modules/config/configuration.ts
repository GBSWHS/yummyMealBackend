export default () => ({
  port: parseInt(process.env.PORT, 10) | 3000,
  NEIS_API_KEY: process.env.NEIS_API_KEY
});