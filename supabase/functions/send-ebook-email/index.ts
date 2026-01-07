import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log("🔥 Webhook Triggered! Payload:", JSON.stringify(payload));

        // Webhook payload structure from Supabase Database Webhooks
        // type: 'INSERT', table: 'orders', record: { ...custom_columns... }
        const { record } = payload;

        if (!record || !record.customer_email) {
            console.error("❌ No record or email found in payload");
            return new Response(JSON.stringify({ error: "No record found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        const email = record.customer_email;
        const name = record.customer_name || "Cliente";

        console.log(`📧 Preparing to send email to: ${email}`);

        // Call Resend API
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Ebook Rhema <onboarding@resend.dev>", // Must verify domain or use testing domain
                to: [email],
                subject: "Seu Ebook chegou! 📚",
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Olá, ${name}!</h1>
            <p>Obrigado por sua compra. Seu conhecimento está garantido.</p>
            <p>Você já pode acessar seus livros digitais na nossa Área do Leitor.</p>
            <br/>
            <a href="https://ebook-rhema.vercel.app/meus-livros" style="background-color: #DD8428; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ACESSAR MEUS LIVROS
            </a>
            <br/><br/>
            <p>Ou acesse: https://ebook-rhema.vercel.app/meus-livros</p>
            <p>Digite seu e-mail (<strong>${email}</strong>) para entrar.</p>
          </div>
        `,
            }),
        });

        const data = await res.json();
        console.log("📨 Resend Response:", res.status, JSON.stringify(data));

        if (!res.ok) {
            console.error("❌ Resend API Error:", JSON.stringify(data));
            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400, // Forward error to Dashboard Logs
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("💥 Unhandled Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
