import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const payload = await req.json();
        console.log("🔥 Webhook Disparado! Recebi:", JSON.stringify(payload));

        const { record } = payload;

        if (!record || !record.customer_email) {
            console.error("❌ Erro: E-mail não encontrado no payload");
            return new Response(JSON.stringify({ error: "No record found" }), { headers: corsHeaders, status: 400 });
        }

        const { customer_email, customer_name = "Cliente" } = record;
        console.log(`📧 Tentando enviar para: ${customer_email}`);

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Ebook Rhema <onboarding@resend.dev>",
                to: [customer_email],
                subject: "Seu Ebook chegou! 📚",
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Olá, ${customer_name}!</h1>
            <p>Obrigado pela compra! Você já pode acessar seus livros:</p>
            <br/>
            <a href="https://ebookrhema.vercel.app/meus-livros" style="background-color: #DD8428; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              ACESSAR MEUS LIVROS
            </a>
            <br/><br/>
            <p>Link direto: https://ebookrhema.vercel.app/meus-livros</p>
          </div>
        `,
            }),
        });

        const data = await res.json();
        console.log("📨 Resposta do Resend:", res.status, JSON.stringify(data));

        if (!res.ok) {
            console.error("❌ Erro no Resend:", JSON.stringify(data));
            return new Response(JSON.stringify(data), { headers: corsHeaders, status: 400 });
        }

        return new Response(JSON.stringify(data), { headers: corsHeaders, status: 200 });
    } catch (error) {
        console.error("💥 Erro Geral:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
    }
});
