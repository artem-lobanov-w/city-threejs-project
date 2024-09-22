export default {
  base: '/city-threejs-project/',
  esbuild: {
    // Enable support for importing ES modules
    // and specify the entry point for the build
    include: /src\/(.*\.js|.*\.jsx|.*\.ts|.*\.tsx)$/
  }
}
