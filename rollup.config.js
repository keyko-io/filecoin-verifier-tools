import typescript from 'rollup-plugin-typescript2';

export default {
  input: './main.js',
  output: {
    file: 'build/main.js',
    format: 'cjs'
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json'
    })
  ]
};
