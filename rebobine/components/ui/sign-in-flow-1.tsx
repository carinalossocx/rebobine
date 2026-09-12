"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SignInPageProps {
  className?: string;
}

/**
 * Hash pseudo-aleatório determinístico por célula da grade (substitui o
 * `random()` do shader GLSL original, sem depender de WebGL/three.js).
 */
function hash(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Efeito de "reveal" em grade de pontos, em Canvas 2D puro.
 * Substitui a versão original (three.js + @react-three/fiber + shader GLSL),
 * que é incompatível com o bundling do Next.js App Router (erro
 * "ReactCurrentOwner" no client bundle do react-reconciler usado pelo r3f).
 */
export const CanvasRevealEffect = ({
  animationSpeed = 3,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[255, 255, 255]],
  containerClassName,
  dotSize = 3,
  totalSize = 20,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  totalSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const draw = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) / 1000;
      const timeScaled = elapsed * animationSpeed * 0.15;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / totalSize) + 1;
      const rows = Math.ceil(height / totalSize) + 1;
      const centerX = cols / 2;
      const centerY = rows / 2;
      const maxDist = Math.hypot(centerX, centerY);

      for (let gx = 0; gx < cols; gx++) {
        for (let gy = 0; gy < rows; gy++) {
          const showOffset = hash(gx, gy);
          const colorIdx = Math.floor(showOffset * colors.length);
          const color = colors[colorIdx] ?? colors[0];

          const opacityIdx = Math.floor(hash(gx + 7, gy + 7) * opacities.length);
          const targetOpacity = opacities[opacityIdx] ?? opacities[0];

          const dist = Math.hypot(gx - centerX, gy - centerY);
          const introOffset = dist * 0.05 + hash(gx, gy) * 0.3;
          const outroOffset = (maxDist - dist) * 0.06 + hash(gx + 42, gy + 42) * 0.3;
          const currentOffset = reverse ? outroOffset : introOffset;

          const progress = Math.min(
            1,
            Math.max(0, (timeScaled - currentOffset) / 0.15)
          );
          const opacity = reverse
            ? targetOpacity * (1 - progress)
            : targetOpacity * progress;

          if (opacity <= 0.01) continue;

          const x = gx * totalSize;
          const y = gy * totalSize;
          ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
          ctx.fillRect(x, y, dotSize, dotSize);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [animationSpeed, opacities, colors, dotSize, totalSize, reverse]);

  return (
    <div ref={containerRef} className={cn("h-full relative w-full", containerClassName)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      )}
    </div>
  );
};

const MENSAGENS_ERRO: Record<string, string> = {
  CAMPOS_OBRIGATORIOS: "E-mail e senha são obrigatórios.",
};

