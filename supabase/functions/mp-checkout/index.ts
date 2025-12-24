import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Lidar com requisições CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        console.log("Recebido request body:", JSON.stringify(body))
        const { order, returnUrl } = body

        // Obter Access Token dos Segredos (Usuário precisa configurar isso)
        const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
        console.log("Verificando access token...", accessToken ? "Presente" : "Ausente")

        if (!accessToken) {
            throw new Error('MP_ACCESS_TOKEN não configurado no servidor')
        }

        // Inicializar Cliente
        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const preference = new Preference(client);

        // Criar Preferência
        const preferenceBody = {
            items: order.items.map((item: any) => ({
                id: item.id || 'book-id',
                title: item.title,
                quantity: item.quantity,
                unit_price: Number(item.price)
            })),
            payer: {
                name: order.customerName,
                email: order.customerEmail,
                phone: {
                    number: order.customerPhone || '000000000'
                }
            },
            back_urls: {
                success: `${returnUrl}?status=success`,
                failure: `${returnUrl}?status=failure`,
                pending: `${returnUrl}?status=pending`
            },
            external_reference: order.id, // Nosso ID do Pedido
        };

        // Mercado Pago Production não permite localhost no auto_return
        if (!returnUrl.includes('localhost') && !returnUrl.includes('127.0.0.1')) {
            (preferenceBody as any).auto_return = 'approved';
        }

        console.log("Enviando preferência para MP:", JSON.stringify(preferenceBody));

        const response = await preference.create({
            body: preferenceBody
        });

        return new Response(
            JSON.stringify({
                preferenceId: response.id,
                init_point: response.init_point,
                sandbox_init_point: response.sandbox_init_point
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error("Erro no mp-checkout:", error);
        // Retornar 200 mas com campo de erro para garantir que o cliente possa ler a mensagem
        return new Response(
            JSON.stringify({
                error: error.message || "Ocorreu um erro desconhecido",
                details: JSON.stringify(error)
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Retornando 200 para evitar que o supabase-js lance erro genérico
            },
        )
    }
})
