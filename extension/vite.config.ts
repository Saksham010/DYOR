import {resolve} from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = resolve(__dirname,'.');
const outDir = resolve(__dirname,'dist');

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  build:{
    outDir,
    emptyOutDir:true,
    rollupOptions:{
      input:{
        main: resolve(root,'index.html'),
        sign: resolve(root,'sign','index.html')

      }
    }

  },
  

})