export const SignInPage = ({ className }: SignInPageProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [step, setStep] = useState<"email" | "senha" | "success">("email");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [destino, setDestino] = useState("/catalogo");
  const senhaInputRef = useRef<HTMLInputElement>(null);

  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  useEffect(() => {
    if (step === "senha") {
      setTimeout(() => senhaInputRef.current?.focus(), 400);
    }
  }, [step]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setErro("");
      setStep("senha");
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setSenha("");
    setErro("");
  };

  const handleSenhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro(MENSAGENS_ERRO.CAMPOS_OBRIGATORIOS);
      return;
    }

    setCarregando(true);

    try {
      // TODO: Integrar com Supabase Auth
      let rotaDestino = "/catalogo";
      if (email === "admin@rebobine.com" && senha === "admin123") {
        localStorage.setItem("isAdmin", "true");
        rotaDestino = "/admin/clientes";
      } else {
        localStorage.setItem("userEmail", email);
        rotaDestino = "/catalogo";
      }

      setDestino(rotaDestino);

      // Dispara animação de reveal e depois transiciona para o sucesso
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      setTimeout(() => setStep("success"), 1200);
    } catch {
      setErro("Erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const preencherDemo = (tipo: "admin" | "cliente") => {
    if (tipo === "admin") {
      setEmail("admin@rebobine.com");
      setSenha("admin123");
    } else {
      setEmail("joao@test.com");
      setSenha("cliente123");
    }
  };

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative", className)}>
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [255, 255, 255],
                [255, 255, 255],
              ]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}

        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-black"
              colors={[
                [255, 255, 255],
                [255, 255, 255],
              ]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Marca */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2 rounded-full border border-[#333] bg-[#1f1f1f57] backdrop-blur-sm">
          <span className="text-xl">🎬</span>
          <span className="text-white font-semibold text-sm">Rebobine</span>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[150px] max-w-sm px-4">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        Bem-vindo de volta
                      </h1>
                      <p className="text-[1.4rem] text-white/70 font-light">
                        Entre para acessar a locadora
                      </p>
                    </div>

                    <div className="space-y-4">
                      <form onSubmit={handleEmailSubmit}>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-transparent"
                            required
                          />
                          <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors group overflow-hidden"
                            aria-label="Continuar"
                          >
                            <span className="relative w-full h-full block overflow-hidden">
                              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">
                                →
                              </span>
                              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 -translate-x-full group-hover:translate-x-0">
                                →
                              </span>
                            </span>
                          </button>
                        </div>
                      </form>

                      <div className="flex gap-2 justify-center text-xs">
                        <button
                          type="button"
                          onClick={() => preencherDemo("admin")}
                          className="px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/30 transition-colors"
                        >
                          Demo Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => preencherDemo("cliente")}
                          className="px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/30 transition-colors"
                        >
                          Demo Cliente
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-white/40 pt-10">
                      Não tem conta?{" "}
                      <Link
                        href="/cadastro"
                        className="underline text-white/40 hover:text-white/60 transition-colors"
                      >
                        Criar uma nova conta
                      </Link>
                    </p>
                  </motion.div>
                ) : step === "senha" ? (
                  <motion.div
                    key="senha-step"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        Digite sua senha
                      </h1>
                      <p className="text-[1.1rem] text-white/50 font-light break-all px-4">
                        {email}
                      </p>
                    </div>

                    {erro && (
                      <div className="bg-red-600/20 border border-red-600/40 text-red-300 px-4 py-2 rounded-full text-sm">
                        {erro}
                      </div>
                    )}

                    <form onSubmit={handleSenhaSubmit} className="space-y-6">
                      <input
                        ref={senhaInputRef}
                        type="password"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-transparent"
                        required
                      />

                      <div className="flex w-full gap-3">
                        <motion.button
                          type="button"
                          onClick={handleBackClick}
                          className="rounded-full bg-white text-black font-medium px-8 py-3 hover:bg-white/90 transition-colors w-[30%]"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Voltar
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={!senha || carregando}
                          className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 ${
                            senha && !carregando
                              ? "bg-white text-black border-transparent hover:bg-white/90 cursor-pointer"
                              : "bg-[#111] text-white/50 border-white/10 cursor-not-allowed"
                          }`}
                          whileHover={senha ? { scale: 1.02 } : {}}
                          whileTap={senha ? { scale: 0.98 } : {}}
                        >
                          {carregando ? "Entrando..." : "Entrar"}
                        </motion.button>
                      </div>
                    </form>

                    <div className="pt-10 bg-slate-800/30 rounded-lg p-4 text-xs text-white/40">
                      <p className="font-semibold mb-1">🔑 Contas de teste:</p>
                      <p>Admin: admin@rebobine.com / admin123</p>
                      <p>Cliente: joao@test.com / (qualquer senha)</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        Você entrou!
                      </h1>
                      <p className="text-[1.25rem] text-white/50 font-light">Bem-vindo(a)</p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="py-10"
                    >
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-black"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={() => router.push(destino)}
                      className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors"
                    >
                      Continuar
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
