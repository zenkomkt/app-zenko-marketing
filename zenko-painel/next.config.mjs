/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler (estável no Next.js 16): memoriza os componentes
  // automaticamente, reduzindo re-renderizações sem mudar o código.
  // Custo: o build fica um pouco mais lento, porque usa Babel.
  reactCompiler: true,

  // Fase 2: aqui entram rewrites/headers para o back-end da Zenko.
};

export default nextConfig;
